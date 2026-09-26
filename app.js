(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const routingLogic = window.NTPilotRoutingLogic;

  const connectionPill = $("#connection-pill");
  const connectionLabel = $("#connection-label");
  const deviceFrame = $("#device-frame");
  const appMain = $(".app-main");
  const primaryNav = $(".primary-nav");
  const deviceTitle = $("#device-title");
  const editorShell = $("#editor-shell");
  const editorEmptyState = $("#editor-empty-state");
  const stateBanner = $("#state-banner");
  const stateBannerTitle = $("#state-banner-title");
  const stateBannerCopy = $("#state-banner-copy");
  const stateAction = $("#state-action");
  const toast = $("#toast");
  deviceFrame.appendChild(toast);
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
  const mappingSlotSelect = $("#mapping-slot-select");
  const mappingEmpty = $("#mapping-empty");
  const mappingEmptyCard = $("#mapping-empty-card");
  const connectMIDI = $("#connect-midi");
  const savePreset = $("#save-preset");
  const undoEdit = $("#undo-edit");
  const redoEdit = $("#redo-edit");
  const workingState = $("#working-state");
  const interfaceScaleDown = $("#interface-scale-down");
  const interfaceScaleValue = $("#interface-scale-value");
  const interfaceScaleUp = $("#interface-scale-up");
  const ipadModeControl = $("#ipad-mode");
  const darkModeControl = $("#dark-mode");
  const syncModeControl = $("#sync-mode");
  const statusSyncControl = $(".status-sync");
  const statusSyncAnchor = document.createComment("status sync position");
  statusSyncControl.parentNode.insertBefore(statusSyncAnchor, statusSyncControl);
  const syncModeLabel = $("#sync-mode-label");
  const syncModeDetail = $("#sync-mode-detail");
  const slotList = $(".slot-list");
  const midiMonitorLog = $("#midi-monitor-log");
  const midiMonitorFilter = $("#midi-monitor-filter");
  const routingViewport = $("#routing-viewport");
  const routingIpadList = $("#routing-ipad-list");
  const routingZoomLayer = $("#routing-zoom-layer");
  const routingCanvas = $("#routing-canvas");
  const routingWires = $("#routing-wires");
  const routingNodes = $("#routing-nodes");
  const routingAuxPalette = $("#routing-aux-palette");
  const routingLoading = $("#routing-loading");
  const routingInspector = $("#routing-inspector");
  const routingShowSignals = $("#routing-show-signals");
  const routingShowInput = $("#routing-show-input");
  const routingShowOutput = $("#routing-show-output");
  const routingShowAux = $("#routing-show-aux");
  const routingShowMod = $("#routing-show-mod");
  const routingInspectorDefault = $("#routing-inspector-default");
  const routingConnectionPanel = $("#routing-connection-panel");
  const routingConnectionTitle = $("#routing-connection-title");
  const routingConnectionPath = $("#routing-connection-path");
  const routingConnectionNote = $("#routing-connection-note");
  const routingOutputModeField = $("#routing-output-mode-field");
  const routingOutputModeHelp = $("#routing-output-mode-help");
  const routingExistingRoutesField = $("#routing-existing-routes-field");
  const routingExistingRoutesHelp = $("#routing-existing-routes-help");
  document.body.appendChild(routingConnectionPanel);
  const editorBusDock = $("#editor-bus-dock");
  const editorAuxBusRow = $("#editor-aux-bus-row");
  const editorInputBusRow = $("#editor-input-bus-row");
  const editorOutputBusRow = $("#editor-output-bus-row");
  const editorExpanderRows = $("#editor-expander-rows");
  const viewStack = $(".view-stack");
  const referenceGuide = $("#reference-guide");
  const guideSearch = $("#guide-search");
  const guideResultCount = $("#guide-result-count");

  let rebootRecovery = null;
  try {
    rebootRecovery = JSON.parse(sessionStorage.getItem("ntPilotRebootRecovery") || "null");
    sessionStorage.removeItem("ntPilotRebootRecovery");
  } catch (_) {
    rebootRecovery = null;
  }

  const state = {
    ntTransport: null,
    transportOnline: false,
    reconnectTimer: null,
    reloadAfterReconnect: false,
    liveIdentity: null,
    liveRouting: null,
    routingReadPromise: null,
    routingReconcileTimer: null,
    routingModeHydrationPromise: null,
    routingReadToken: 0,
    routingZoom: 1,
    interfaceScale: 100,
    ipadMode: false,
    darkMode: false,
    pilotAccentHue: 164,
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
    parameterWriteQueue: Promise.resolve(),
    hasUnsavedWorkingEdits: false,
    liveParameters: new Map(),
    armedBusEntry: null,
    selectedSlotIndex: null,
    activeLiveSlotIndex: null,
    syncMode: "fast",
    pollTimer: null,
    pollToken: 0,
    pollInFlight: null,
    lastPollError: null,
    smartFeedbackTimer: null,
    smartFeedbackValues: new Map(),
    performancePage: 1,
    performanceItems: [],
    performanceEntries: new Map(),
    performanceReadPromise: null,
    undoHistory: [],
    redoHistory: [],
    historyBusy: false,
    cpuTimer: null,
    midiEvents: [],
    midiRenderPending: false,
    midiCounts: { all: 0, channel: 0, sysex: 0 },
  };

  function updateHistoryControls() {
    undoEdit.disabled = state.historyBusy;
    redoEdit.disabled = state.historyBusy;
    undoEdit.classList.toggle("empty", !state.transportOnline || state.undoHistory.length === 0);
    redoEdit.classList.toggle("empty", !state.transportOnline || state.redoHistory.length === 0);
    undoEdit.setAttribute("aria-disabled", String(!state.transportOnline || state.undoHistory.length === 0));
    redoEdit.setAttribute("aria-disabled", String(!state.transportOnline || state.redoHistory.length === 0));
    undoEdit.title = state.undoHistory.length ? `Undo ${state.undoHistory.at(-1).label} (Ctrl/Cmd+Z)` : "Nothing to undo";
    redoEdit.title = state.redoHistory.length ? `Redo ${state.redoHistory.at(-1).label} (Ctrl/Cmd+Shift+Z)` : "Nothing to redo";
  }

  function recordHistory(action) {
    if (state.historyBusy) return;
    state.undoHistory.push(action);
    if (state.undoHistory.length > 50) state.undoHistory.shift();
    state.redoHistory.length = 0;
    updateHistoryControls();
  }

  function recordParameterHistory(changes, label, { routing = false } = {}) {
    const effective = changes.filter(change => change.before != null && change.after != null && Number(change.before) !== Number(change.after));
    if (!effective.length) return;
    recordHistory({ type: "parameter-batch", changes: effective, label, routing });
  }

  function captureRoutingParameterState(snapshot = state.routingSnapshot) {
    const values = new Map();
    (snapshot?.slots || []).forEach(slot => (slot.parameters || []).forEach(parameter => {
      values.set(`${slot.index}:${parameter.index}`, {
        slotIndex: slot.index,
        parameterIndex: parameter.index,
        before: Number(parameter.value)
      });
    }));
    return values;
  }

  function recordRoutingHistory(beforeState, label) {
    const afterState = captureRoutingParameterState();
    const changes = [];
    beforeState.forEach((before, key) => {
      const after = afterState.get(key);
      if (after && before.before !== after.before) changes.push({
        slotIndex: before.slotIndex,
        parameterIndex: before.parameterIndex,
        before: before.before,
        after: after.before
      });
    });
    recordParameterHistory(changes, label, { routing: true });
  }

  async function applyParameterHistory(action, direction) {
    const target = direction === "undo" ? "before" : "after";
    try {
      for (const change of action.changes) {
        await state.ntTransport.writeParameter(change.slotIndex, change.parameterIndex, change[target]);
      }
      if (action.routing && state.routingSnapshot) {
        await loadLiveRouting({ preserveView: true });
      } else {
        action.changes.forEach(change => {
          const liveEntry = state.liveParameters.get(mappingKey(change.slotIndex, change.parameterIndex));
          if (liveEntry) updateLiveParameterEntry(liveEntry, change[target], "midi-feedback");
          state.performanceEntries.forEach(entry => {
            if (entry.slotInfo.index === change.slotIndex && entry.parameter.index === change.parameterIndex) {
              entry.parameter.value = change[target];
              updatePerformanceEntry(entry);
            }
          });
          if (change.parameterIndex === 0) {
            const bypassed = Boolean(change[target]);
            const identitySlot = state.liveIdentity?.slots.find(slot => slot.index === change.slotIndex);
            const routingSlot = state.liveRouting?.slots.find(slot => slot.index === change.slotIndex);
            if (identitySlot) identitySlot.bypassed = bypassed;
            if (routingSlot) routingSlot.bypassed = bypassed;
            $(`[data-index="${change.slotIndex}"]`, slotList)?.classList.toggle("bypassed", bypassed);
            $$(`[data-bypass-slot="${change.slotIndex}"]`).forEach(item => setBypassToggleContent(item, bypassed));
          }
        });
      }
      markWorkingEdit();
      startCpuPolling();
      return true;
    } catch (error) {
      showToast(`History apply failed · ${error.message}`);
      return false;
    }
  }

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
      title: "Connect your disting NT",
      copy: "Read the current working preset to edit it.",
      action: "Connect",
      bannerClass: "offline"
    },
    labConnected: {
      label: "Connected",
      title: "Real NT connected",
      copy: "Edits apply to the NT working preset. Save preset stores them permanently.",
      action: "Refresh",
      bannerClass: "offline"
    }
  };

  function userFacingText(value, fallback = "Information unavailable") {
    const raw = value instanceof Error ? value.message : value;
    const text = String(raw ?? "").trim();
    if (!text || /^(?:null|undefined|nan)$/i.test(text)) return fallback;
    return text;
  }

  function showToast(message) {
    clearTimeout(state.toastTimer);
    $("span", toast).textContent = userFacingText(message);
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
    if (state.syncMode === "manual") return;
    state.liveParameters.forEach(entry => {
      if (entry.sliderInteracting) return;
      const midi = entry.parameter.mapping?.midi;
      if (!midi?.enabled || midi.type !== "CC" || midi.relative) return;
      if (midi.channel !== message.channel || midi.cc !== message.controller) return;
      const lower = Math.min(midi.min, midi.max);
      const upper = Math.max(midi.min, midi.max);
      const mapped = midi.min + (message.value / 127) * (midi.max - midi.min);
      const value = Math.min(entry.parameter.max, Math.max(entry.parameter.min,
        Math.min(upper, Math.max(lower, Math.round(mapped)))));
      if (state.syncMode === "smart") {
        state.smartFeedbackValues.set(entry, value);
        if (!state.smartFeedbackTimer) {
          state.smartFeedbackTimer = setTimeout(() => {
            state.smartFeedbackTimer = null;
            const updates = [...state.smartFeedbackValues.entries()];
            state.smartFeedbackValues.clear();
            if (state.syncMode !== "smart") return;
            updates.forEach(([target, nextValue]) => updateLiveParameterEntry(target, nextValue, "midi-feedback"));
          }, 250);
        }
        return;
      }
      updateLiveParameterEntry(entry, value, "midi-feedback");
    });
  }

  function clearSmartFeedback() {
    clearTimeout(state.smartFeedbackTimer);
    state.smartFeedbackTimer = null;
    state.smartFeedbackValues.clear();
  }

  function updateLiveParameterEntry(entry, value, feedbackClass = "poll-feedback") {
    if (entry.parameter.value === value) {
      updateParameterBusChip(entry);
      return;
    }
    entry.parameter.value = value;
    entry.confirmedValue = value;
    entry.slider.value = String(value);
    updateRangeProgress(entry.slider);
    entry.output.textContent = formatParameterValue(entry.parameter);
    updatePerformanceEntry(entry);
    updateParameterBusChip(entry);
    if (state.armedBusEntry === entry) refreshEditorBusDockState();
    entry.row.classList.remove("midi-feedback", "poll-feedback");
    requestAnimationFrame(() => entry.row.classList.add(feedbackClass));
    clearTimeout(entry.feedbackTimer);
    entry.feedbackTimer = setTimeout(() => entry.row.classList.remove(feedbackClass), 180);
  }

  function updateWorkingState() {
    const visible = Boolean(state.transportOnline && state.ntTransport && state.liveIdentity && state.hasUnsavedWorkingEdits);
    workingState.classList.toggle("hidden", !visible);
    savePreset.classList.toggle("hidden", !state.liveIdentity);
    savePreset.disabled = !visible;
  }

  function markWorkingEdit() {
    state.hasUnsavedWorkingEdits = true;
    updateWorkingState();
  }

  function queueLiveParameterWrite(entry, value, { afterWrite = null, onSuccess = null, successMessage = null, historyRouting = false } = {}) {
    const requestedValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    const previousValue = entry.parameter.value;
    if (requestedValue === previousValue) {
      if (onSuccess) onSuccess();
      return Promise.resolve(true);
    }
    if (!state.ntTransport || !state.transportOnline) return Promise.resolve(false);
    const pendingPoll = stopLivePolling();
    entry.writePending = true;
    entry.slider.disabled = true;
    if (entry.busChip) entry.busChip.disabled = true;
    if (state.armedBusEntry === entry) refreshEditorBusDockState();
    const operation = state.parameterWriteQueue.catch(() => {}).then(async () => {
      if (pendingPoll) await pendingPoll.catch(() => {});
      if (!state.ntTransport || !state.transportOnline) throw new Error("The NT is no longer connected.");
      await state.ntTransport.writeParameter(entry.slotInfo.index, entry.parameter.index, requestedValue);
      updateLiveParameterEntry(entry, requestedValue, "midi-feedback");
      markWorkingEdit();
      recordParameterHistory([{
        slotIndex: entry.slotInfo.index,
        parameterIndex: entry.parameter.index,
        before: previousValue,
        after: requestedValue
      }], `change ${entry.parameter.name}`, { routing: historyRouting });
      if (afterWrite) await afterWrite();
      if (onSuccess) onSuccess();
      showToast(successMessage || `${entry.parameter.name} changed and verified from the NT`);
      return true;
    }).catch(error => {
      entry.slider.value = String(previousValue);
      entry.output.textContent = formatParameterValue(entry.parameter);
      updateParameterBusChip(entry);
      showToast(error.message);
      return false;
    }).finally(() => {
      entry.writePending = false;
      entry.slider.disabled = false;
      if (entry.busChip) entry.busChip.disabled = false;
      if (state.armedBusEntry === entry) refreshEditorBusDockState();
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
    });
    state.parameterWriteQueue = operation;
    return operation;
  }

  function previewLiveParameterEntry(entry, value) {
    const previewValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    entry.slider.value = String(previewValue);
    updateRangeProgress(entry.slider);
    entry.output.textContent = formatParameterValue(entry.parameter, previewValue);
  }

  function queueLiveSliderWrite(entry, value, { commit = false } = {}) {
    const requestedValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    if (entry.sliderHistoryStart == null && requestedValue !== entry.confirmedValue) entry.sliderHistoryStart = entry.confirmedValue;
    previewLiveParameterEntry(entry, requestedValue);
    if (requestedValue !== entry.confirmedValue) entry.pendingSliderValue = requestedValue;
    if (commit) entry.sliderCommitPending = true;
    if (entry.sliderWriteRunning || !state.ntTransport || !state.transportOnline) return;

    entry.sliderWriteRunning = true;
    const pendingPoll = stopLivePolling();
    const operation = state.parameterWriteQueue.catch(() => {}).then(async () => {
      if (pendingPoll) await pendingPoll.catch(() => {});
      while (entry.pendingSliderValue != null) {
        const nextValue = entry.pendingSliderValue;
        entry.pendingSliderValue = null;
        if (!state.ntTransport || !state.transportOnline) throw new Error("The NT is no longer connected.");
        await state.ntTransport.writeParameter(entry.slotInfo.index, entry.parameter.index, nextValue);
        entry.parameter.value = nextValue;
        entry.confirmedValue = nextValue;
        updateParameterBusChip(entry);
        if (state.armedBusEntry === entry) refreshEditorBusDockState();
        markWorkingEdit();
      }
      if (!entry.sliderInteracting) previewLiveParameterEntry(entry, entry.confirmedValue);
      if (entry.sliderCommitPending) {
        recordParameterHistory([{
          slotIndex: entry.slotInfo.index,
          parameterIndex: entry.parameter.index,
          before: entry.sliderHistoryStart,
          after: entry.confirmedValue
        }], `change ${entry.parameter.name}`);
        entry.sliderHistoryStart = null;
        showToast(`${entry.parameter.name} changed in NT working memory`);
      }
    }).catch(error => {
      entry.pendingSliderValue = null;
      entry.sliderHistoryStart = null;
      previewLiveParameterEntry(entry, entry.confirmedValue);
      updateParameterBusChip(entry);
      showToast(error.message);
    }).finally(() => {
      entry.sliderWriteRunning = false;
      entry.sliderCommitPending = false;
      if (entry.pendingSliderValue != null) {
        queueLiveSliderWrite(entry, entry.pendingSliderValue);
        return;
      }
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
    });
    state.parameterWriteQueue = operation;
  }

  function stopLivePolling() {
    clearTimeout(state.pollTimer);
    state.pollTimer = null;
    state.pollToken += 1;
    return state.pollInFlight;
  }

  function stopCpuPolling() {
    clearTimeout(state.cpuTimer);
    state.cpuTimer = null;
  }

  function startCpuPolling() {
    stopCpuPolling();
    const cpuLabel = $("#editor-cpu-usage");
    const poll = async () => {
      if (!state.ntTransport || !state.transportOnline || document.hidden) return;
      if (state.pollInFlight || state.routingReadPromise || state.performanceReadPromise) {
        state.cpuTimer = setTimeout(poll, 2000);
        return;
      }
      try {
        const usage = await state.ntTransport.readCpuUsage();
        cpuLabel.textContent = `Audio ${usage.audioThread}% · Overall ${usage.overall}%`;
        cpuLabel.title = `Audio thread ${usage.audioThread}% · Overall CPU ${usage.overall}%`;
        cpuLabel.classList.toggle("high", usage.audioThread >= 85 || usage.overall >= 85);
      } catch (_) {
        // Other live reads have priority on the NT's single-request transport.
      } finally {
        if (state.ntTransport && state.transportOnline) state.cpuTimer = setTimeout(poll, 1000);
      }
    };
    state.cpuTimer = setTimeout(poll, 500);
  }

  function pollingDelay() {
    if (state.syncMode === "fast") return 100;
    if (state.syncMode === "smart") return 250;
    return null;
  }

  function setSyncMode(mode, announce = true) {
    if (!["manual", "smart", "fast"].includes(mode)) return;
    stopLivePolling();
    clearSmartFeedback();
    state.syncMode = mode;
    syncModeControl.value = mode;
    const label = mode === "smart" ? "Slow" : mode[0].toUpperCase() + mode.slice(1);
    const detail = mode === "manual" ? "No automatic NT or MIDI feedback · use Refresh" :
      mode === "fast" ? "Immediate MIDI feedback · 100 ms polling" :
        "MIDI feedback grouped at 250 ms · 250 ms polling";
    if (syncModeLabel) syncModeLabel.textContent = label;
    if (syncModeDetail) syncModeDetail.textContent = detail;
    if (mode !== "manual" && state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
    if (announce) showToast(`${label} sync · ${detail}`);
  }

  function startLivePolling(slotIndex) {
    stopLivePolling();
    state.activeLiveSlotIndex = slotIndex;
    const delay = pollingDelay();
    if (delay == null || !state.ntTransport || !state.transportOnline || document.hidden) return;
    const token = state.pollToken;

    const poll = async () => {
      if (token !== state.pollToken || !state.ntTransport || !state.transportOnline || state.activeLiveSlotIndex !== slotIndex) return;
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
        if (token === state.pollToken && pollingDelay() === delay && state.ntTransport && state.transportOnline && state.activeLiveSlotIndex === slotIndex) {
          state.pollTimer = setTimeout(poll, delay);
        }
      }
    };

    state.pollTimer = setTimeout(poll, delay);
  }

  function routingBusLabel(index, snapshot) {
    if (!snapshot || !Number.isInteger(Number(index))) return "Unknown bus";
    index = Number(index);
    if (index < 0) return "None";
    if (index < snapshot.inputBusCount) return `${index + 1}`;
    const outputIndex = index - snapshot.inputBusCount;
    if (outputIndex < snapshot.outputBusCount) return `${outputIndex + 1}`;
    return `A${outputIndex - snapshot.outputBusCount + 1}`;
  }

  function routingBusKind(index, snapshot) {
    if (index < snapshot.inputBusCount) return "input";
    if (index < snapshot.inputBusCount + snapshot.outputBusCount) return "output";
    return "aux";
  }

  function routingBusContextLabel(index, snapshot = state.routingSnapshot || state.liveIdentity) {
    if (index < 0) return "None";
    const label = routingBusLabel(index, snapshot);
    const kind = routingBusKind(index, snapshot);
    if (kind === "input") return `Input ${label}`;
    if (kind === "output") return `Output ${label}`;
    return `Aux ${label}`;
  }

  function routingAuxColour(bus, snapshot) {
    const auxIndex = bus - snapshot.inputBusCount - snapshot.outputBusCount;
    return `hsl(${Math.round((auxIndex * 360) / snapshot.auxBusCount)} 78% 48%)`;
  }

  function applyPilotAccentHue(hue) {
    state.pilotAccentHue = hue;
    const pilot = `hsl(${hue} 78% 48%)`;
    const deep = state.darkMode
      ? `hsl(${hue} 72% 72%)`
      : `hsl(${hue} 65% 31%)`;
    const soft = state.darkMode
      ? `hsl(${hue} 34% 20%)`
      : `hsl(${hue} 48% 92%)`;
    [document.documentElement, document.body, deviceFrame].forEach(element => {
      element.style.setProperty("--pilot", pilot);
      element.style.setProperty("--pilot-deep", deep);
      element.style.setProperty("--pilot-soft", soft);
    });
    document.documentElement.style.setProperty("--mint-deep", `hsl(${hue} 65% 31%)`);
  }

  function applyPilotAccentFromAux(bus, identity = state.routingSnapshot || state.liveIdentity) {
    if (!identity || !Number.isInteger(Number(bus)) || routingBusKind(Number(bus), identity) !== "aux") return;
    bus = Number(bus);
    const auxIndex = bus - identity.inputBusCount - identity.outputBusCount;
    applyPilotAccentHue(Math.round((auxIndex * 360) / identity.auxBusCount));
  }

  function editorBusDescriptor(value, identity = state.liveIdentity) {
    const rawValue = Number(value);
    if (!identity || rawValue === 0) return { label: "None", kind: "none", bus: -1 };
    const bus = rawValue - 1;
    const total = identity.inputBusCount + identity.outputBusCount + identity.auxBusCount;
    if (!Number.isInteger(bus) || bus < 0 || bus >= total) return { label: String(rawValue), kind: "none", bus: -1 };
    return { label: routingBusLabel(bus, identity), kind: routingBusKind(bus, identity), bus };
  }

  function applyEditorBusChipAppearance(chip, value) {
    if (!chip) return;
    const descriptor = editorBusDescriptor(value);
    chip.classList.remove("input", "output", "aux", "none");
    chip.classList.add(descriptor.kind);
    chip.textContent = descriptor.label;
    chip.title = descriptor.kind === "none" ? "No bus assigned" : `Assigned to ${descriptor.label}`;
    chip.style.removeProperty("--bus-colour");
    if (descriptor.kind === "aux") chip.style.setProperty("--bus-colour", routingAuxColour(descriptor.bus, state.liveIdentity));
  }

  function updateParameterBusChip(entry) {
    if (!entry?.busChip) return;
    applyEditorBusChipAppearance(entry.busChip, entry.parameter.value);
    applyParameterBusColour(entry, entry.parameter.value);
    entry.busChip.setAttribute("aria-label", `${entry.parameter.name}: ${entry.busChip.textContent}. Choose bus assignment.`);
  }

  function applyParameterBusColour(entry, value) {
    if (!entry?.busChip || !entry.row) return;
    const descriptor = editorBusDescriptor(value);
    const colour = descriptor.kind === "input"
      ? "#438ee8"
      : descriptor.kind === "output"
        ? "#df4b4b"
        : descriptor.kind === "aux"
          ? routingAuxColour(descriptor.bus, state.liveIdentity)
          : "#a8b5bc";
    entry.row.style.setProperty("--parameter-tint", `color-mix(in srgb, ${colour} 4%, transparent)`);
    entry.row.style.setProperty("--parameter-tint-hover", `color-mix(in srgb, ${colour} 9%, transparent)`);
    entry.row.style.setProperty("--parameter-accent", `color-mix(in srgb, ${colour} 62%, transparent)`);
    entry.row.style.setProperty("--slider-colour", colour);
  }

  function defaultParameterColour(target, parameter = null) {
    const colour = parameter?.mapping?.cv?.enabled ? "#c69300" : "#57b8ae";
    target.style.setProperty("--parameter-tint", `color-mix(in srgb, ${colour} 4%, transparent)`);
    target.style.setProperty("--parameter-tint-hover", `color-mix(in srgb, ${colour} 9%, transparent)`);
    target.style.setProperty("--parameter-accent", `color-mix(in srgb, ${colour} 62%, transparent)`);
    target.style.setProperty("--slider-colour", colour);
  }

  function refreshEditorBusDockState() {
    const entry = state.armedBusEntry;
    editorBusDock.classList.toggle("armed", Boolean(entry));
    $$(".editor-bus-chip[data-value]", editorBusDock).forEach(chip => {
      const value = Number(chip.dataset.value);
      const valid = !entry || (value >= entry.parameter.min && value <= entry.parameter.max);
      chip.disabled = !valid || Boolean(entry?.writePending);
      chip.classList.toggle("current", Boolean(entry) && value === Number(entry.parameter.value));
      chip.setAttribute("aria-pressed", String(Boolean(entry) && value === Number(entry.parameter.value)));
    });
  }

  function disarmEditorBusAssignment() {
    if (state.armedBusEntry?.busChip) {
      state.armedBusEntry.busChip.classList.remove("armed");
      state.armedBusEntry.busChip.setAttribute("aria-pressed", "false");
    }
    state.armedBusEntry = null;
    refreshEditorBusDockState();
  }

  function armEditorBusAssignment(entry) {
    if (state.armedBusEntry === entry) {
      disarmEditorBusAssignment();
      showToast("Bus assignment cancelled");
      return;
    }
    disarmEditorBusAssignment();
    state.armedBusEntry = entry;
    entry.busChip.classList.add("armed");
    entry.busChip.setAttribute("aria-pressed", "true");
    refreshEditorBusDockState();
    showToast(`Choose an input, output, aux bus, or None for ${entry.parameter.name}`);
  }

  function createEditorDockBusChip(value, label, kind, bus = -1, accessibleLabel = label) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `editor-bus-chip ${kind}`;
    chip.dataset.value = String(value);
    chip.textContent = label;
    chip.title = `Assign ${accessibleLabel}`;
    chip.setAttribute("aria-label", `Assign ${accessibleLabel}`);
    chip.setAttribute("aria-pressed", "false");
    if (kind === "aux") chip.style.setProperty("--bus-colour", routingAuxColour(bus, state.liveIdentity));
    return chip;
  }

  function updateEditorBusDockVisibility() {
    editorBusDock.classList.toggle("hidden", !state.transportOnline || !state.liveIdentity || state.view !== "editor");
    updateBottomBusDockHeight();
  }

  function updateBottomBusDockHeight() {
    requestAnimationFrame(() => {
      const activeDock = !editorBusDock.classList.contains("hidden")
        ? editorBusDock
        : !routingAuxPalette.classList.contains("hidden") && routingAuxPalette.parentElement === deviceFrame
          ? routingAuxPalette
          : null;
      const height = deviceFrame.classList.contains("bus-dock-bottom") && activeDock
        ? Math.ceil(activeDock.getBoundingClientRect().height)
        : 0;
      deviceFrame.style.setProperty("--bottom-bus-dock-height", `${height}px`);
    });
  }

  function updateRoutingPaletteVisibility() {
    if (state.ipadMode) routingAuxPalette.classList.toggle("hidden", state.view !== "routing");
    else routingAuxPalette.classList.remove("hidden");
    updateBottomBusDockHeight();
  }

  function applyBusDockLayout() {
    const bottom = state.ipadMode;
    if (bottom && editorBusDock.parentElement !== deviceFrame) deviceFrame.appendChild(editorBusDock);
    if (!bottom && editorBusDock.parentElement !== appMain) appMain.insertBefore(editorBusDock, viewStack);
    if (bottom && routingAuxPalette.parentElement !== deviceFrame) deviceFrame.appendChild(routingAuxPalette);
    if (!bottom && routingAuxPalette.parentElement !== routingViewport.parentElement) routingViewport.parentElement.insertBefore(routingAuxPalette, routingViewport);
    deviceFrame.classList.toggle("bus-dock-bottom", bottom);
    deviceFrame.classList.toggle("ipad-mode", bottom);
    if (bottom) {
      primaryNav.insertAdjacentElement("afterend", statusSyncControl);
    } else {
      statusSyncAnchor.parentNode.insertBefore(statusSyncControl, statusSyncAnchor.nextSibling);
    }
    if (state.liveIdentity) renderEditorBusDock(state.liveIdentity);
    if (state.liveRouting) renderAuxPalette(state.liveRouting);
    updateRoutingPaletteVisibility();
    updateBottomBusDockHeight();
  }

  function setIpadMode(enabled, { save = true } = {}) {
    state.ipadMode = Boolean(enabled);
    ipadModeControl.checked = state.ipadMode;
    if (save) {
      try {
        localStorage.setItem("ntPilotIpadMode", state.ipadMode ? "true" : "false");
      } catch (_) {
        // iPad mode remains active for this session.
      }
    }
    setInterfaceScale(state.interfaceScale, { save: false });
    applyBusDockLayout();
  }

  function setDarkMode(enabled, { save = true } = {}) {
    state.darkMode = Boolean(enabled);
    darkModeControl.checked = state.darkMode;
    deviceFrame.classList.toggle("dark-mode", state.darkMode);
    document.body.classList.toggle("dark-mode", state.darkMode);
    document.documentElement.style.colorScheme = state.darkMode ? "dark" : "light";
    applyPilotAccentHue(state.pilotAccentHue);
    if (save) {
      try {
        localStorage.setItem("ntPilotDarkMode", state.darkMode ? "true" : "false");
      } catch (_) {
        // Dark mode remains active for this session.
      }
    }
  }

  function renderEditorBusDock(identity) {
    const firstOutput = identity.inputBusCount;
    const firstAux = identity.inputBusCount + identity.outputBusCount;
    const inputs = Array.from({ length: identity.inputBusCount }, (_, index) =>
      createEditorDockBusChip(index + 1, String(index + 1), "input", index, `Input ${index + 1}`));
    const outputs = Array.from({ length: identity.outputBusCount }, (_, index) => {
      const bus = firstOutput + index;
      return createEditorDockBusChip(bus + 1, String(index + 1), "output", bus, `Output ${index + 1}`);
    });
    const auxes = Array.from({ length: identity.auxBusCount }, (_, index) => {
      const bus = firstAux + index;
      return createEditorDockBusChip(bus + 1, `A${index + 1}`, "aux", bus);
    });
    editorInputBusRow.replaceChildren(...inputs);
    const nativeOutputs = outputs.slice(0, 8);
    const expansionOutputs = outputs.slice(8);
    const actualBankCount = Math.ceil(expansionOutputs.length / 8);
    const totalBankCount = Math.max(1, actualBankCount + (expansionOutputs.length > 0 && expansionOutputs.length % 8 === 0 ? 1 : 0));
    const makeExpanderBank = bankIndex => {
      const actual = expansionOutputs.slice(bankIndex * 8, (bankIndex + 1) * 8);
      const chips = [...actual];
      actual.forEach((chip, index) => {
        chip.classList.add("ntx-output");
        chip.removeAttribute("title");
        chip.dataset.expanderHelp = `NTX-8CV ${bankIndex + 1}, output ${index + 1}. Each module adds 8 outputs: NTX 1 is 9–16, NTX 2 is 17–24, and so on. Banks stay on the current row until full, then wrap. Maximum: 8 modules, 64 extra outputs.`;
      });
      for (let index = actual.length; index < 8; index += 1) {
        const outputNumber = 9 + bankIndex * 8 + index;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "editor-bus-chip output ntx-placeholder";
        chip.textContent = String(outputNumber);
        chip.dataset.expanderHelp = `NTX-8CV ${bankIndex + 1} preview, output ${index + 1}. Each module adds 8 outputs: NTX 1 is 9–16, NTX 2 is 17–24, and so on. Banks stay on the current row until full, then wrap. Maximum: 8 modules, 64 extra outputs.`;
        chip.setAttribute("aria-label", `NTX-8CV placeholder · Output ${outputNumber}`);
        chip.setAttribute("aria-disabled", "true");
        chip.tabIndex = -1;
        chips.push(chip);
      }
      return chips;
    };
    const firstExpanderBank = makeExpanderBank(0);
    const visibleFirstExpanderBank = state.ipadMode ? [] : firstExpanderBank;
    editorOutputBusRow.replaceChildren(...nativeOutputs, ...visibleFirstExpanderBank);
    editorAuxBusRow.replaceChildren(...auxes);
    const firstRowOutputs = [...nativeOutputs, ...visibleFirstExpanderBank];
    const gridColumns = state.ipadMode
      ? 22
      : Math.max(1, identity.auxBusCount, identity.inputBusCount + firstRowOutputs.length + 11);
    editorAuxBusRow.style.setProperty("--bus-grid-columns", String(gridColumns));
    const physicalStrip = $(".editor-physical-bus-strip");
    physicalStrip.style.setProperty("--bus-grid-columns", String(gridColumns));
    const inputLabel = $(".editor-bus-group-label.input", physicalStrip);
    const outputLabel = $(".editor-bus-group-label.output", physicalStrip);
    const none = $(".editor-bus-none", physicalStrip);
    if (state.ipadMode) {
      inputs.forEach((chip, index) => {
        chip.style.gridColumn = String(index + 1);
        chip.style.gridRow = "1";
      });
      inputLabel.style.gridColumn = "1 / span 12";
      inputLabel.style.gridRow = "1";
      none.style.gridColumn = "13 / span 2";
      none.style.gridRow = "1";
      firstRowOutputs.forEach((chip, index) => {
        chip.style.gridColumn = String(15 + index);
        chip.style.gridRow = "1";
      });
      outputLabel.style.gridColumn = "15 / span 8";
      outputLabel.style.gridRow = "1";
    } else {
      inputLabel.style.gridColumn = `${identity.inputBusCount + 1} / span 3`;
      const outputStart = identity.inputBusCount + 4;
      inputs.forEach((chip, index) => {
        chip.style.gridColumn = String(index + 1);
        chip.style.gridRow = "1";
      });
      firstRowOutputs.forEach((chip, index) => {
        chip.style.gridColumn = String(outputStart + index);
        chip.style.gridRow = "1";
      });
      inputLabel.style.gridRow = "1";
      outputLabel.style.gridRow = "1";
      none.style.gridRow = "1";
      outputLabel.style.gridColumn = `${outputStart + firstRowOutputs.length} / span 3`;
      none.style.gridColumn = `${outputStart + firstRowOutputs.length + 3} / span 5`;
    }

    const extraBankIndices = state.ipadMode
      ? Array.from({ length: actualBankCount }, (_, index) => index)
      : Array.from({ length: Math.max(0, totalBankCount - 1) }, (_, index) => index + 1);
    const rows = extraBankIndices.map(bankIndex => {
      const row = document.createElement("div");
      row.className = "editor-expander-row";
      row.style.setProperty("--bus-grid-columns", String(gridColumns));
      const label = document.createElement("span");
      label.className = "editor-expander-label";
      label.textContent = `NTX ${bankIndex + 1}`;
      label.style.gridColumn = "1 / span 3";
      const chips = makeExpanderBank(bankIndex).filter(chip => !state.ipadMode || !chip.classList.contains("ntx-placeholder"));
      chips.forEach((chip, index) => {
        chip.style.gridColumn = String(index + 4);
        chip.style.gridRow = "1";
      });
      row.append(label, ...chips);
      if (state.ipadMode && !chips.length) row.classList.add("hidden");
      return row;
    });
    editorExpanderRows.replaceChildren(...rows);
    updateEditorBusDockVisibility();
    disarmEditorBusAssignment();
  }

  function renderAuxPalette(snapshot) {
    const used = new Set(snapshot.slots.flatMap(slot => (slot.ioParameters || []).map(parameter => Number(parameter.value) - 1)));
    const firstAux = snapshot.inputBusCount + snapshot.outputBusCount;
    const fragment = document.createDocumentFragment();
    if (!state.ipadMode) {
      const none = document.createElement("button");
      none.type = "button";
      none.className = "routing-aux-chip none";
      none.dataset.bus = "-1";
      none.textContent = "None";
      fragment.appendChild(none);
    }
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
    if (state.ipadMode) {
      for (let index = 0; index < snapshot.inputBusCount; index += 1) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "routing-aux-chip physical input";
        chip.dataset.bus = String(index);
        chip.textContent = String(index + 1);
        fragment.appendChild(chip);
      }
      const none = document.createElement("button");
      none.type = "button";
      none.className = "routing-aux-chip none physical";
      none.dataset.bus = "-1";
      none.textContent = "None";
      fragment.appendChild(none);
      for (let index = 0; index < snapshot.outputBusCount; index += 1) {
        const bus = snapshot.inputBusCount + index;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "routing-aux-chip physical output";
        chip.dataset.bus = String(bus);
        chip.textContent = String(index + 1);
        fragment.appendChild(chip);
      }
    }
    routingAuxPalette.replaceChildren(fragment);
    updateBottomBusDockHeight();
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
      directInputs,
      inputs: [...new Set([...directInputs, ...implicitInputs])].sort((a, b) => a - b),
      mappings: routingMaskIndices(routing.mappingInputMask, total),
      outputs,
      replaces
    };
  }

  function unprefixedParameterName(name) {
    return String(name || "").replace(/^\d+:/, "").trim();
  }

  function decorateDerivedInputPorts(ports, slot, snapshot) {
    const explicit = ports.filter(port => !port.implicit);
    const implicit = ports.filter(port => port.implicit);
    const claimed = new Set();

    explicit.forEach(parent => {
      const match = unprefixedParameterName(parent.name).match(/^Gate input (\d+)$/i);
      if (!match || parent.bus < 0) return;
      const gateNumber = Number(match[1]);
      const countParameter = (slot.parameters || []).find(parameter =>
        unprefixedParameterName(parameter.name).toLowerCase() === `gate ${gateNumber} cv count`
      );
      if (!countParameter) return;
      const count = Math.max(0, Number(countParameter.value) || 0);
      parent.derivedCount = {
        label: "Pitch CVs",
        parameterIndex: countParameter.index,
        value: count,
        minimum: Number(countParameter.min),
        maximum: Math.min(
          Number(countParameter.max),
          snapshot.inputBusCount + snapshot.outputBusCount + snapshot.auxBusCount - parent.bus - 1
        )
      };
      implicit.forEach(port => {
        const offset = port.bus - parent.bus;
        if (offset < 1 || offset > count || claimed.has(port.key)) return;
        claimed.add(port.key);
        port.derivedFrom = parent.key;
        port.derivedOrder = offset;
        port.name = `Pitch CV ${offset}`;
        port.title = `Assigned automatically after ${parent.name}`;
      });
    });

    implicit.filter(port => !claimed.has(port.key)).forEach(port => {
      port.name = "Also uses";
      port.title = "Assigned automatically by this algorithm";
    });

    const ordered = [];
    explicit.forEach(parent => {
      ordered.push(parent);
      implicit.filter(port => port.derivedFrom === parent.key)
        .sort((first, second) => first.derivedOrder - second.derivedOrder)
        .forEach(port => ordered.push(port));
    });
    implicit.filter(port => !claimed.has(port.key)).forEach(port => ordered.push(port));
    return ordered;
  }

  function slotGuid(slot) {
    return String.fromCharCode(...(slot.guid || [])).replace(/\0/g, "").toLowerCase();
  }

  function setBypassToggleContent(control, bypassed) {
    control.dataset.bypassed = String(bypassed);
    control.setAttribute("aria-checked", String(bypassed));
    control.setAttribute("aria-label", bypassed ? "Enable algorithm" : "Bypass algorithm");
    control.title = bypassed ? "Enable algorithm" : "Bypass algorithm";
    control.innerHTML = bypassed
      ? 'Enable <i class="bypass-zzz" aria-hidden="true"><b>Z</b><b>z</b><b>z</b></i>'
      : "Bypass";
  }

  function makeBypassToggle(className, slotIndex, bypassed) {
    const control = document.createElement("span");
    control.className = className;
    control.dataset.bypassSlot = String(slotIndex);
    control.tabIndex = 0;
    control.setAttribute("role", "switch");
    setBypassToggleContent(control, bypassed);
    return control;
  }

  function makeRoutingNode(definition) {
    const node = document.createElement(definition.slotIndex == null ? "div" : "button");
    node.className = `routing-node ${definition.kind}`;
    if (definition.sideLane) node.classList.add("side-slot", definition.sideLane);
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
    node.classList.toggle("bypassed", Boolean(definition.bypassed));
    const head = document.createElement("div");
    head.className = "routing-node-head";
    const number = document.createElement("span");
    number.className = "routing-slot-number";
    number.textContent = String(definition.slotIndex + 1);
    const title = document.createElement("span");
    title.className = "routing-node-title";
    const name = document.createElement("strong");
    const algorithmName = userFacingText(definition.algorithmName, definition.isPlugin ? "Plug-in" : "Algorithm");
    const instanceName = userFacingText(definition.name, algorithmName);
    name.textContent = instanceName;
    name.title = instanceName;
    const algorithm = document.createElement("small");
    algorithm.className = "routing-algorithm-name";
    algorithm.title = algorithmName;
    const algorithmKind = document.createElement("b");
    algorithmKind.textContent = definition.isPlugin ? "PLUG-IN" : "ALGO";
    const algorithmText = document.createElement("span");
    algorithmText.textContent = algorithmName;
    algorithm.append(algorithmKind, algorithmText);
    title.append(name, algorithm);
    head.append(number, title);
    head.appendChild(makeBypassToggle("routing-bypass-toggle", definition.slotIndex, definition.bypassed));
    const body = document.createElement("div");
    body.className = "routing-node-ports";
    const addColumn = (side, ports) => {
      if (definition.sideLane && !ports.length) return;
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
        row.dataset.minimum = String(port.minimum ?? 0);
        row.dataset.maximum = String(port.maximum ?? 0);
        row.classList.toggle("implicit", Boolean(port.implicit));
        row.classList.toggle("derived", Boolean(port.derivedFrom));
        row.classList.toggle("partial", Boolean(port.partial));
        if (port.kind === "aux") row.style.setProperty("--aux-colour", routingAuxColour(port.bus, state.routingSnapshot));
        row.title = userFacingText(port.title, `${userFacingText(port.name, side === "input" ? "Input" : "Output")} · ${userFacingText(port.busLabel, "None")}`);
        const dot = document.createElement("i");
        const label = document.createElement("span");
        label.textContent = userFacingText(port.name, side === "input" ? "Input" : "Output");
        const bus = document.createElement("b");
        bus.className = `routing-bus-badge ${port.kind}`;
        const busLabel = userFacingText(port.busLabel, "None");
        bus.textContent = side === "output" && port.kind === "input" ? `${busLabel} downstream` : busLabel;
        if (port.kind === "aux") bus.style.setProperty("--aux-colour", routingAuxColour(port.bus, state.routingSnapshot));
        const derivedCount = port.derivedCount ? document.createElement("span") : null;
        if (derivedCount) {
          derivedCount.className = "routing-derived-count";
          derivedCount.setAttribute("aria-label", `${port.derivedCount.label}: ${port.derivedCount.value}`);
          const decrease = document.createElement("span");
          decrease.tabIndex = 0;
          decrease.setAttribute("role", "button");
          decrease.textContent = "−";
          decrease.title = `Use fewer ${port.derivedCount.label.toLowerCase()}`;
          const value = document.createElement("strong");
          value.textContent = `${port.derivedCount.label} ×${port.derivedCount.value}`;
          const increase = document.createElement("span");
          increase.tabIndex = 0;
          increase.setAttribute("role", "button");
          increase.textContent = "+";
          increase.title = `Use more ${port.derivedCount.label.toLowerCase()}`;
          [decrease, increase].forEach((button, index) => {
            button.className = "routing-derived-count-step";
            button.dataset.slotIndex = String(definition.slotIndex);
            button.dataset.parameterIndex = String(port.derivedCount.parameterIndex);
            button.dataset.value = String(port.derivedCount.value);
            button.dataset.minimum = String(port.derivedCount.minimum);
            button.dataset.maximum = String(port.derivedCount.maximum);
            button.dataset.delta = index === 0 ? "-1" : "1";
          });
          decrease.classList.toggle("disabled", port.derivedCount.value <= port.derivedCount.minimum);
          increase.classList.toggle("disabled", port.derivedCount.value >= port.derivedCount.maximum);
          decrease.setAttribute("aria-disabled", String(port.derivedCount.value <= port.derivedCount.minimum));
          increase.setAttribute("aria-disabled", String(port.derivedCount.value >= port.derivedCount.maximum));
          derivedCount.append(decrease, value, increase);
        }
        if (side === "output") {
          const mode = document.createElement("span");
          const editableMode = port.modeStatus === "editable" && !port.inPlace;
          mode.className = `routing-mode-toggle ${port.inPlace ? "in-place" : port.outputMode} ${port.modeStatus || "fixed"}${editableMode ? "" : " readonly"}`;
          mode.dataset.slotIndex = String(definition.slotIndex);
          mode.dataset.parameterIndex = port.modeParameterIndex == null ? "" : String(port.modeParameterIndex);
          mode.dataset.mode = port.outputMode;
          mode.dataset.modeStatus = port.modeStatus || "fixed";
          if (port.inPlace) mode.textContent = "IN PLACE";
          else if (port.modeStatus === "unknown") mode.textContent = "MODE ?";
          else if (port.modeStatus === "loading") mode.textContent = "MODE…";
          else if (port.modeStatus === "fixed" && !port.outputModeKnown) mode.textContent = "FIXED";
          else if (port.modeStatus === "fixed") mode.textContent = `FIXED ${port.outputMode === "replace" ? "REPLACE" : "ADD"}`;
          else mode.textContent = port.outputMode === "replace" ? "REPLACE" : "ADD";
          if (port.inPlace) mode.title = "This algorithm processes its input bus in place; its Replace behaviour is fixed.";
          else if (port.modeStatus === "unknown") mode.title = "The NT's Add/Replace metadata could not be read. Refresh Routing to retry.";
          else if (port.modeStatus === "loading") mode.title = "Reading Add/Replace controls from the NT…";
          else if (port.modeStatus === "fixed" && !port.outputModeKnown) mode.title = "This algorithm exposes no editable Add/Replace control. Its effective fixed mode is not reported while disconnected.";
          else if (port.modeStatus === "fixed") mode.title = `Fixed ${port.outputMode === "replace" ? "Replace" : "Add"}: this algorithm exposes no editable mode control.`;
          else mode.title = `${port.outputMode === "replace" ? "Replace" : "Add"} mode · click to change`;
          row.append(mode, bus, label, dot);
        } else {
          row.append(...(side === "input" ? [dot, label, bus] : [bus, label, dot]));
          if (derivedCount) row.appendChild(derivedCount);
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

  function makeIpadRoutingCard(definition) {
    const card = makeRoutingNode(definition);
    card.classList.add("routing-ipad-card");
    card.style.removeProperty("left");
    card.style.removeProperty("top");
    card.style.removeProperty("width");
    card.style.removeProperty("height");
    if (definition.mappings.length) {
      const modulation = document.createElement("div");
      modulation.className = "routing-ipad-modulation";
      const label = document.createElement("strong");
      label.textContent = "Modulation";
      const buses = document.createElement("div");
      definition.mappings.forEach(busLabel => {
        const badge = document.createElement("span");
        badge.textContent = busLabel;
        buses.appendChild(badge);
      });
      modulation.append(label, buses);
      card.appendChild(modulation);
    }
    return card;
  }

  function routingModeDetails(selection) {
    if (selection?.side !== "output") return null;
    const control = selection.element.querySelector(".routing-mode-toggle");
    if (!control) return null;
    const parameterIndex = Number(control.dataset.parameterIndex);
    if (!Number.isInteger(parameterIndex) || control.classList.contains("readonly")) return null;
    return {
      control,
      slotIndex: Number(control.dataset.slotIndex),
      parameterIndex,
      currentMode: control.dataset.mode
    };
  }

  async function resolveRoutingModeDetails(selection) {
    const rendered = routingModeDetails(selection);
    if (rendered) return rendered;
    if (state.routingModeHydrationPromise) await state.routingModeHydrationPromise.catch(() => {});
    if (state.routingReadPromise) await state.routingReadPromise.catch(() => {});
    if (selection?.side !== "output" || selection.slotIndex == null || selection.parameterIndex == null) return null;
    const slot = state.routingSnapshot?.slots.find(item => item.index === selection.slotIndex);
    if (!slot) return null;
    const match = Object.entries(slot.outputModeMap || {})
      .find(([, outputs]) => outputs.includes(selection.parameterIndex));
    if (!match) return null;
    const parameterIndex = Number(match[0]);
    const modeParameter = (slot.parameters || []).find(parameter => parameter.index === parameterIndex);
    const livePort = [...$$(".routing-port.output", routingNodes), ...$$(".routing-port.output", routingIpadList)].find(element => Number(element.dataset.slotIndex) === selection.slotIndex
      && Number(element.dataset.parameterIndex) === selection.parameterIndex);
    return {
      control: livePort?.querySelector(".routing-mode-toggle") || livePort || selection.element,
      slotIndex: slot.index,
      parameterIndex,
      currentMode: Number(modeParameter?.value) === 1 ? "replace" : "add"
    };
  }

  function routingOutputModeStatus(selection) {
    if (selection?.side !== "output" || selection.slotIndex == null) return null;
    const slot = state.routingSnapshot?.slots.find(item => item.index === selection.slotIndex);
    return slot?.outputModeStatus || null;
  }

  async function chooseRoutingOutputMode(details, mode) {
    const value = mode === "replace" ? 1 : 0;
    await state.ntTransport.writeParameter(details.slotIndex, details.parameterIndex, value);
    updateRoutingSnapshotParameter(details.slotIndex, details.parameterIndex, value);
  }

  function updateRoutingSnapshotParameter(slotIndex, parameterIndex, value) {
    const liveEntry = state.liveParameters.get(mappingKey(slotIndex, parameterIndex));
    if (liveEntry) updateLiveParameterEntry(liveEntry, value, "midi-feedback");
    const snapshots = [...new Set([state.routingSnapshot, state.liveRouting].filter(Boolean))];
    let routingParameter = null;
    snapshots.forEach(snapshot => {
      const slot = snapshot.slots?.find(item => item.index === slotIndex);
      if (!slot) return;
      [slot.parameters, slot.ioParameters].forEach(parameters => {
        const parameter = parameters?.find(item => item.index === parameterIndex);
        if (parameter) {
          parameter.value = value;
          if (parameters === slot.ioParameters) routingParameter = parameter;
        }
      });
    });
    if (!routingParameter || !state.routingSnapshot) return;
    const bus = Number(value) - 1;
    const kind = bus < 0 ? "disconnected" : routingBusKind(bus, state.routingSnapshot);
    const label = bus < 0 ? "—" : routingBusLabel(bus, state.routingSnapshot);
    $$(`.routing-port[data-slot-index="${slotIndex}"][data-parameter-index="${parameterIndex}"]`).forEach(port => {
      port.dataset.bus = String(bus);
      port.classList.remove("disconnected", "input", "output", "aux", "partial");
      port.classList.add(kind);
      port.style.removeProperty("--aux-colour");
      if (kind === "aux") port.style.setProperty("--aux-colour", routingAuxColour(bus, state.routingSnapshot));
      const badge = $(".routing-bus-badge", port);
      if (badge) {
        badge.className = `routing-bus-badge ${kind}`;
        badge.textContent = port.dataset.routingSide === "output" && kind === "input" ? `${label} downstream` : label;
        badge.style.removeProperty("--aux-colour");
        if (kind === "aux") badge.style.setProperty("--aux-colour", routingAuxColour(bus, state.routingSnapshot));
      }
    });
  }

  function scheduleRoutingReconciliation(delay = 900) {
    clearTimeout(state.routingReconcileTimer);
    state.routingReconcileTimer = setTimeout(() => {
      state.routingReconcileTimer = null;
      if (!state.ntTransport || !state.liveIdentity) return;
      if (state.routingReadPromise) {
        scheduleRoutingReconciliation(500);
        return;
      }
      loadLiveRouting({ preserveView: true, background: true });
    }, delay);
  }

  let routingConnectionAction = null;
  let routingConnectionRetarget = null;

  function closeRoutingConnectionPanel() {
    routingConnectionAction = null;
    routingConnectionRetarget = null;
    routingConnectionPanel.classList.add("hidden");
  }

  function positionRoutingConnectionPanel(anchorElement = null) {
    const panelRect = routingConnectionPanel.getBoundingClientRect();
    if (state.ipadMode) {
      const anchorRect = anchorElement?.getBoundingClientRect();
      const anchorX = anchorRect ? anchorRect.left + anchorRect.width / 2 : window.innerWidth / 2;
      const anchorY = anchorRect ? anchorRect.top : window.innerHeight / 2;
      const left = Math.min(window.innerWidth - panelRect.width - 12, Math.max(12, anchorX - panelRect.width / 2));
      const top = anchorY - panelRect.height - 12 >= 12
        ? anchorY - panelRect.height - 12
        : Math.min(window.innerHeight - panelRect.height - 12, (anchorRect?.bottom ?? anchorY) + 12);
      routingConnectionPanel.style.right = "auto";
      routingConnectionPanel.style.bottom = "auto";
      routingConnectionPanel.style.left = `${left}px`;
      routingConnectionPanel.style.top = `${Math.max(12, top)}px`;
      return;
    }
    routingConnectionPanel.style.right = "auto";
    routingConnectionPanel.style.bottom = "auto";
    const pointer = state.lastRoutingPointer;
    const preferredLeft = pointer
      ? (pointer.x + panelRect.width + 22 <= window.innerWidth ? pointer.x + 12 : pointer.x - panelRect.width - 12)
      : (window.innerWidth - panelRect.width) / 2;
    const preferredTop = pointer
      ? (pointer.y + panelRect.height + 22 <= window.innerHeight ? pointer.y + 12 : pointer.y - panelRect.height - 12)
      : (window.innerHeight - panelRect.height) / 2;
    routingConnectionPanel.style.left = `${Math.min(window.innerWidth - panelRect.width - 10, Math.max(10, preferredLeft))}px`;
    routingConnectionPanel.style.top = `${Math.min(window.innerHeight - panelRect.height - 10, Math.max(10, preferredTop))}px`;
  }

  function routingSelectionLabel(selection) {
    const routingIdentity = state.routingSnapshot || state.liveIdentity;
    if (selection.parameterIndex == null) return routingBusLabel(selection.bus, routingIdentity);
    if (selection.label) return selection.label;
    const slot = state.routingSnapshot?.slots.find(item => item.index === selection.slotIndex);
    const parameter = slot?.parameters?.find(item => item.index === selection.parameterIndex);
    return `${slot?.name || `Slot ${selection.slotIndex + 1}`} · ${parameter?.name || `Parameter ${selection.parameterIndex + 1}`}`;
  }

  async function openRoutingConnectionPanel({ source, destination, output, destinationBus, onApply, onRetarget = null, title = "New connection", submitLabel = "Connect", allowRouteChanges = true }) {
    applyPilotAccentFromAux(destinationBus, state.routingSnapshot || state.liveIdentity);
    routingConnectionPanel.classList.toggle("ipad-panel", state.ipadMode);
    const isInputAssignment = !output && source?.side === "input";
    const details = output?.parameterIndex != null ? routingModeDetails(output) : null;
    const existing = allowRouteChanges && output?.parameterIndex != null && destinationBus >= 0
      ? existingWritableOutputRoutes(destinationBus, output)
      : [];
    routingConnectionTitle.textContent = isInputAssignment ? "Change input source" : title;
    routingConnectionPath.textContent = isInputAssignment
      ? `${routingSelectionLabel(source)} · ${routingBusContextLabel(source.bus)} → ${routingBusContextLabel(destinationBus)}`
      : `${routingSelectionLabel(source)} → ${routingSelectionLabel(destination)}`;
    $("#routing-connection-apply").disabled = false;
    $("#routing-connection-apply").textContent = isInputAssignment ? "Change source" : submitLabel;
    const modeControls = $$('input[name="routing-output-mode"]', routingConnectionPanel);
    const renderedMode = output?.element?.querySelector(".routing-mode-toggle")?.dataset.mode || "add";
    const currentMode = details?.currentMode || renderedMode;
    const modeStatus = routingOutputModeStatus(output);
    routingConnectionNote.classList.toggle("hidden", !isInputAssignment);
    routingConnectionNote.textContent = isInputAssignment
      ? "Changes only this input. Other routes remain connected."
      : "";
    routingOutputModeField.classList.toggle("hidden", !output);
    modeControls.forEach(control => {
      control.checked = control.value === currentMode;
      control.disabled = !details;
    });
    routingOutputModeField.classList.toggle("fixed", !details);
    routingOutputModeHelp.textContent = details
      ? "Add combines this output with the bus. Replace replaces the bus at this algorithm's position; algorithms below can still write afterward."
      : modeStatus === "error"
        ? "The NT's Add/Replace metadata could not be read. The connection can still be made, but its mode cannot be changed here."
        : `This algorithm reports a fixed ${currentMode === "replace" ? "Replace" : "Add"} mode, so NT Pilot cannot change it.`;
    const routeControls = $$('input[name="routing-existing-routes"]', routingConnectionPanel);
    routeControls.forEach(control => {
      control.checked = control.value === "keep";
      control.disabled = existing.length === 0;
    });
    routingExistingRoutesField.classList.toggle("hidden", !allowRouteChanges);
    routingExistingRoutesField.classList.toggle("empty", existing.length === 0);
    routingExistingRoutesHelp.textContent = existing.length
      ? `${routingBusLabel(destinationBus, state.routingSnapshot)} has ${existing.length} other editable connection${existing.length === 1 ? "" : "s"}. Disconnecting them sets those output assignments to None.`
      : "No other editable routes use this destination.";
    routingConnectionAction = () => {
      const selectedMode = $('input[name="routing-output-mode"]:checked', routingConnectionPanel)?.value || currentMode;
      const routeChoice = $('input[name="routing-existing-routes"]:checked', routingConnectionPanel)?.value || "keep";
      return onApply(details ? { details, mode: selectedMode } : null, routeChoice === "disconnect" ? existing : []);
    };
    routingConnectionRetarget = onRetarget;
    routingConnectionPanel.classList.remove("hidden");
    positionRoutingConnectionPanel(destination.element);
  }

  function routingPath(edge, nodes) {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    const fromLeft = edge.fromPort?.side === "input" || from.side === "sink";
    const toRight = edge.toPort?.side === "output" || to.side === "source";
    const sx = fromLeft ? from.x : from.x + from.width;
    const sy = edge.fromPort ? from.y + edge.fromPort.y : from.y + (from.height / 2);
    const tx = toRight ? to.x + to.width : to.x;
    const ty = edge.toPort ? to.y + edge.toPort.y : to.y + (to.height / 2);
    const endpointStub = Math.min(50, Math.max(24, Math.abs(tx - sx) * .22));
    const startDirection = fromLeft ? -1 : 1;
    const endDirection = toRight ? 1 : -1;
    const startBend = { x: sx + endpointStub * startDirection, y: sy };
    const endBend = { x: tx + endpointStub * endDirection, y: ty };
    const diagonalLength = Math.hypot(endBend.x - startBend.x, endBend.y - startBend.y);
    const corner = Math.min(14, endpointStub * .38, diagonalLength * .22);
    const dx = diagonalLength ? (endBend.x - startBend.x) / diagonalLength : 1;
    const dy = diagonalLength ? (endBend.y - startBend.y) / diagonalLength : 0;
    const startLineEnd = { x: startBend.x - corner * startDirection, y: startBend.y };
    const startDiagonal = { x: startBend.x + dx * corner, y: startBend.y + dy * corner };
    const endDiagonal = { x: endBend.x - dx * corner, y: endBend.y - dy * corner };
    const endLineStart = { x: endBend.x - corner * endDirection, y: endBend.y };
    return `M ${sx} ${sy} L ${startLineEnd.x} ${startLineEnd.y} Q ${startBend.x} ${startBend.y}, ${startDiagonal.x} ${startDiagonal.y} L ${endDiagonal.x} ${endDiagonal.y} Q ${endBend.x} ${endBend.y}, ${endLineStart.x} ${endLineStart.y} L ${tx} ${ty}`;
  }

  function renderRoutingGraph(snapshot, { live = false, preserveView = false } = {}) {
    const previousView = preserveView
      ? { left: routingViewport.scrollLeft, top: routingViewport.scrollTop, zoom: state.routingZoom }
      : null;
    const previousSelection = preserveView && state.routingSelection
      ? {
          side: state.routingSelection.side,
          bus: state.routingSelection.bus,
          slotIndex: state.routingSelection.slotIndex,
          parameterIndex: state.routingSelection.parameterIndex,
          minimum: state.routingSelection.minimum,
          maximum: state.routingSelection.maximum
        }
      : null;
    const previousBusSelection = preserveView ? state.routingBusSelection : null;
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
        const port = { key: `${side}:${slot.index}:${parameter.index ?? ordinal}`, side, parameterIndex: parameter.index, name: parameter.name || `${side === "input" ? "Input" : "Output"} ${ordinal + 1}`, bus, busLabel: bus < 0 ? "—" : routingBusLabel(bus, snapshot), kind: bus < 0 ? "disconnected" : routingBusKind(bus, snapshot), minimum: Number(parameter.min), maximum: Number(parameter.max), implicit: false };
        if (side === "output") {
          const modeEntry = Object.entries(slot.outputModeMap || {}).find(([, outputs]) => outputs.includes(parameter.index));
          const modeParameterIndex = modeEntry == null ? null : Number(modeEntry[0]);
          const modeParameter = (slot.parameters || []).find(item => item.index === modeParameterIndex);
          if (modeParameter) {
            port.modeParameterIndex = modeParameterIndex;
            port.outputMode = Number(modeParameter.value) === 1 ? "replace" : "add";
            port.modeStatus = "editable";
            port.outputModeKnown = true;
          } else {
            port.outputMode = bus >= 0 && masks.replaces.includes(bus) ? "replace" : "add";
            port.outputModeKnown = bus >= 0;
            port.modeStatus = slot.outputModeStatus === "error"
              ? "unknown"
              : ["pending", "loading"].includes(slot.outputModeStatus) ? "loading" : "fixed";
          }
          if (["quan", "cali"].includes(slotGuid(slot))) {
            port.outputMode = "replace";
            port.outputModeKnown = true;
            port.modeStatus = "fixed";
          }
        }
        return port;
      };
      let inputPorts = io.filter(parameter => parameter.ioFlags & 0x01).map((parameter, index) => makePort(parameter, "input", index));
      let outputPorts = io.filter(parameter => parameter.ioFlags & 0x02).map((parameter, index) => makePort(parameter, "output", index));
      if (["attn", "absv", "vcam", "enfo", "slew", "debo", "eqpa"].includes(slotGuid(slot))) {
        outputPorts.forEach((port, index) => {
          if (port.bus >= 0 || inputPorts[index]?.bus == null || inputPorts[index].bus < 0) return;
          port.bus = inputPorts[index].bus;
          port.busLabel = routingBusLabel(port.bus, snapshot);
          port.kind = routingBusKind(port.bus, snapshot);
          port.outputMode = "replace";
          port.outputModeKnown = true;
          port.modeStatus = "fixed";
          port.inPlace = true;
          port.modeParameterIndex = null;
        });
      }
      const addImplicitPorts = (ports, buses, side) => {
        const represented = new Set(ports.filter(port => port.bus >= 0).map(port => port.bus));
        buses.filter(bus => !represented.has(bus)).forEach((bus, index) => ports.push({
          key: `${side}:${slot.index}:implicit:${bus}`,
          side,
          parameterIndex: null,
          name: side === "input" ? "Also uses" : "Also writes",
          bus,
          busLabel: routingBusLabel(bus, snapshot),
          kind: routingBusKind(bus, snapshot),
          minimum: 0,
          maximum: 0,
          implicit: true,
          title: side === "input"
            ? "Assigned automatically by this algorithm"
            : "Written automatically by this algorithm",
          outputMode: side === "output" ? (masks.replaces.includes(bus) ? "replace" : "add") : null,
          outputModeKnown: side === "output",
          modeStatus: side === "output" ? "fixed" : null,
          modeParameterIndex: null
        }));
      };
      addImplicitPorts(inputPorts, masks.directInputs, "input");
      addImplicitPorts(outputPorts, masks.outputs, "output");
      inputPorts = decorateDerivedInputPorts(inputPorts, slot, snapshot);
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
    const readersByBus = new Map();
    slotLayouts.forEach(layout => layout.inputPorts.forEach(port => {
      if (port.bus < 0) return;
      const readers = readersByBus.get(port.bus) || [];
      readers.push({ layout, port });
      readersByBus.set(port.bus, readers);
    }));
    slotLayouts.forEach(layout => {
      layout.inputPorts.forEach(port => {
        port.partial = port.bus >= 0 && routingBusKind(port.bus, snapshot) === "aux" && !(writersByBus.get(port.bus) || []).length;
      });
      layout.outputPorts.forEach(port => {
        port.partial = port.bus >= 0 && routingBusKind(port.bus, snapshot) === "aux" && !(readersByBus.get(port.bus) || []).length;
      });
    });

    const connectRead = (slot, bus, type, toPort = null) => {
      const busKind = routingBusKind(bus, snapshot);
      const previous = (writersByBus.get(bus) || []).filter(writer => writer.layout.slot.index < slot.index);
      let lastReplaceIndex = -1;
      for (let index = previous.length - 1; index >= 0; index -= 1) {
        if (previous[index].replaces) {
          lastReplaceIndex = index;
          break;
        }
      }
      if (busKind === "aux") {
        previous.forEach((writer, writerIndex) => {
          edges.push({
            from: `slot:${writer.layout.slot.index}`,
            to: `slot:${slot.index}`,
            bus,
            type,
            fromPort: writer.port,
            toPort,
            fromSlot: writer.layout.slot.index,
            toSlot: slot.index,
            maskedByReplace: lastReplaceIndex >= 0 && writerIndex < lastReplaceIndex,
            replacesBus: writer.replaces && writerIndex === lastReplaceIndex
          });
        });
      }
      if (busKind === "input") {
        edges.push({ from: `source:${bus}`, to: `slot:${slot.index}`, bus, type, toPort, toSlot: slot.index });
      }
    };

    slotLayouts.forEach(({ slot, masks, inputPorts, outputPorts }) => {
      inputPorts.filter(port => port.bus >= 0).forEach(port => connectRead(slot, port.bus, "signal", port));
      masks.mappings.forEach(bus => connectRead(slot, bus, "modulation"));
      outputPorts.forEach(port => {
        const bus = port.bus;
        if (bus < 0) return;
        const kind = routingBusKind(bus, snapshot);
        if (kind === "output") {
          const writers = writersByBus.get(bus) || [];
          const lastReplacingWriter = [...writers].reverse().find(writer => writer.replaces);
          edges.push({
            from: `slot:${slot.index}`,
            to: `sink:${bus}`,
            bus,
            type: "signal",
            fromPort: port,
            fromSlot: slot.index,
            maskedByReplace: Boolean(lastReplacingWriter && slot.index < lastReplacingWriter.layout.slot.index),
            replacesBus: Boolean(port.outputMode === "replace" && lastReplacingWriter?.layout.slot.index === slot.index)
          });
        }
      });
    });

    const width = 1180;
    const nodeDefinitions = new Map();
    const endpointGap = 38;
    const inputBankHeight = snapshot.inputBusCount * endpointGap + 42;
    const outputBankHeight = snapshot.outputBusCount * endpointGap + 42;
    const laneY = { left: 0, centre: 34, right: 0 };
    let centreSlotCount = 0;
    const usbLane = slot => {
      const guid = slotGuid(slot);
      if (guid === "usbf") return "left";
      if (guid === "usbt") return "right";
      return "centre";
    };
    snapshot.slots.forEach((slot, index) => {
      const { masks, inputPorts, outputPorts } = slotLayouts[index];
      const rows = Math.max(1, inputPorts.length, outputPorts.length);
      const slotHeight = 54 + (rows * 25) + 18;
      const lane = usbLane(slot);
      const sideLane = lane === "centre" ? null : lane;
      const nodeWidth = sideLane ? 142 : 310;
      if (!sideLane) centreSlotCount += 1;
      inputPorts.forEach((port, row) => { port.y = 66 + (row * 25); });
      outputPorts.forEach((port, row) => { port.y = 66 + (row * 25); });
      nodeDefinitions.set(`slot:${slot.index}`, {
        key: `slot:${slot.index}`,
        kind: "slot",
        slotIndex: slot.index,
        name: slot.name,
        algorithmName: slot.algorithmName,
        bypassed: Boolean(slot.bypassed),
        isPlugin: Boolean(slot.isPlugin || /plug[ -]?in/i.test(slot.algorithmName)),
        inputPorts,
        mappings: masks.mappings.map(bus => routingBusLabel(bus, snapshot)),
        outputPorts,
        sideLane,
        x: lane === "left" ? 12 : lane === "right" ? 988 : 420,
        y: laneY[lane],
        width: nodeWidth,
        height: slotHeight
      });
      laneY[lane] += slotHeight + 42;
    });
    const centreBottom = centreSlotCount ? laneY.centre - 42 : 686;
    const algorithmListCentre = centreSlotCount ? (34 + centreBottom) / 2 : 360;
    const leftStackHeight = inputBankHeight + laneY.left;
    const rightStackHeight = outputBankHeight + laneY.right;
    const sideStackTop = Math.max(34, algorithmListCentre - (Math.max(leftStackHeight, rightStackHeight) / 2));
    const inputBankTop = sideStackTop;
    const outputBankTop = sideStackTop;
    const sideTop = {
      left: inputBankTop + inputBankHeight + 42,
      right: outputBankTop + outputBankHeight + 42
    };
    nodeDefinitions.forEach(definition => {
      if (definition.sideLane) definition.y += sideTop[definition.sideLane];
    });
    const leftBottom = sideTop.left + laneY.left;
    const rightBottom = sideTop.right + laneY.right;
    const height = Math.max(720, centreBottom + 20, leftBottom + 20, rightBottom + 20);
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
    addEndpointBank("source", snapshot.inputBusCount, inputBankTop);
    addEndpointBank("sink", snapshot.outputBusCount, outputBankTop);

    routingIpadList.replaceChildren(...[...nodeDefinitions.values()]
      .filter(definition => definition.kind === "slot")
      .sort((first, second) => first.slotIndex - second.slotIndex)
      .map(makeIpadRoutingCard));

    state.routingCanvasSize = { width, height };
    routingCanvas.style.width = `${width}px`;
    routingCanvas.style.height = `${height}px`;
    routingWires.setAttribute("viewBox", `0 0 ${width} ${height}`);
    routingNodes.replaceChildren();
    nodeDefinitions.forEach(definition => routingNodes.appendChild(makeRoutingNode(definition)));
    if (previousSelection) {
      const selectedElement = $$(".routing-port, .routing-node.endpoint", routingNodes).find(element => {
        const slotIndex = element.dataset.slotIndex === undefined ? null : Number(element.dataset.slotIndex);
        const parameterIndex = element.dataset.parameterIndex === undefined || element.dataset.parameterIndex === "" ? null : Number(element.dataset.parameterIndex);
        return element.dataset.routingSide === previousSelection.side
          && Number(element.dataset.bus) === previousSelection.bus
          && slotIndex === previousSelection.slotIndex
          && parameterIndex === previousSelection.parameterIndex;
      });
      if (selectedElement) {
        state.routingSelection = { ...previousSelection, element: selectedElement };
        selectedElement.classList.add("routing-selected-source");
        refreshRoutingPaletteAvailability(state.routingSelection);
      }
    } else if (previousBusSelection != null) {
      state.routingBusSelection = previousBusSelection;
      $$(".routing-aux-chip", routingAuxPalette).forEach(chip => chip.classList.toggle("selected", Number(chip.dataset.bus) === previousBusSelection));
      [routingNodes, routingIpadList].forEach(surface => $$(".routing-port", surface).forEach(port => port.classList.toggle("bus-match", Number(port.dataset.bus) === previousBusSelection)));
    }
    routingWires.replaceChildren();
    const svgNS = "http://www.w3.org/2000/svg";
    edges.forEach((edge, index) => {
      const geometry = routingPath(edge, nodeDefinitions);
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", geometry);
      const busKind = routingBusKind(edge.bus, snapshot);
      path.setAttribute("class", `routing-wire ${edge.type} ${busKind}`);
      if (edge.type === "signal" && edge.toSlot != null) path.classList.add("input-flow");
      if (edge.type === "signal" && edge.fromSlot != null) path.classList.add("output-flow");
      if (edge.maskedByReplace) path.classList.add("masked-by-replace");
      if (edge.replacesBus) path.classList.add("replaces-bus");
      if (busKind === "aux" && edge.type === "signal") path.style.setProperty("--aux-colour", routingAuxColour(edge.bus, snapshot));
      if (edge.maskedByReplace || edge.replacesBus) {
        const title = document.createElementNS(svgNS, "title");
        title.textContent = edge.maskedByReplace
          ? `Still connected, but overwritten by a later Replace on ${routingBusLabel(edge.bus, snapshot)}.`
          : `Replace: overwrites earlier audio on ${routingBusLabel(edge.bus, snapshot)} at this slot.`;
        path.appendChild(title);
      }
      path.dataset.edgeIndex = String(index);
      if (edge.fromSlot != null) path.dataset.fromSlot = String(edge.fromSlot);
      if (edge.toSlot != null) path.dataset.toSlot = String(edge.toSlot);
      routingWires.appendChild(path);
    });
    const mappingCount = slotLayouts.reduce((count, item) => count + item.masks.mappings.length, 0);
    routingShowMod.disabled = mappingCount === 0;
    routingShowMod.title = mappingCount
      ? `${mappingCount} parameter-modulation bus connection${mappingCount === 1 ? "" : "s"}`
      : "No parameter-modulation bus connections in this preset";
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
    if (port.classList.contains("implicit")) {
      showToast(port.classList.contains("derived")
        ? "This pitch CV bus follows its gate automatically. Change the gate or its Pitch CV count."
        : "This bus is assigned automatically by the algorithm and cannot be changed independently.");
      return true;
    }
    if (routingConnectionAction) closeRoutingConnectionPanel();
    const side = port.dataset.routingSide;
    const selection = {
      element: port,
      side,
      bus: Number(port.dataset.bus),
      slotIndex: port.dataset.slotIndex === undefined ? null : Number(port.dataset.slotIndex),
      parameterIndex: port.dataset.parameterIndex !== undefined && port.dataset.parameterIndex !== "" ? Number(port.dataset.parameterIndex) : null,
      minimum: Number(port.dataset.minimum ?? 0),
      maximum: Number(port.dataset.maximum ?? 0)
    };
    if (state.routingBusSelection != null && selection.parameterIndex == null) {
      state.routingBusSelection = null;
      $$(".routing-aux-chip", routingAuxPalette).forEach(chip => chip.classList.remove("selected"));
      [routingNodes, routingIpadList].forEach(surface => $$(".routing-port", surface).forEach(candidate => candidate.classList.remove("bus-match")));
      showToast("An Aux bus cannot connect directly to a physical socket; choose a writable algorithm port.");
      return true;
    }
    if (state.routingBusSelection != null && selection.parameterIndex != null) {
      const bus = state.routingBusSelection;
      state.routingBusSelection = null;
      const result = await assignRoutingPort(selection, bus);
      applyPilotAccentFromAux(bus, state.routingSnapshot);
      return result;
    }
    if (!state.routingSelection) {
      state.routingSelection = selection;
      port.classList.add("routing-selected-source");
      refreshRoutingPaletteAvailability(selection);
      showToast(selection.parameterIndex == null ? "Now choose an algorithm port" : "Now choose a compatible port or bus");
      return true;
    }
    const source = state.routingSelection;
    source.element.classList.remove("routing-selected-source");
    state.routingSelection = null;
    refreshRoutingPaletteAvailability(null);
    if (source.element === port && source.parameterIndex != null && source.bus >= 0) {
      const historyBefore = captureRoutingParameterState();
      try {
        await writeRoutingSelection(source, -1);
        await loadLiveRouting({ preserveView: true });
        markWorkingEdit();
        recordRoutingHistory(historyBefore, `disconnect ${routingSelectionLabel(source)}`);
        showToast("Connection removed and verified from the NT");
      } catch (error) {
        showToast(error.message);
      }
      return true;
    }
    const directParameter = [source, selection].find(item => item.parameterIndex != null);
    const directEndpoint = [source, selection].find(item => item.parameterIndex == null && item.bus >= 0);
    if (directParameter && directEndpoint) {
      const compatibilityError = routingLogic.endpointCompatibilityError(directParameter, directEndpoint);
      if (compatibilityError) {
        showToast(compatibilityError);
        return true;
      }
    }
    const output = [source, selection].find(item => item.side === "output");
    const destinationBus = directEndpoint?.bus ?? -1;
    if (output?.parameterIndex != null && directEndpoint) {
      await openRoutingConnectionPanel({
        source: output,
        destination: directEndpoint,
        output,
        destinationBus,
        onApply: (modeChoice, routesToRemove) => finishRoutingConnection(source, selection, modeChoice, routesToRemove)
      });
    } else {
      await continueRoutingConnection(source, selection, output, []);
    }
    return true;
  }

  async function handleDerivedCountClick(target) {
    const control = target.closest(".routing-derived-count-step");
    if (!control) return Boolean(target.closest(".routing-derived-count"));
    const slotIndex = Number(control.dataset.slotIndex);
    const parameterIndex = Number(control.dataset.parameterIndex);
    const current = Number(control.dataset.value);
    const minimum = Number(control.dataset.minimum);
    const maximum = Number(control.dataset.maximum);
    const next = Math.min(maximum, Math.max(minimum, current + Number(control.dataset.delta)));
    if (next === current || !state.ntTransport || !state.transportOnline) return true;
    const historyBefore = captureRoutingParameterState();
    $$(".routing-derived-count-step", control.closest(".routing-node")).forEach(button => {
      button.classList.add("disabled");
      button.setAttribute("aria-disabled", "true");
    });
    try {
      await state.ntTransport.writeParameter(slotIndex, parameterIndex, next);
      await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      recordRoutingHistory(historyBefore, `change pitch CV count to ${next}`);
      showToast(`Pitch CV count changed to ${next} and verified from the NT`);
    } catch (error) {
      showToast(error.message);
      await loadLiveRouting({ preserveView: true }).catch(() => {});
    }
    return true;
  }

  function existingWritableOutputRoutes(bus, incomingOutput) {
    return routingLogic.writableOutputRoutesForBus(state.routingSnapshot?.slots, bus, incomingOutput);
  }

  async function continueRoutingConnection(source, selection, output, routesToRemove) {
    if (output?.parameterIndex != null) {
      const destination = source === output ? selection : source;
      await openRoutingConnectionPanel({
        source: output,
        destination,
        output,
        destinationBus: output.bus,
        onApply: (modeChoice, nextRoutesToRemove) => finishRoutingConnection(source, selection, modeChoice, nextRoutesToRemove)
      });
    } else {
      await finishRoutingConnection(source, selection, null, routesToRemove);
    }
  }

  async function finishRoutingConnection(first, second, modeChoice = null, routesToRemove = []) {
    const historyBefore = captureRoutingParameterState();
    const pendingPoll = stopLivePolling();
    if (pendingPoll) await pendingPoll.catch(() => {});
    const originalMode = modeChoice?.details.currentMode;
    const modeChanged = Boolean(modeChoice && modeChoice.mode !== originalMode);
    const connectingOutput = [first, second].find(item => item.side === "output" && item.parameterIndex != null);
    const originalConnectingBus = connectingOutput?.bus ?? -1;
    const removedRoutes = [];
    try {
      if (modeChanged) await chooseRoutingOutputMode(modeChoice.details, modeChoice.mode);
      for (const route of routesToRemove) {
        await writeRoutingSelection(route, -1);
        removedRoutes.push(route);
      }
      await connectRoutingSelections(first, second);
      markWorkingEdit();
      recordRoutingHistory(historyBefore, `change routing for ${routingSelectionLabel(connectingOutput || first)}`);
      const routeCopy = routesToRemove.length ? ` · removed ${routesToRemove.length} previous route${routesToRemove.length === 1 ? "" : "s"}` : "";
      const modeCopy = modeChoice ? ` · ${modeChoice.mode === "replace" ? "Replace" : "Add"} mode` : "";
      showToast(`Routing changed${routeCopy}${modeCopy} and verified from the NT`);
      scheduleRoutingReconciliation();
    } catch (error) {
      if (removedRoutes.length) {
        try {
          if (connectingOutput) await writeRoutingSelection(connectingOutput, originalConnectingBus);
          for (const route of removedRoutes) await writeRoutingSelection(route, route.bus);
        } catch (rollbackError) {
          showToast(`${error.message} Route rollback also failed; refresh routing.`);
          return;
        }
      }
      if (modeChanged) {
        try {
          await chooseRoutingOutputMode(modeChoice.details, originalMode);
        } catch (rollbackError) {
          showToast(`${error.message} Output-mode rollback also failed; refresh routing.`);
          return;
        }
      }
      showToast(error.message);
    } finally {
      if (state.activeLiveSlotIndex != null && !state.routingReadPromise) startLivePolling(state.activeLiveSlotIndex);
    }
  }

  function routingSelectionAcceptsBus(selection, bus) {
    return routingLogic.selectionAcceptsBus(selection, bus);
  }

  function refreshRoutingPaletteAvailability(selection) {
    $$(".routing-aux-chip", routingAuxPalette).forEach(chip => {
      const bus = Number(chip.dataset.bus);
      chip.disabled = Boolean(selection?.parameterIndex != null && !routingSelectionAcceptsBus(selection, bus));
    });
  }

  function routingUsedBuses() {
    return new Set(state.routingSnapshot.slots.flatMap(slot => (slot.ioParameters || [])
      .map(parameter => Number(parameter.value) - 1)).filter(value => value >= 0));
  }

  function compatibleFreeAux(first, second) {
    const snapshot = state.routingSnapshot;
    const used = routingUsedBuses();
    const firstAux = snapshot.inputBusCount + snapshot.outputBusCount;
    return Array.from({ length: snapshot.auxBusCount }, (_, index) => firstAux + index)
      .find(bus => !used.has(bus) && routingSelectionAcceptsBus(first, bus) && routingSelectionAcceptsBus(second, bus));
  }

  async function writeRoutingSelection(selection, bus) {
    if (selection.parameterIndex == null || selection.slotIndex == null) throw new Error("That route has no writable NT parameter.");
    if (!routingSelectionAcceptsBus(selection, bus)) {
      throw new Error(`${routingBusLabel(bus, state.routingSnapshot)} is outside this port's permitted bus range.`);
    }
    await state.ntTransport.writeParameter(selection.slotIndex, selection.parameterIndex, bus + 1);
    updateRoutingSnapshotParameter(selection.slotIndex, selection.parameterIndex, bus + 1);
  }

  async function connectRoutingSelections(first, second) {
    const parameters = [first, second].filter(item => item.parameterIndex != null);
    const endpoints = [first, second].filter(item => item.parameterIndex == null && item.bus >= 0);
    if (!parameters.length) throw new Error("Choose at least one writable algorithm port.");

    if (endpoints.length) {
      if (parameters.length !== 1) throw new Error("Choose one algorithm port and one physical bus.");
      const compatibilityError = routingLogic.endpointCompatibilityError(parameters[0], endpoints[0]);
      if (compatibilityError) throw new Error(compatibilityError);
      await writeRoutingSelection(parameters[0], endpoints[0].bus);
      return;
    }

    if (parameters.length !== 2 || parameters[0].side === parameters[1].side) {
      throw new Error("Choose one algorithm output and one algorithm input.");
    }
    const output = parameters.find(item => item.side === "output");
    const input = parameters.find(item => item.side === "input");
    if (!output || !input) throw new Error("Choose one algorithm output and one algorithm input.");

    let bus = output.bus;
    let writeOutput = false;
    if (bus < 0) {
      bus = compatibleFreeAux(output, input);
      if (bus == null) throw new Error("No free Aux bus is permitted by both ports.");
      writeOutput = true;
    } else if (!routingSelectionAcceptsBus(input, bus)) {
      throw new Error(`${routingBusLabel(bus, state.routingSnapshot)} is not permitted by the selected input.`);
    }

    const originalOutputBus = output.bus;
    if (writeOutput) await writeRoutingSelection(output, bus);
    try {
      await writeRoutingSelection(input, bus);
    } catch (error) {
      if (writeOutput) {
        try {
          await writeRoutingSelection(output, originalOutputBus);
        } catch (rollbackError) {
          throw new Error(`${error.message} The source rollback also failed; refresh routing before continuing.`);
        }
      }
      throw error;
    }
  }

  async function assignRoutingPort(selection, bus, modeChoice = null, routesToRemove = [], confirmed = false, anchorElement = null) {
    if (selection.parameterIndex == null || selection.slotIndex == null) {
      showToast("Select an algorithm input or output first");
      return true;
    }
    const assigningBus = bus >= 0;
    if (!confirmed && assigningBus) {
      const busChip = $(`.routing-aux-chip[data-bus="${bus}"]`, routingAuxPalette);
      const destination = { element: anchorElement || busChip || selection.element, side: "both", bus, slotIndex: null, parameterIndex: null };
      await openRoutingConnectionPanel({
        source: selection,
        destination,
        output: selection.side === "output" ? selection : null,
        destinationBus: bus,
        allowRouteChanges: selection.side === "output",
        onRetarget: (nextBus, nextAnchor) => assignRoutingPort(selection, nextBus, null, [], false, nextAnchor),
        onApply: (nextModeChoice, nextRoutesToRemove) => assignRoutingPort(selection, bus, nextModeChoice, nextRoutesToRemove, true, anchorElement)
      });
      return true;
    }
    const pendingPoll = stopLivePolling();
    if (pendingPoll) await pendingPoll.catch(() => {});
    const originalMode = modeChoice?.details.currentMode;
    const modeChanged = Boolean(modeChoice && modeChoice.mode !== originalMode);
    const originalBus = selection.bus;
    const historyBefore = captureRoutingParameterState();
    const removedRoutes = [];
    try {
      if (modeChanged) await chooseRoutingOutputMode(modeChoice.details, modeChoice.mode);
      for (const route of routesToRemove) {
        await writeRoutingSelection(route, -1);
        removedRoutes.push(route);
      }
      await writeRoutingSelection(selection, bus);
      markWorkingEdit();
      recordRoutingHistory(historyBefore, `route ${routingSelectionLabel(selection)} to ${bus < 0 ? "None" : routingBusLabel(bus, state.routingSnapshot)}`);
      showToast(`${bus < 0 ? "Disconnected" : `Assigned ${routingBusLabel(bus, state.routingSnapshot)}`} and verified from the NT`);
      scheduleRoutingReconciliation();
    } catch (error) {
      if (removedRoutes.length) {
        try {
          await writeRoutingSelection(selection, originalBus);
          for (const route of removedRoutes) await writeRoutingSelection(route, route.bus);
        } catch (rollbackError) {
          showToast(`${error.message} Route rollback also failed; refresh routing.`);
          return true;
        }
      }
      if (modeChanged) {
        try {
          await chooseRoutingOutputMode(modeChoice.details, originalMode);
        } catch (rollbackError) {
          showToast(`${error.message} Output-mode rollback also failed; refresh routing.`);
          return true;
        }
      }
      showToast(error.message);
    } finally {
      if (state.activeLiveSlotIndex != null && !state.routingReadPromise) startLivePolling(state.activeLiveSlotIndex);
    }
    return true;
  }

  function editorRoutingSelection(entry, anchorElement) {
    const side = Number(entry.parameter.ioFlags) & 0x02 ? "output" : "input";
    const port = state.routingSnapshot
      ? [...$$(".routing-port", routingIpadList), ...$$(".routing-port", routingNodes)]
        .find(candidate => candidate.dataset.routingSide === side
          && Number(candidate.dataset.slotIndex) === entry.slotInfo.index
          && Number(candidate.dataset.parameterIndex) === entry.parameter.index)
      : null;
    return {
      element: port || anchorElement,
      side,
      bus: port ? Number(port.dataset.bus) : Number(entry.confirmedValue) - 1,
      slotIndex: entry.slotInfo.index,
      parameterIndex: entry.parameter.index,
      minimum: Number(entry.parameter.min),
      maximum: Number(entry.parameter.max),
      label: `${entry.slotInfo.name} · ${entry.parameter.name}`
    };
  }

  async function assignEditorBusWithPopup(entry, value, anchorElement) {
    const selection = editorRoutingSelection(entry, anchorElement);
    await assignRoutingPort(selection, value - 1, null, [], false, anchorElement);
    disarmEditorBusAssignment();
    previewLiveParameterEntry(entry, entry.confirmedValue);
    return true;
  }

  async function retargetOpenRoutingConnection(bus, anchorElement) {
    if (!routingConnectionRetarget || bus < 0) return false;
    const retarget = routingConnectionRetarget;
    closeRoutingConnectionPanel();
    $$(".routing-aux-chip", routingAuxPalette).forEach(item =>
      item.classList.toggle("selected", Number(item.dataset.bus) === bus));
    applyPilotAccentFromAux(bus, state.routingSnapshot || state.liveIdentity);
    await retarget(bus, anchorElement);
    return true;
  }

  async function handleAuxPaletteClick(target) {
    const chip = target.closest(".routing-aux-chip");
    if (!chip || !state.routingSnapshot) return false;
    const bus = Number(chip.dataset.bus);
    applyPilotAccentFromAux(bus, state.routingSnapshot);
    if (await retargetOpenRoutingConnection(bus, chip)) return true;
    if (state.routingSelection?.parameterIndex != null) {
      const selection = state.routingSelection;
      selection.element.classList.remove("routing-selected-source");
      state.routingSelection = null;
      refreshRoutingPaletteAvailability(null);
      const result = await assignRoutingPort(selection, bus);
      applyPilotAccentFromAux(bus, state.routingSnapshot);
      return result;
    }
    if (state.routingSelection) {
      state.routingSelection.element.classList.remove("routing-selected-source");
      state.routingSelection = null;
      refreshRoutingPaletteAvailability(null);
    }
    state.routingBusSelection = bus;
    $$(".routing-aux-chip", routingAuxPalette).forEach(item => item.classList.toggle("selected", item === chip));
    [routingNodes, routingIpadList].forEach(surface => $$(".routing-port", surface).forEach(port => port.classList.toggle("bus-match", Number(port.dataset.bus) === bus)));
    showToast(bus < 0 ? "Now choose a port to disconnect" : `Now choose a port for ${routingBusLabel(bus, state.routingSnapshot)}`);
    return true;
  }

  async function handleRoutingModeClick(target) {
    const control = target.closest(".routing-mode-toggle");
    if (!control) return false;
    const rawParameterIndex = control.dataset.parameterIndex;
    const parameterIndex = rawParameterIndex === "" ? null : Number(rawParameterIndex);
    const row = control.closest(".routing-port");
    const details = Number.isInteger(parameterIndex) && !control.classList.contains("readonly")
      ? { control, slotIndex: Number(control.dataset.slotIndex), parameterIndex, currentMode: control.dataset.mode }
      : await resolveRoutingModeDetails({
          element: row,
          side: "output",
          slotIndex: Number(row.dataset.slotIndex),
          parameterIndex: Number(row.dataset.parameterIndex)
        });
    if (!details) {
      const slotStatus = routingOutputModeStatus({ side: "output", slotIndex: Number(row.dataset.slotIndex) });
      const status = slotStatus === "error" ? "unknown" : control.dataset.modeStatus;
      if (status === "unknown") showToast("The NT's Add/Replace metadata failed to load. Refresh Routing to retry.");
      else if (["pending", "loading"].includes(slotStatus) || status === "loading") showToast("Still reading this output's mode controls from the NT.");
      else showToast("This output's Add/Replace behaviour is fixed by the algorithm; the NT exposes no editable mode control.");
      return true;
    }
    const selection = {
      element: row,
      side: "output",
      bus: Number(row.dataset.bus),
      slotIndex: Number(row.dataset.slotIndex),
      parameterIndex: Number(row.dataset.parameterIndex)
    };
    const destination = { element: row, side: "both", bus: selection.bus, slotIndex: null, parameterIndex: null };
    await openRoutingConnectionPanel({
      source: selection,
      destination,
      output: selection,
      destinationBus: selection.bus,
      title: "Output mode",
      submitLabel: "Apply",
      onApply: async (modeChoice, routesToRemove) => {
        const originalMode = details.currentMode;
        const historyBefore = captureRoutingParameterState();
        const removedRoutes = [];
        try {
          if (modeChoice?.mode !== originalMode) await chooseRoutingOutputMode(details, modeChoice.mode);
          for (const route of routesToRemove) {
            await writeRoutingSelection(route, -1);
            removedRoutes.push(route);
          }
          await loadLiveRouting({ preserveView: true });
          if (modeChoice?.mode !== originalMode || removedRoutes.length) markWorkingEdit();
          recordRoutingHistory(historyBefore, `change output mode for ${routingSelectionLabel(selection)}`);
          const removedCopy = removedRoutes.length ? ` · removed ${removedRoutes.length} other route${removedRoutes.length === 1 ? "" : "s"}` : "";
          showToast(`Output mode is ${modeChoice?.mode === "replace" ? "Replace" : "Add"}${removedCopy}`);
        } catch (error) {
          try {
            if (modeChoice?.mode !== originalMode) await chooseRoutingOutputMode(details, originalMode);
            for (const route of removedRoutes) await writeRoutingSelection(route, route.bus);
          } catch (rollbackError) {
            showToast(`${error.message} Rollback also failed; refresh routing.`);
            return;
          }
          showToast(error.message);
        }
      }
    });
    return true;
  }

  function selectRoutingSlot(slotIndex, snapshot = state.liveRouting) {
    if (!snapshot) return;
    [routingNodes, routingIpadList].forEach(surface => $$(".routing-node.slot", surface).forEach(node => node.classList.toggle("selected", Number(node.dataset.slotIndex) === slotIndex)));
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
    const algorithmName = userFacingText(slot.algorithmName, "Algorithm");
    $("span", copy).textContent = `Slot ${slot.index + 1} · ${algorithmName}`;
    $("strong", copy).textContent = userFacingText(slot.name, algorithmName);
    detail.textContent = `Reads ${list(masks.inputs)} · writes ${list(masks.outputs)}${masks.mappings.length ? ` · modulates from ${list(masks.mappings)}` : ""}`;
  }

  function applyRoutingZoom() {
    const { width, height } = state.routingCanvasSize;
    routingCanvas.style.zoom = "";
    routingCanvas.style.transform = `scale(${state.routingZoom})`;
    routingZoomLayer.style.width = `${Math.ceil(width * state.routingZoom)}px`;
    routingZoomLayer.style.height = `${Math.ceil(height * state.routingZoom)}px`;
    $("#routing-zoom-value").textContent = `${Math.round(state.routingZoom * 100)}%`;
  }

  function captureRoutingAnchor(clientX, clientY) {
    const rect = routingCanvas.getBoundingClientRect();
    const width = Math.max(1, state.routingCanvasSize.width);
    const height = Math.max(1, state.routingCanvasSize.height);
    return {
      x: (clientX - rect.left) / (Math.max(1, rect.width) / width),
      y: (clientY - rect.top) / (Math.max(1, rect.height) / height)
    };
  }

  function restoreRoutingAnchor(anchor, clientX, clientY) {
    const viewportRect = routingViewport.getBoundingClientRect();
    const viewportScaleX = viewportRect.width / Math.max(1, routingViewport.clientWidth);
    const viewportScaleY = viewportRect.height / Math.max(1, routingViewport.clientHeight);
    const localX = (clientX - viewportRect.left) / Math.max(.01, viewportScaleX);
    const localY = (clientY - viewportRect.top) / Math.max(.01, viewportScaleY);
    routingViewport.scrollLeft = anchor.x * state.routingZoom - localX;
    routingViewport.scrollTop = anchor.y * state.routingZoom - localY;
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
    const signalsVisible = routingShowSignals.checked;
    routingCanvas.classList.toggle("hide-signals", !signalsVisible);
    routingCanvas.classList.toggle("hide-input", !routingShowInput.matches("[aria-pressed=true]"));
    routingCanvas.classList.toggle("hide-output", !routingShowOutput.matches("[aria-pressed=true]"));
    routingCanvas.classList.toggle("hide-aux", !routingShowAux.matches("[aria-pressed=true]"));
    routingCanvas.classList.toggle("hide-modulation", !routingShowMod.matches("[aria-pressed=true]"));
  }

  async function loadLiveRouting({ preserveView = false, background = false } = {}) {
    if (!state.ntTransport || !state.liveIdentity || state.routingReadPromise) return state.routingReadPromise;
    const token = ++state.routingReadToken;
    if (!background) routingLoading.classList.remove("hidden");
    state.routingReadPromise = (async () => {
      const pendingPoll = stopLivePolling();
      if (pendingPoll) await pendingPoll.catch(() => {});
      await state.parameterReadQueue.catch(() => {});
      const snapshot = await state.ntTransport.readRoutingSnapshot(state.liveIdentity);
      if (token !== state.routingReadToken) return;
      state.liveRouting = snapshot;
      renderRoutingGraph(snapshot, { live: true, preserveView });
      if (!background) {
        routingLoading.classList.add("hidden");
        showToast(`Read NT routing · discovering Add/Replace controls…`);
      }
      state.routingModeHydrationPromise = state.ntTransport.hydrateRoutingOutputModes(snapshot);
      await state.routingModeHydrationPromise;
      if (token !== state.routingReadToken) return;
      renderRoutingGraph(snapshot, { live: true, preserveView: true });
      if (!background) showToast(`Read complete NT routing · ${snapshot.slots.length} slots`);
    })().catch(error => {
      if (token === state.routingReadToken) {
        showToast(background ? `Routing reconciliation failed · ${error.message}` : error.message);
      }
    }).finally(() => {
      if (token === state.routingReadToken) {
        if (!background) routingLoading.classList.add("hidden");
        if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
      }
      state.routingReadPromise = null;
      state.routingModeHydrationPromise = null;
    });
    return state.routingReadPromise;
  }

  function setView(view) {
    if (view !== "editor") disarmEditorBusAssignment();
    state.view = view;
    deviceFrame.classList.remove("sidebar-compact");
    updateEditorBusDockVisibility();
    updateRoutingPaletteVisibility();
    viewStack.classList.toggle("editor-mode", view === "editor");
    const viewTitles = {
      editor: "Editor",
      routing: "Routing",
      mapping: "MIDI mapping",
      control: "Performance",
      assistant: "Assistant",
      status: "Status & setup"
    };
    $("#current-view-title").textContent = viewTitles[view] || "Editor";
    $$("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === view));
    $$("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    viewStack.scrollTop = 0;
    if (view === "routing") {
      if (state.liveRouting) selectRoutingSlot(null, state.liveRouting);
      requestAnimationFrame(() => fitRoutingGraph("auto"));
      if (state.ntTransport && !state.liveRouting) loadLiveRouting();
    }
    if (view === "mapping") {
      const selectedSlot = $(".slot.active", slotList);
      if (state.ntTransport && selectedSlot) queueLiveParameterRead(selectedSlot);
    }
    if (view === "control") {
      renderPerformanceControls();
      if (state.ntTransport && state.transportOnline && !state.performanceItems.length) loadPerformancePage();
    }
  }

  function setInterfaceScale(value, { save = true } = {}) {
    const next = Math.max(90, Math.min(170, Math.round(Number(value) / 10) * 10));
    state.interfaceScale = next;
    const effective = state.ipadMode ? next : 100;
    document.documentElement.style.setProperty("--interface-scale", String(effective / 100));
    document.documentElement.style.setProperty("--scaled-header-height", `${Math.round(54 * effective / 100)}px`);
    interfaceScaleValue.textContent = `${next}%`;
    interfaceScaleDown.disabled = next <= 90;
    interfaceScaleUp.disabled = next >= 170;
    if (save) {
      try {
        localStorage.setItem("ntPilotInterfaceScale", String(next));
      } catch (_) {
        // Scaling still works for this session when local storage is unavailable.
      }
    }
    if (state.view === "routing" && state.routingSnapshot) requestAnimationFrame(() => fitRoutingGraph("auto"));
  }

  function canMutate() {
    return state.device === "ready" || state.device === "offline";
  }

  function canApplyToHardware() {
    return false;
  }

  function setDeviceState(nextState) {
    state.device = nextState;
    const detail = deviceStates[nextState];
    const hasLivePreset = nextState === "labConnected";
    const showStateBanner = nextState === "syncing" || nextState === "disconnected" || nextState === "owned";
    connectionPill.className = `connection-pill ${nextState}`;
    connectionLabel.textContent = detail.label;
    connectionPill.classList.toggle("hidden", nextState === "labWaiting");
    deviceTitle.classList.toggle("disconnected", !hasLivePreset);
    stateBanner.className = `state-banner ${detail.bannerClass}`.trim();
    stateBanner.classList.toggle("hidden", !showStateBanner);
    stateBannerTitle.textContent = detail.title;
    stateBannerCopy.textContent = detail.copy;
    stateAction.textContent = detail.action;
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
    const settledLabel = state.device === "offline" ? "Local draft" : "Read from NT";
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
      ? (values.type === "CC" ? `Ch ${values.channel} · CC ${values.cc}` : `Ch ${values.channel} · ${values.type}`)
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

  function displaySlot(slot) {
    if (!slot) return;
    const slotIndex = Number(slot.dataset.index);
    if (state.selectedSlotIndex !== slotIndex) {
      disarmEditorBusAssignment();
      clearSmartFeedback();
    }
    state.selectedSlotIndex = slotIndex;
    $$(".slot", slotList).forEach(row => row.classList.remove("active"));
    slot.classList.add("active");
    mappingSlotSelect.value = String(slotIndex);
    if (state.liveRouting) selectRoutingSlot(slotIndex);
    $("#slot-heading").textContent = slot.dataset.slot;
    const slotNumber = $(".slot-number", slot).textContent;
    $("#slot-kicker").textContent = `Slot ${slotNumber} · ${slot.dataset.algorithm}`;
    if (state.ntTransport) {
      queueLiveParameterRead(slot);
      return;
    }
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = slot.dataset.algorithm;
    $("#parameter-fixture-note span").textContent = "Connect to read this slot's live parameter definitions and values.";
  }

  function formatParameterValue(parameter, rawValue = parameter.value) {
    const cachedLabel = parameter.valueStrings?.get(Number(rawValue));
    if (cachedLabel) return cachedLabel;
    const enumLabel = parameter.enumStrings?.[Number(rawValue) - parameter.min];
    if (enumLabel) return enumLabel;
    const scaling = parameter.scaling || 1;
    const value = rawValue / scaling;
    if (parameter.unit === 0 && parameter.min === 0 && parameter.max === 1) {
      return value ? "On" : "Off";
    }
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
  }

  function updateRangeProgress(slider) {
    const minimum = Number(slider.min);
    const maximum = Number(slider.max);
    const progress = maximum === minimum ? 0 : ((Number(slider.value) - minimum) / (maximum - minimum)) * 100;
    slider.style.setProperty("--range-progress", `${Math.max(0, Math.min(100, progress))}%`);
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
    state.selectedMapping = liveItems[0] || null;
    if (state.selectedMapping) populateMapping(state.selectedMapping);
    updateMappingSummary();
    renderPerformanceControls();
  }

  function updatePerformanceEntry(entry) {
    const card = $(`.performance-control[data-key="${mappingKey(entry.slotInfo.index, entry.parameter.index)}"]`);
    if (!card) return;
    const totalBusCount = state.liveIdentity
      ? state.liveIdentity.inputBusCount + state.liveIdentity.outputBusCount + state.liveIdentity.auxBusCount
      : 0;
    if (totalBusCount > 0 && window.NTWebMIDITransport.isRoutingBusParameter(entry.parameter, totalBusCount)) {
      applyParameterBusColour({ busChip: true, row: card }, entry.parameter.value);
    }
    const slider = $("input[type=range]", card);
    const value = $("output", card);
    if (slider && document.activeElement !== slider) {
      slider.value = String(entry.parameter.value);
      updateRangeProgress(slider);
    }
    if (value) value.textContent = formatParameterValue(entry.parameter);
  }

  async function loadPerformancePage() {
    if (!state.ntTransport || !state.liveIdentity) return;
    if (state.performanceReadPromise) return state.performanceReadPromise;
    state.performanceReadPromise = (async () => {
      const items = await state.ntTransport.readPerformancePage();
      const enabledSlots = [...new Set(items.filter(item => item.enabled).map(item => item.slotIndex))];
      const parametersBySlot = new Map();
      for (const slotIndex of enabledSlots) {
        parametersBySlot.set(slotIndex, await state.ntTransport.readSlotParameters(slotIndex));
      }
      state.performanceItems = items;
      state.performanceEntries.clear();
      items.filter(item => item.enabled).forEach(item => {
        const slotInfo = state.liveIdentity.slots.find(slot => slot.index === item.slotIndex);
        const parameter = parametersBySlot.get(item.slotIndex)?.find(candidate => candidate.index === item.parameterNumber);
        if (slotInfo && parameter) state.performanceEntries.set(item.itemIndex, { item, slotInfo, parameter });
      });
      const enumTargets = [...new Map([...state.performanceEntries.values()].map(entry => [
        mappingKey(entry.slotInfo.index, entry.parameter.index), entry
      ])).values()];
      for (const entry of enumTargets) {
        entry.parameter.valueStrings = new Map();
        try {
          entry.parameter.enumStrings = await state.ntTransport.readParameterEnumStrings(
            entry.slotInfo.index,
            entry.parameter.index
          );
        } catch (_) {
          entry.parameter.enumStrings = [];
        }
        try {
          const currentLabel = await state.ntTransport.readParameterValueString(
            entry.slotInfo.index,
            entry.parameter.index
          );
          if (currentLabel) entry.parameter.valueStrings.set(entry.parameter.value, currentLabel);
        } catch (_) {}
      }
      renderPerformanceControls();
    })().catch(error => {
      showToast(`Performance Page unavailable · ${error.message}`);
    }).finally(() => {
      state.performanceReadPromise = null;
    });
    return state.performanceReadPromise;
  }

  async function writePerformanceValue(entry, value, control) {
    if (!state.ntTransport || !state.transportOnline) return;
    const requestedValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    const previousValue = entry.parameter.value;
    control.disabled = true;
    const operation = state.parameterWriteQueue.catch(() => {}).then(async () => {
      await state.ntTransport.writeParameter(entry.slotInfo.index, entry.parameter.index, requestedValue);
      entry.parameter.value = requestedValue;
      markWorkingEdit();
      recordParameterHistory([{
        slotIndex: entry.slotInfo.index,
        parameterIndex: entry.parameter.index,
        before: previousValue,
        after: requestedValue
      }], `change ${entry.item.upperLabel || entry.parameter.name}`);
      renderPerformanceControls();
      return true;
    }).catch(error => {
      showToast(error.message);
      return false;
    }).finally(() => {
      control.disabled = false;
    });
    state.parameterWriteQueue = operation;
    return operation;
  }

  function queuePerformanceValueWrite(entry, value, control) {
    const requestedValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    if (entry.performanceHistoryStart == null && requestedValue !== entry.parameter.value) entry.performanceHistoryStart = entry.parameter.value;
    entry.pendingPerformanceValue = requestedValue;
    if (entry.performanceWriteRunning || !state.ntTransport || !state.transportOnline) return;
    entry.performanceWriteRunning = true;
    const operation = state.parameterWriteQueue.catch(() => {}).then(async () => {
      while (entry.pendingPerformanceValue != null) {
        const nextValue = entry.pendingPerformanceValue;
        entry.pendingPerformanceValue = null;
        await state.ntTransport.writeParameter(entry.slotInfo.index, entry.parameter.index, nextValue);
        entry.parameter.value = nextValue;
        markWorkingEdit();
      }
      recordParameterHistory([{
        slotIndex: entry.slotInfo.index,
        parameterIndex: entry.parameter.index,
        before: entry.performanceHistoryStart,
        after: entry.parameter.value
      }], `change ${entry.item.upperLabel || entry.parameter.name}`);
      entry.performanceHistoryStart = null;
      try {
        const confirmedLabel = await state.ntTransport.readParameterValueString(
          entry.slotInfo.index,
          entry.parameter.index
        );
        if (confirmedLabel) {
          entry.parameter.valueStrings ??= new Map();
          entry.parameter.valueStrings.set(entry.parameter.value, confirmedLabel);
          const card = $(`.performance-control[data-performance-item="${entry.item.itemIndex}"]`);
          const output = $("output", card);
          if (output) output.textContent = confirmedLabel;
          const toggle = $(".performance-binary-toggle", card);
          if (toggle) toggle.textContent = confirmedLabel;
        }
      } catch (_) {}
      return true;
    }).catch(error => {
      entry.performanceHistoryStart = null;
      showToast(error.message);
      return false;
    }).finally(() => {
      entry.performanceWriteRunning = false;
      control?.removeAttribute("aria-busy");
      if (entry.pendingPerformanceValue != null) queuePerformanceValueWrite(entry, entry.pendingPerformanceValue, control);
    });
    control?.setAttribute("aria-busy", "true");
    state.parameterWriteQueue = operation;
  }

  async function setSlotBypass(slotIndex, bypassed, control) {
    if (!state.ntTransport || !state.transportOnline || control.dataset.busy === "true") return;
    control.dataset.busy = "true";
    const operation = state.parameterWriteQueue.catch(() => {}).then(async () => {
      await state.ntTransport.writeParameter(slotIndex, 0, bypassed ? 1 : 0);
      const identitySlot = state.liveIdentity?.slots.find(slot => slot.index === slotIndex);
      if (identitySlot) identitySlot.bypassed = bypassed;
      const routingSlot = state.liveRouting?.slots.find(slot => slot.index === slotIndex);
      if (routingSlot) routingSlot.bypassed = bypassed;
      const editorSlot = $(`.slot[data-index="${slotIndex}"]`, slotList);
      const routingNode = $(`.routing-node.slot[data-slot-index="${slotIndex}"]`, routingNodes);
      const ipadRoutingNode = $(`.routing-node.slot[data-slot-index="${slotIndex}"]`, routingIpadList);
      editorSlot?.classList.toggle("bypassed", bypassed);
      routingNode?.classList.toggle("bypassed", bypassed);
      ipadRoutingNode?.classList.toggle("bypassed", bypassed);
      $$(`[data-bypass-slot="${slotIndex}"]`).forEach(item => setBypassToggleContent(item, bypassed));
      const liveEntry = state.liveParameters.get(mappingKey(slotIndex, 0));
      if (liveEntry) updateLiveParameterEntry(liveEntry, bypassed ? 1 : 0, "midi-feedback");
      markWorkingEdit();
      recordParameterHistory([{
        slotIndex,
        parameterIndex: 0,
        before: bypassed ? 0 : 1,
        after: bypassed ? 1 : 0
      }], `${bypassed ? "bypass" : "enable"} slot ${slotIndex + 1}`);
      startCpuPolling();
      showToast(`Slot ${slotIndex + 1} ${bypassed ? "bypassed" : "enabled"} and verified from the NT`);
      return true;
    }).catch(error => {
      showToast(error.message);
      return false;
    }).finally(() => {
      control.dataset.busy = "false";
    });
    state.parameterWriteQueue = operation;
    return operation;
  }

  function activateBypassToggle(target) {
    const control = target.closest("[data-bypass-slot]");
    if (!control) return false;
    setSlotBypass(Number(control.dataset.bypassSlot), control.dataset.bypassed !== "true", control);
    return true;
  }

  function renderPerformanceControls() {
    const grid = $("#performance-grid");
    if (!grid) return;
    const start = (state.performancePage - 1) * 3;
    grid.replaceChildren();
    for (let index = 0; index < 3; index += 1) {
      const itemNumber = start + index + 1;
      const entry = state.performanceEntries.get(start + index);
      if (!entry) {
        const empty = document.createElement("article");
        empty.className = "control-card empty-performance";
        const number = document.createElement("span");
        number.textContent = String(itemNumber);
        const label = document.createElement("strong");
        label.textContent = state.performanceReadPromise ? "Reading from NT…" : "Unassigned";
        empty.append(number, label);
        grid.appendChild(empty);
        continue;
      }
      const card = document.createElement("article");
      card.className = `control-card performance-control ${["accent-mint", "accent-yellow", "accent-lilac", "accent-blue"][index]}`;
      card.dataset.performanceItem = String(entry.item.itemIndex);
      defaultParameterColour(card, entry.parameter);
      const performanceBusCount = state.liveIdentity
        ? state.liveIdentity.inputBusCount + state.liveIdentity.outputBusCount + state.liveIdentity.auxBusCount
        : 0;
      if (performanceBusCount > 0 && window.NTWebMIDITransport.isRoutingBusParameter(entry.parameter, performanceBusCount)) {
        applyParameterBusColour({ busChip: true, row: card }, entry.parameter.value);
      }
      const head = document.createElement("div");
      head.className = "control-card-head";
      const slot = document.createElement("span");
      slot.textContent = `Slot ${entry.slotInfo.index + 1} · ${entry.slotInfo.name}`;
      const position = document.createElement("span");
      position.textContent = `Control ${itemNumber}`;
      head.append(slot, position);
      const value = document.createElement("output");
      value.className = "performance-live-value";
      value.textContent = formatParameterValue(entry.parameter);
      const title = document.createElement("h2");
      title.textContent = entry.item.upperLabel || entry.parameter.name;
      const detail = document.createElement("p");
      detail.textContent = entry.item.lowerLabel || `${entry.parameter.name} · Parameter ${entry.parameter.index + 1}`;
      const isBinary = entry.parameter.enumStrings?.length === 2
        || Math.abs(entry.item.max - entry.item.min) === 1;
      let liveControl;
      if (isBinary) {
        value.classList.add("hidden");
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "performance-binary-toggle";
        const refreshToggle = rawValue => {
          const active = Number(rawValue) === entry.item.max;
          toggle.classList.toggle("active", active);
          toggle.setAttribute("aria-pressed", String(active));
          toggle.textContent = formatParameterValue(entry.parameter, active ? entry.item.max : entry.item.min);
        };
        refreshToggle(entry.parameter.value);
        toggle.setAttribute("aria-label", `${entry.parameter.name}, two-state performance control`);
        toggle.addEventListener("click", () => {
          const nextValue = Number(toggle.getAttribute("aria-pressed") === "true" ? entry.item.min : entry.item.max);
          entry.parameter.value = nextValue;
          value.textContent = formatParameterValue(entry.parameter, nextValue);
          refreshToggle(nextValue);
          queuePerformanceValueWrite(entry, nextValue, toggle);
        });
        liveControl = toggle;
      } else {
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = String(entry.item.min);
        slider.max = String(entry.item.max);
        slider.value = String(entry.parameter.value);
        slider.setAttribute("aria-label", `${entry.parameter.name}, performance control`);
        updateRangeProgress(slider);
        slider.addEventListener("input", () => {
          const nextValue = Number(slider.value);
          updateRangeProgress(slider);
          if (!entry.parameter.valueStrings?.size) {
            value.textContent = formatParameterValue(entry.parameter, nextValue);
          }
          entry.parameter.value = nextValue;
          queuePerformanceValueWrite(entry, nextValue, slider);
        });
        liveControl = slider;
      }
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "performance-reset";
      reset.textContent = "Reset to default";
      reset.title = `Reset ${entry.parameter.name} to ${formatParameterValue(entry.parameter, entry.parameter.defaultValue)}`;
      reset.addEventListener("click", () => writePerformanceValue(entry, entry.parameter.defaultValue, reset));
      card.append(head, value, title, detail, liveControl, reset);
      grid.appendChild(card);
    }
    $("#performance-page-title").textContent = `Performance Page · ${state.performancePage}`;
  }


  function renderLiveParameters(editorState, slotInfo) {
    const { parameters, pages } = editorState;
    const visibleParameters = parameters.filter(parameter => parameter.name);
    const totalBusCount = state.liveIdentity
      ? state.liveIdentity.inputBusCount + state.liveIdentity.outputBusCount + state.liveIdentity.auxBusCount
      : 0;
    const list = $("#parameter-list");
    disarmEditorBusAssignment();
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
      defaultParameterColour(row, parameter);

      const name = document.createElement("div");
      name.className = "parameter-name";
      const titleLine = document.createElement("div");
      titleLine.className = "parameter-title-line";
      const strong = document.createElement("strong");
      strong.textContent = parameter.name;
      row.dataset.parameterIndex = String(parameter.index);
      row.title = `${parameter.name} · Parameter ${parameter.index + 1}`;

      const pendingMapping = document.createElement("button");
      pendingMapping.className = "map-shortcut";
      pendingMapping.type = "button";
      pendingMapping.dataset.mappingKey = mappingKey(slotInfo.index, parameter.index);
      const midi = parameter.mapping?.midi;
      if (midi?.enabled) {
        pendingMapping.classList.add("mapped");
        pendingMapping.title = `MIDI channel ${midi.channel} · ${midi.type}${midi.type === "CC" ? ` ${midi.cc}` : ""}`;
        pendingMapping.setAttribute("aria-label", `Edit mapping for ${parameter.name}`);
        pendingMapping.textContent = midi.type === "CC" ? `Ch ${midi.channel} · CC ${midi.cc}` : `Ch ${midi.channel} · ${midi.type}`;
      } else {
        pendingMapping.title = `Add mapping for ${parameter.name}`;
        pendingMapping.setAttribute("aria-label", `Add mapping for ${parameter.name}`);
        pendingMapping.textContent = "+";
      }
      titleLine.append(strong);
      name.append(titleLine, pendingMapping);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = String(parameter.min);
      slider.max = String(parameter.max);
      slider.value = String(Math.min(parameter.max, Math.max(parameter.min, parameter.value)));
      slider.setAttribute("aria-label", `${parameter.name}, live NT value`);
      updateRangeProgress(slider);

      const output = document.createElement("output");
      output.textContent = formatParameterValue(parameter);

      const busSlot = document.createElement("div");
      busSlot.className = "parameter-bus-slot";
      let busChip = null;
      const isBusAssignable = totalBusCount > 0
        && window.NTWebMIDITransport.isRoutingBusParameter(parameter, totalBusCount);
      if (isBusAssignable) {
        busChip = document.createElement("button");
        busChip.type = "button";
        busChip.className = "editor-bus-chip parameter-bus-chip";
        busChip.setAttribute("aria-pressed", "false");
        busSlot.appendChild(busChip);
      }

      row.append(name, slider, output, busSlot);
      const entry = {
        parameter,
        slotInfo,
        row,
        slider,
        output,
        busChip,
        confirmedValue: parameter.value,
        pendingSliderValue: null,
        sliderWriteRunning: false,
        sliderCommitPending: false,
        sliderInteracting: false,
        sliderHistoryStart: null,
        writePending: false,
        feedbackTimer: null
      };
      state.liveParameters.set(pendingMapping.dataset.mappingKey, entry);
      updateParameterBusChip(entry);
      if (busChip) busChip.addEventListener("click", () => armEditorBusAssignment(entry));
      slider.addEventListener("input", () => {
        const entry = state.liveParameters.get(pendingMapping.dataset.mappingKey);
        if (!entry) return;
        entry.sliderInteracting = true;
        updateRangeProgress(slider);
        if (entry.busChip) {
          previewLiveParameterEntry(entry, slider.value);
          return;
        }
        queueLiveSliderWrite(entry, slider.value);
      });
      slider.addEventListener("change", async () => {
        const entry = state.liveParameters.get(pendingMapping.dataset.mappingKey);
        if (!entry) return;
        entry.sliderInteracting = false;
        if (entry.busChip) {
          const value = Number(slider.value);
          if (value > 0) await assignEditorBusWithPopup(entry, value, slider);
          else queueLiveParameterWrite(entry, value, {
            historyRouting: true,
            successMessage: `${entry.parameter.name} disconnected in NT working memory`,
            afterWrite: async () => {
              if (state.liveRouting) await loadLiveRouting({ preserveView: true });
            }
          });
          return;
        }
        queueLiveSliderWrite(entry, slider.value, { commit: true });
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
      const colourName = colours[index % colours.length];
      button.className = `slot slot-accent-${colourName}${index === 0 ? " active" : ""}${slot.bypassed ? " bypassed" : ""}`;
      button.dataset.slot = slot.name;
      button.dataset.algorithm = slot.algorithmName;
      button.dataset.index = String(slot.index);
      button.draggable = true;
      const number = document.createElement("span");
      number.className = "slot-number";
      number.textContent = String(index + 1);
      const copy = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = slot.name;
      const algorithm = document.createElement("small");
      algorithm.textContent = slot.algorithmName;
      copy.append(name, algorithm);
      copy.appendChild(makeBypassToggle("slot-bypass-toggle", slot.index, slot.bypassed));
      const colour = document.createElement("i");
      colour.className = `slot-colour ${colourName}`;
      button.append(number, copy, colour);
      slotList.appendChild(button);
    });
    mappingSlotSelect.replaceChildren(...slots.map((slot, index) => {
      const option = document.createElement("option");
      option.value = String(slot.index);
      option.textContent = `${index + 1}. ${slot.name}`;
      return option;
    }));
    mappingSlotSelect.disabled = false;
    displaySlot($(".slot.active", slotList));
  }

  async function moveLiveSlot(fromSlot, toSlot, { record = true, announce = true } = {}) {
    if (!state.ntTransport || !state.transportOnline || fromSlot === toSlot) return false;
    const pendingPoll = stopLivePolling();
    slotList.classList.add("reordering");
    try {
      if (pendingPoll) await pendingPoll.catch(() => {});
      await state.ntTransport.moveAlgorithm(fromSlot, toSlot);
      const identity = await state.ntTransport.readSnapshot();
      state.liveIdentity = identity;
      state.performanceItems = [];
      state.performanceEntries.clear();
      showLiveIdentity(identity);
      const movedSlot = $(`.slot[data-index="${toSlot}"]`, slotList);
      if (movedSlot) displaySlot(movedSlot);
      if (state.liveRouting || state.view === "routing") await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      if (record) recordHistory({ type: "slot-move", fromSlot, toSlot, label: `move to slot ${toSlot + 1}` });
      if (announce) showToast(`Moved algorithm to slot ${toSlot + 1} and verified from the NT`);
      return true;
    } catch (error) {
      showToast(`Could not move algorithm · ${error.message}`);
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
      return false;
    } finally {
      slotList.classList.remove("reordering");
    }
  }

  async function stepEditHistory(direction) {
    if (state.historyBusy) return;
    if (!state.transportOnline) {
      showToast(`${direction === "undo" ? "Undo" : "Redo"} is unavailable while the NT is disconnected`);
      return;
    }
    const source = direction === "undo" ? state.undoHistory : state.redoHistory;
    const destination = direction === "undo" ? state.redoHistory : state.undoHistory;
    const action = source.pop();
    if (!action) {
      showToast(`Nothing to ${direction} yet`);
      return;
    }
    const control = direction === "undo" ? undoEdit : redoEdit;
    const idleLabel = direction === "undo" ? "Undo" : "Redo";
    state.historyBusy = true;
    updateHistoryControls();
    control.classList.add("working");
    control.textContent = direction === "undo" ? "Undoing…" : "Redoing…";
    showToast(`${direction === "undo" ? "Undoing" : "Redoing"} ${action.label}…`);
    let succeeded = false;
    if (action.type === "slot-move") {
      succeeded = direction === "undo"
        ? await moveLiveSlot(action.toSlot, action.fromSlot, { record: false, announce: false })
        : await moveLiveSlot(action.fromSlot, action.toSlot, { record: false, announce: false });
    }
    if (action.type === "parameter-batch") succeeded = await applyParameterHistory(action, direction);
    if (succeeded) {
      destination.push(action);
      control.classList.add("confirmed");
      control.textContent = direction === "undo" ? "Undone" : "Redone";
      showToast(`${direction === "undo" ? "Undid" : "Redid"} ${action.label} and verified from the NT`);
    } else {
      source.push(action);
      control.textContent = "Not changed";
    }
    state.historyBusy = false;
    updateHistoryControls();
    window.setTimeout(() => {
      control.classList.remove("working", "confirmed");
      control.textContent = idleLabel;
    }, succeeded ? 1100 : 1500);
  }

  function showLiveIdentity(identity) {
    state.hasUnsavedWorkingEdits = false;
    updateWorkingState();
    const presetName = identity.presetName || "Unnamed preset";
    $("#preset-title").textContent = presetName;
    $("#editor-heading").textContent = presetName;
    $("#editor-slot-count").textContent = `${identity.slotCount} slots`;
    $("#hardware-title").textContent = "disting NT · live";
    $("#hardware-detail").textContent = `${identity.version || "Unknown firmware"} · SysEx ID ${identity.sysexId}`;
    setHardwareStatus("Connected", true);
    editorEmptyState.classList.add("hidden");
    editorShell.classList.remove("hidden");
    renderEditorBusDock(identity);
    renderLiveSlots(identity.slots);
  }

  function setHardwareStatus(label, isGood = false) {
    const status = $("#hardware-status");
    status.textContent = label;
    status.classList.toggle("good", isGood);
  }

  function flushDisconnectedSession() {
    closeRoutingConnectionPanel();
    clearTimeout(state.routingReconcileTimer);
    state.routingReconcileTimer = null;
    stopLivePolling();
    stopCpuPolling();
    clearSmartFeedback();
    disarmEditorBusAssignment();
    state.parameterReadToken += 1;
    state.routingReadToken += 1;
    state.routingReadPromise = null;
    state.liveRouting = null;
    state.routingSnapshot = null;
    state.routingSelection = null;
    state.routingBusSelection = null;
    state.activeLiveSlotIndex = null;
    state.hasUnsavedWorkingEdits = false;
    state.liveParameters.forEach(entry => {
      entry.pendingSliderValue = null;
      entry.sliderCommitPending = false;
      entry.sliderInteracting = false;
      entry.slider.disabled = false;
      if (entry.busChip) entry.busChip.disabled = false;
      previewLiveParameterEntry(entry, entry.confirmedValue);
    });
    state.liveParameters.clear();
    state.performanceItems = [];
    state.performanceEntries.clear();
    state.performanceReadPromise = null;
    state.undoHistory.length = 0;
    state.redoHistory.length = 0;
    state.historyBusy = false;
    routingNodes.replaceChildren();
    routingIpadList.replaceChildren();
    routingWires.replaceChildren();
    routingAuxPalette.replaceChildren();
    routingLoading.classList.add("hidden");
    updateWorkingState();
    updateHistoryControls();
    updateEditorBusDockVisibility();
  }

  function markTransportOffline(message = "The disting NT MIDI endpoint disconnected.") {
    if (state.transportOnline) state.reloadAfterReconnect = true;
    state.transportOnline = false;
    flushDisconnectedSession();
    $("#midi-monitor-status").textContent = "Endpoint disconnected · waiting for the NT to return";
    setDeviceState("disconnected");
    stateBannerCopy.textContent = message;
    connectMIDI.textContent = "Reconnect";
    setHardwareStatus("Disconnected");
  }

  function scheduleTransportReconnect(delay = 600) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = null;
      if (connectMIDI.disabled) {
        scheduleTransportReconnect(delay);
        return;
      }
      readRealIdentity();
    }, delay);
  }

  function disconnectRealTransport() {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
    state.transportOnline = false;
    flushDisconnectedSession();
    state.selectedSlotIndex = null;
    if (state.ntTransport) state.ntTransport.disconnect();
    state.ntTransport = null;
    state.liveIdentity = null;
    state.liveRouting = null;
    editorBusDock.classList.add("hidden");
    routingLoading.classList.add("hidden");
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
              markTransportOffline();
              scheduleTransportReconnect(1200);
              showToast("The real NT MIDI endpoint disconnected");
              return;
            }
            if (event.type === "ports-changed") {
              $("#midi-monitor-status").textContent = `NT endpoints returned · reconnecting to ${event.input}`;
              if (!state.transportOnline && state.device === "disconnected") scheduleTransportReconnect();
            }
          }
        });
      }
      await state.ntTransport.connect();
      const identity = await state.ntTransport.readSnapshot();
      if (state.reloadAfterReconnect) {
        try {
          sessionStorage.setItem("ntPilotRebootRecovery", JSON.stringify({ view: state.view, at: Date.now() }));
        } catch (_) {
          // The browser reload still provides fresh Web MIDI objects if session storage is unavailable.
        }
        window.location.reload();
        return;
      }
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
      state.transportOnline = true;
      updateHistoryControls();
      state.liveIdentity = identity;
      state.performanceItems = [];
      state.performanceEntries.clear();
      showLiveIdentity(identity);
      startCpuPolling();
      setDeviceState("labConnected");
      connectMIDI.textContent = "Refresh";
      showToast(rebootRecovery ? `NT reconnected · refreshed ${identity.presetName || "unnamed preset"}` : `Read ${identity.presetName || "unnamed preset"} from the real NT`);
      rebootRecovery = null;
      if (state.view === "control") await loadPerformancePage();
      if (state.view === "routing") await loadLiveRouting();
    } catch (error) {
      markTransportOffline(error.message);
      $("#hardware-title").textContent = "disting NT";
      $("#hardware-detail").textContent = error.message;
      setHardwareStatus("Unavailable");
      showToast(error.message);
      // NT USB MIDI endpoints often return a moment after the device itself.
      // Keep reacquiring fresh Web MIDI port objects until the reboot settles.
      scheduleTransportReconnect(1200);
    } finally {
      connectMIDI.disabled = false;
    }
  }

  function resetEditorForConnection() {
    disconnectRealTransport();
    state.hasUnsavedWorkingEdits = false;
    updateWorkingState();
    resetMIDIMonitor();
    routingNodes.replaceChildren();
    routingWires.replaceChildren();
    slotList.replaceChildren();
    mappingSlotSelect.replaceChildren(new Option("Connect to choose an algorithm", ""));
    mappingSlotSelect.disabled = true;
    $("#mapping-items").replaceChildren();
    mappingCount.textContent = "No preset";
    mappingEmpty.classList.remove("hidden");
    mappingEmpty.textContent = "Connect and choose an algorithm to read its native MIDI mappings.";
    mappingForm.classList.add("hidden");
    mappingEmptyCard.classList.add("hidden");
    $("#editor-heading").textContent = "No preset loaded";
    $("#preset-title").textContent = "No preset loaded";
    editorShell.classList.add("hidden");
    editorEmptyState.classList.remove("hidden");
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = "No preset loaded";
    $("#parameter-fixture-note span").textContent = "Connect to read the current preset from the NT.";
    $("span", $("div", routingInspector)).textContent = "Routing graph";
    $("strong", $("div", routingInspector)).textContent = "Connect to inspect the complete loaded preset.";
    $("p", routingInspector).textContent = "No routing data has been requested from the NT yet.";
    $("#hardware-detail").textContent = "Waiting for MIDI connection";
    setHardwareStatus("Not connected");
    connectMIDI.textContent = "Connect";
    setDeviceState("labWaiting");
  }

  $$("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  const openReferenceGuide = () => {
    if (referenceGuide.open) return;
    referenceGuide.showModal();
    guideSearch.focus();
  };
  $("#reference-guide-card").addEventListener("click", openReferenceGuide);
  $("#reference-guide-card").addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openReferenceGuide();
    }
  });
  $("#close-reference-guide").addEventListener("click", () => referenceGuide.close());
  referenceGuide.addEventListener("click", event => {
    if (event.target === referenceGuide) referenceGuide.close();
  });
  guideSearch.addEventListener("input", () => {
    const query = guideSearch.value.trim().toLowerCase();
    let visible = 0;
    $$("section", $("#guide-topics")).forEach(topic => {
      const matches = !query || topic.textContent.toLowerCase().includes(query);
      topic.classList.toggle("hidden", !matches);
      const contentsLink = $(`.guide-wiki > nav a[href="#${topic.id}"]`);
      if (contentsLink) contentsLink.classList.toggle("hidden", !matches);
      if (matches) visible += 1;
    });
    guideResultCount.textContent = `${visible} ${visible === 1 ? "topic" : "topics"}`;
  });
  connectMIDI.addEventListener("click", readRealIdentity);
  savePreset.addEventListener("click", async () => {
    if (!state.ntTransport || !state.liveIdentity || !state.hasUnsavedWorkingEdits) return;
    const presetName = state.liveIdentity.presetName || "the current preset";
    if (!window.confirm(`Save ${presetName} to the NT now?\n\nThis overwrites the loaded preset file. Your parameter and routing edits have already been applied to the NT working memory.`)) return;
    savePreset.disabled = true;
    savePreset.textContent = "Saving…";
    try {
      state.ntTransport.savePreset(2);
      await new Promise(resolve => setTimeout(resolve, 350));
      state.hasUnsavedWorkingEdits = false;
      updateWorkingState();
      showToast("Save command sent to the NT");
    } catch (error) {
      showToast(error.message);
    } finally {
      savePreset.textContent = "Save preset";
      updateWorkingState();
    }
  });
  const handleRoutingSurfaceClick = async event => {
    if (activateBypassToggle(event.target)) return;
    if (await handleDerivedCountClick(event.target)) return;
    if (await handleRoutingModeClick(event.target)) return;
    if (await handleRoutingConnectionClick(event.target)) return;
    const node = event.target.closest(".routing-node.slot");
    if (node) {
      const slotIndex = Number(node.dataset.slotIndex);
      if (node.classList.contains("selected")) {
        selectRoutingSlot(null);
      } else {
        const slot = $(`.slot[data-index="${slotIndex}"]`, slotList);
        if (slot) displaySlot(slot);
      }
    }
  };
  routingNodes.addEventListener("click", handleRoutingSurfaceClick);
  routingIpadList.addEventListener("click", handleRoutingSurfaceClick);
  routingViewport.addEventListener("click", event => {
    if (!event.target.closest(".routing-node, .routing-port, button, input, label")) selectRoutingSlot(null);
  });
  routingAuxPalette.addEventListener("click", event => handleAuxPaletteClick(event.target));
  $("#routing-connection-cancel").addEventListener("click", closeRoutingConnectionPanel);
  routingConnectionPanel.addEventListener("submit", async event => {
    event.preventDefault();
    if (!routingConnectionAction) return;
    const action = routingConnectionAction;
    const apply = $("#routing-connection-apply");
    apply.disabled = true;
    apply.textContent = "Connecting…";
    try {
      await action();
      closeRoutingConnectionPanel();
    } finally {
      apply.disabled = false;
      apply.textContent = "Connect";
    }
  });
  let routingResizeFrame = null;
  window.addEventListener("resize", () => {
    if (state.view !== "routing" || !state.routingSnapshot) return;
    cancelAnimationFrame(routingResizeFrame);
    routingResizeFrame = requestAnimationFrame(() => {
      routingResizeFrame = null;
      fitRoutingGraph("auto");
    });
  });
  routingShowSignals.addEventListener("change", updateRoutingLayers);
  [routingShowInput, routingShowOutput, routingShowAux, routingShowMod].forEach(control => control.addEventListener("click", () => {
    const active = control.getAttribute("aria-pressed") === "true";
    const nextActive = !active;
    control.setAttribute("aria-pressed", String(nextActive));
    control.classList.toggle("active", nextActive);
    // A category cannot be visibly enabled while the master Signals switch is
    // suppressing it. Turning any category on also turns the master on.
    if (nextActive && !routingShowSignals.checked) routingShowSignals.checked = true;
    updateRoutingLayers();
  }));
  interfaceScaleDown.addEventListener("click", () => setInterfaceScale(state.interfaceScale - 10));
  interfaceScaleUp.addEventListener("click", () => setInterfaceScale(state.interfaceScale + 10));
  interfaceScaleValue.addEventListener("dblclick", () => setInterfaceScale(100));
  ipadModeControl.addEventListener("change", () => setIpadMode(ipadModeControl.checked));
  darkModeControl.addEventListener("change", () => setDarkMode(darkModeControl.checked));
  new ResizeObserver(updateBottomBusDockHeight).observe(editorBusDock);
  new ResizeObserver(updateBottomBusDockHeight).observe(routingAuxPalette);
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
    const anchor = captureRoutingAnchor(event.clientX, event.clientY);
    const previousZoom = state.routingZoom;
    const direction = event.deltaY > 0 ? -.08 : .08;
    state.routingZoom = Math.max(.2, Math.min(1.5, Number((previousZoom + direction).toFixed(2))));
    applyRoutingZoom();
    restoreRoutingAnchor(anchor, event.clientX, event.clientY);
  }, { passive: false });

  let routingDrag = null;
  const routingTouches = new Map();
  let routingPinch = null;
  let routingNativeTouch = null;
  const routingTouchGeometry = () => {
    const points = [...routingTouches.values()].slice(0, 2);
    if (points.length < 2) return null;
    return {
      distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2
    };
  };
  document.addEventListener("pointerdown", event => {
    state.lastRoutingPointer = { x: event.clientX, y: event.clientY };
  }, true);
  document.addEventListener("touchstart", event => {
    const touch = event.changedTouches?.[0] || event.touches?.[0];
    if (touch) state.lastRoutingPointer = { x: touch.clientX, y: touch.clientY };
  }, { capture: true, passive: true });
  routingViewport.addEventListener("pointerdown", event => {
    if (routingNativeTouch) return;
    if (event.pointerType === "touch") {
      routingTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      routingViewport.setPointerCapture(event.pointerId);
      const geometry = routingTouchGeometry();
      if (geometry) {
        routingPinch = {
          distance: Math.max(1, geometry.distance),
          zoom: state.routingZoom,
          anchor: captureRoutingAnchor(geometry.x, geometry.y)
        };
        routingDrag = null;
        routingViewport.classList.remove("dragging");
        event.preventDefault();
        return;
      }
    }
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
    if (routingNativeTouch) return;
    if (event.pointerType === "touch" && routingTouches.has(event.pointerId)) {
      routingTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const geometry = routingTouchGeometry();
      if (routingPinch && geometry) {
        state.routingZoom = Math.max(.2, Math.min(1.5, routingPinch.zoom * geometry.distance / routingPinch.distance));
        applyRoutingZoom();
        restoreRoutingAnchor(routingPinch.anchor, geometry.x, geometry.y);
        event.preventDefault();
        return;
      }
    }
    if (!routingDrag || event.pointerId !== routingDrag.pointerId) return;
    routingViewport.scrollLeft = routingDrag.left - (event.clientX - routingDrag.x);
    routingViewport.scrollTop = routingDrag.top - (event.clientY - routingDrag.y);
  });
  const finishRoutingDrag = event => {
    if (event.pointerType === "touch") {
      routingTouches.delete(event.pointerId);
      if (routingTouches.size < 2) {
        routingPinch = null;
        routingDrag = null;
        routingViewport.classList.remove("dragging");
      }
    }
    if (routingDrag && event.pointerId === routingDrag.pointerId) {
      routingDrag = null;
      routingViewport.classList.remove("dragging");
    }
  };
  routingViewport.addEventListener("pointerup", finishRoutingDrag);
  routingViewport.addEventListener("pointercancel", finishRoutingDrag);

  const nativeTouchGeometry = touches => {
    if (touches.length < 2) return null;
    const first = touches[0];
    const second = touches[1];
    return {
      distance: Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY),
      x: (first.clientX + second.clientX) / 2,
      y: (first.clientY + second.clientY) / 2
    };
  };
  const beginNativeRoutingPinch = touches => {
    const geometry = nativeTouchGeometry(touches);
    if (!geometry) return false;
    routingNativeTouch = {
      mode: "pinch",
      distance: Math.max(1, geometry.distance),
      zoom: state.routingZoom,
      anchor: captureRoutingAnchor(geometry.x, geometry.y)
    };
    routingDrag = null;
    routingViewport.classList.remove("dragging");
    return true;
  };
  routingViewport.addEventListener("touchstart", event => {
    if (event.touches.length >= 2) {
      beginNativeRoutingPinch(event.touches);
      event.preventDefault();
      return;
    }
    const touch = event.touches[0];
    if (!touch || event.target.closest("button, input, label, .routing-node.endpoint, .routing-port")) {
      routingNativeTouch = { mode: "tap" };
      return;
    }
    routingNativeTouch = {
      mode: "pan",
      x: touch.clientX,
      y: touch.clientY,
      left: routingViewport.scrollLeft,
      top: routingViewport.scrollTop
    };
  }, { passive: false });
  routingViewport.addEventListener("touchmove", event => {
    if (event.touches.length >= 2) {
      if (routingNativeTouch?.mode !== "pinch") beginNativeRoutingPinch(event.touches);
      const geometry = nativeTouchGeometry(event.touches);
      if (!geometry || routingNativeTouch?.mode !== "pinch") return;
      state.routingZoom = Math.max(.2, Math.min(1.5, routingNativeTouch.zoom * geometry.distance / routingNativeTouch.distance));
      applyRoutingZoom();
      restoreRoutingAnchor(routingNativeTouch.anchor, geometry.x, geometry.y);
      event.preventDefault();
      return;
    }
    if (routingNativeTouch?.mode !== "pan" || event.touches.length !== 1) return;
    const touch = event.touches[0];
    routingViewport.scrollLeft = routingNativeTouch.left - (touch.clientX - routingNativeTouch.x);
    routingViewport.scrollTop = routingNativeTouch.top - (touch.clientY - routingNativeTouch.y);
    event.preventDefault();
  }, { passive: false });
  const finishNativeRoutingTouch = event => {
    if (event.touches.length === 1 && routingNativeTouch?.mode === "pinch") {
      const touch = event.touches[0];
      routingNativeTouch = {
        mode: "pan",
        x: touch.clientX,
        y: touch.clientY,
        left: routingViewport.scrollLeft,
        top: routingViewport.scrollTop
      };
      return;
    }
    if (!event.touches.length) routingNativeTouch = null;
  };
  routingViewport.addEventListener("touchend", finishNativeRoutingTouch, { passive: false });
  routingViewport.addEventListener("touchcancel", finishNativeRoutingTouch, { passive: false });
  ["gesturestart", "gesturechange", "gestureend"].forEach(type => {
    routingViewport.addEventListener(type, event => event.preventDefault(), { passive: false });
  });
  midiMonitorFilter.addEventListener("change", renderMIDIMonitor);
  $("#clear-midi-monitor").addEventListener("click", resetMIDIMonitor);
  $("#sysex-id").addEventListener("change", () => {
    disconnectRealTransport();
    connectMIDI.textContent = "Connect";
    setDeviceState("labWaiting");
  });

  syncModeControl.addEventListener("change", () => setSyncMode(syncModeControl.value));
  undoEdit.addEventListener("click", () => stepEditHistory("undo"));
  redoEdit.addEventListener("click", () => stepEditHistory("redo"));
  document.addEventListener("keydown", event => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== "z") return;
    if (event.target.closest("input, textarea, select, [contenteditable=true]")) return;
    event.preventDefault();
    stepEditHistory(event.shiftKey ? "redo" : "undo");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLivePolling();
      stopCpuPolling();
      return;
    }
    if (state.transportOnline) startCpuPolling();
    if (state.activeLiveSlotIndex != null) {
      startLivePolling(state.activeLiveSlotIndex);
    }
  });

  slotList.addEventListener("click", event => {
    if (activateBypassToggle(event.target)) return;
    const slot = event.target.closest(".slot:not(.muted)");
    if (slot) displaySlot(slot);
  });
  let draggedSlotIndex = null;
  let slotDropIndex = null;
  const clearSlotDragState = () => {
    draggedSlotIndex = null;
    slotDropIndex = null;
    $$(".slot", slotList).forEach(slot => slot.classList.remove("dragging", "drop-before", "drop-after"));
  };
  slotList.addEventListener("dragstart", event => {
    if (event.target.closest("[data-bypass-slot]")) {
      event.preventDefault();
      return;
    }
    const slot = event.target.closest(".slot");
    if (!slot || !state.transportOnline) return;
    draggedSlotIndex = Number(slot.dataset.index);
    slot.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedSlotIndex));
  });
  slotList.addEventListener("dragover", event => {
    if (draggedSlotIndex == null) return;
    const target = event.target.closest(".slot");
    if (!target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    $$(".slot", slotList).forEach(slot => slot.classList.remove("drop-before", "drop-after"));
    const bounds = target.getBoundingClientRect();
    const after = event.clientY > bounds.top + bounds.height / 2;
    target.classList.add(after ? "drop-after" : "drop-before");
    slotDropIndex = Number(target.dataset.index) + (after ? 1 : 0);
  });
  slotList.addEventListener("drop", event => {
    if (draggedSlotIndex == null || slotDropIndex == null) return;
    event.preventDefault();
    const fromSlot = draggedSlotIndex;
    let toSlot = slotDropIndex;
    if (toSlot > fromSlot) toSlot -= 1;
    toSlot = Math.max(0, Math.min(state.liveIdentity.slots.length - 1, toSlot));
    clearSlotDragState();
    moveLiveSlot(fromSlot, toSlot);
  });
  slotList.addEventListener("dragend", clearSlotDragState);
  [slotList, routingNodes, routingIpadList].forEach(container => container.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-bypass-slot]")) {
      event.preventDefault();
      event.stopPropagation();
      activateBypassToggle(event.target);
    }
  }));
  editorBusDock.addEventListener("click", async event => {
    const chip = event.target.closest(".editor-bus-chip[data-value]");
    if (!chip || chip.disabled) return;
    const value = Number(chip.dataset.value);
    const descriptor = editorBusDescriptor(value);
    if (value > 0 && await retargetOpenRoutingConnection(value - 1, chip)) return;
    const entry = state.armedBusEntry;
    if (!entry) {
      showToast("Tap the bus chip at the right of a parameter first");
      return;
    }
    if (value < entry.parameter.min || value > entry.parameter.max) return;
    if (value > 0) {
      await assignEditorBusWithPopup(entry, value, chip);
      return;
    }
    queueLiveParameterWrite(entry, value, {
      historyRouting: true,
      successMessage: `${entry.parameter.name} assigned to ${descriptor.label} in NT working memory`,
      afterWrite: async () => {
        if (state.liveRouting) await loadLiveRouting({ preserveView: true });
      },
      onSuccess: () => {
        if (descriptor.kind === "aux") applyPilotAccentFromAux(descriptor.bus, state.liveIdentity);
        disarmEditorBusAssignment();
      }
    });
  });
  mappingSlotSelect.addEventListener("change", () => {
    const slot = $(`.slot[data-index="${mappingSlotSelect.value}"]`, slotList);
    if (slot) displaySlot(slot);
  });
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

  $$("[data-performance-page]").forEach(button => button.addEventListener("click", () => {
    state.performancePage = Number(button.dataset.performancePage);
    $$("[data-performance-page]").forEach(item => item.classList.toggle("active", item === button));
    renderPerformanceControls();
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
      showToast(`${state.selectedMapping.dataset.name} mapping preview updated`);
    }, 950);
  });

  const refreshButton = $(".refresh-button");
  if (refreshButton) refreshButton.addEventListener("click", readRealIdentity);

  stateAction.addEventListener("click", () => {
    if (state.device === "labWaiting" || state.device === "labConnected") {
      readRealIdentity();
      return;
    }
    if (state.device === "owned") {
      showToast("Control request sent to the current owner");
      return;
    }
    readRealIdentity();
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
  let savedInterfaceScale = 100;
  try {
    savedInterfaceScale = Number(localStorage.getItem("ntPilotInterfaceScale")) || 100;
  } catch (_) {
    savedInterfaceScale = 100;
  }
  setInterfaceScale(savedInterfaceScale, { save: false });
  let savedDarkMode = false;
  try {
    const storedDarkMode = localStorage.getItem("ntPilotDarkMode");
    savedDarkMode = storedDarkMode == null
      ? Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      : storedDarkMode === "true";
  } catch (_) {
    savedDarkMode = false;
  }
  setDarkMode(savedDarkMode, { save: false });
  let savedIpadMode = false;
  try {
    const storedIpadMode = localStorage.getItem("ntPilotIpadMode");
    savedIpadMode = storedIpadMode == null
      ? localStorage.getItem("ntPilotBusDockLayout") === "bottom"
      : storedIpadMode === "true";
  } catch (_) {
    savedIpadMode = false;
  }
  setIpadMode(savedIpadMode, { save: false });
  resetEditorForConnection();
  const recoveredView = ["editor", "routing", "mapping", "control", "status", "assistant"].includes(rebootRecovery?.view)
    ? rebootRecovery.view
    : "editor";
  setView(recoveredView);
  readRealIdentity();
})();
