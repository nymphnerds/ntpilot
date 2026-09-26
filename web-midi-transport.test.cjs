"use strict";

const assert = require("node:assert/strict");
const { NTWebMIDITransport, parseMIDIMessage, parseRoutingPayload, isRoutingBusParameter } = require("./web-midi-transport.js");
const { selectionAcceptsBus, endpointCompatibilityError, writableOutputRoutesForBus } = require("./routing-logic.js");

const header = [0xF0, 0x00, 0x21, 0x27, 0x6D, 0];
const replies = new Map([
  [0x22, [...header, 0x32, ...Buffer.from("1.20.0"), 0xF7]],
  [0x41, [...header, 0x41, ...Buffer.from("Hardware Test"), 0, 0xF7]],
  [0x60, [...header, 0x60, 2, 12, 8, 44, 0xF7]],
  [0x30, [...header, 0x30, 0, 0, 2, 0xF7]]
]);

const algorithms = [
  { guid: [1, 2, 3, 4], name: "Clock", specifications: [{ name: "Division", min: 1, max: 16, defaultValue: 4, type: 0 }] },
  { guid: [5, 6, 7, 8], name: "Custom plug-in", isPlugin: true, filename: "KickSnare.lua" }
];
const slots = [
  { guid: algorithms[0].guid, name: "Master Clocks" },
  { guid: algorithms[1].guid, name: "Kick Snare" }
];
const parameters = [
  { name: "Rate", min: -100, max: 100, defaultValue: 0, unit: 0, scaling: 1, value: 25 },
  { name: "Division", min: 0, max: 15, defaultValue: 4, unit: 1, scaling: 1, value: 7 }
];

function encodeShort(value) {
  const unsigned = value & 0xFFFF;
  return [(unsigned >> 14) & 0x03, (unsigned >> 7) & 0x7F, unsigned & 0x7F];
}

function decodeShort(bytes) {
  const unsigned = ((bytes[0] & 0x03) << 14) | ((bytes[1] & 0x7F) << 7) | (bytes[2] & 0x7F);
  return unsigned & 0x8000 ? unsigned - 0x10000 : unsigned;
}

function encodeUnsigned35(value) {
  const bytes = [0, 0, 0, 0, 0];
  let remaining = value;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    bytes[index] = remaining & 0x7F;
    remaining = Math.floor(remaining / 128);
  }
  return bytes;
}

function encodeUnsigned70(value) {
  const bytes = Array(10).fill(0);
  let remaining = value;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    bytes[index] = remaining & 0x7F;
    remaining = Math.floor(remaining / 128);
  }
  return bytes;
}

function encodeRoutingMask(value) {
  const bytes = [];
  let remaining = BigInt(value);
  for (let index = 0; index < 10; index += 1) {
    bytes.push(Number(remaining & 0x7Fn));
    remaining >>= 7n;
  }
  return bytes;
}

const input = { id: "in", name: "disting NT MIDI IN", onmidimessage: null };
let saveCommand = null;
let moveCommand = null;
let addCommand = null;
let loadPluginCommand = null;
let removeCommand = null;
let loadPresetCommand = null;
let wakeCommand = null;
let setPresetNameCommand = null;
let midiMappingCommand = null;
let algorithmInfoRequests = 0;
const midiMappings = new Map([[0, {
  version: 7,
  cc: 74,
  flags: 17,
  flags2: 0,
  min: parameters[0].min,
  max: parameters[0].max
}]]);
let directoryCommand = null;
let fileDownloadCommand = null;
const fileUploadCommands = [];
let presetFileBytes = Uint8Array.from(Buffer.from('{"name":"Live Set","version":1}', "utf8"));
let sendWrongSDOperationOnce = false;
let sendFragmentedSDListingOnce = false;

function decodeUnsigned70(bytes) {
  return bytes.reduce((value, byte) => (value * 128) + (byte & 0x7F), 0);
}

function decodeNibbles(bytes) {
  const result = new Uint8Array(bytes.length / 2);
  for (let index = 0; index < bytes.length; index += 2) result[index / 2] = (bytes[index] << 4) | bytes[index + 1];
  return result;
}
const output = {
  id: "out",
  name: "disting NT MIDI OUT",
  send(bytes) {
    if (bytes[6] === 0x36) {
      saveCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x37) {
      moveCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x32) {
      addCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x38) {
      loadPluginCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x33) {
      removeCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x34) {
      loadPresetCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x07) {
      wakeCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x47) {
      setPresetNameCommand = [...bytes];
      return;
    }
    if (bytes[6] === 0x4E) {
      midiMappingCommand = [...bytes];
      const parameter = ((bytes[8] & 0x7F) << 14) | ((bytes[9] & 0x7F) << 7) | (bytes[10] & 0x7F);
      const version = bytes[11];
      const limitsOffset = version >= 2 ? 15 : 14;
      midiMappings.set(parameter, {
        version,
        cc: bytes[12],
        flags: bytes[13],
        flags2: version >= 2 ? bytes[14] : 0,
        min: decodeShort(bytes.slice(limitsOffset, limitsOffset + 3)),
        max: decodeShort(bytes.slice(limitsOffset + 3, limitsOffset + 6))
      });
      return;
    }
    let reply = replies.get(bytes[6]);
    if (bytes[6] === 0x31) {
      algorithmInfoRequests += 1;
      const index = bytes[9];
      const algorithm = algorithms[index];
      const specifications = algorithm.specifications || [];
      reply = [
        ...header, 0x31, 0, 0, index, ...algorithm.guid, specifications.length,
        ...specifications.flatMap(specification => [...encodeShort(specification.min), ...encodeShort(specification.max), ...encodeShort(specification.defaultValue), specification.type]),
        ...Buffer.from(algorithm.name), 0, ...specifications.flatMap(specification => [...Buffer.from(specification.name), 0]),
        algorithm.isPlugin ? 1 : 0, 1,
        ...Buffer.from(algorithm.filename || ""), 0, 0xF7
      ];
    }
    if (bytes[6] === 0x39) {
      reply = [
        ...header, 0x39, 3,
        ...[4096, 8192, 2048, 1024].flatMap(encodeUnsigned35),
        ...[1024, 7000, 512, 800].flatMap(encodeUnsigned35),
        ...[512, 1600, 2048, 100].flatMap(encodeUnsigned35),
        ...[0, 0, 0, 0].flatMap(encodeUnsigned35),
        0xF7
      ];
    }
    if (bytes[6] === 0x40) {
      const index = bytes[7];
      const slot = slots[index];
      reply = [...header, 0x40, index, ...slot.guid, ...Buffer.from(slot.name), 0, 0, 0, 0xF7];
    }
    if (bytes[6] === 0x42) {
      const slot = bytes[7];
      reply = [...header, 0x42, slot, ...encodeShort(parameters.length), 0xF7];
    }
    if (bytes[6] === 0x43) {
      const slot = bytes[7];
      const index = bytes[10];
      const parameter = parameters[index];
      reply = [
        ...header, 0x43, slot, ...encodeShort(index), ...encodeShort(parameter.min),
        ...encodeShort(parameter.max), ...encodeShort(parameter.defaultValue), parameter.unit,
        ...Buffer.from(parameter.name), 0, Math.log10(parameter.scaling), 0xF7
      ];
    }
    if (bytes[6] === 0x44) {
      const slot = bytes[7];
      reply = [...header, 0x44, slot, ...parameters.flatMap(parameter => encodeShort(parameter.value)), 0xF7];
    }
    if (bytes[6] === 0x45) {
      const slot = bytes[7];
      const parameter = bytes[10];
      reply = [...header, 0x45, slot, ...encodeShort(parameter), ...encodeShort(slot === 1 ? 1 : 0), 0xF7];
    }
    if (bytes[6] === 0x49) {
      const slot = bytes[7];
      const parameter = bytes[10];
      reply = [...header, 0x49, slot, ...encodeShort(parameter), 2, ...Buffer.from("Profile A"), 0, ...Buffer.from("Profile B"), 0, 0xF7];
    }
    if (bytes[6] === 0x50) {
      const slot = bytes[7];
      const parameter = bytes[10];
      reply = [...header, 0x50, slot, ...encodeShort(parameter), ...Buffer.from("Profile B"), 0, 0xF7];
    }
    if (bytes[6] === 0x52) {
      const slot = bytes[7];
      reply = [
        ...header, 0x52, slot, 2,
        ...Buffer.from("Timing"), 0, 1, 0, 0,
        ...Buffer.from("Division"), 0, 1, 0, 1,
        0xF7
      ];
    }
    if (bytes[6] === 0x55) {
      const slot = bytes[7];
      const modeParameter = bytes[10];
      reply = [...header, 0x55, slot, ...encodeShort(modeParameter), 2, ...encodeShort(3), ...encodeShort(4), 0xF7];
    }
    if (bytes[6] === 0x57) {
      const item = bytes[7];
      reply = item === 0
        ? [...header, 0x57, 1, item, 1, 1, ...encodeShort(1), ...encodeShort(-2), ...encodeShort(12), ...Buffer.from("Macro"), 0, ...Buffer.from("Division"), 0, 0xF7]
        : [...header, 0x57, 1, item, 0, 0xF7];
    }
    if (bytes[6] === 0x4B) {
      const slot = bytes[7];
      const index = bytes[10];
      const mapping = midiMappings.get(index) || {
        version: 7,
        cc: 0,
        flags: 0,
        flags2: 0,
        min: parameters[index].min,
        max: parameters[index].max
      };
      reply = [
        ...header, 0x4B, slot, ...encodeShort(index), mapping.version,
        0, 0, 0, 0, ...encodeShort(0),
        mapping.cc, mapping.flags, ...(mapping.version >= 2 ? [mapping.flags2] : []),
        ...encodeShort(mapping.min), ...encodeShort(mapping.max),
        0xF7
      ];
    }
    if (bytes[6] === 0x61) {
      const slot = bytes[7];
      const masks = slot === 0
        ? [1n, 1n << 12n, 1n << 12n, 0n, 0n, 0n]
        : [1n << 12n, 1n << 20n, 0n, 0n, 0n, 1n];
      reply = [...header, 0x61, slot, ...masks.flatMap(encodeRoutingMask), 0xF7];
    }
    if (bytes[6] === 0x62) reply = [...header, 0x62, 48, 37, 10, 20, 0xF7];
    if (bytes[6] === 0x7A) {
      const operation = bytes[7];
      if (operation === 1) {
        directoryCommand = [...bytes];
        const listing = [
          0x10, 0, 0, 0, 0, 0, 0, ...encodeUnsigned70(0), ...Buffer.from("presets"), 0,
          0, 0, 0, 0, 0, 0, 0, ...encodeUnsigned70(1536), ...Buffer.from("Live Set.json"), 0
        ];
        reply = [...header, 0x7A, 0, 1, ...listing, 0xF7];
      } else if (operation === 2) {
        fileDownloadCommand = [...bytes];
        reply = [...header, 0x7A, 0, 2, ...[...presetFileBytes].flatMap(byte => [(byte >> 4) & 0x0F, byte & 0x0F]), 0xF7];
      } else if (operation === 4) {
        fileUploadCommands.push([...bytes]);
        const pathEnd = bytes.indexOf(0, 8);
        const createAlways = bytes[pathEnd + 1];
        const offset = decodeUnsigned70(bytes.slice(pathEnd + 2, pathEnd + 12));
        const count = decodeUnsigned70(bytes.slice(pathEnd + 12, pathEnd + 22));
        const data = decodeNibbles(bytes.slice(pathEnd + 22, pathEnd + 22 + count * 2));
        const next = new Uint8Array(Math.max(createAlways ? 0 : presetFileBytes.length, offset + data.length));
        if (!createAlways) next.set(presetFileBytes);
        next.set(data, offset);
        presetFileBytes = next;
        reply = [...header, 0x7A, 0, 4, 0xF7];
      } else {
        reply = [...header, 0x7A, 0, operation, 0xF7];
      }
      if (sendWrongSDOperationOnce) {
        sendWrongSDOperationOnce = false;
        const wrongOperation = operation === 1 ? 7 : 1;
        queueMicrotask(() => input.onmidimessage({ data: Uint8Array.from([...header, 0x7A, 0, wrongOperation, 0xF7]) }));
        queueMicrotask(() => input.onmidimessage({ data: Uint8Array.from(reply) }));
        return;
      }
      if (sendFragmentedSDListingOnce) {
        sendFragmentedSDListingOnce = false;
        const splitAt = Math.floor(reply.length / 2);
        queueMicrotask(() => input.onmidimessage({ data: Uint8Array.from(reply.slice(0, splitAt)) }));
        queueMicrotask(() => input.onmidimessage({ data: Uint8Array.from(reply.slice(splitAt)) }));
        return;
      }
    }
    assert.ok(reply, `missing reply fixture for 0x${bytes[6].toString(16)}`);
    queueMicrotask(() => input.onmidimessage({ data: Uint8Array.from(reply) }));
  }
};
const access = {
  inputs: new Map([[input.id, input]]),
  outputs: new Map([[output.id, output]]),
  onstatechange: null
};

global.navigator = { requestMIDIAccess: async options => {
  assert.deepEqual(options, { sysex: true });
  return access;
} };

(async () => {
  const legacyPorts = {
    forEach(callback) {
      callback(input, input.id, this);
    }
  };
  assert.equal(NTWebMIDITransport.choosePort(legacyPorts, "input"), input);
  assert.equal(NTWebMIDITransport.choosePort([
    { id: "stale-in", name: "disting NT MIDI IN", state: "disconnected" },
    input
  ], "input"), input);
  assert.deepEqual(parseMIDIMessage([0xBE, 9, 100]), {
    kind: "channel",
    subtype: "cc",
    label: "Ch 15 · CC 9 · value 100",
    channel: 15,
    controller: 9,
    value: 100,
    hex: "BE 09 64"
  });
  assert.equal(parseMIDIMessage([...header, 0x45, 0, 0xF7]).kind, "sysex");
  assert.deepEqual(parseRoutingPayload([0, ...[
    1n, 1n << 12n, 1n << 12n, 0n, 0n, 0n
  ].flatMap(encodeRoutingMask)]), {
    slot: 0,
    format: "wide",
    inputMask: 1n,
    outputMask: 1n << 12n,
    replaceMask: 1n << 12n,
    mappingInputMask: 0n,
    masks: [1n, 1n << 12n, 1n << 12n, 0n, 0n, 0n]
  });
  assert.equal(isRoutingBusParameter({ name: "Audio input", min: 0, max: 64, ioFlags: 1 }, 64), true);
  assert.equal(isRoutingBusParameter({ name: "Main output", min: 0, max: 64, ioFlags: 2 }, 64), true);
  assert.equal(isRoutingBusParameter({ name: "Radio Station:Output path", min: 0, max: 1, ioFlags: 2 }, 64), true);
  assert.equal(isRoutingBusParameter({ name: "Ordinary enum", min: 0, max: 64, ioFlags: 0 }, 64), false);
  assert.equal(NTWebMIDITransport.isRoutingBusParameter({ name: "Gate input", min: 0, max: 64, ioFlags: 1 }, 64), true);
  const physicalOutput6Bus = 12 + 5;
  const writableOutput = { side: "output", parameterIndex: 4, minimum: 0, maximum: 64 };
  const writableInput = { side: "input", parameterIndex: 3, minimum: 0, maximum: 64 };
  assert.equal(physicalOutput6Bus + 1, 18);
  assert.equal(selectionAcceptsBus(writableOutput, physicalOutput6Bus), true);
  assert.equal(endpointCompatibilityError(writableOutput, { side: "sink", bus: physicalOutput6Bus }), null);
  assert.match(endpointCompatibilityError(writableInput, { side: "sink", bus: physicalOutput6Bus }), /algorithm output/);
  assert.match(endpointCompatibilityError(writableOutput, { side: "source", bus: 5 }), /algorithm input/);
  assert.deepEqual(writableOutputRoutesForBus([
    { index: 2, ioParameters: [{ index: 4, ioFlags: 2, value: 18, min: 0, max: 64 }] },
    { index: 7, ioParameters: [{ index: 9, ioFlags: 2, value: 18, min: 0, max: 64 }, { index: 10, ioFlags: 1, value: 18, min: 0, max: 64 }] }
  ], physicalOutput6Bus, { slotIndex: 7, parameterIndex: 9 }), [
    { side: "output", bus: physicalOutput6Bus, slotIndex: 2, parameterIndex: 4, minimum: 0, maximum: 64 }
  ]);

  const events = [];
  const transport = new NTWebMIDITransport({ sysexId: 0, timeoutMs: 100, onEvent: event => events.push(event) });
  const ports = await transport.connect();
  assert.equal(ports.input, input.name);
  assert.equal(ports.output, output.name);
  const initialSnapshot = await transport.readSnapshot();
  assert.deepEqual(initialSnapshot, {
    version: "1.20.0",
    presetName: "Hardware Test",
    slotCount: 2,
    inputBusCount: 12,
    outputBusCount: 8,
    auxBusCount: 44,
    inputName: input.name,
    outputName: output.name,
    sysexId: 0,
    algorithms: [
      { index: 0, guid: [1, 2, 3, 4], guidKey: "01020304", name: "Clock", factoryName: "Clock", isPlugin: false, isLoaded: true, filename: "", specifications: [{ min: 1, max: 16, defaultValue: 4, type: 0, name: "Division" }] },
      { index: 1, guid: [5, 6, 7, 8], guidKey: "05060708", name: "KickSnare", factoryName: "Custom plug-in", isPlugin: true, isLoaded: true, filename: "KickSnare.lua", specifications: [] }
    ],
    slots: [
      { index: 0, guid: [1, 2, 3, 4], guidKey: "01020304", name: "Master Clocks", algorithmName: "Clock", algorithmFactoryName: "Clock", isPlugin: false, pluginFilename: null, bypassed: false },
      { index: 1, guid: [5, 6, 7, 8], guidKey: "05060708", name: "Kick Snare", algorithmName: "KickSnare", algorithmFactoryName: "Custom plug-in", isPlugin: true, pluginFilename: "KickSnare.lua", bypassed: true }
    ]
  });
  assert.equal(algorithmInfoRequests, algorithms.length);
  const cachedSnapshot = await transport.readSnapshot({ algorithms: initialSnapshot.algorithms });
  assert.equal(cachedSnapshot.slots.length, slots.length);
  assert.equal(algorithmInfoRequests, algorithms.length);
  assert.deepEqual(await transport.readSlotParameters(0), [
    {
      index: 0,
      name: "Rate",
      min: -100,
      max: 100,
      defaultValue: 0,
      unit: 0,
      scaling: 1,
      ioFlags: 0,
      value: 25
    },
    {
      index: 1,
      name: "Division",
      min: 0,
      max: 15,
      defaultValue: 4,
      unit: 1,
      scaling: 1,
      ioFlags: 0,
      value: 7
    }
  ]);
  assert.equal(await transport.readSlotCount(), 2);
  assert.deepEqual(await transport.readSlotAlgorithm(1), {
    index: 1,
    guid: [5, 6, 7, 8],
    guidKey: "05060708",
    name: "Kick Snare"
  });
  const editorState = await transport.readSlotEditorState(0);
  assert.deepEqual(editorState.pages, [
    { index: 0, name: "Timing", parameterIndices: [0] },
    { index: 1, name: "Division", parameterIndices: [1] }
  ]);
  assert.equal(editorState.parameters[0].mapping.midi.enabled, true);
  assert.equal(editorState.parameters[0].mapping.midi.channel, 3);
  assert.equal(editorState.parameters[0].mapping.midi.cc, 74);
  assert.equal(editorState.parameters[0].mapping.midi.type, "CC");
  assert.equal(editorState.parameters[1].mapping.midi.enabled, false);
  const confirmedMapping = await transport.writeMIDIMapping(0, 0, {
    version: 7,
    channel: 16,
    type: "Pitch bend",
    cc: 9,
    min: -12,
    max: 34,
    enabled: true,
    relative: true,
    symmetric: true,
    viewChange: true
  });
  assert.deepEqual(confirmedMapping.midi, {
    cc: 9,
    channel: 16,
    typeCode: 5,
    type: "Pitch bend",
    enabled: true,
    symmetric: true,
    relative: true,
    viewChange: true,
    min: -12,
    max: 34
  });
  assert.deepEqual(midiMappingCommand.slice(6, -1), [
    0x4E, 0, 0, 0, 0, 7, 9, 123, 23,
    ...encodeShort(-12), ...encodeShort(34)
  ]);
  await assert.rejects(() => transport.writeMIDIMapping(0, 0, {
    version: 7, channel: 0, type: "CC", cc: 1, min: 0, max: 1
  }), /channels must be between 1 and 16/i);
  assert.deepEqual(await transport.readOutputModeUsage(0, 1), {
    parameterIndex: 1,
    outputParameterIndices: [3, 4]
  });
  assert.deepEqual(await transport.readCpuUsage(), {
    audioThread: 48,
    overall: 37,
    slots: [10, 20]
  });
  const memory = await transport.readMemoryUsage(algorithms[0]);
  assert.equal(memory.available, true);
  assert.deepEqual(memory.pools.map(pool => [pool.name, pool.total, pool.current, pool.required, pool.fits]), [
    ["SRAM", 4096, 1024, 512, true],
    ["DRAM", 8192, 7000, 1600, false],
    ["DTC", 2048, 512, 2048, false],
    ["ITC", 1024, 800, 100, true]
  ]);
  assert.deepEqual(await transport.readParameterEnumStrings(1, 1), ["Profile A", "Profile B"]);
  assert.equal(await transport.readParameterValueString(1, 1), "Profile B");
  const performancePage = await transport.readPerformancePage();
  assert.equal(performancePage.length, 30);
  assert.deepEqual(performancePage[0], {
    version: 1,
    itemIndex: 0,
    enabled: true,
    slotIndex: 1,
    parameterNumber: 1,
    min: -2,
    max: 12,
    upperLabel: "Macro",
    lowerLabel: "Division"
  });
  assert.deepEqual(performancePage[29], { version: 1, itemIndex: 29, enabled: false });
  transport.savePreset();
  assert.equal(saveCommand[6], 0x36);
  assert.equal(saveCommand[7], 2);
  await transport.moveAlgorithm(1, 0);
  assert.deepEqual(moveCommand.slice(6, 9), [0x37, 1, 0]);
  transport.addAlgorithm({ guid: algorithms[0].guid, specifications: [{ defaultValue: -1 }, { defaultValue: 4 }] });
  assert.deepEqual(addCommand.slice(6, -1), [0x32, 1, 2, 3, 4, 3, 127, 127, 0, 0, 4, 0, 0, 0]);
  transport.loadPlugin({ guid: algorithms[1].guid, isPlugin: true });
  assert.deepEqual(loadPluginCommand.slice(6, 11), [0x38, 5, 6, 7, 8]);
  transport.removeAlgorithm(1);
  assert.deepEqual(removeCommand.slice(6, 8), [0x33, 1]);
  transport.loadPreset("/presets/Live Set.json", { append: true });
  assert.deepEqual(loadPresetCommand.slice(6, 8), [0x34, 1]);
  assert.equal(loadPresetCommand.at(-2), 0);
  transport.setPresetName("Renamed preset");
  assert.deepEqual(setPresetNameCommand.slice(6, -1), [0x47, ...Buffer.from("Renamed preset"), 0]);
  assert.throws(() => transport.setPresetName(""), /preset name is required/i);
  assert.throws(() => transport.setPresetName("x".repeat(32)), /31 characters/i);
  await transport.wake();
  assert.deepEqual(wakeCommand.slice(6, 8), [0x07, 0xF7]);
  const directory = await transport.readSDDirectory("/presets");
  assert.deepEqual(directory.map(entry => [entry.name, entry.isDirectory, entry.size]), [["presets", true, 0], ["Live Set.json", false, 1536]]);
  assert.deepEqual(directoryCommand.slice(6, -1), [0x7A, 1, ...Buffer.from("/presets/"), 27]);
  sendWrongSDOperationOnce = true;
  const matchedDirectory = await transport.readSDDirectory("/presets");
  assert.deepEqual(matchedDirectory.map(entry => entry.name), ["presets", "Live Set.json"]);
  sendFragmentedSDListingOnce = true;
  const fragmentedDirectory = await transport.readSDDirectory("/presets");
  assert.deepEqual(fragmentedDirectory.map(entry => entry.name), ["presets", "Live Set.json"]);
  await transport.createSDDirectory("/presets/New");
  await transport.renameSDPath("/presets/New", "/presets/Renamed");
  await transport.deleteSDPath("/presets/Renamed");
  assert.equal(new TextDecoder().decode(await transport.readSDFile("/presets/Live Set.json")), '{"name":"Live Set","version":1}');
  assert.deepEqual(fileDownloadCommand.slice(6, -1), [0x7A, 2, ...Buffer.from("/presets/Live Set.json"), 86]);
  const editedPreset = Uint8Array.from({ length: 700 }, (_, index) => index & 0xFF);
  await transport.writeSDFile("/presets/Live Set.json", editedPreset);
  assert.equal(fileUploadCommands.length, 2);
  assert.deepEqual(fileUploadCommands[0].slice(6, 8), [0x7A, 4]);
  assert.equal(fileUploadCommands[0][8 + Buffer.byteLength("/presets/Live Set.json")], 0);
  assert.equal(fileUploadCommands[0][9 + Buffer.byteLength("/presets/Live Set.json")], 1);
  assert.equal(fileUploadCommands[1][9 + Buffer.byteLength("/presets/Live Set.json")], 0);
  assert.deepEqual([...await transport.readSDFile("/presets/Live Set.json")], [...editedPreset]);
  const routing = await transport.readRoutingSnapshot(await transport.readSnapshot());
  assert.equal(routing.slots.length, 2);
  assert.equal(routing.slots[0].outputModeStatus, "fixed");
  assert.equal(routing.slots[0].routing.inputMask, 1n);
  assert.equal(routing.slots[0].routing.outputMask, 1n << 12n);
  assert.equal(routing.slots[1].routing.mappingInputMask, 1n);
  const outputModeSnapshot = {
    slots: [{
      index: 0,
      guidKey: "01020304",
      parameters: [{ index: 1, name: "Output mode", ioFlags: 0x08, value: 0 }],
      outputModeMap: {},
      outputModeStatus: "pending",
      outputModeErrors: []
    }]
  };
  await transport.hydrateRoutingOutputModes(outputModeSnapshot);
  assert.equal(outputModeSnapshot.slots[0].outputModeStatus, "ready");
  assert.deepEqual(outputModeSnapshot.slots[0].outputModeMap, { 1: [3, 4] });
  const failedOutputModeSnapshot = {
    slots: [{
      index: 1,
      guidKey: "failure-case",
      parameters: [{ index: 2, name: "Output mode", ioFlags: 0x08, value: 0 }],
      outputModeMap: { 99: [99] },
      outputModeStatus: "pending",
      outputModeErrors: []
    }]
  };
  const readOutputModeUsage = transport.readOutputModeUsage;
  transport.readOutputModeUsage = async () => { throw new Error("mode metadata timeout"); };
  await transport.hydrateRoutingOutputModes(failedOutputModeSnapshot);
  transport.readOutputModeUsage = readOutputModeUsage;
  assert.equal(failedOutputModeSnapshot.slots[0].outputModeStatus, "error");
  assert.deepEqual(failedOutputModeSnapshot.slots[0].outputModeMap, {});
  assert.equal(failedOutputModeSnapshot.slots[0].outputModeErrors[0].message, "mode metadata timeout");
  input.onmidimessage({ data: Uint8Array.from([0xB2, 74, 91]), receivedTime: 42 });
  const ccEvent = events.find(event => event.type === "midi-message" && event.message.subtype === "cc");
  assert.equal(ccEvent.message.label, "Ch 3 · CC 74 · value 91");
  assert.ok(events.some(event => event.type === "midi-message" && event.message.kind === "sysex"));
  input.state = "disconnected";
  access.onstatechange({ port: input });
  assert.equal(events.at(-1).type, "disconnected");
  input.state = "connected";
  access.onstatechange({ port: input });
  assert.equal(events.at(-1).type, "ports-changed");
  assert.equal(input.onmidimessage, transport.handleMessage);
  transport.disconnect();
  console.log("web-midi-transport: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
