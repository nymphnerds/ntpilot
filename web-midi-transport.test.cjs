"use strict";

const assert = require("node:assert/strict");
const { NTWebMIDITransport, parseMIDIMessage, parseRoutingPayload, isRoutingBusParameter } = require("./web-midi-transport.js");

const header = [0xF0, 0x00, 0x21, 0x27, 0x6D, 0];
const replies = new Map([
  [0x22, [...header, 0x32, ...Buffer.from("1.20.0"), 0xF7]],
  [0x41, [...header, 0x41, ...Buffer.from("Hardware Test"), 0, 0xF7]],
  [0x60, [...header, 0x60, 2, 12, 8, 44, 0xF7]],
  [0x30, [...header, 0x30, 0, 0, 2, 0xF7]]
]);

const algorithms = [
  { guid: [1, 2, 3, 4], name: "Clock" },
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
const output = {
  id: "out",
  name: "disting NT MIDI OUT",
  send(bytes) {
    if (bytes[6] === 0x36) {
      saveCommand = [...bytes];
      return;
    }
    let reply = replies.get(bytes[6]);
    if (bytes[6] === 0x31) {
      const index = bytes[9];
      const algorithm = algorithms[index];
      reply = [
        ...header, 0x31, 0, 0, index, ...algorithm.guid, 0,
        ...Buffer.from(algorithm.name), 0,
        algorithm.isPlugin ? 1 : 0, 1,
        ...Buffer.from(algorithm.filename || ""), 0, 0xF7
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
      const enabled = index === 0;
      reply = [
        ...header, 0x4B, slot, ...encodeShort(index), 7,
        0, 0, 0, 0, ...encodeShort(0),
        enabled ? 74 : 0, enabled ? 17 : 0, 0,
        ...encodeShort(parameters[index].min), ...encodeShort(parameters[index].max),
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

  const events = [];
  const transport = new NTWebMIDITransport({ sysexId: 0, timeoutMs: 100, onEvent: event => events.push(event) });
  const ports = await transport.connect();
  assert.equal(ports.input, input.name);
  assert.equal(ports.output, output.name);
  assert.deepEqual(await transport.readSnapshot(), {
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
      { index: 0, guid: [1, 2, 3, 4], guidKey: "01020304", name: "Clock", factoryName: "Clock", isPlugin: false, isLoaded: true, filename: "" },
      { index: 1, guid: [5, 6, 7, 8], guidKey: "05060708", name: "KickSnare", factoryName: "Custom plug-in", isPlugin: true, isLoaded: true, filename: "KickSnare.lua" }
    ],
    slots: [
      { index: 0, guid: [1, 2, 3, 4], guidKey: "01020304", name: "Master Clocks", algorithmName: "Clock", algorithmFactoryName: "Clock", isPlugin: false, pluginFilename: null },
      { index: 1, guid: [5, 6, 7, 8], guidKey: "05060708", name: "Kick Snare", algorithmName: "KickSnare", algorithmFactoryName: "Custom plug-in", isPlugin: true, pluginFilename: "KickSnare.lua" }
    ]
  });
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
  assert.deepEqual(await transport.readOutputModeUsage(0, 1), {
    parameterIndex: 1,
    outputParameterIndices: [3, 4]
  });
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
  const routing = await transport.readRoutingSnapshot(await transport.readSnapshot());
  assert.equal(routing.slots.length, 2);
  assert.equal(routing.slots[0].routing.inputMask, 1n);
  assert.equal(routing.slots[0].routing.outputMask, 1n << 12n);
  assert.equal(routing.slots[1].routing.mappingInputMask, 1n);
  input.onmidimessage({ data: Uint8Array.from([0xB2, 74, 91]), receivedTime: 42 });
  const ccEvent = events.find(event => event.type === "midi-message" && event.message.subtype === "cc");
  assert.equal(ccEvent.message.label, "Ch 3 · CC 74 · value 91");
  assert.ok(events.some(event => event.type === "midi-message" && event.message.kind === "sysex"));
  transport.disconnect();
  console.log("web-midi-transport: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
