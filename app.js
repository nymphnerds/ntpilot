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
  const mapMin = $("#map-min");
  const mapMax = $("#map-max");
  const newMappingButton = $("#new-mapping-button");
  const newMappingPicker = $("#new-mapping-picker");
  const newMappingTarget = $("#new-mapping-target");
  const mappingCount = $("#mapping-count");
  const mappingSourceCopy = $("#mapping-source-copy");
  const transportMode = $("#transport-mode");
  const connectMIDI = $("#connect-midi");
  const deviceStateControl = $("#device-state");
  const slotList = $(".slot-list");
  const simulatedSlotMarkup = slotList.innerHTML;
  const midiMonitorLog = $("#midi-monitor-log");
  const midiMonitorFilter = $("#midi-monitor-filter");

  const state = {
    surface: "app",
    hostSize: "expanded",
    transport: "simulation",
    ntTransport: null,
    liveIdentity: null,
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
      copy: "Connect to read firmware and preset identity. Hardware writes are blocked in this milestone.",
      action: "Connect",
      bannerClass: "offline"
    },
    labConnected: {
      label: "NT detected",
      title: "Real NT connected in safe read-only mode",
      copy: "Preset, slots, and the selected slot's parameters are live. Hardware writes remain blocked; mappings and performance are still fixtures.",
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
  }

  function setView(view) {
    state.view = view;
    $$("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === view));
    $$("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $(".view-stack").scrollTop = 0;
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
    mappingSourceCopy.textContent = nextState === "offline" ? "Local draft" :
      state.transport === "real" ? "Demo fixture · not live" : "Fake NT fixture";
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
      enabled: mapEnabled.checked
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
    state.mappingBaseline = currentMappingValues();
    state.mappingDirty = false;
    state.undoMapping = null;
    resetMapping.textContent = "Cancel";
    updateMappingState();
  }

  function mappingIsConflicted() {
    return mapChannel.value === "1" && mapCC.value === "9";
  }

  function updateMappingState() {
    mappingWarning.classList.toggle("hidden", !mappingIsConflicted());
    mappingConfirmation.className = `confirmed-badge${state.mappingDirty ? " draft" : ""}`;
    const settledLabel = state.device === "offline" ? "Local draft" :
      state.transport === "real" ? "Fixture only" : "Confirmed";
    mappingConfirmation.innerHTML = `<i></i> ${state.mappingDirty ? "Not applied" : settledLabel}`;
    applyMapping.disabled = !canMutate() || !state.mappingDirty;
  }

  function updateMappingSummary() {
    const items = $$(".mapping-item");
    const mapped = items.filter(item => item.dataset.cc !== "").length;
    mappingCount.textContent = `${mapped} mapped · ${items.length - mapped} available`;
    const previousTarget = newMappingTarget.value;
    newMappingTarget.replaceChildren();
    items.forEach((item, index) => {
      if (!item.dataset.mappingKey) item.dataset.mappingKey = `fixture:${index}:${item.dataset.name}`;
      const option = document.createElement("option");
      option.value = item.dataset.mappingKey;
      option.textContent = item.dataset.name;
      option.disabled = item.dataset.cc !== "";
      newMappingTarget.appendChild(option);
    });
    if ([...newMappingTarget.options].some(option => option.value === previousTarget && !option.disabled)) {
      newMappingTarget.value = previousTarget;
    }
    const firstAvailable = [...newMappingTarget.options].find(option => !option.disabled);
    if (newMappingTarget.selectedOptions[0]?.disabled && firstAvailable) {
      newMappingTarget.value = firstAvailable.value;
    }
    newMappingButton.disabled = !firstAvailable;
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
    updateMappingSummary();
  }

  function restoreMapping(values) {
    mapChannel.value = values.channel;
    mapType.value = values.type;
    mapCC.value = values.cc;
    mapMin.value = values.min;
    mapMax.value = values.max;
    mapEnabled.checked = values.enabled;
  }

  function showSimulatedIdentity() {
    slotList.innerHTML = simulatedSlotMarkup;
    $(".prototype-note").textContent = "Fake data · no MIDI";
    $("#preset-title").textContent = "WitchboardX";
    $("#editor-heading").textContent = "WitchboardX";
    $("#editor-slot-count").textContent = "10 slots";
    $("#hardware-title").textContent = "disting NT";
    $("#hardware-detail").textContent = "Simulation · SysEx ID 0";
    $("#hardware-status").textContent = "Ready";
    displaySlot($(".slot.active", slotList));
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

  function createMappingItem(parameter, slotInfo) {
    const item = document.createElement("button");
    item.className = "mapping-item";
    item.type = "button";
    item.dataset.mappingKey = `live:${slotInfo.index}:${parameter.index}`;
    item.dataset.name = parameter.name;
    item.dataset.category = slotInfo.algorithmName;
    item.dataset.path = `Slot ${slotInfo.index + 1} · ${slotInfo.name} · Parameter ${parameter.index + 1}`;
    item.dataset.parameterIndex = String(parameter.index);
    item.dataset.slotIndex = String(slotInfo.index);
    item.dataset.cc = "";
    item.dataset.channel = "1";
    item.dataset.type = "CC";
    item.dataset.min = String(parameter.min);
    item.dataset.max = String(parameter.max);
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = parameter.name;
    const detail = document.createElement("small");
    detail.textContent = `Parameter ${parameter.index + 1} · ${slotInfo.algorithmName}`;
    copy.append(name, detail);
    const status = document.createElement("em");
    status.textContent = "Not mapped";
    item.append(copy, status);
    return item;
  }

  function syncLiveMappingTargets(parameters, slotInfo) {
    const items = $("#mapping-items");
    items.replaceChildren(...parameters.filter(parameter => parameter.name)
      .map(parameter => createMappingItem(parameter, slotInfo)));
    mappingSourceCopy.textContent = "Live parameters · draft only";
    updateMappingSummary();
  }

  function renderLiveParameters(parameters, slotInfo) {
    const visibleParameters = parameters.filter(parameter => parameter.name);
    const list = $("#parameter-list");
    list.replaceChildren();
    syncLiveMappingTargets(parameters, slotInfo);
    visibleParameters.forEach(parameter => {
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
      pendingMapping.dataset.mappingKey = `live:${slotInfo.index}:${parameter.index}`;
      pendingMapping.title = `Add mapping for ${parameter.name}`;
      pendingMapping.setAttribute("aria-label", `Add mapping for ${parameter.name}`);
      pendingMapping.textContent = "+";

      row.append(name, slider, output, pendingMapping);
      list.appendChild(row);
    });
    list.classList.remove("hidden");
    $("#parameter-fixture-note").classList.toggle("hidden", visibleParameters.length > 0);
    if (!visibleParameters.length) {
      $("#fixture-algorithm").textContent = "No visible parameters";
      $("#parameter-fixture-note span").textContent = "The NT reported no named parameters for this algorithm.";
    }
  }

  function queueLiveParameterRead(slot) {
    const token = ++state.parameterReadToken;
    const slotIndex = Number(slot.dataset.index);
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = `Reading ${slot.dataset.algorithm}…`;
    $("#parameter-fixture-note span").textContent = "Reading parameter definitions and current values from the NT.";

    state.parameterReadQueue = state.parameterReadQueue.catch(() => {}).then(async () => {
      if (token !== state.parameterReadToken || !state.ntTransport) return;
      try {
        const parameters = await state.ntTransport.readSlotParameters(slotIndex);
        if (token !== state.parameterReadToken) return;
        renderLiveParameters(parameters, {
          index: slotIndex,
          name: slot.dataset.slot,
          algorithmName: slot.dataset.algorithm
        });
        showToast(`Read ${parameters.filter(parameter => parameter.name).length} parameters from ${slot.dataset.slot}`);
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
    $(".prototype-note").textContent = "Live preset + slots · writes blocked";
    $("#preset-title").textContent = presetName;
    $("#editor-heading").textContent = presetName;
    $("#editor-slot-count").textContent = `${identity.slotCount} slots`;
    $("#hardware-title").textContent = "disting NT · live";
    $("#hardware-detail").textContent = `${identity.version || "Unknown firmware"} · SysEx ID ${identity.sysexId}`;
    $("#hardware-status").textContent = "Read only";
    renderLiveSlots(identity.slots);
  }

  function disconnectRealTransport() {
    if (state.ntTransport) state.ntTransport.disconnect();
    state.ntTransport = null;
    state.liveIdentity = null;
    if ($("#midi-monitor-status")) $("#midi-monitor-status").textContent = "Monitor paused · no NT endpoint";
  }

  async function readRealIdentity() {
    connectMIDI.disabled = true;
    connectMIDI.textContent = "Reading…";
    setDeviceState("syncing");
    try {
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
              $("#midi-monitor-status").textContent = `Listening on ${event.input} · read-only capture`;
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
    } catch (error) {
      disconnectRealTransport();
      setDeviceState("disconnected");
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
      $(".prototype-note").textContent = "Real Web MIDI · writes blocked";
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
    showToast(`${button.textContent} synchronization selected`);
  }));

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
    const button = event.target.closest(".map-shortcut");
    if (!button) return;
    const target = button.dataset.mappingKey
      ? $(`.mapping-item[data-mapping-key="${button.dataset.mappingKey}"]`)
      : $(`.mapping-item[data-name="${button.dataset.param}"]`);
    if (target) openMappingItem(target);
  });

  $("#mapping-items").addEventListener("click", event => {
    const item = event.target.closest(".mapping-item");
    if (item) populateMapping(item);
  });

  newMappingButton.addEventListener("click", () => {
    updateMappingSummary();
    if (newMappingButton.disabled) {
      showToast("Every shown parameter already has a mapping");
      return;
    }
    newMappingPicker.classList.toggle("hidden");
  });

  $("#cancel-new-mapping").addEventListener("click", () => newMappingPicker.classList.add("hidden"));

  $("#create-mapping-draft").addEventListener("click", () => {
    const target = $$(".mapping-item").find(item => item.dataset.mappingKey === newMappingTarget.value);
    if (!target) return;
    populateMapping(target);
    mapEnabled.checked = true;
    markMappingDirty();
    newMappingPicker.classList.add("hidden");
    mapCC.focus();
    showToast(`New ${target.dataset.name} mapping draft`);
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
