(() => {
  "use strict";

  const state = { access: null, opening: null, ports: new Map(), clients: new Map(), inputBuffers: new Map() };
  const INPUT_OFFSET = 1000;
  const OUTPUT_OFFSET = 2000;

  function send(detail) {
    document.dispatchEvent(new CustomEvent("jazz-midi", { detail }));
  }

  function makePort(kind, descriptor, index) {
    const client = (kind === "input" ? INPUT_OFFSET : OUTPUT_OFFSET) + index;
    const port = {
      id: `${kind}:${descriptor.name}:${index}`,
      name: descriptor.name,
      manufacturer: descriptor.manufacturer || "",
      version: descriptor.version || "",
      state: "connected",
      connection: "open",
      type: kind,
      onmidimessage: null,
      open: async () => port,
      close: async () => port
    };
    if (kind === "output") port.send = bytes => send(["play", client, ...Array.from(bytes)]);
    state.ports.set(client, port);
    return { client, port };
  }

  // Jazz delivers the bytes it receives from the Windows MIDI driver. Drivers
  // may split a long SysEx reply across callbacks, while Web MIDI presents one
  // complete SysEx message. Restore that contract before NTPilot sees it.
  function deliverInput(client, incoming) {
    const port = state.ports.get(client);
    if (!port?.onmidimessage) return;

    const buffered = state.inputBuffers.get(client) || [];
    const bytes = [...buffered, ...incoming.map(value => Number(value) & 0xFF)];
    let offset = 0;

    while (offset < bytes.length) {
      const start = bytes.indexOf(0xF0, offset);
      if (start === -1) {
        if (offset < bytes.length) {
          port.onmidimessage({ data: Uint8Array.from(bytes.slice(offset)), receivedTime: performance.now() });
        }
        state.inputBuffers.delete(client);
        return;
      }

      if (start > offset) {
        port.onmidimessage({ data: Uint8Array.from(bytes.slice(offset, start)), receivedTime: performance.now() });
      }

      const end = bytes.indexOf(0xF7, start + 1);
      if (end === -1) {
        state.inputBuffers.set(client, bytes.slice(start));
        return;
      }

      port.onmidimessage({ data: Uint8Array.from(bytes.slice(start, end + 1)), receivedTime: performance.now() });
      offset = end + 1;
    }

    state.inputBuffers.delete(client);
  }

  function refreshAccess(detail) {
    const inputs = new Map();
    const outputs = new Map();
    const opening = [];
    (detail.ins || []).forEach((descriptor, index) => {
      const { client, port } = makePort("input", descriptor, index);
      inputs.set(port.id, port);
      opening.push(client);
      send(["openin", client, descriptor.name]);
    });
    (detail.outs || []).forEach((descriptor, index) => {
      const { client, port } = makePort("output", descriptor, index);
      outputs.set(port.id, port);
      opening.push(client);
      send(["openout", client, descriptor.name]);
    });
    state.access = { inputs, outputs, onstatechange: null, sysexEnabled: true };
    state.opening = new Set(opening);
    if (!opening.length) resolveAccess();
  }

  function resolveAccess() {
    if (!state.opening || state.opening.size) return;
    const resolve = state.resolve;
    state.resolve = null;
    state.opening = null;
    if (resolve) resolve(state.access);
  }

  document.addEventListener("jazz-midi-msg", event => {
    const [type, client, ...rest] = event.detail;
    if (type === "refresh") {
      refreshAccess(client);
      return;
    }
    if (type === "openin" || type === "openout") {
      state.opening?.delete(client);
      resolveAccess();
      return;
    }
    if (type === "midi") {
      const bytes = rest.slice(1);
      deliverInput(client, bytes);
    }
  });

  navigator.requestMIDIAccess = async () => {
    if (state.access && !state.opening) return state.access;
    return new Promise((resolve, reject) => {
      state.resolve = resolve;
      state.reject = reject;
      send(["refresh"]);
      window.setTimeout(() => {
        if (state.resolve !== resolve) return;
        state.resolve = null;
        state.opening = null;
        reject(new Error("Timed out opening local Windows MIDI ports."));
      }, 5000);
    });
  };
})();
