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

  function guidKey(bytes) {
    return bytes.map(value => value.toString(16).padStart(2, "0")).join("");
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

  class NTWebMIDITransport {
    constructor({ sysexId = 0, timeoutMs = 1800, onEvent = () => {} } = {}) {
      this.sysexId = Number(sysexId);
      this.timeoutMs = timeoutMs;
      this.onEvent = onEvent;
      this.access = null;
      this.input = null;
      this.output = null;
      this.pending = null;
      this.handleMessage = this.handleMessage.bind(this);
      this.handleStateChange = this.handleStateChange.bind(this);
    }

    static isSupported() {
      return typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function";
    }

    static choosePort(ports, direction) {
      const candidates = [...ports.values()];
      const preferredSuffix = direction === "input" ? "midi in" : "midi out";
      return candidates.find(port => port.name?.toLowerCase() === `disting nt ${preferredSuffix}`) ||
        candidates.find(port => {
          const name = port.name?.toLowerCase() || "";
          return name.includes("disting nt") && name.includes(preferredSuffix);
        }) ||
        candidates.find(port => port.name?.toLowerCase().includes("disting nt")) ||
        null;
    }

    async connect() {
      if (!NTWebMIDITransport.isSupported()) {
        throw new Error("This browser does not expose Web MIDI. Use desktop Chrome or Edge.");
      }
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
      if (bytes.length < 8 || !bytesMatch(bytes, header) || bytes.at(-1) !== 0xF7) return;
      this.onEvent({ type: "received", command: bytes[6], byteLength: bytes.length });
      if (!this.pending || bytes[6] !== this.pending.responseCommand) return;
      if (this.pending.match && !this.pending.match(bytes)) return;
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timer);
      pending.resolve(bytes.slice(7, -1));
    }

    request(requestCommand, responseCommand, payload = [], match = null) {
      if (!this.output) return Promise.reject(new Error("No disting NT MIDI output is selected."));
      if (this.pending) return Promise.reject(new Error("A read request is already active."));
      const bytes = [...PRODUCT_HEADER, this.sysexId, requestCommand, ...payload, 0xF7];
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pending = null;
          reject(new Error(`Timed out waiting for NT response 0x${responseCommand.toString(16)}.`));
        }, this.timeoutMs);
        this.pending = { responseCommand, match, resolve, reject, timer };
        this.output.send(bytes);
        this.onEvent({ type: "sent", command: requestCommand, byteLength: bytes.length });
      });
    }

    async readIdentity() {
      const versionBytes = await this.request(0x22, 0x32);
      const presetBytes = await this.request(0x41, 0x41);
      const slotBytes = await this.request(0x60, 0x60);
      return {
        version: decodeText(versionBytes),
        presetName: decodeText(presetBytes.slice(0, 21)),
        slotCount: slotBytes[0],
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
        const nameOffset = 8 + (numSpecs * 10);
        algorithms.push({
          index: responseIndex,
          guid,
          guidKey: guidKey(guid),
          name: decodeText(payload.slice(nameOffset, nameOffset + 32)) || "Unknown algorithm"
        });
      }
      return algorithms;
    }

    async readSlots(slotCount, algorithms) {
      if (slotCount < 0 || slotCount > 32) throw new Error(`NT returned an invalid slot count (${slotCount}).`);
      const namesByGuid = new Map(algorithms.map(algorithm => [algorithm.guidKey, algorithm.name]));
      const slots = [];
      for (let slot = 0; slot < slotCount; slot += 1) {
        const payload = await this.request(0x40, 0x40, [slot], bytes => bytes[7] === slot);
        const guid = payload.slice(1, 5);
        slots.push({
          index: slot,
          guid,
          guidKey: guidKey(guid),
          name: decodeText(payload.slice(5, 29)) || `Slot ${slot + 1}`,
          algorithmName: namesByGuid.get(guidKey(guid)) || `Unknown · ${guidKey(guid)}`
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
        while (nameLength < 24 && info[13 + nameLength] !== 0) nameLength += 1;
        const name = decodeText(info.slice(13, 13 + nameLength));
        const metadataOffset = 13 + Math.min(nameLength + 1, 24);
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

      const valuesPayload = await this.request(
        0x44,
        0x44,
        [slot],
        bytes => bytes[7] === slot
      );
      const valueBytes = valuesPayload.slice(1);
      parameters.forEach((parameter, index) => {
        const offset = index * 3;
        parameter.value = offset + 3 <= valueBytes.length
          ? decodeSignedShort(valueBytes.slice(offset, offset + 3))
          : parameter.defaultValue;
      });
      return parameters;
    }

    async readSnapshot() {
      const identity = await this.readIdentity();
      const algorithms = await this.readAlgorithmCatalog();
      const slots = await this.readSlots(identity.slotCount, algorithms);
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
      guidKey,
      parseMIDIMessage
    };
  }
})();
