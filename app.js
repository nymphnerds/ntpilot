(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const frame = $("#device-frame");
  const connectionPill = $("#connection-pill");
  const connectionLabel = $("#connection-label");
  const stateBanner = $("#state-banner");
  const stateBannerTitle = $("#state-banner-title");
  const stateBannerCopy = $("#state-banner-copy");
  const stateAction = $("#state-action");
  const toast = $("#toast");
  const mappingForm = $("#mapping-form");
  const mappingConfirmation = $("#mapping-confirmation");
  const applyMapping = $("#apply-mapping");
  const resetMapping = $("#reset-mapping");
  const mappingWarning = $("#mapping-warning");
  const mapCC = $("#map-cc");
  const mapChannel = $("#map-channel");
  const mapType = $("#map-type");
  const mapEnabled = $("#map-enabled");
  const mapRelative = $("#map-relative");
  const mapSymmetric = $("#map-symmetric");
  const mapMin = $("#map-min");
  const mapMax = $("#map-max");
  const mappingCount = $("#mapping-count");
  const mappingSourceCopy = $("#mapping-source-copy");
  const mappingEmpty = $("#mapping-empty");
  const mappingEmptyCard = $("#mapping-empty-card");
  const transportMode = $("#transport-mode");
  const connectMIDI = $("#connect-midi");
  const deviceStateControl = $("#device-state");
  const slotList = $(".slot-list");
  const simulatedSlotMarkup = slotList.innerHTML;
  const midiMonitorLog = $("#midi-monitor-log");
  const midiMonitorFilter = $("#midi-monitor-filter");
  const routingViewport = $("#routing-viewport");
  const routingZoomLayer = $("#routing-zoom-layer");
  const routingCanvas = $("#routing-canvas");
  const routingWires = $("#routing-wires");
  const routingNodes = $("#routing-nodes");
  const routingAuxPalette = $("#routing-aux-palette");
  const routingLoading = $("#routing-loading");
  const routingReadButton = $("#routing-read-button");
  const routingConnectButton = $("#routing-connect-button");
  const routingSourceCopy = $("#routing-source-copy");
  const routingInspector = $("#routing-inspector");

  const state = {
    surface: "app",
    hostSize: "expanded",
    transport: "simulation",
    ntTransport: null,
    liveIdentity: null,
    liveRouting: null,
    routingReadPromise: null,
    routingReadToken: 0,
    routingZoom: 1,
    routingCanvasSize: { width: 1180, height: 760 },
    routingSnapshot: null,
    routingSelection: null,
    routingBusSelection: null,
    device: "ready",
    view: "editor",
    mappingDirty: false,
    selectedMapping: null,
    mappingBaseline: null,
    undoMapping: null,
    hasOfflineDraft: false,
    toastTimer: null,
    learnTimer: null,
    parameterReadToken: 0,
    parameterReadQueue: Promise.resolve(),
    liveParameters: new Map(),
    activeLiveSlotIndex: null,
    syncMode: "smart",
    pollTimer: null,
    pollToken: 0,
    pollInFlight: null,
    lastPollError: null,
    midiEvents: [],
    midiRenderPending: false,
    midiCounts: { all: 0, channel: 0, sysex: 0 }
  };

  const deviceStates = {
    ready: {
      label: "Ready",
      title: "",
      copy: "",
      action: "",
      bannerClass: ""
    },
    syncing: {
      label: "Synchronizing",
      title: "Synchronizing with disting NT",
      copy: "Reading the current preset. Editing remains locked until the snapshot is complete.",
      action: "View progress",
      bannerClass: ""
    },
    disconnected: {
      label: "Disconnected",
      title: "disting NT is unavailable",
      copy: "Showing the last confirmed snapshot in read-only mode. Check the USB connection to continue.",
      action: "Try again",
      bannerClass: "disconnected"
    },
    owned: {
      label: "Read only",
      title: "Another instance has control",
      copy: "This view is read-only until the current owner checkpoints and releases the NT connection.",
      action: "Request control",
      bannerClass: "owned"
    },
    offline: {
      label: "Offline draft",
      title: "Editing a local preset",
      copy: "No NT is connected. Changes stay in this local draft and will be compared before any later hardware apply.",
      action: "Draft details",
      bannerClass: "offline"
    },
    labWaiting: {
      label: "Not connected",
      title: "Real NT lab mode",
      copy: "Connect to read the NT. Confirmed routing changes can write to the loaded preset.",
      action: "Connect",
      bannerClass: "offline"
    },
    labConnected: {
      label: "NT detected",
      title: "Real NT connected",
      copy: "Routing writes are enabled with confirmation and readback. Other live editor surfaces remain read-only.",
      action: "Read again",
      bannerClass: "offline"
    }
  };

  function showToast(message) {
    clearTimeout(state.toastTimer);
    $("span", toast).textContent = message;
    toast.classList.add("visible");
    state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function formatMonitorTime(wallTime) {
    return new Date(wallTime).toISOString().slice(11, 23);
  }

  function renderMIDIMonitor() {
    if (!midiMonitorLog) return;
    $("#midi-count-all").textContent = String(state.midiCounts.all);
    $("#midi-count-channel").textContent = String(state.midiCounts.channel);
    $("#midi-count-sysex").textContent = String(state.midiCounts.sysex);
    const filter = midiMonitorFilter.value;
    const visible = state.midiEvents.filter(entry => filter === "all" || entry.message.kind === filter);
    midiMonitorLog.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "midi-monitor-empty";
      empty.textContent = filter === "channel"
        ? "No channel MIDI received yet. Move a fader connected to the NT."
        : `No ${filter === "sysex" ? "SysEx" : "MIDI"} messages received yet.`;
      midiMonitorLog.appendChild(empty);
      return;
    }
    visible.slice(0, 80).forEach(entry => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      time.dateTime = new Date(entry.wallTime).toISOString();
      time.textContent = formatMonitorTime(entry.wallTime);
      const kind = document.createElement("span");
      kind.className = `midi-kind ${entry.message.kind}`;
      kind.textContent = entry.message.kind === "sysex" ? "SysEx" : entry.message.kind === "channel" ? "MIDI" : "System";
      const label = document.createElement("strong");
      label.textContent = entry.message.label;
      const raw = document.createElement("code");
      raw.textContent = entry.message.hex.length > 74 ? `${entry.message.hex.slice(0, 74)} …` : entry.message.hex;
      item.append(time, kind, label, raw);
      midiMonitorLog.appendChild(item);
    });
  }

  function resetMIDIMonitor() {
    state.midiEvents = [];
    state.midiCounts = { all: 0, channel: 0, sysex: 0 };
    renderMIDIMonitor();
  }

  function scheduleMIDIMonitorRender() {
    if (state.midiRenderPending) return;
    state.midiRenderPending = true;
    requestAnimationFrame(() => {
      state.midiRenderPending = false;
      renderMIDIMonitor();
    });
  }

  function recordMIDIEvent(event) {
    state.midiCounts.all += 1;
    if (event.message.kind === "channel") state.midiCounts.channel += 1;
    if (event.message.kind === "sysex") state.midiCounts.sysex += 1;
    state.midiEvents.unshift(event);
    if (state.midiEvents.length > 200) state.midiEvents.length = 200;
    scheduleMIDIMonitorRender();
    if (event.message.subtype === "cc") applyLiveCCFeedback(event.message);
  }

  function applyLiveCCFeedback(message) {
    if (state.transport !== "real") return;
    state.liveParameters.forEach(entry => {
      const midi = entry.parameter.mapping?.midi;
      if (!midi?.enabled || midi.type !== "CC" || midi.relative) return;
      if (midi.channel !== message.channel || midi.cc !== message.controller) return;
      const lower = Math.min(midi.min, midi.max);
      const upper = Math.max(midi.min, midi.max);
      const mapped = midi.min + (message.value / 127) * (midi.max - midi.min);
      const value = Math.min(entry.parameter.max, Math.max(entry.parameter.min,
        Math.min(upper, Math.max(lower, Math.round(mapped)))));
      updateLiveParameterEntry(entry, value, "midi-feedback");
    });
  }

  function updateLiveParameterEntry(entry, value, feedbackClass = "poll-feedback") {
    if (entry.parameter.value === value) return;
    entry.parameter.value = value;
    entry.slider.value = String(value);
    entry.output.textContent = formatParameterValue(entry.parameter);
    entry.row.classList.remove("midi-feedback", "poll-feedback");
    requestAnimationFrame(() => entry.row.classList.add(feedbackClass));
    clearTimeout(entry.feedbackTimer);
    entry.feedbackTimer = setTimeout(() => entry.row.classList.remove(feedbackClass), 180);
  }

  function stopLivePolling() {
    clearTimeout(state.pollTimer);
    state.pollTimer = null;
    state.pollToken += 1;
    return state.pollInFlight;
  }

  function pollingDelay() {
    if (state.syncMode === "fast") return 100;
    if (state.syncMode === "smart") return 250;
    return null;
  }

  function startLivePolling(slotIndex) {
    stopLivePolling();
    state.activeLiveSlotIndex = slotIndex;
    const delay = pollingDelay();
    if (delay == null || !state.ntTransport || document.hidden) return;
    const token = state.pollToken;

    const poll = async () => {
      if (token !== state.pollToken || !state.ntTransport || state.activeLiveSlotIndex !== slotIndex) return;
      const request = state.ntTransport.readSlotParameterValues(slotIndex);
      state.pollInFlight = request;
      try {
        const values = await request;
        if (token !== state.pollToken || state.activeLiveSlotIndex !== slotIndex) return;
        state.liveParameters.forEach(entry => {
          if (entry.slotInfo.index !== slotIndex) return;
          const value = values[entry.parameter.index];
          if (value != null) updateLiveParameterEntry(entry, value);
        });
        state.lastPollError = null;
      } catch (error) {
        if (token === state.pollToken && error.message !== state.lastPollError) {
          state.lastPollError = error.message;
          showToast(`Live refresh delayed · ${error.message}`);
        }
      } finally {
        if (state.pollInFlight === request) state.pollInFlight = null;
        if (token === state.pollToken && state.ntTransport && state.activeLiveSlotIndex === slotIndex) {
          state.pollTimer = setTimeout(poll, delay);
        }
      }
    };

    state.pollTimer = setTimeout(poll, delay);
  }

  function routingMask(indices) {
    return indices.reduce((mask, index) => mask | (1n << BigInt(index)), 0n);
  }

  function routingRecord(slot, inputs = [], outputs = [], mappings = [], replaces = outputs) {
    const masks = [routingMask(inputs), routingMask(outputs), routingMask(replaces), 0n, 0n, routingMask(mappings)];
    return {
      slot,
      format: "fixture",
      inputMask: masks[0],
      outputMask: masks[1],
      replaceMask: masks[2],
      mappingInputMask: masks[5],
      masks
    };
  }

  function makeSimulatedRoutingSnapshot() {
    const inputBusCount = 12;
    const outputBusCount = 8;
    const aux = number => inputBusCount + outputBusCount + number - 1;
    const output = number => inputBusCount + number - 1;
    const fixture = [
      { inputs: [], outputs: [aux(2), aux(3), aux(8), aux(9)] },
      { inputs: [], outputs: [aux(13), aux(14), aux(15)] },
      { inputs: [0, 1], outputs: [aux(1), aux(2), aux(3), aux(4)] },
      { inputs: [0, 1], outputs: [aux(4), aux(5)] },
      { inputs: [aux(4), aux(5)], outputs: [aux(8), aux(9)] },
      { inputs: [4, 5], outputs: [aux(6), aux(7)] },
      { inputs: [aux(1), aux(2), aux(3), aux(4), aux(6), aux(7), aux(8), aux(9), aux(13)], outputs: [output(1), output(2), output(3), output(4), output(5), output(7), output(8), aux(17), aux(18), aux(19), aux(20)], mappings: [aux(15), aux(16)] },
      { inputs: [aux(9), aux(13), aux(23), aux(24), aux(25), aux(26)], outputs: [aux(27), aux(28)], mappings: [aux(30)] },
      { inputs: [aux(17), aux(18)], outputs: [aux(21), aux(22)] },
      { inputs: [aux(17), aux(18), aux(19), aux(20), aux(27), aux(28)], outputs: [] }
    ];
    const slots = $$(".slot", slotList).map((element, index) => {
      const route = fixture[index] || { inputs: [], outputs: [] };
      const inputParameters = route.inputs.map((bus, parameter) => ({ index: parameter, name: `Input ${parameter + 1}`, unit: 1, ioFlags: 1, value: bus + 1 }));
      let nextParameter = inputParameters.length;
      const outputModeMap = {};
      const outputParameters = route.outputs.flatMap((bus, outputIndex) => {
        const outputParameterIndex = nextParameter++;
        const modeParameterIndex = nextParameter++;
        outputModeMap[modeParameterIndex] = [outputParameterIndex];
        return [
          { index: outputParameterIndex, name: `Output ${outputIndex + 1}`, unit: 1, ioFlags: 2, value: bus + 1 },
          { index: modeParameterIndex, name: `Output ${outputIndex + 1} mode`, unit: 0, ioFlags: 8, value: (route.replaces || route.outputs).includes(bus) ? 1 : 0 }
        ];
      });
      const parameters = [...inputParameters, ...outputParameters];
      return {
        index,
        name: element.dataset.slot || `Slot ${index + 1}`,
        algorithmName: element.dataset.algorithm || "Unknown algorithm",
        parameters,
        ioParameters: parameters.filter(parameter => parameter.ioFlags & 0x03),
        outputModeMap,
        routing: routingRecord(index, route.inputs, route.outputs, route.mappings || [], route.replaces)
      };
    });
    return { presetName: "Demo preset", inputBusCount, outputBusCount, auxBusCount: 44, slots };
  }

  function routingBusLabel(index, snapshot) {
    if (index < snapshot.inputBusCount) return `I${index + 1}`;
    const outputIndex = index - snapshot.inputBusCount;
    if (outputIndex < snapshot.outputBusCount) return `O${outputIndex + 1}`;
    return `A${outputIndex - snapshot.outputBusCount + 1}`;
  }

  function routingBusKind(index, snapshot) {
    if (index < snapshot.inputBusCount) return "input";
    if (index < snapshot.inputBusCount + snapshot.outputBusCount) return "output";
    return "aux";
  }

  function routingAuxColour(bus, snapshot) {
    const auxIndex = bus - snapshot.inputBusCount - snapshot.outputBusCount;
    return `hsl(${Math.round((auxIndex * 360) / snapshot.auxBusCount)} 78% 48%)`;
  }

  function renderAuxPalette(snapshot) {
    const used = new Set(snapshot.slots.flatMap(slot => (slot.ioParameters || []).map(parameter => Number(parameter.value) - 1)));
    const firstAux = snapshot.inputBusCount + snapshot.outputBusCount;
    const fragment = document.createDocumentFragment();
    const none = document.createElement("button");
    none.type = "button";
    none.className = "routing-aux-chip none";
    none.dataset.bus = "-1";
    none.textContent = "None";
    fragment.appendChild(none);
    for (let index = 0; index < snapshot.auxBusCount; index += 1) {
      const bus = firstAux + index;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `routing-aux-chip${used.has(bus) ? " used" : ""}`;
      chip.dataset.bus = String(bus);
      chip.style.setProperty("--aux-colour", routingAuxColour(bus, snapshot));
      chip.textContent = `A${index + 1}`;
      fragment.appendChild(chip);
    }
    routingAuxPalette.replaceChildren(fragment);
  }

  function routingMaskIndices(mask, total) {
    const result = [];
    for (let index = 0; index < total; index += 1) {
      if (mask & (1n << BigInt(index))) result.push(index);
    }
    return result;
  }

  function routingSlotMasks(slot, total) {
    const routing = slot.routing;
    const directInputs = routingMaskIndices(routing.inputMask, total);
    const outputs = routingMaskIndices(routing.outputMask, total);
    const replaces = routingMaskIndices(routing.replaceMask, total);
    const implicitInputs = outputs.filter(bus => !replaces.includes(bus));
    return {
      inputs: [...new Set([...directInputs, ...implicitInputs])].sort((a, b) => a - b),
      mappings: routingMaskIndices(routing.mappingInputMask, total),
      outputs,
      replaces
    };
  }

  function makeRoutingNode(definition) {
    const node = document.createElement(definition.slotIndex == null ? "div" : "button");
    node.className = `routing-node ${definition.kind}`;
    node.style.left = `${definition.x}px`;
    node.style.top = `${definition.y}px`;
    node.style.width = `${definition.width}px`;
    node.style.height = `${definition.height}px`;
    node.dataset.nodeKey = definition.key;
    if (definition.slotIndex == null) {
      if (definition.kind.includes("endpoint-bank")) {
        const title = document.createElement("strong");
        title.textContent = definition.label;
        node.appendChild(title);
        return node;
      }
      node.dataset.routingSide = definition.side;
      node.dataset.bus = String(definition.bus);
      const title = document.createElement("strong");
      title.textContent = definition.label;
      const kind = document.createElement("span");
      kind.textContent = definition.caption;
      node.append(title, kind);
      return node;
    }
    node.type = "button";
    node.dataset.slotIndex = String(definition.slotIndex);
    const head = document.createElement("div");
    head.className = "routing-node-head";
    const number = document.createElement("span");
    number.className = "routing-slot-number";
    number.textContent = String(definition.slotIndex + 1);
    const title = document.createElement("span");
    title.className = "routing-node-title";
    const name = document.createElement("strong");
    name.textContent = definition.name;
    name.title = definition.name;
    const algorithm = document.createElement("small");
    algorithm.className = "routing-algorithm-name";
    algorithm.title = definition.algorithmName;
    const algorithmKind = document.createElement("b");
    algorithmKind.textContent = definition.isPlugin ? "PLUG-IN" : "ALGO";
    const algorithmText = document.createElement("span");
    algorithmText.textContent = definition.algorithmName;
    algorithm.append(algorithmKind, algorithmText);
    title.append(name, algorithm);
    head.append(number, title);
    const body = document.createElement("div");
    body.className = "routing-node-ports";
    const addColumn = (side, ports) => {
      const column = document.createElement("div");
      column.className = `routing-port-column ${side}`;
      ports.forEach(port => {
        const row = document.createElement("div");
        row.className = `routing-port ${side} ${port.kind}`;
        row.dataset.portKey = port.key;
        row.dataset.routingSide = side;
        row.dataset.slotIndex = String(definition.slotIndex);
        row.dataset.parameterIndex = port.parameterIndex == null ? "" : String(port.parameterIndex);
        row.dataset.bus = String(port.bus);
        if (port.kind === "aux") row.style.setProperty("--aux-colour", routingAuxColour(port.bus, state.routingSnapshot));
        row.title = `${port.name} · ${port.busLabel}`;
        const dot = document.createElement("i");
        const label = document.createElement("span");
        label.textContent = port.name;
        const bus = document.createElement("b");
        bus.className = `routing-bus-badge ${port.kind}`;
        bus.textContent = side === "output" && port.kind === "input" ? `${port.busLabel} downstream` : port.busLabel;
        if (port.kind === "aux") bus.style.setProperty("--aux-colour", routingAuxColour(port.bus, state.routingSnapshot));
        if (side === "output" && port.outputMode) {
          const mode = document.createElement("span");
          mode.className = `routing-mode-toggle ${port.outputMode}${port.modeParameterIndex == null ? " readonly" : ""}`;
          mode.dataset.slotIndex = String(definition.slotIndex);
          mode.dataset.parameterIndex = port.modeParameterIndex == null ? "" : String(port.modeParameterIndex);
          mode.dataset.mode = port.outputMode;
          mode.textContent = port.outputMode === "replace" ? "REPLACE" : "ADD";
          mode.title = port.modeParameterIndex == null
            ? `${port.outputMode === "replace" ? "Replace" : "Add"} mode (reported by routing summary)`
            : `${port.outputMode === "replace" ? "Replace" : "Add"} mode · click to change`;
          row.append(mode, bus, label, dot);
        } else {
          row.append(...(side === "input" ? [dot, label, bus] : [bus, label, dot]));
        }
        column.appendChild(row);
      });
      if (!ports.length) {
        const empty = document.createElement("em");
        empty.textContent = "No ports";
        column.appendChild(empty);
      }
      body.appendChild(column);
    };
    addColumn("input", definition.inputPorts);
    addColumn("output", definition.outputPorts);
    node.append(head, body);
    return node;
  }

  function routingPath(edge, nodes) {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    const sx = from.side === "both" ? from.x : from.x + from.width;
    const sy = edge.fromPort ? from.y + edge.fromPort.y : from.y + (from.height / 2);
    const tx = to.x;
    const ty = edge.toPort ? to.y + edge.toPort.y : to.y + (to.height / 2);
    const shoulder = Math.min(42, Math.max(18, Math.abs(tx - sx) * .18));
    return `M ${sx} ${sy} C ${sx + shoulder} ${sy}, ${sx + shoulder} ${sy}, ${sx + shoulder * 1.35} ${sy} L ${tx - shoulder * 1.35} ${ty} C ${tx - shoulder} ${ty}, ${tx - shoulder} ${ty}, ${tx} ${ty}`;
  }

  function renderRoutingGraph(snapshot, { live = false, preserveView = false } = {}) {
    const previousView = preserveView
      ? { left: routingViewport.scrollLeft, top: routingViewport.scrollTop, zoom: state.routingZoom }
      : null;
    state.routingSnapshot = snapshot;
    state.routingSelection = null;
    state.routingBusSelection = null;
    renderAuxPalette(snapshot);
    const total = snapshot.inputBusCount + snapshot.outputBusCount + snapshot.auxBusCount;
    const slotLayouts = snapshot.slots.map(slot => {
      const masks = routingSlotMasks(slot, total);
      const io = slot.ioParameters || [];
      const makePort = (parameter, side, ordinal) => {
        const bus = Number(parameter.value) > 0 ? Number(parameter.value) - 1 : -1;
        const port = { key: `${side}:${slot.index}:${parameter.index ?? ordinal}`, parameterIndex: parameter.index, name: parameter.name || `${side === "input" ? "Input" : "Output"} ${ordinal + 1}`, bus, busLabel: bus < 0 ? "—" : routingBusLabel(bus, snapshot), kind: bus < 0 ? "disconnected" : routingBusKind(bus, snapshot) };
        if (side === "output") {
          const modeEntry = Object.entries(slot.outputModeMap || {}).find(([, outputs]) => outputs.includes(parameter.index));
          const modeParameterIndex = modeEntry == null ? null : Number(modeEntry[0]);
          const modeParameter = (slot.parameters || []).find(item => item.index === modeParameterIndex);
          if (modeParameter) {
            port.modeParameterIndex = modeParameterIndex;
            port.outputMode = Number(modeParameter.value) === 1 ? "replace" : "add";
          } else if (bus >= 0) {
            port.outputMode = masks.replaces.includes(bus) ? "replace" : "add";
          }
        }
        return port;
      };
      let inputPorts = io.filter(parameter => parameter.ioFlags & 0x01).map((parameter, index) => makePort(parameter, "input", index));
      let outputPorts = io.filter(parameter => parameter.ioFlags & 0x02).map((parameter, index) => makePort(parameter, "output", index));
      return { slot, masks, inputPorts, outputPorts };
    });
    const edges = [];
    const writersByBus = new Map();
    slotLayouts.forEach(layout => layout.outputPorts.forEach(port => {
      if (port.bus < 0) return;
      const writers = writersByBus.get(port.bus) || [];
      writers.push({ layout, port, replaces: port.outputMode ? port.outputMode === "replace" : layout.masks.replaces.includes(port.bus) });
      writersByBus.set(port.bus, writers);
    }));

    const connectRead = (slot, bus, type, toPort = null) => {
      if (type === "signal" && routingBusKind(bus, snapshot) === "aux") return;
      const previous = (writersByBus.get(bus) || []).filter(writer => writer.layout.slot.index < slot.index);
      let activeWriters = previous;
      let includeBase = true;
      for (let index = previous.length - 1; index >= 0; index -= 1) {
        if (previous[index].replaces) {
          activeWriters = previous.slice(index);
          includeBase = false;
          break;
        }
      }
      activeWriters.forEach(writer => {
        edges.push({ from: `slot:${writer.layout.slot.index}`, to: `slot:${slot.index}`, bus, type, fromPort: writer.port, toPort, fromSlot: writer.layout.slot.index, toSlot: slot.index });
      });
      if ((includeBase || !activeWriters.length) && routingBusKind(bus, snapshot) === "input") {
        edges.push({ from: `source:${bus}`, to: `slot:${slot.index}`, bus, type, toPort, toSlot: slot.index });
      }
    };

    slotLayouts.forEach(({ slot, masks, inputPorts, outputPorts }) => {
      inputPorts.filter(port => port.bus >= 0).forEach(port => connectRead(slot, port.bus, "signal", port));
      outputPorts.forEach(port => {
        const bus = port.bus;
        if (bus < 0) return;
        const kind = routingBusKind(bus, snapshot);
        if (kind === "output") edges.push({ from: `slot:${slot.index}`, to: `sink:${bus}`, bus, type: "signal", fromPort: port, fromSlot: slot.index });
      });
    });

    const width = 1180;
    const nodeDefinitions = new Map();
    let slotY = 34;
    snapshot.slots.forEach((slot, index) => {
      const { masks, inputPorts, outputPorts } = slotLayouts[index];
      const rows = Math.max(1, inputPorts.length, outputPorts.length);
      const slotHeight = 54 + (rows * 25) + 18;
      inputPorts.forEach((port, row) => { port.y = 66 + (row * 25); });
      outputPorts.forEach((port, row) => { port.y = 66 + (row * 25); });
      nodeDefinitions.set(`slot:${slot.index}`, {
        key: `slot:${slot.index}`,
        kind: "slot",
        slotIndex: slot.index,
        name: slot.name,
        algorithmName: slot.algorithmName,
        isPlugin: Boolean(slot.isPlugin || /plug[ -]?in/i.test(slot.algorithmName)),
        inputPorts,
        mappings: masks.mappings.map(bus => routingBusLabel(bus, snapshot)),
        outputPorts,
        x: 420,
        y: slotY,
        width: 310,
        height: slotHeight
      });
      slotY += slotHeight + 42;
    });
    const endpointGap = 38;
    const outputBankHeight = snapshot.outputBusCount * endpointGap + 42;
    const height = Math.max(720, slotY + 20);
    const addEndpointBank = (side, count, bankTop, kind = null) => {
      const source = side === "source";
      const x = source ? 24 : 1000;
      const gap = endpointGap;
      const bankHeight = count * gap + 42;
      const top = bankTop + 32;
      const endpointKind = kind || (source ? "input" : "output");
      const bankKey = kind === "aux" ? "aux" : side;
      nodeDefinitions.set(`bank:${bankKey}`, { key: `bank:${bankKey}`, kind: `endpoint-bank ${endpointKind}`, label: kind === "aux" ? "Aux buses" : source ? "NT Inputs" : "NT Outputs", x: x - 12, y: bankTop, width: 142, height: bankHeight });
      for (let index = 0; index < count; index += 1) {
        const bus = kind === "aux" ? snapshot.inputBusCount + snapshot.outputBusCount + index : source ? index : snapshot.inputBusCount + index;
        const key = kind === "aux" ? `aux:${bus}` : `${side}:${bus}`;
        nodeDefinitions.set(key, { key, kind: `endpoint ${endpointKind}`, bus, side: kind === "aux" ? "both" : side, label: routingBusLabel(bus, snapshot), caption: kind === "aux" ? "Aux bus" : source ? "NT input" : "NT output", x, y: top + index * gap, width: 118, height: 30 });
      }
      return bankHeight;
    };
    const inputBankHeight = snapshot.inputBusCount * endpointGap + 42;
    addEndpointBank("source", snapshot.inputBusCount, Math.max(18, Math.round((height - inputBankHeight) / 2)));
    const rightStackTop = Math.max(18, Math.round((height - outputBankHeight) / 2));
    addEndpointBank("sink", snapshot.outputBusCount, rightStackTop);

    state.routingCanvasSize = { width, height };
    routingCanvas.style.width = `${width}px`;
    routingCanvas.style.height = `${height}px`;
    routingWires.setAttribute("viewBox", `0 0 ${width} ${height}`);
    routingNodes.replaceChildren();
    nodeDefinitions.forEach(definition => routingNodes.appendChild(makeRoutingNode(definition)));
    routingWires.replaceChildren();
    const svgNS = "http://www.w3.org/2000/svg";
    edges.forEach((edge, index) => {
      const geometry = routingPath(edge, nodeDefinitions);
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", geometry);
      const busKind = routingBusKind(edge.bus, snapshot);
      path.setAttribute("class", `routing-wire ${edge.type} ${busKind}`);
      path.dataset.edgeIndex = String(index);
      if (edge.fromSlot != null) path.dataset.fromSlot = String(edge.fromSlot);
      if (edge.toSlot != null) path.dataset.toSlot = String(edge.toSlot);
      routingWires.appendChild(path);
      if (busKind === "aux") {
        const from = nodeDefinitions.get(edge.from);
        const to = nodeDefinitions.get(edge.to);
        if (from && to) {
          const label = document.createElementNS(svgNS, "text");
          label.setAttribute("x", String((from.x + from.width + to.x) / 2));
          label.setAttribute("y", String(((edge.fromPort ? from.y + edge.fromPort.y : from.y + from.height / 2) + (edge.toPort ? to.y + edge.toPort.y : to.y + to.height / 2)) / 2 - 4));
          label.setAttribute("class", `routing-wire-label ${edge.type} aux`);
          label.textContent = routingBusLabel(edge.bus, snapshot);
          routingWires.appendChild(label);
        }
      }
    });
    routingSourceCopy.textContent = live ? `Live NT · ${snapshot.slots.length} slots` : "Simulation fixture";
    const mappingCount = slotLayouts.reduce((count, item) => count + item.masks.mappings.length, 0);
    $("#routing-mapping-count").textContent = String(mappingCount);
    $("#routing-show-mappings").disabled = mappingCount === 0;
    routingReadButton.textContent = live ? "Read again" : "Read routing";
    routingReadButton.disabled = !live;
    applyRoutingZoom();
    updateRoutingLayers();
    selectRoutingSlot(null, snapshot);
    if (state.view === "routing") {
      requestAnimationFrame(() => {
        if (previousView) {
          state.routingZoom = previousView.zoom;
          applyRoutingZoom();
          routingViewport.scrollTo({ left: previousView.left, top: previousView.top, behavior: "auto" });
        } else {
          fitRoutingGraph("auto");
        }
      });
    }
  }

  async function handleRoutingConnectionClick(target) {
    const port = target.closest(".routing-port, .routing-node.endpoint");
    if (!port) return false;
    const side = port.dataset.routingSide;
    const isSource = side === "output" || side === "source" || side === "both";
    const selection = {
      element: port,
      side,
      bus: Number(port.dataset.bus),
      slotIndex: port.dataset.slotIndex === undefined ? null : Number(port.dataset.slotIndex),
      parameterIndex: port.dataset.parameterIndex !== undefined && port.dataset.parameterIndex !== "" ? Number(port.dataset.parameterIndex) : null
    };
    if (state.routingBusSelection != null && selection.parameterIndex != null) {
      const bus = state.routingBusSelection;
      state.routingBusSelection = null;
      return assignRoutingPort(selection, bus);
    }
    if (!state.routingSelection) {
      if (!isSource) {
        if (side !== "input" || selection.parameterIndex == null) {
          showToast("Choose an output or NT input first");
          return true;
        }
        state.routingSelection = selection;
        port.classList.add("routing-selected-source");
        showToast("Choose an aux bus above, a physical source, or None");
        return true;
      }
      state.routingSelection = selection;
      port.classList.add("routing-selected-source");
      showToast("Now choose an algorithm input or NT output");
      return true;
    }
    const source = state.routingSelection;
    source.element.classList.remove("routing-selected-source");
    state.routingSelection = null;
    if (source.element === port && source.parameterIndex != null && source.bus >= 0) {
      const name = port.title || port.textContent.trim();
      if (state.transport === "real" && !window.confirm(`Disconnect ${name}?`)) return true;
      try {
        if (state.transport === "real") {
          await state.ntTransport.writeParameter(source.slotIndex, source.parameterIndex, 0);
          await loadLiveRouting({ preserveView: true });
          showToast("Connection removed and verified from the NT");
        } else {
          const slot = state.routingSnapshot.slots.find(item => item.index === source.slotIndex);
          const parameter = slot?.ioParameters?.find(item => item.index === source.parameterIndex);
          if (parameter) parameter.value = 0;
          renderRoutingGraph(state.routingSnapshot, { live: false, preserveView: true });
          showToast("Simulation connection removed");
        }
      } catch (error) {
        showToast(error.message);
      }
      return true;
    }
    const destinationValid = side === "input" || side === "sink" || side === "both";
    if (!destinationValid) {
      showToast("Route cancelled · choose a source again");
      return true;
    }
    const destinationIsParameter = side === "input";
    const writeTarget = destinationIsParameter ? selection : source;
    let bus = destinationIsParameter ? source.bus : selection.bus;
    if (writeTarget.parameterIndex == null || writeTarget.slotIndex == null) {
      showToast("That route has no writable NT parameter");
      return true;
    }
    const sourceName = source.element.title || source.element.textContent.trim();
    const destinationName = port.title || port.textContent.trim();
    if (state.transport === "real" && !window.confirm(`Connect ${sourceName} to ${destinationName}?`)) return true;
    try {
      const write = async (targetSlot, parameterIndex, nextValue) => {
        if (state.transport === "real") return state.ntTransport.writeParameter(targetSlot, parameterIndex, nextValue);
        const slot = state.routingSnapshot.slots.find(item => item.index === targetSlot);
        const parameter = slot?.ioParameters?.find(item => item.index === parameterIndex);
        if (!parameter) throw new Error("That simulated port has no writable parameter.");
        parameter.value = nextValue;
      };
      if (destinationIsParameter && source.side === "output" && bus < 0) {
        const used = new Set(state.routingSnapshot.slots.flatMap(slot => (slot.ioParameters || []).map(parameter => Number(parameter.value) - 1)).filter(value => value >= 0));
        const firstAux = state.routingSnapshot.inputBusCount + state.routingSnapshot.outputBusCount;
        bus = Array.from({ length: state.routingSnapshot.auxBusCount }, (_, index) => firstAux + index).find(candidate => !used.has(candidate));
        if (bus == null) throw new Error("No free aux bus is available for this connection.");
        await write(source.slotIndex, source.parameterIndex, bus + 1);
      }
      if (state.transport === "real") {
        await write(writeTarget.slotIndex, writeTarget.parameterIndex, bus + 1);
        await loadLiveRouting({ preserveView: true });
        showToast("Routing changed and verified from the NT");
      } else {
        await write(writeTarget.slotIndex, writeTarget.parameterIndex, bus + 1);
        renderRoutingGraph(state.routingSnapshot, { live: false, preserveView: true });
        showToast("Simulation route changed");
      }
    } catch (error) {
      showToast(error.message);
    }
    return true;
  }

  async function assignRoutingPort(selection, bus) {
    if (selection.parameterIndex == null || selection.slotIndex == null) {
      showToast("Select an algorithm input or output first");
      return true;
    }
    try {
      if (state.transport === "real") {
        await state.ntTransport.writeParameter(selection.slotIndex, selection.parameterIndex, bus + 1);
        await loadLiveRouting({ preserveView: true });
        showToast(`${bus < 0 ? "Disconnected" : `Assigned ${routingBusLabel(bus, state.routingSnapshot)}`} and verified from the NT`);
      } else {
        const slot = state.routingSnapshot.slots.find(item => item.index === selection.slotIndex);
        const parameter = slot?.ioParameters?.find(item => item.index === selection.parameterIndex);
        if (!parameter) throw new Error("That simulated port has no writable parameter.");
        parameter.value = bus + 1;
        renderRoutingGraph(state.routingSnapshot, { live: false, preserveView: true });
        showToast(bus < 0 ? "Simulation port disconnected" : `Simulation port assigned to ${routingBusLabel(bus, state.routingSnapshot)}`);
      }
    } catch (error) {
      showToast(error.message);
    }
    return true;
  }

  async function handleAuxPaletteClick(target) {
    const chip = target.closest(".routing-aux-chip");
    if (!chip || !state.routingSnapshot) return false;
    const bus = Number(chip.dataset.bus);
    if (state.routingSelection?.parameterIndex != null) {
      const selection = state.routingSelection;
      selection.element.classList.remove("routing-selected-source");
      state.routingSelection = null;
      return assignRoutingPort(selection, bus);
    }
    if (state.routingSelection) {
      state.routingSelection.element.classList.remove("routing-selected-source");
      state.routingSelection = null;
    }
    state.routingBusSelection = bus;
    $$(".routing-aux-chip", routingAuxPalette).forEach(item => item.classList.toggle("selected", item === chip));
    $$(".routing-port", routingNodes).forEach(port => port.classList.toggle("bus-match", Number(port.dataset.bus) === bus));
    showToast(bus < 0 ? "Now choose a port to disconnect" : `Now choose a port for ${routingBusLabel(bus, state.routingSnapshot)}`);
    return true;
  }

  async function handleRoutingModeClick(target) {
    const control = target.closest(".routing-mode-toggle");
    if (!control) return false;
    const rawParameterIndex = control.dataset.parameterIndex;
    const parameterIndex = rawParameterIndex === "" ? null : Number(rawParameterIndex);
    if (!Number.isInteger(parameterIndex)) {
      showToast("The NT reports this mode, but did not expose its controlling parameter");
      return true;
    }
    const slotIndex = Number(control.dataset.slotIndex);
    const nextValue = control.dataset.mode === "replace" ? 0 : 1;
    const nextName = nextValue === 1 ? "Replace" : "Add";
    if (state.transport === "real" && !window.confirm(`Change this output to ${nextName} mode?`)) return true;
    try {
      if (state.transport === "real") {
        await state.ntTransport.writeParameter(slotIndex, parameterIndex, nextValue);
        await loadLiveRouting({ preserveView: true });
        showToast(`Output mode changed to ${nextName} and verified from the NT`);
      } else {
        const slot = state.routingSnapshot.slots.find(item => item.index === slotIndex);
        const parameter = slot?.parameters?.find(item => item.index === parameterIndex);
        if (!parameter) throw new Error("The simulated mode parameter is unavailable.");
        parameter.value = nextValue;
        renderRoutingGraph(state.routingSnapshot, { live: false, preserveView: true });
        showToast(`Simulation output mode changed to ${nextName}`);
      }
    } catch (error) {
      showToast(error.message);
    }
    return true;
  }

  function selectRoutingSlot(slotIndex, snapshot = state.liveRouting || makeSimulatedRoutingSnapshot()) {
    $$(".routing-node.slot", routingNodes).forEach(node => node.classList.toggle("selected", Number(node.dataset.slotIndex) === slotIndex));
    $$(".routing-wire", routingWires).forEach(wire => {
      const related = slotIndex == null || Number(wire.dataset.fromSlot) === slotIndex || Number(wire.dataset.toSlot) === slotIndex;
      wire.classList.toggle("dimmed", !related);
      wire.classList.toggle("highlighted", slotIndex != null && related);
    });
    const copy = $("div", routingInspector);
    const detail = $("p", routingInspector);
    if (slotIndex == null) {
      $("span", copy).textContent = "Routing graph";
      $("strong", copy).textContent = "Choose a port and an aux colour, or connect physical I/O directly. Use None to disconnect.";
      detail.textContent = `${snapshot.slots.length} slots · ${snapshot.inputBusCount} inputs · ${snapshot.outputBusCount} outputs · ${snapshot.auxBusCount} aux buses`;
      return;
    }
    const slot = snapshot.slots.find(item => item.index === slotIndex);
    const masks = routingSlotMasks(slot, snapshot.inputBusCount + snapshot.outputBusCount + snapshot.auxBusCount);
    const list = values => values.map(bus => routingBusLabel(bus, snapshot)).join(", ") || "none";
    $("span", copy).textContent = `Slot ${slot.index + 1} · ${slot.algorithmName}`;
    $("strong", copy).textContent = slot.name;
    detail.textContent = `Reads ${list(masks.inputs)} · writes ${list(masks.outputs)}${masks.mappings.length ? ` · maps ${list(masks.mappings)}` : ""}`;
  }

  function applyRoutingZoom() {
    const { width, height } = state.routingCanvasSize;
    routingCanvas.style.zoom = "";
    routingCanvas.style.transform = `scale(${state.routingZoom})`;
    routingZoomLayer.style.width = `${Math.ceil(width * state.routingZoom)}px`;
    routingZoomLayer.style.height = `${Math.ceil(height * state.routingZoom)}px`;
    $("#routing-zoom-value").textContent = `${Math.round(state.routingZoom * 100)}%`;
  }

  function fitRoutingGraph(behavior = "smooth") {
    const { width, height } = state.routingCanvasSize;
    const availableWidth = Math.max(320, routingViewport.clientWidth - 24);
    const availableHeight = Math.max(260, routingViewport.clientHeight - 24);
    state.routingZoom = Math.max(.55, Math.min(1, availableWidth / width));
    applyRoutingZoom();
    routingViewport.scrollTo({ left: 0, top: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      routingViewport.scrollLeft = 0;
      routingViewport.scrollTop = 0;
    });
  }

  function updateRoutingLayers() {
    const hideSignals = !$("#routing-show-signals").checked;
    const hideMappings = !$("#routing-show-mappings").checked;
    routingCanvas.classList.toggle("hide-signals", hideSignals);
    routingCanvas.classList.toggle("hide-mappings", hideMappings);
    $$(".routing-wire.signal, .routing-wire-label.signal", routingCanvas).forEach(element => { element.style.display = hideSignals ? "none" : ""; });
    $$(".routing-wire.mapping, .routing-wire-label.mapping, .routing-node.endpoint.mapping", routingCanvas).forEach(element => { element.style.display = hideMappings ? "none" : ""; });
  }

  async function loadLiveRouting({ preserveView = false } = {}) {
    if (!state.ntTransport || !state.liveIdentity || state.routingReadPromise) return state.routingReadPromise;
    const token = ++state.routingReadToken;
    routingLoading.classList.remove("hidden");
    routingReadButton.disabled = true;
    routingReadButton.textContent = "Reading…";
    state.routingReadPromise = (async () => {
      const pendingPoll = stopLivePolling();
      if (pendingPoll) await pendingPoll.catch(() => {});
      await state.parameterReadQueue.catch(() => {});
      const snapshot = await state.ntTransport.readRoutingSnapshot(state.liveIdentity);
      if (token !== state.routingReadToken) return;
      state.liveRouting = snapshot;
      renderRoutingGraph(snapshot, { live: true, preserveView });
      showToast(`Read complete NT routing · ${snapshot.slots.length} slots`);
    })().catch(error => {
      if (token === state.routingReadToken) {
        routingSourceCopy.textContent = "Routing read failed";
        showToast(error.message);
      }
    }).finally(() => {
      if (token === state.routingReadToken) {
        routingLoading.classList.add("hidden");
        routingReadButton.disabled = !state.ntTransport;
        routingReadButton.textContent = state.liveRouting ? "Read again" : "Read routing";
        if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
      }
      state.routingReadPromise = null;
    });
    return state.routingReadPromise;
  }

  function setView(view) {
    state.view = view;
    $$("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === view));
    $$("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $(".view-stack").scrollTop = 0;
    if (view === "routing") {
      requestAnimationFrame(() => fitRoutingGraph("auto"));
      if (state.transport === "real" && !state.liveRouting) loadLiveRouting();
    }
  }

  function setSurface(surface) {
    state.surface = surface;
    frame.classList.toggle("surface-app", surface === "app");
    frame.classList.toggle("surface-auv3", surface === "auv3");
    $$("[data-surface]").forEach(button => button.classList.toggle("active", button.dataset.surface === surface));
    $(".host-size-control").classList.toggle("hidden", surface !== "auv3");
    updateHostSize();
    if (surface === "auv3" && state.view === "status") setView("control");
  }

  function updateHostSize() {
    frame.classList.remove("host-compact", "host-standard", "host-expanded");
    if (state.surface === "auv3") frame.classList.add(`host-${state.hostSize}`);
  }

  function canMutate() {
    return state.device === "ready" || state.device === "offline";
  }

  function canApplyToHardware() {
    return state.transport === "simulation" && state.device === "ready";
  }

  function setDeviceState(nextState) {
    state.device = nextState;
    const detail = deviceStates[nextState];
    connectionPill.className = `connection-pill ${nextState}`;
    connectionLabel.textContent = detail.label;
    stateBanner.className = `state-banner ${detail.bannerClass}`.trim();
    stateBanner.classList.toggle("hidden", nextState === "ready");
    stateBannerTitle.textContent = detail.title;
    stateBannerCopy.textContent = detail.copy;
    stateAction.textContent = detail.action;
    if (nextState === "offline") mappingSourceCopy.textContent = "Local draft";
    else if (state.transport !== "real") mappingSourceCopy.textContent = "Fake NT fixture";
    mappingForm.setAttribute("aria-disabled", String(!canMutate()));
    applyMapping.textContent = nextState === "offline" ? "Save to draft" : "Apply to NT";
    applyMapping.disabled = !canMutate() || !state.mappingDirty;
    updateMappingState();
  }

  function currentMappingValues() {
    return {
      channel: mapChannel.value,
      type: mapType.value,
      cc: mapCC.value,
      min: mapMin.value,
      max: mapMax.value,
      enabled: mapEnabled.checked,
      relative: mapRelative.checked,
      symmetric: mapSymmetric.checked
    };
  }

  function populateMapping(item) {
    state.selectedMapping = item;
    $$(".mapping-item").forEach(row => row.classList.toggle("active", row === item));
    $("#mapping-param").textContent = item.dataset.name;
    $("#mapping-path").textContent = item.dataset.path || `Slot 7 · WitchboardX · ${item.dataset.category}`;
    mapChannel.value = item.dataset.channel || "1";
    mapType.value = item.dataset.type || "CC";
    mapCC.value = item.dataset.cc || "0";
    mapMin.value = item.dataset.min || "0";
    mapMax.value = item.dataset.max || "100";
    mapEnabled.checked = Boolean(item.dataset.cc);
    mapRelative.checked = item.dataset.relative === "true";
    mapSymmetric.checked = item.dataset.symmetric === "true";
    state.mappingBaseline = currentMappingValues();
    state.mappingDirty = false;
    state.undoMapping = null;
    resetMapping.textContent = "Cancel";
    updateMappingState();
  }

  function mappingIsConflicted() {
    if (!mapEnabled.checked || mapType.value !== "CC") return false;
    return $$(".mapping-item").some(item => item !== state.selectedMapping &&
      item.dataset.cc !== "" && item.dataset.type === "CC" &&
      item.dataset.channel === mapChannel.value && item.dataset.cc === mapCC.value);
  }

  function updateMappingState() {
    const conflicted = mappingIsConflicted();
    mappingWarning.classList.toggle("hidden", !conflicted);
    if (conflicted) $("#mapping-warning-copy").textContent = `Channel ${mapChannel.value} · CC ${mapCC.value} already controls another parameter. Continue only if you deliberately want both parameters to move together.`;
    mappingConfirmation.className = `confirmed-badge${state.mappingDirty ? " draft" : ""}`;
    const settledLabel = state.device === "offline" ? "Local draft" :
      state.transport === "real" ? "Read from NT" : "Confirmed";
    mappingConfirmation.innerHTML = `<i></i> ${state.mappingDirty ? "Not applied" : settledLabel}`;
    applyMapping.disabled = !canMutate() || !state.mappingDirty;
  }

  function updateMappingSummary() {
    const items = $$(".mapping-item");
    mappingCount.textContent = `${items.length} mapping${items.length === 1 ? "" : "s"}`;
    mappingEmpty.classList.toggle("hidden", items.length > 0);
    mappingForm.classList.toggle("hidden", items.length === 0);
    mappingEmptyCard.classList.toggle("hidden", items.length > 0);
  }

  function openMappingItem(item) {
    const isNew = item.dataset.cc === "";
    populateMapping(item);
    if (isNew) {
      mapEnabled.checked = true;
      markMappingDirty();
    }
    setView("mapping");
    if (isNew) setTimeout(() => mapCC.focus(), 0);
  }

  function markMappingDirty() {
    state.mappingDirty = JSON.stringify(currentMappingValues()) !== JSON.stringify(state.mappingBaseline);
    if (state.mappingDirty) state.undoMapping = null;
    resetMapping.textContent = "Cancel";
    updateMappingState();
  }

  function mappingLabel(values) {
    if (!values.enabled) return "Not mapped";
    if (values.type === "CC") return `Ch ${values.channel} · CC ${values.cc}`;
    return `Ch ${values.channel} · ${values.type}`;
  }

  function updateEditorMappingBadge(item, values) {
    const button = item.dataset.mappingKey
      ? $(`.map-shortcut[data-mapping-key="${item.dataset.mappingKey}"]`)
      : $(`.map-shortcut[data-param="${item.dataset.name}"]`);
    if (!button) return;
    button.classList.toggle("mapped", values.enabled);
    button.textContent = values.enabled
      ? (values.type === "CC" ? `${values.channel}:${values.cc}` : values.type)
      : "+";
    button.title = values.enabled
      ? `MIDI channel ${values.channel} · ${values.type}${values.type === "CC" ? ` ${values.cc}` : ""}`
      : `Add mapping for ${item.dataset.name}`;
  }

  function applyMappingToItem(values) {
    const item = state.selectedMapping;
    item.dataset.channel = values.channel;
    item.dataset.type = values.type;
    item.dataset.cc = values.enabled ? values.cc : "";
    item.dataset.min = values.min;
    item.dataset.max = values.max;
    item.dataset.relative = String(Boolean(values.relative));
    item.dataset.symmetric = String(Boolean(values.symmetric));
    item.dataset.draft = "false";
    const label = $("em", item);
    label.textContent = mappingLabel(values);
    label.className = values.enabled ? "mapped-label" : "";
    item.classList.toggle("conflict", values.enabled && values.channel === "1" && values.cc === "74");
    if (item.classList.contains("conflict")) {
      const warning = document.createElement("i");
      warning.textContent = "!";
      label.append(" ", warning);
    }
    updateEditorMappingBadge(item, values);
    if (!values.enabled) {
      item.remove();
      state.selectedMapping = null;
    }
    updateMappingSummary();
  }

  function restoreMapping(values) {
    mapChannel.value = values.channel;
    mapType.value = values.type;
    mapCC.value = values.cc;
    mapMin.value = values.min;
    mapMax.value = values.max;
    mapEnabled.checked = values.enabled;
    mapRelative.checked = Boolean(values.relative);
    mapSymmetric.checked = Boolean(values.symmetric);
  }

  function showSimulatedIdentity() {
    state.liveRouting = null;
    slotList.innerHTML = simulatedSlotMarkup;
    $(".prototype-note").textContent = "Fake data · no MIDI";
    $("#preset-title").textContent = "Demo preset";
    $("#editor-heading").textContent = "Demo preset";
    $("#editor-slot-count").textContent = "10 slots";
    $("#hardware-title").textContent = "disting NT";
    $("#hardware-detail").textContent = "Simulation · SysEx ID 0";
    $("#hardware-status").textContent = "Ready";
    routingConnectButton.textContent = "Connect NT";
    displaySlot($(".slot.active", slotList));
    renderRoutingGraph(makeSimulatedRoutingSnapshot());
  }

  function displaySlot(slot) {
    if (!slot) return;
    $$(".slot", slotList).forEach(row => row.classList.remove("active"));
    slot.classList.add("active");
    $("#slot-heading").textContent = slot.dataset.slot;
    const slotNumber = $(".slot-number", slot).textContent;
    $("#slot-kicker").textContent = `Slot ${slotNumber} · ${slot.dataset.algorithm}`;
    if (state.transport === "real" && state.ntTransport) {
      queueLiveParameterRead(slot);
      return;
    }
    const hasFixture = state.transport === "simulation" && slot.dataset.slot === "WitchboardX";
    $("#parameter-list").classList.toggle("hidden", !hasFixture);
    $("#parameter-fixture-note").classList.toggle("hidden", hasFixture);
    $("#fixture-algorithm").textContent = slot.dataset.algorithm;
    $("#parameter-fixture-note span").textContent = state.transport === "real" ?
      "This slot identity is live. Parameter definitions and values are the next read-only synchronization milestone." :
      "This visual pass only carries the WitchboardX parameter fixture. Production parameter definitions come live from the NT.";
  }

  function formatParameterValue(parameter) {
    const scaling = parameter.scaling || 1;
    const value = parameter.value / scaling;
    if (parameter.unit === 0 && parameter.min === 0 && parameter.max === 1) {
      return value ? "On" : "Off";
    }
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
  }

  function mappingKey(slotIndex, parameterIndex) {
    return `live:${slotIndex}:${parameterIndex}`;
  }

  function createMappingItem(parameter, slotInfo, { draft = false } = {}) {
    const midi = parameter.mapping?.midi;
    if (!draft && !midi?.enabled) return null;
    const item = document.createElement("button");
    item.className = "mapping-item";
    item.type = "button";
    item.dataset.mappingKey = mappingKey(slotInfo.index, parameter.index);
    item.dataset.name = parameter.name;
    item.dataset.category = parameter.pageName || slotInfo.algorithmName;
    item.dataset.path = `Slot ${slotInfo.index + 1} · ${slotInfo.name} · ${parameter.pageName || `Parameter ${parameter.index + 1}`}`;
    item.dataset.parameterIndex = String(parameter.index);
    item.dataset.slotIndex = String(slotInfo.index);
    item.dataset.cc = draft ? "" : String(midi.cc);
    item.dataset.channel = String(midi?.channel || 1);
    item.dataset.type = midi?.type || "CC";
    item.dataset.min = String(midi?.min ?? parameter.min);
    item.dataset.max = String(midi?.max ?? parameter.max);
    item.dataset.relative = String(Boolean(midi?.relative));
    item.dataset.symmetric = String(Boolean(midi?.symmetric));
    item.dataset.draft = String(draft);
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = parameter.name;
    const detail = document.createElement("small");
    detail.textContent = `${parameter.pageName || slotInfo.algorithmName} · Parameter ${parameter.index + 1}`;
    copy.append(name, detail);
    const status = document.createElement("em");
    status.className = draft ? "" : "mapped-label";
    status.textContent = draft ? "New draft" : mappingLabel({ ...midi, channel: String(midi.channel), cc: String(midi.cc) });
    item.append(copy, status);
    return item;
  }

  function syncLiveMappings(parameters, slotInfo) {
    const items = $("#mapping-items");
    const liveItems = parameters
      .filter(parameter => parameter.name && parameter.mapping?.midi?.enabled)
      .map(parameter => createMappingItem(parameter, slotInfo));
    items.replaceChildren(...liveItems);
    $("#mapping-slot-label").textContent = `Slot ${slotInfo.index + 1} · ${slotInfo.name}`;
    mappingSourceCopy.textContent = `Live · Slot ${slotInfo.index + 1}`;
    state.selectedMapping = liveItems[0] || null;
    if (state.selectedMapping) populateMapping(state.selectedMapping);
    updateMappingSummary();
  }

  function renderLiveParameters(editorState, slotInfo) {
    const { parameters, pages } = editorState;
    const visibleParameters = parameters.filter(parameter => parameter.name);
    const list = $("#parameter-list");
    list.replaceChildren();
    state.liveParameters.clear();

    const parametersByIndex = new Map(visibleParameters.map(parameter => [parameter.index, parameter]));
    const usedIndices = new Set();
    const sections = pages.map(page => {
      const sectionParameters = page.parameterIndices.map(index => parametersByIndex.get(index)).filter(Boolean);
      sectionParameters.forEach(parameter => {
        parameter.pageName = page.name;
        usedIndices.add(parameter.index);
      });
      return { name: page.name, parameters: sectionParameters };
    }).filter(section => section.parameters.length);
    const remaining = visibleParameters.filter(parameter => !usedIndices.has(parameter.index));
    if (remaining.length) {
      remaining.forEach(parameter => { parameter.pageName = "Other"; });
      sections.push({ name: "Other", parameters: remaining });
    }

    const createParameterRow = parameter => {
      const row = document.createElement("div");
      row.className = "parameter-row live-parameter-row";

      const name = document.createElement("div");
      name.className = "parameter-name";
      const strong = document.createElement("strong");
      strong.textContent = parameter.name;
      const detail = document.createElement("span");
      detail.textContent = `Parameter ${parameter.index + 1}`;
      name.append(strong, detail);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = String(parameter.min);
      slider.max = String(parameter.max);
      slider.value = String(Math.min(parameter.max, Math.max(parameter.min, parameter.value)));
      slider.disabled = true;
      slider.setAttribute("aria-label", `${parameter.name}, live read-only value`);

      const output = document.createElement("output");
      output.textContent = formatParameterValue(parameter);

      const pendingMapping = document.createElement("button");
      pendingMapping.className = "map-shortcut";
      pendingMapping.type = "button";
      pendingMapping.dataset.mappingKey = mappingKey(slotInfo.index, parameter.index);
      const midi = parameter.mapping?.midi;
      if (midi?.enabled) {
        pendingMapping.classList.add("mapped");
        pendingMapping.title = `MIDI channel ${midi.channel} · ${midi.type}${midi.type === "CC" ? ` ${midi.cc}` : ""}`;
        pendingMapping.setAttribute("aria-label", `Edit mapping for ${parameter.name}`);
        pendingMapping.textContent = midi.type === "CC" ? `${midi.channel}:${midi.cc}` : midi.type;
      } else {
        pendingMapping.title = `Add mapping for ${parameter.name}`;
        pendingMapping.setAttribute("aria-label", `Add mapping for ${parameter.name}`);
        pendingMapping.textContent = "+";
      }

      row.append(name, slider, output, pendingMapping);
      state.liveParameters.set(pendingMapping.dataset.mappingKey, {
        parameter,
        slotInfo,
        row,
        slider,
        output,
        feedbackTimer: null
      });
      return row;
    };

    sections.forEach(sectionData => {
      const section = document.createElement("section");
      section.className = "parameter-section collapsed";
      const heading = document.createElement("button");
      heading.className = "parameter-section-heading";
      heading.type = "button";
      heading.setAttribute("aria-expanded", "false");
      const title = document.createElement("strong");
      title.textContent = sectionData.name;
      const count = document.createElement("span");
      count.textContent = `${sectionData.parameters.length} parameter${sectionData.parameters.length === 1 ? "" : "s"}`;
      heading.append(title, count);
      section.append(heading, ...sectionData.parameters.map(createParameterRow));
      list.appendChild(section);
    });
    syncLiveMappings(parameters, slotInfo);
    list.classList.remove("hidden");
    $("#parameter-fixture-note").classList.toggle("hidden", visibleParameters.length > 0);
    if (!visibleParameters.length) {
      $("#fixture-algorithm").textContent = "No visible parameters";
      $("#parameter-fixture-note span").textContent = "The NT reported no named parameters for this algorithm.";
    }
  }

  function queueLiveParameterRead(slot) {
    const pendingPoll = stopLivePolling();
    const token = ++state.parameterReadToken;
    const slotIndex = Number(slot.dataset.index);
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = `Reading ${slot.dataset.algorithm}…`;
    $("#parameter-fixture-note span").textContent = "Reading parameter pages, current values, and native MIDI mappings from the NT.";

    state.parameterReadQueue = state.parameterReadQueue.catch(() => {}).then(async () => {
      if (pendingPoll) await pendingPoll.catch(() => {});
      if (token !== state.parameterReadToken || !state.ntTransport) return;
      try {
        const editorState = await state.ntTransport.readSlotEditorState(slotIndex);
        if (token !== state.parameterReadToken) return;
        renderLiveParameters(editorState, {
          index: slotIndex,
          name: slot.dataset.slot,
          algorithmName: slot.dataset.algorithm
        });
        const mappedCount = editorState.mappings.filter(mapping => mapping.midi.enabled).length;
        showToast(`Read ${editorState.parameters.filter(parameter => parameter.name).length} parameters · ${mappedCount} mappings`);
        startLivePolling(slotIndex);
      } catch (error) {
        if (token !== state.parameterReadToken) return;
        $("#fixture-algorithm").textContent = "Parameter read failed";
        $("#parameter-fixture-note span").textContent = error.message;
        showToast(error.message);
      }
    });
  }

  function renderLiveSlots(slots) {
    const colours = ["mint", "yellow", "lilac", "blue"];
    slotList.replaceChildren();
    slots.forEach((slot, index) => {
      const button = document.createElement("button");
      button.className = `slot${index === 0 ? " active" : ""}`;
      button.dataset.slot = slot.name;
      button.dataset.algorithm = slot.algorithmName;
      button.dataset.index = String(slot.index);
      const number = document.createElement("span");
      number.className = "slot-number";
      number.textContent = String(index + 1);
      const copy = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = slot.name;
      const algorithm = document.createElement("small");
      algorithm.textContent = slot.algorithmName;
      copy.append(name, algorithm);
      const colour = document.createElement("i");
      colour.className = `slot-colour ${colours[index % colours.length]}`;
      button.append(number, copy, colour);
      slotList.appendChild(button);
    });
    displaySlot($(".slot.active", slotList));
  }

  function showLiveIdentity(identity) {
    const presetName = identity.presetName || "Unnamed preset";
    $(".prototype-note").textContent = "Live NT · routing writes enabled";
    $("#preset-title").textContent = presetName;
    $("#editor-heading").textContent = presetName;
    $("#editor-slot-count").textContent = `${identity.slotCount} slots`;
    $("#hardware-title").textContent = "disting NT · live";
    $("#hardware-detail").textContent = `${identity.version || "Unknown firmware"} · SysEx ID ${identity.sysexId}`;
    $("#hardware-status").textContent = "Connected";
    renderLiveSlots(identity.slots);
    routingSourceCopy.textContent = "Ready to read live NT";
    routingReadButton.textContent = "Read routing";
    routingReadButton.disabled = false;
    routingConnectButton.textContent = "Reconnect";
  }

  function disconnectRealTransport() {
    stopLivePolling();
    state.routingReadToken += 1;
    state.activeLiveSlotIndex = null;
    if (state.ntTransport) state.ntTransport.disconnect();
    state.ntTransport = null;
    state.liveIdentity = null;
    state.liveRouting = null;
    routingLoading.classList.add("hidden");
    routingReadButton.disabled = true;
    routingReadButton.textContent = "Read routing";
    if ($("#midi-monitor-status")) $("#midi-monitor-status").textContent = "Monitor paused · no NT endpoint";
  }

  async function readRealIdentity() {
    connectMIDI.disabled = true;
    connectMIDI.textContent = "Reading…";
    setDeviceState("syncing");
    try {
      const pendingPoll = stopLivePolling();
      if (pendingPoll) await pendingPoll.catch(() => {});
      if (!state.ntTransport) {
        resetMIDIMonitor();
        state.ntTransport = new window.NTWebMIDITransport({
          sysexId: Number($("#sysex-id").value),
          onEvent: event => {
            if (event.type === "midi-message") {
              recordMIDIEvent(event);
              return;
            }
            if (event.type === "connected") {
              $("#midi-monitor-status").textContent = `Listening on ${event.input}`;
              return;
            }
            if (event.type === "disconnected") {
              $("#midi-monitor-status").textContent = "Endpoint disconnected · captured messages retained";
              setDeviceState("disconnected");
              connectMIDI.textContent = "Reconnect";
              $("#hardware-status").textContent = "Disconnected";
              showToast("The real NT MIDI endpoint disconnected");
            }
          }
        });
        await state.ntTransport.connect();
      }
      const identity = await state.ntTransport.readSnapshot();
      state.liveIdentity = identity;
      showLiveIdentity(identity);
      setDeviceState("labConnected");
      connectMIDI.textContent = "Read again";
      showToast(`Read ${identity.presetName || "unnamed preset"} from the real NT`);
      if (state.view === "routing") await loadLiveRouting();
    } catch (error) {
      disconnectRealTransport();
      setDeviceState("disconnected");
      stateBannerCopy.textContent = error.message;
      connectMIDI.textContent = "Reconnect";
      $("#hardware-title").textContent = "disting NT";
      $("#hardware-detail").textContent = error.message;
      $("#hardware-status").textContent = "Unavailable";
      showToast(error.message);
    } finally {
      connectMIDI.disabled = false;
    }
  }

  function setTransportMode(mode) {
    disconnectRealTransport();
    state.transport = mode;
    $$(".real-midi-control").forEach(control => control.classList.toggle("hidden", mode !== "real"));
    deviceStateControl.disabled = mode === "real";
    if (mode === "real") {
      resetMIDIMonitor();
      $(".prototype-note").textContent = "Real Web MIDI · routing writes enabled";
      mappingSourceCopy.textContent = "Not read yet";
      routingSourceCopy.textContent = "Connect to read live NT";
      routingNodes.replaceChildren();
      routingWires.replaceChildren();
      $("span", $("div", routingInspector)).textContent = "Routing graph";
      $("strong", $("div", routingInspector)).textContent = "Connect to inspect the complete loaded preset.";
      $("p", routingInspector).textContent = "No routing data has been requested from the NT yet.";
      $("#hardware-detail").textContent = "Waiting for Web MIDI permission";
      $("#hardware-status").textContent = "Not connected";
      connectMIDI.textContent = "Connect";
      setDeviceState("labWaiting");
      return;
    }
    showSimulatedIdentity();
    deviceStateControl.value = "ready";
    setDeviceState("ready");
  }

  $$("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-surface]").forEach(button => button.addEventListener("click", () => setSurface(button.dataset.surface)));

  $("#host-size").addEventListener("change", event => {
    state.hostSize = event.target.value;
    updateHostSize();
  });

  deviceStateControl.addEventListener("change", event => {
    const wasOffline = state.device === "offline";
    setDeviceState(event.target.value);
    if (wasOffline && state.device === "ready" && state.hasOfflineDraft) {
      showToast("Offline draft retained · compare it before applying anything to the NT");
    }
  });

  transportMode.addEventListener("change", event => setTransportMode(event.target.value));
  connectMIDI.addEventListener("click", readRealIdentity);
  routingConnectButton.addEventListener("click", async () => {
    if (state.transport !== "real") {
      transportMode.value = "real";
      setTransportMode("real");
    } else if (state.ntTransport) {
      disconnectRealTransport();
      setDeviceState("labWaiting");
    }
    await readRealIdentity();
  });
  routingReadButton.addEventListener("click", loadLiveRouting);
  routingNodes.addEventListener("click", async event => {
    if (await handleRoutingModeClick(event.target)) return;
    if (await handleRoutingConnectionClick(event.target)) return;
    const node = event.target.closest(".routing-node.slot");
    if (node) selectRoutingSlot(Number(node.dataset.slotIndex));
  });
  routingAuxPalette.addEventListener("click", event => handleAuxPaletteClick(event.target));
  $("#routing-show-signals").addEventListener("change", updateRoutingLayers);
  $("#routing-show-mappings").addEventListener("change", updateRoutingLayers);
  $("#routing-zoom-out").addEventListener("click", () => {
    state.routingZoom = Math.max(.2, Number((state.routingZoom - .1).toFixed(2)));
    applyRoutingZoom();
  });
  $("#routing-zoom-in").addEventListener("click", () => {
    state.routingZoom = Math.min(1.5, Number((state.routingZoom + .1).toFixed(2)));
    applyRoutingZoom();
  });
  $("#routing-fit").addEventListener("click", () => fitRoutingGraph());
  routingViewport.addEventListener("wheel", event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = routingViewport.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const previousZoom = state.routingZoom;
    const contentX = (routingViewport.scrollLeft + localX) / previousZoom;
    const contentY = (routingViewport.scrollTop + localY) / previousZoom;
    const direction = event.deltaY > 0 ? -.08 : .08;
    state.routingZoom = Math.max(.2, Math.min(1.5, Number((previousZoom + direction).toFixed(2))));
    applyRoutingZoom();
    routingViewport.scrollLeft = (contentX * state.routingZoom) - localX;
    routingViewport.scrollTop = (contentY * state.routingZoom) - localY;
  }, { passive: false });

  let routingDrag = null;
  routingViewport.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button, input, label, .routing-node.endpoint, .routing-port")) return;
    routingDrag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: routingViewport.scrollLeft,
      top: routingViewport.scrollTop
    };
    routingViewport.setPointerCapture(event.pointerId);
    routingViewport.classList.add("dragging");
  });
  routingViewport.addEventListener("pointermove", event => {
    if (!routingDrag || event.pointerId !== routingDrag.pointerId) return;
    routingViewport.scrollLeft = routingDrag.left - (event.clientX - routingDrag.x);
    routingViewport.scrollTop = routingDrag.top - (event.clientY - routingDrag.y);
  });
  const finishRoutingDrag = event => {
    if (!routingDrag || event.pointerId !== routingDrag.pointerId) return;
    routingDrag = null;
    routingViewport.classList.remove("dragging");
  };
  routingViewport.addEventListener("pointerup", finishRoutingDrag);
  routingViewport.addEventListener("pointercancel", finishRoutingDrag);
  midiMonitorFilter.addEventListener("change", renderMIDIMonitor);
  $("#clear-midi-monitor").addEventListener("click", resetMIDIMonitor);
  $("#sysex-id").addEventListener("change", () => {
    disconnectRealTransport();
    connectMIDI.textContent = "Connect";
    setDeviceState("labWaiting");
  });

  $("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light-stage"));

  $$(".sync-option").forEach(button => button.addEventListener("click", () => {
    $$(".sync-option").forEach(option => option.classList.remove("active"));
    button.classList.add("active");
    state.syncMode = button.textContent.trim().toLowerCase();
    if (state.transport === "real" && state.activeLiveSlotIndex != null) {
      startLivePolling(state.activeLiveSlotIndex);
    }
    const detail = state.syncMode === "manual" ? "background polling off" :
      state.syncMode === "fast" ? "100 ms selected-slot polling" : "250 ms selected-slot polling";
    showToast(`${button.textContent.trim()} sync · ${detail}`);
  }));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLivePolling();
      return;
    }
    if (state.transport === "real" && state.activeLiveSlotIndex != null) {
      startLivePolling(state.activeLiveSlotIndex);
    }
  });

  slotList.addEventListener("click", event => {
    const slot = event.target.closest(".slot:not(.muted)");
    if (slot) displaySlot(slot);
  });

  $$(".parameter-row input[type=range]").forEach(slider => slider.addEventListener("input", () => {
    const output = $("output", slider.closest(".parameter-row"));
    output.textContent = `${slider.value}${Number(slider.min) < 0 ? " st" : "%"}`;
  }));

  $$("[data-jump=mapping]").forEach(button => button.addEventListener("click", () => setView("mapping")));
  $("#parameter-list").addEventListener("click", event => {
    const sectionHeading = event.target.closest(".parameter-section-heading");
    if (sectionHeading) {
      const section = sectionHeading.closest(".parameter-section");
      const collapsed = section.classList.toggle("collapsed");
      sectionHeading.setAttribute("aria-expanded", String(!collapsed));
      return;
    }
    const button = event.target.closest(".map-shortcut");
    if (!button) return;
    const target = button.dataset.mappingKey
      ? $(`.mapping-item[data-mapping-key="${button.dataset.mappingKey}"]`)
      : $(`.mapping-item[data-name="${button.dataset.param}"]`);
    if (target) {
      openMappingItem(target);
      return;
    }

    $$('.mapping-item[data-draft="true"]').forEach(item => item.remove());
    let draft;
    if (button.dataset.mappingKey && state.liveParameters.has(button.dataset.mappingKey)) {
      const liveTarget = state.liveParameters.get(button.dataset.mappingKey);
      draft = createMappingItem(liveTarget.parameter, liveTarget.slotInfo, { draft: true });
    } else {
      const row = button.closest(".parameter-row");
      const slider = $("input[type=range]", row);
      const parameter = {
        index: $$(".parameter-row", $("#parameter-list")).indexOf(row),
        name: button.dataset.param || $(".parameter-name strong", row).textContent,
        min: Number(slider.min),
        max: Number(slider.max),
        pageName: $(".parameter-section-heading strong", row.closest(".parameter-section"))?.textContent || $(".parameter-name span", row).textContent,
        mapping: null
      };
      draft = createMappingItem(parameter, { index: 6, name: "WitchboardX", algorithmName: "Witchboard custom plug-in" }, { draft: true });
      draft.dataset.mappingKey = "";
    }
    $("#mapping-items").prepend(draft);
    updateMappingSummary();
    openMappingItem(draft);
  });

  $("#mapping-items").addEventListener("click", event => {
    const item = event.target.closest(".mapping-item");
    if (item) populateMapping(item);
  });

  $("#mapping-search").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    $$(".mapping-item").forEach(item => {
      item.classList.toggle("hidden", !`${item.dataset.name} ${item.dataset.category}`.toLowerCase().includes(query));
    });
  });

  $$(`#mapping-form input, #mapping-form select`).forEach(control => control.addEventListener("input", markMappingDirty));

  $("#learn-button").addEventListener("click", event => {
    const button = event.currentTarget;
    clearTimeout(state.learnTimer);
    if (button.classList.contains("listening")) {
      button.classList.remove("listening");
      $("#learn-label").textContent = "Learn";
      showToast("MIDI Learn cancelled");
      return;
    }
    button.classList.add("listening");
    $("#learn-label").textContent = "Listening…";
    state.learnTimer = setTimeout(() => {
      button.classList.remove("listening");
      $("#learn-label").textContent = "Learn";
      mapChannel.value = "1";
      mapType.value = "CC";
      mapCC.value = "9";
      mapEnabled.checked = true;
      markMappingDirty();
      showToast("Prototype captured Channel 1 · CC 9");
    }, 1300);
  });

  const performanceAssignedCard = `
    <div class="control-card-head"><span>LoopyDial</span><button>•••</button></div>
    <div class="performance-value"><strong>Profile 3</strong><span>Current value</span></div>
    <h2>Profile</h2><p>Slot 9 · Parameter 1</p>`;

  $$("[data-performance-page]").forEach(button => button.addEventListener("click", () => {
    const page = Number(button.dataset.performancePage);
    $$("[data-performance-page]").forEach(item => item.classList.toggle("active", item === button));
    $("#performance-page-title").textContent = `Page ${page}`;
    const cards = $$(".performance-grid .control-card");
    cards.forEach((card, index) => {
      const itemNumber = (page - 1) * 4 + index + 1;
      card.className = "control-card empty-performance";
      card.classList.toggle("hidden", itemNumber > 30);
      card.innerHTML = `<span>${itemNumber}</span><strong>Unassigned</strong><button>Assign parameter</button>`;
    });
    if (page === 1) {
      cards[0].className = "control-card accent-mint assigned-performance";
      cards[0].innerHTML = performanceAssignedCard;
    }
  }));

  resetMapping.addEventListener("click", () => {
    if (state.selectedMapping?.dataset.draft === "true") {
      const name = state.selectedMapping.dataset.name;
      state.selectedMapping.remove();
      state.selectedMapping = null;
      state.mappingDirty = false;
      updateMappingSummary();
      setView("editor");
      showToast(`${name} mapping draft discarded`);
      return;
    }
    if (state.undoMapping) {
      const current = currentMappingValues();
      restoreMapping(state.undoMapping);
      applyMappingToItem(state.undoMapping);
      state.mappingBaseline = currentMappingValues();
      state.undoMapping = current;
      state.mappingDirty = false;
      resetMapping.textContent = "Undo last";
      updateMappingState();
      showToast(state.device === "offline" ? "Previous local mapping restored" : "Previous mapping restored and read back");
      return;
    }
    restoreMapping(state.mappingBaseline);
    state.mappingDirty = false;
    updateMappingState();
  });

  mappingForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!canMutate()) {
      showToast("Mapping is read-only until the NT is ready");
      return;
    }
    if (!state.mappingDirty) return;
    const previous = state.mappingBaseline;
    const next = currentMappingValues();
    if (state.device === "offline") {
      applyMappingToItem(next);
      state.mappingBaseline = next;
      state.mappingDirty = false;
      state.undoMapping = previous;
      state.hasOfflineDraft = true;
      resetMapping.textContent = "Undo last";
      updateMappingState();
      showToast(`${state.selectedMapping.dataset.name} mapping saved to offline draft`);
      return;
    }
    applyMapping.disabled = true;
    mappingConfirmation.className = "confirmed-badge draft verifying";
    mappingConfirmation.innerHTML = "<i></i> Reading back…";
    setTimeout(() => {
      applyMappingToItem(next);
      state.mappingBaseline = next;
      state.mappingDirty = false;
      state.undoMapping = previous;
      resetMapping.textContent = "Undo last";
      updateMappingState();
      showToast(`${state.selectedMapping.dataset.name} mapping confirmed by fake NT`);
    }, 950);
  });

  $(".refresh-button").addEventListener("click", () => {
    if (state.transport === "real") {
      readRealIdentity();
      return;
    }
    if (state.device === "disconnected") {
      showToast("Cannot refresh while the NT is disconnected");
      return;
    }
    if (state.device === "offline") {
      showToast("Offline draft will be compared with the NT before any hardware apply");
      return;
    }
    setDeviceState("syncing");
    $("#device-state").value = "syncing";
    setTimeout(() => {
      setDeviceState("ready");
      $("#device-state").value = "ready";
      showToast("Fake preset snapshot refreshed");
    }, 1100);
  });

  stateAction.addEventListener("click", () => {
    if (state.device === "labWaiting" || state.device === "labConnected") {
      readRealIdentity();
      return;
    }
    if (state.device === "owned") {
      showToast("Control request sent to the current owner");
      return;
    }
    if (state.device === "disconnected") {
      setDeviceState("syncing");
      $("#device-state").value = "syncing";
      setTimeout(() => {
        setDeviceState("ready");
        $("#device-state").value = "ready";
        showToast("Fake NT connection restored");
      }, 1200);
      return;
    }
    showToast("Snapshot: algorithms 10/10 · parameters 52/78");
  });

  $("#approve-change").addEventListener("click", event => {
    if (!canApplyToHardware()) {
      showToast("Approval is unavailable until the NT is ready");
      return;
    }
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Applying…";
    setTimeout(() => {
      const card = $("#change-card");
      card.classList.add("committed");
      $(".change-kind", card).textContent = "Applied and verified";
      $(".risk-pill", card).textContent = "Undo available";
      button.textContent = "Committed";
      showToast("Change read back and committed");
    }, 1100);
  });

  $("#reject-change").addEventListener("click", () => {
    $("#change-card").classList.add("hidden");
    showToast("Proposal rejected · nothing changed");
  });

  $("#chat-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("#chat-input");
    const message = input.value.trim();
    if (!message) return;
    const article = document.createElement("article");
    article.className = "message user-message";
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    article.appendChild(paragraph);
    $("#messages").appendChild(article);
    input.value = "";
    article.scrollIntoView({ behavior: "smooth", block: "end" });
    setTimeout(() => {
      const response = document.createElement("article");
      response.className = "message assistant-message";
      const avatar = document.createElement("div");
      avatar.className = "assistant-avatar";
      avatar.textContent = "AI";
      const body = document.createElement("div");
      body.className = "message-body";
      const copy = document.createElement("p");
      copy.textContent = "This visual prototype is using a canned response. The production assistant will inspect live state and cited NT documentation before proposing anything.";
      body.appendChild(copy);
      response.append(avatar, body);
      $("#messages").appendChild(response);
      response.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 650);
  });

  populateMapping($(".mapping-item.active"));
  updateMappingSummary();
  setDeviceState("ready");
  showSimulatedIdentity();
  setSurface("app");
  setView("editor");
})();
