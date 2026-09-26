(() => {
  "use strict";

  const PRODUCT_HEADER = [0xF0, 0x00, 0x21, 0x27, 0x6D];

  function bytesMatch(bytes, expected, offset = 0) {
    return expected.every((value, index) => bytes[offset + index] === value);
  }

  function decodeText(bytes) {
    const zero = bytes.indexOf(0);
    const end = zero >= 0 ? zero : bytes.length;
    return String.fromCharCode(...bytes.slice(0, end));
  }

  function decodeUnsigned21(bytes) {
    return (bytes[0] << 14) | (bytes[1] << 7) | bytes[2];
  }

  function decodeSignedShort(bytes) {
    const value = decodeUnsigned21(bytes);
    return (value << 16) >> 16;
  }

  function encodeUnsigned21(value) {
    return [(value >> 14) & 0x7F, (value >> 7) & 0x7F, value & 0x7F];
  }

  function encodeSignedShort(value) {
    const normalized = Number(value) & 0xFFFF;
    return [(normalized >> 14) & 0x03, (normalized >> 7) & 0x7F, normalized & 0x7F];
  }

  function decodeUnsigned35(bytes) {
    return bytes.reduce((value, byte) => (value * 128) + (byte & 0x7F), 0);
  }

  function sdPathBytes(path) {
    if (typeof path !== "string" || !path.startsWith("/") || path.includes("\0")) {
      throw new Error("An absolute NT SD-card path is required.");
    }
    const bytes = [...path].map(character => character.charCodeAt(0));
    if (bytes.some(byte => byte < 0x20 || byte > 0x7E)) throw new Error("NT SD-card paths must use printable ASCII characters.");
    return bytes;
  }

  function sdChecksum(payload) {
    return (-payload.reduce((sum, byte) => sum + (byte & 0x7F), 0)) & 0x7F;
  }

  function parseSDDirectoryEntries(payload) {
    if ((payload[0] ?? 1) !== 0) {
      throw new Error(decodeText(payload.slice(1)) || "The NT could not read that SD-card folder.");
    }
    if (payload[1] !== 1) throw new Error("The NT returned an unexpected SD-card response.");
    const data = payload.slice(2);
    const entries = [];
    for (let offset = 0; offset < data.length;) {
      if (data.length - offset < 18) break;
      const attributes = data[offset++];
      const date = decodeUnsigned21(data.slice(offset, offset + 3)); offset += 3;
      const time = decodeUnsigned21(data.slice(offset, offset + 3)); offset += 3;
      let size = 0;
      for (let index = 0; index < 10; index += 1) size = (size * 128) + (data[offset++] & 0x7F);
      const end = data.indexOf(0, offset);
      if (end < 0) throw new Error("The NT returned an incomplete SD-card directory entry.");
      const name = decodeText(data.slice(offset, end));
      offset = end + 1;
      if (!name) break;
      entries.push({ name, attributes, isDirectory: Boolean(attributes & 0x10), size, date, time });
    }
    return entries;
  }

  function guidKey(bytes) {
    return bytes.map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function decodeRoutingMask(bytes) {
    return bytes.reduce(
      (value, byte, index) => value | (BigInt(byte & 0x7F) << BigInt(index * 7)),
      0n
    );
  }

  function parseRoutingPayload(payload) {
    const slot = payload[0];
    const wide = payload.length > 31;
    const bytesPerMask = wide ? 10 : 5;
    const expectedLength = 1 + (6 * bytesPerMask);
    if (payload.length < expectedLength) throw new Error("NT returned incomplete routing information.");
    const masks = [];
    let offset = 1;
    for (let index = 0; index < 6; index += 1) {
      let mask = decodeRoutingMask(payload.slice(offset, offset + bytesPerMask));
      if (!wide) mask >>= 1n;
      masks.push(mask);
      offset += bytesPerMask;
    }
    return {
      slot,
      format: wide ? "wide" : "legacy",
      inputMask: masks[0],
      outputMask: masks[1],
      replaceMask: masks[2],
      mappingInputMask: masks[5],
      masks
    };
  }

  const MIDI_MAPPING_TYPES = [
    "CC",
    "Note — momentary",
    "Note — toggle",
    "14-bit CC — low",
    "14-bit CC — high",
    "Pitch bend",
    "Channel pressure"
  ];

  function parseParameterPages(payload) {
    const data = payload.slice(1);
    const pageCount = data[0] ?? 0;
    const pages = [];
    let offset = 1;
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const nameEnd = data.indexOf(0, offset);
      if (nameEnd < 0 || nameEnd - offset > 32) throw new Error("NT returned malformed parameter pages.");
      const name = decodeText(data.slice(offset, nameEnd));
      offset = nameEnd + 1;
      const parameterCount = data[offset++] ?? 0;
      const parameterIndices = [];
      for (let index = 0; index < parameterCount; index += 1) {
        if (offset + 1 >= data.length) throw new Error("NT returned incomplete parameter pages.");
        parameterIndices.push((data[offset] << 7) | data[offset + 1]);
        offset += 2;
      }
      pages.push({ index: pageIndex, name: name || `Page ${pageIndex + 1}`, parameterIndices });
    }
    return pages;
  }

  function parseMappingPayload(payload) {
    const data = payload.slice(1);
    if (data.length < 4) throw new Error("NT returned an incomplete mapping.");
    const parameterIndex = decodeUnsigned21(data.slice(0, 3));
    const version = data[3];
    if (version < 1 || version > 7) throw new Error(`NT returned unsupported mapping version ${version}.`);
    let offset = 4;
    const cvSource = version >= 4 ? data[offset++] : null;
    const cvInput = data[offset++] ?? 0;
    const cvFlags = data[offset++] ?? 0;
    const cvVolts = data[offset++] ?? 0;
    const cvDelta = decodeSignedShort(data.slice(offset, offset + 3));
    offset += 3;

    const cc = data[offset++] ?? 0;
    const midiFlags = data[offset++] ?? 0;
    const midiFlags2 = version >= 2 ? (data[offset++] ?? 0) : 0;
    const min = decodeSignedShort(data.slice(offset, offset + 3));
    offset += 3;
    const max = decodeSignedShort(data.slice(offset, offset + 3));
    const typeCode = midiFlags2 >> 2;
    return {
      parameterIndex,
      version,
      cv: {
        source: cvSource,
        input: cvInput,
        enabled: Boolean(cvFlags & 1),
        symmetric: Boolean(cvFlags & 2),
        volts: cvVolts,
        delta: cvDelta
      },
      midi: {
        cc,
        channel: ((midiFlags >> 3) & 0x0F) + 1,
        typeCode,
        type: MIDI_MAPPING_TYPES[typeCode] || `Type ${typeCode}`,
        enabled: Boolean(midiFlags & 1),
        symmetric: Boolean(midiFlags & 2),
        relative: Boolean(midiFlags2 & 1),
        viewChange: Boolean(midiFlags2 & 2),
        min,
        max
      },
      raw: data
    };
  }

  function parseMIDIMessage(bytes) {
    const status = bytes[0] ?? 0;
    const hex = bytes.map(value => value.toString(16).padStart(2, "0").toUpperCase()).join(" ");
    if (status === 0xF0) {
      const isNT = bytesMatch(bytes, PRODUCT_HEADER);
      const command = isNT && bytes.length > 6 ? bytes[6] : null;
      return {
        kind: "sysex",
        subtype: isNT ? "nt-sysex" : "sysex",
        label: command == null
          ? `SysEx · ${bytes.length} bytes`
          : `NT SysEx 0x${command.toString(16).padStart(2, "0").toUpperCase()} · ${bytes.length} bytes`,
        channel: null,
        hex
      };
    }

    if (status >= 0x80 && status <= 0xEF) {
      const channel = (status & 0x0F) + 1;
      const type = status & 0xF0;
      const data1 = bytes[1] ?? 0;
      const data2 = bytes[2] ?? 0;
      if (type === 0xB0) {
        return { kind: "channel", subtype: "cc", label: `Ch ${channel} · CC ${data1} · value ${data2}`, channel, controller: data1, value: data2, hex };
      }
      if (type === 0x90 && data2 > 0) {
        return { kind: "channel", subtype: "note-on", label: `Ch ${channel} · Note on ${data1} · velocity ${data2}`, channel, note: data1, value: data2, hex };
      }
      if (type === 0x80 || (type === 0x90 && data2 === 0)) {
        return { kind: "channel", subtype: "note-off", label: `Ch ${channel} · Note off ${data1} · velocity ${data2}`, channel, note: data1, value: data2, hex };
      }
      if (type === 0xE0) {
        const value = data1 | (data2 << 7);
        return { kind: "channel", subtype: "pitch-bend", label: `Ch ${channel} · Pitch bend ${value - 8192}`, channel, value, hex };
      }
      if (type === 0xD0) {
        return { kind: "channel", subtype: "channel-pressure", label: `Ch ${channel} · Channel pressure ${data1}`, channel, value: data1, hex };
      }
      if (type === 0xA0) {
        return { kind: "channel", subtype: "poly-pressure", label: `Ch ${channel} · Poly pressure ${data1} · value ${data2}`, channel, note: data1, value: data2, hex };
      }
      if (type === 0xC0) {
        return { kind: "channel", subtype: "program-change", label: `Ch ${channel} · Program ${data1}`, channel, value: data1, hex };
      }
      return { kind: "channel", subtype: "other-channel", label: `Ch ${channel} · MIDI 0x${type.toString(16).toUpperCase()}`, channel, hex };
    }

    const realtimeNames = {
      0xF8: "Timing clock",
      0xFA: "Start",
      0xFB: "Continue",
      0xFC: "Stop",
      0xFE: "Active sensing",
      0xFF: "System reset"
    };
    return {
      kind: "system",
      subtype: "system",
      label: realtimeNames[status] || `System MIDI 0x${status.toString(16).padStart(2, "0").toUpperCase()}`,
      channel: null,
      hex
    };
  }

  function isRoutingBusParameter(parameter, totalBusCount) {
    return Boolean(parameter.ioFlags & 0x03)
      && parameter.min <= parameter.max
      && parameter.max >= 0;
  }

  function isHardcodedRoutingInput(slot, parameter) {
    if (slot.guidKey === "6c6f6769") return /^\d+:Input [XY]$/.test(parameter.name);
    if (slot.guidKey === "6d757377") return /^\d+:(In control source|Out control source|Reset source)$/.test(parameter.name);
    return false;
  }

  class NTWebMIDITransport {
    constructor({ sysexId = 0, timeoutMs = 1800, onEvent = () => {} } = {}) {
      this.sysexId = Number(sysexId);
      this.timeoutMs = timeoutMs;
      this.onEvent = onEvent;
      this.access = null;
      this.input = null;
      this.output = null;
      this.pending = null;
      this.requestTail = Promise.resolve();
      this.outputModeUsageCache = new Map();
      this.handleMessage = this.handleMessage.bind(this);
      this.handleStateChange = this.handleStateChange.bind(this);
    }

    static isSupported() {
      return typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function";
    }

    static isRoutingBusParameter(parameter, totalBusCount) {
      return isRoutingBusParameter(parameter, totalBusCount);
    }

    static choosePort(ports, direction) {
      const candidates = [];
      if (ports && typeof ports.forEach === "function") {
        ports.forEach(port => candidates.push(port));
      } else if (ports && typeof ports.values === "function") {
        const iterator = ports.values();
        let next = iterator.next();
        while (!next.done) {
          candidates.push(next.value);
          next = iterator.next();
        }
      } else if (ports && typeof ports === "object") {
        Object.keys(ports).forEach(key => candidates.push(ports[key]));
      }
      const available = candidates.filter(port => port && port.state !== "disconnected");
      const preferredSuffix = direction === "input" ? "midi in" : "midi out";
      return available.find(port => port.name?.toLowerCase() === `disting nt ${preferredSuffix}`) ||
        available.find(port => {
          const name = port.name?.toLowerCase() || "";
          return name.includes("disting nt") && name.includes(preferredSuffix);
        }) ||
        available.find(port => port.name?.toLowerCase().includes("disting nt")) ||
        (available.length === 1 ? available[0] : null) ||
        null;
    }

    async connect() {
      if (!NTWebMIDITransport.isSupported()) {
        throw new Error("This browser does not expose Web MIDI. Use desktop Chrome or Edge.");
      }
      // A reboot can leave the browser's previous port objects and an in-flight
      // SysEx request behind. Never reuse either when reconnecting.
      this.rejectPending(new Error("Reconnecting to the disting NT."));
      if (this.input) this.input.onmidimessage = null;
      if (this.access) this.access.onstatechange = null;
      this.input = null;
      this.output = null;
      this.outputModeUsageCache.clear();
      this.access = await navigator.requestMIDIAccess({ sysex: true });
      this.access.onstatechange = this.handleStateChange;
      this.selectPorts();
      if (!this.input || !this.output) {
        throw new Error("The disting NT MIDI input/output pair was not found.");
      }
      this.input.onmidimessage = this.handleMessage;
      this.onEvent({ type: "connected", input: this.input.name, output: this.output.name });
      return { input: this.input.name, output: this.output.name };
    }

    selectPorts() {
      if (!this.access) return;
      if (this.input) this.input.onmidimessage = null;
      this.input = NTWebMIDITransport.choosePort(this.access.inputs, "input");
      this.output = NTWebMIDITransport.choosePort(this.access.outputs, "output");
      if (this.input) this.input.onmidimessage = this.handleMessage;
    }

    handleStateChange() {
      const previousInput = this.input?.id;
      const previousOutput = this.output?.id;
      this.selectPorts();
      if (!this.input || !this.output) {
        this.rejectPending(new Error("The disting NT MIDI endpoint disconnected."));
        this.onEvent({ type: "disconnected" });
      } else if (this.input.id !== previousInput || this.output.id !== previousOutput) {
        this.onEvent({ type: "ports-changed", input: this.input.name, output: this.output.name });
      }
    }

    handleMessage(message) {
      const bytes = [...message.data];
      this.onEvent({
        type: "midi-message",
        message: parseMIDIMessage(bytes),
        bytes,
        receivedTime: message.receivedTime ?? null,
        wallTime: Date.now()
      });
      const header = [...PRODUCT_HEADER, this.sysexId];
      if (bytes.length < 8 || !bytesMatch(bytes, header) || bytes[bytes.length - 1] !== 0xF7) return;
      this.onEvent({ type: "received", command: bytes[6], byteLength: bytes.length });
      if (!this.pending || bytes[6] !== this.pending.responseCommand) return;
      if (this.pending.match && !this.pending.match(bytes)) return;
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timer);
      pending.resolve(bytes.slice(7, -1));
    }

    request(requestCommand, responseCommand, payload = [], match = null, timeoutMs = this.timeoutMs) {
      if (!this.output) return Promise.reject(new Error("No disting NT MIDI output is selected."));
      const operation = this.requestTail.catch(() => {}).then(() => {
        if (!this.output) throw new Error("No disting NT MIDI output is selected.");
        const bytes = [...PRODUCT_HEADER, this.sysexId, requestCommand, ...payload, 0xF7];
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            this.pending = null;
            reject(new Error(`Timed out waiting for NT response 0x${responseCommand.toString(16)}.`));
          }, timeoutMs);
          this.pending = { responseCommand, match, resolve, reject, timer };
          this.output.send(bytes);
          this.onEvent({ type: "sent", command: requestCommand, byteLength: bytes.length });
        });
      });
      this.requestTail = operation.catch(() => {});
      return operation;
    }

    send(command, payload = []) {
      if (!this.output) throw new Error("No disting NT MIDI output is selected.");
      if (this.pending) throw new Error("A read request is already active.");
      const bytes = [...PRODUCT_HEADER, this.sysexId, command, ...payload, 0xF7];
      this.output.send(bytes);
      this.onEvent({ type: "sent", command, byteLength: bytes.length });
    }

    async readIdentity() {
      const versionBytes = await this.request(0x22, 0x32);
      const presetBytes = await this.request(0x41, 0x41);
      const slotBytes = await this.request(0x60, 0x60);
      return {
        version: decodeText(versionBytes),
        presetName: decodeText(presetBytes.slice(0, 21)),
        slotCount: slotBytes[0],
        inputBusCount: slotBytes[1] ?? 12,
        outputBusCount: slotBytes[2] ?? 8,
        auxBusCount: slotBytes[3] ?? 44,
        inputName: this.input.name,
        outputName: this.output.name,
        sysexId: this.sysexId
      };
    }

    async readAlgorithmCatalog() {
      const countBytes = await this.request(0x30, 0x30);
      const count = decodeUnsigned21(countBytes.slice(0, 3));
      if (count < 1 || count > 512) throw new Error(`NT returned an invalid algorithm count (${count}).`);
      const algorithms = [];
      for (let index = 0; index < count; index += 1) {
        algorithms.push(await this.readAlgorithmInfo(index));
      }
      return algorithms;
    }

    async readAlgorithmInfo(index) {
      if (!Number.isInteger(index) || index < 0 || index > 0x1FFFFF) throw new Error("Invalid NT algorithm index.");
      const encodedIndex = encodeUnsigned21(index);
      const payload = await this.request(
        0x31,
        0x31,
        encodedIndex,
        bytes => decodeUnsigned21(bytes.slice(7, 10)) === index
      );
      const responseIndex = decodeUnsigned21(payload.slice(0, 3));
      const guid = payload.slice(3, 7);
      const numSpecs = payload[7];
      const specifications = [];
      let specificationCursor = 8;
      for (let specificationIndex = 0; specificationIndex < numSpecs; specificationIndex += 1) {
        specifications.push({
          min: decodeSignedShort(payload.slice(specificationCursor, specificationCursor + 3)),
          max: decodeSignedShort(payload.slice(specificationCursor + 3, specificationCursor + 6)),
          defaultValue: decodeSignedShort(payload.slice(specificationCursor + 6, specificationCursor + 9)),
          type: payload[specificationCursor + 9] ?? 0
        });
        specificationCursor += 10;
      }
      let cursor = specificationCursor;
      const names = [];
      for (let nameIndex = 0; nameIndex < 1 + numSpecs; nameIndex += 1) {
        const start = cursor;
        while (cursor < payload.length && payload[cursor] !== 0) cursor += 1;
        names.push(decodeText(payload.slice(start, cursor)));
        if (payload[cursor] === 0) cursor += 1;
      }
      const isPlugin = Boolean(payload[cursor++] ?? 0);
      const isLoaded = Boolean(payload[cursor++] ?? 0);
      const filename = decodeText(payload.slice(cursor, cursor + 256));
      const filenameLeaf = filename.split(/[\\/]/).pop() || "";
      const pluginName = filenameLeaf.replace(/\.(lua|3pot|o)$/i, "");
      const factoryName = names[0] || "Unknown algorithm";
      specifications.forEach((specification, specificationIndex) => {
        specification.name = names[specificationIndex + 1] || `Specification ${specificationIndex + 1}`;
      });
      return {
        index: responseIndex,
        guid,
        guidKey: guidKey(guid),
        name: isPlugin && pluginName ? pluginName : factoryName,
        factoryName,
        isPlugin,
        isLoaded,
        filename,
        specifications
      };
    }

    async readSlots(slotCount, algorithms) {
      if (slotCount < 0 || slotCount > 40) throw new Error(`NT returned an invalid slot count (${slotCount}).`);
      const algorithmsByGuid = new Map(algorithms.map(algorithm => [algorithm.guidKey, algorithm]));
      const slots = [];
      for (let slot = 0; slot < slotCount; slot += 1) {
        const payload = await this.request(0x40, 0x40, [slot], bytes => bytes[7] === slot);
        const guid = payload.slice(1, 5);
        const algorithm = algorithmsByGuid.get(guidKey(guid));
        slots.push({
          index: slot,
          guid,
          guidKey: guidKey(guid),
          name: decodeText(payload.slice(5, 29)) || `Slot ${slot + 1}`,
          algorithmName: algorithm?.name || `Unknown · ${guidKey(guid)}`,
          algorithmFactoryName: algorithm?.factoryName || null,
          isPlugin: Boolean(algorithm?.isPlugin),
          pluginFilename: algorithm?.filename || null
        });
      }
      return slots;
    }

    async readSlotParameters(slot) {
      const countPayload = await this.request(
        0x42,
        0x42,
        [slot],
        bytes => bytes[7] === slot
      );
      const count = decodeSignedShort(countPayload.slice(1, 4));
      if (count < 0 || count >= 256) {
        throw new Error(`NT returned an invalid parameter count (${count}) for slot ${slot + 1}.`);
      }

      const parameters = [];
      for (let parameter = 0; parameter < count; parameter += 1) {
        const encodedParameter = encodeUnsigned21(parameter);
        const payload = await this.request(
          0x43,
          0x43,
          [slot, ...encodedParameter],
          bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter
        );
        const info = payload.slice(1);
        let nameLength = 0;
        while (13 + nameLength < info.length && info[13 + nameLength] !== 0) nameLength += 1;
        const name = decodeText(info.slice(13, 13 + nameLength));
        const metadataOffset = 13 + nameLength + 1;
        const metadata = info[metadataOffset] ?? 0;
        parameters.push({
          index: decodeUnsigned21(info.slice(0, 3)),
          name,
          min: decodeSignedShort(info.slice(3, 6)),
          max: decodeSignedShort(info.slice(6, 9)),
          defaultValue: decodeSignedShort(info.slice(9, 12)),
          unit: info[12],
          scaling: 10 ** (metadata & 0x03),
          ioFlags: (metadata >> 2) & 0x0F
        });
      }

      const values = await this.readSlotParameterValues(slot);
      parameters.forEach((parameter, index) => {
        parameter.value = values[index] ?? parameter.defaultValue;
      });
      return parameters;
    }

    async readSlotParameterValues(slot) {
      const valuesPayload = await this.request(
        0x44,
        0x44,
        [slot],
        bytes => bytes[7] === slot
      );
      const valueBytes = valuesPayload.slice(1);
      const values = [];
      for (let offset = 0; offset + 3 <= valueBytes.length; offset += 3) {
        values.push(decodeSignedShort(valueBytes.slice(offset, offset + 3)));
      }
      return values;
    }

    async readParameterEnumStrings(slot, parameter) {
      const encodedParameter = encodeUnsigned21(parameter);
      const payload = await this.request(
        0x49,
        0x49,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter
      );
      const count = payload[4] ?? 0;
      const strings = [];
      let cursor = 5;
      for (let index = 0; index < count && cursor <= payload.length; index += 1) {
        const end = payload.indexOf(0, cursor);
        strings.push(decodeText(payload.slice(cursor, end < 0 ? payload.length : end)));
        cursor = end < 0 ? payload.length : end + 1;
      }
      return strings;
    }

    async readParameterValueString(slot, parameter) {
      const encodedParameter = encodeUnsigned21(parameter);
      const payload = await this.request(
        0x50,
        0x50,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter
      );
      return decodeText(payload.slice(4)).replace(/\0.*$/, "");
    }

    async readSlotBypass(slot) {
      const encodedParameter = encodeUnsigned21(0);
      const payload = await this.request(
        0x45,
        0x45,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === 0
      );
      return decodeSignedShort(payload.slice(4, 7)) === 1;
    }

    async readCpuUsage() {
      const payload = await this.request(0x62, 0x62);
      return {
        audioThread: payload[0] ?? 0,
        overall: payload[1] ?? 0,
        slots: payload.slice(2)
      };
    }

    async readMemoryUsage(algorithm) {
      if (!algorithm || !Array.isArray(algorithm.guid) || algorithm.guid.length !== 4) {
        throw new Error("Invalid NT algorithm memory query.");
      }
      const values = (algorithm.specifications || []).slice(0, 3).map(specification => specification.defaultValue ?? 0);
      while (values.length < 3) values.push(0);
      const payload = await this.request(0x39, 0x39, [...algorithm.guid, ...values.flatMap(encodeSignedShort)]);
      const status = payload[0] ?? 0;
      if (status !== 3) {
        const reason = status === 0
          ? "The NT could not find this algorithm. Refresh the catalogue and try again."
          : status === 1
            ? "This plug-in is not loaded into NT memory."
            : status === 2
              ? "The NT reported an invalid plug-in memory state. Refresh the catalogue and try again."
              : `The NT rejected this memory query (status ${status}).`;
        return {
          available: false,
          reason
        };
      }
      if (payload.length !== 61 && payload.length !== 81) throw new Error("NT returned an invalid memory report.");
      const pools = ["SRAM", "DRAM", "DTC", "ITC"].map((name, index) => ({
        name,
        total: decodeUnsigned35(payload.slice(1 + (index * 5), 6 + (index * 5))),
        current: decodeUnsigned35(payload.slice(21 + (index * 5), 26 + (index * 5))),
        required: decodeUnsigned35(payload.slice(41 + (index * 5), 46 + (index * 5)))
      }));
      return {
        available: true,
        pools: pools.map(pool => ({ ...pool, free: pool.total - pool.current, fits: pool.current + pool.required <= pool.total }))
      };
    }

    async readPerformancePageItem(itemIndex) {
      const payload = await this.request(0x57, 0x57, [itemIndex], bytes => bytes[8] === itemIndex);
      const version = payload[0] ?? 0;
      const responseIndex = payload[1] ?? itemIndex;
      const flags = payload[2] ?? 0;
      if (!(flags & 1)) return { version, itemIndex: responseIndex, enabled: false };
      let cursor = 13;
      const upperEnd = payload.indexOf(0, cursor);
      const upperLabel = decodeText(payload.slice(cursor, upperEnd < 0 ? payload.length : upperEnd));
      cursor = upperEnd < 0 ? payload.length : upperEnd + 1;
      const lowerEnd = payload.indexOf(0, cursor);
      const lowerLabel = decodeText(payload.slice(cursor, lowerEnd < 0 ? payload.length : lowerEnd));
      return {
        version,
        itemIndex: responseIndex,
        enabled: true,
        slotIndex: payload[3],
        parameterNumber: decodeUnsigned21(payload.slice(4, 7)),
        min: decodeSignedShort(payload.slice(7, 10)),
        max: decodeSignedShort(payload.slice(10, 13)),
        upperLabel,
        lowerLabel
      };
    }

    async readPerformancePage() {
      const items = [];
      for (let itemIndex = 0; itemIndex < 30; itemIndex += 1) {
        items.push(await this.readPerformancePageItem(itemIndex));
      }
      return items;
    }

    async writeParameter(slot, parameter, value) {
      const encodedParameter = encodeUnsigned21(parameter);
      const encodedValue = encodeUnsigned21(value);
      this.send(0x46, [slot, ...encodedParameter, ...encodedValue]);
      await new Promise(resolve => setTimeout(resolve, 5));
      const payload = await this.request(
        0x45,
        0x45,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter
      );
      const readParameter = decodeUnsigned21(payload.slice(1, 4));
      const readValue = decodeSignedShort(payload.slice(4, 7));
      if (readParameter !== parameter || readValue !== value) throw new Error(`NT parameter readback did not match (expected ${value}, received ${readValue}).`);
      return value;
    }

    savePreset(option = 2) {
      if (!Number.isInteger(option) || option < 0 || option > 2) {
        throw new Error("Invalid NT preset-save option.");
      }
      // 0 asks on the module, 1 generates a new file, 2 overwrites the loaded file.
      // The NT protocol provides no acknowledgement for this command.
      this.send(0x36, [option]);
    }

    loadPreset(path, { append = false } = {}) {
      this.send(0x34, [append ? 1 : 0, ...sdPathBytes(path), 0]);
    }

    async readSDDirectory(path = "/") {
      const operation = 1;
      const data = [operation, ...sdPathBytes(path)];
      const payload = await this.request(0x7A, 0x7A, [...data, sdChecksum(data)], null, 5000);
      return parseSDDirectoryEntries(payload);
    }

    async sdOperation(operation, data = []) {
      const payloadData = [operation, ...data];
      const payload = await this.request(0x7A, 0x7A, [...payloadData, sdChecksum(payloadData)], null, 5000);
      if ((payload[0] ?? 1) !== 0) throw new Error(decodeText(payload.slice(1)) || "The NT rejected that SD-card operation.");
      if (payload[1] !== operation) throw new Error("The NT returned an unexpected SD-card response.");
    }

    createSDDirectory(path) {
      return this.sdOperation(7, sdPathBytes(path));
    }

    renameSDPath(fromPath, toPath) {
      return this.sdOperation(5, [...sdPathBytes(fromPath), 0, ...sdPathBytes(toPath), 0]);
    }

    deleteSDPath(path) {
      return this.sdOperation(3, sdPathBytes(path));
    }

    addAlgorithm(algorithm) {
      if (!algorithm || !Array.isArray(algorithm.guid) || algorithm.guid.length !== 4) {
        throw new Error("Invalid NT algorithm selection.");
      }
      if (algorithm.isPlugin && !algorithm.isLoaded) {
        throw new Error("Load this plug-in before adding it to the preset.");
      }
      const values = (algorithm.specifications || []).slice(0, 3).map(specification => specification.defaultValue ?? 0);
      while (values.length < 3) values.push(0);
      this.send(0x32, [...algorithm.guid, ...values.flatMap(encodeSignedShort)]);
    }

    loadPlugin(algorithm) {
      if (!algorithm?.isPlugin || !Array.isArray(algorithm.guid) || algorithm.guid.length !== 4) {
        throw new Error("Invalid NT plug-in selection.");
      }
      this.send(0x38, algorithm.guid);
    }

    removeAlgorithm(slot) {
      if (!Number.isInteger(slot) || slot < 0 || slot > 127) throw new Error("Invalid disting NT slot removal.");
      this.send(0x33, [slot]);
    }

    async moveAlgorithm(fromSlot, toSlot) {
      if (!Number.isInteger(fromSlot) || !Number.isInteger(toSlot) || fromSlot < 0 || toSlot < 0 || fromSlot > 127 || toSlot > 127) {
        throw new Error("Invalid disting NT slot move.");
      }
      this.send(0x37, [fromSlot & 0x7F, toSlot & 0x7F]);
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    async readParameterPages(slot) {
      const payload = await this.request(0x52, 0x52, [slot], bytes => bytes[7] === slot);
      return parseParameterPages(payload);
    }

    async readParameterMapping(slot, parameter) {
      const encodedParameter = encodeUnsigned21(parameter);
      const payload = await this.request(
        0x4B,
        0x4B,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter
      );
      return parseMappingPayload(payload);
    }

    async readOutputModeUsage(slot, parameter) {
      const encodedParameter = encodeUnsigned21(parameter);
      const payload = await this.request(
        0x55,
        0x55,
        [slot, ...encodedParameter],
        bytes => bytes[7] === slot && decodeUnsigned21(bytes.slice(8, 11)) === parameter,
        350
      );
      const modeParameter = decodeUnsigned21(payload.slice(1, 4));
      const count = payload[4] ?? 0;
      const outputs = [];
      for (let index = 0; index < count; index += 1) {
        const offset = 5 + index * 3;
        outputs.push(decodeUnsigned21(payload.slice(offset, offset + 3)));
      }
      return { parameterIndex: modeParameter, outputParameterIndices: outputs };
    }

    async readSlotEditorState(slot) {
      const parameters = await this.readSlotParameters(slot);
      const pages = await this.readParameterPages(slot);
      const mappings = [];
      for (const parameter of parameters) {
        mappings.push(await this.readParameterMapping(slot, parameter.index));
      }
      const mappingsByParameter = new Map(mappings.map(mapping => [mapping.parameterIndex, mapping]));
      parameters.forEach(parameter => {
        parameter.mapping = mappingsByParameter.get(parameter.index) || null;
      });
      return { parameters, pages, mappings };
    }

    async readSlotRouting(slot) {
      const payload = await this.request(0x61, 0x61, [slot], bytes => bytes[7] === slot);
      return parseRoutingPayload(payload);
    }

    async readRoutingSnapshot(identity) {
      if (!identity?.slots) throw new Error("Read the NT preset identity before routing.");
      const slots = [];
      const totalBusCount = identity.inputBusCount + identity.outputBusCount + identity.auxBusCount;
      for (const slot of identity.slots) {
        const routing = await this.readSlotRouting(slot.index);
        const parameters = await this.readSlotParameters(slot.index);
        const ioParameters = parameters
          .filter(parameter => isRoutingBusParameter(parameter, totalBusCount) || isHardcodedRoutingInput(slot, parameter))
          .map(parameter => isHardcodedRoutingInput(slot, parameter)
            ? { ...parameter, ioFlags: parameter.ioFlags | 0x01 }
            : parameter);
        const outputModeMap = {};
        const outputModeParameterIndices = parameters.filter(parameter => parameter.ioFlags & 0x08).map(parameter => parameter.index);
        slots.push({
          ...slot,
          routing,
          parameters,
          ioParameters,
          outputModeMap,
          outputModeParameterIndices,
          outputModeStatus: outputModeParameterIndices.length ? "pending" : "fixed",
          outputModeErrors: []
        });
      }
      return {
        presetName: identity.presetName,
        inputBusCount: identity.inputBusCount,
        outputBusCount: identity.outputBusCount,
        auxBusCount: identity.auxBusCount,
        slots
      };
    }

    async hydrateRoutingOutputModes(snapshot) {
      for (const slot of snapshot.slots) {
        const outputModeParameters = (slot.parameters || []).filter(parameter => parameter.ioFlags & 0x08);
        slot.outputModeMap = {};
        slot.outputModeErrors = [];
        slot.outputModeStatus = outputModeParameters.length ? "loading" : "fixed";
        for (const parameter of outputModeParameters) {
          try {
            const cacheKey = `${slot.index}:${slot.guidKey}:${slot.parameters.length}:${parameter.index}:${parameter.name}`;
            let usage = this.outputModeUsageCache.get(cacheKey);
            if (!usage) {
              usage = await this.readOutputModeUsage(slot.index, parameter.index);
              this.outputModeUsageCache.set(cacheKey, usage);
            }
            slot.outputModeMap[usage.parameterIndex] = usage.outputParameterIndices;
          } catch (error) {
            slot.outputModeErrors.push({ parameterIndex: parameter.index, message: error.message });
            this.onEvent({ type: "warning", command: 0x55, message: `Output-mode metadata unavailable for slot ${slot.index + 1}, parameter ${parameter.index}: ${error.message}` });
          }
        }
        if (slot.outputModeErrors.length) slot.outputModeStatus = "error";
        else if (outputModeParameters.length) slot.outputModeStatus = "ready";
      }
      return snapshot;
    }

    async readSnapshot() {
      const identity = await this.readIdentity();
      const algorithms = await this.readAlgorithmCatalog();
      const slots = await this.readSlots(identity.slotCount, algorithms);
      for (const slot of slots) slot.bypassed = await this.readSlotBypass(slot.index);
      return { ...identity, algorithms, slots };
    }

    rejectPending(error) {
      if (!this.pending) return;
      clearTimeout(this.pending.timer);
      this.pending.reject(error);
      this.pending = null;
    }

    disconnect() {
      this.rejectPending(new Error("Transport closed."));
      if (this.input) this.input.onmidimessage = null;
      if (this.access) this.access.onstatechange = null;
      this.input = null;
      this.output = null;
      this.access = null;
    }
  }

  if (typeof window !== "undefined") window.NTWebMIDITransport = NTWebMIDITransport;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      NTWebMIDITransport,
      decodeText,
      decodeUnsigned21,
      decodeSignedShort,
      encodeUnsigned21,
      encodeSignedShort,
      guidKey,
      parseRoutingPayload,
      parseParameterPages,
      parseMappingPayload,
      parseMIDIMessage,
      isRoutingBusParameter
    };
  }
})();
