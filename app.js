(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const routingLogic = window.NTPilotRoutingLogic;
  const storageLogic = window.NTPilotStorageLogic;
  const { OperationScheduler } = window.NTPilotOperationScheduler;
  const deviceLogic = window.NTPilotDeviceLogic;

  const connectionPill = $("#connection-pill");
  const connectionLabel = $("#connection-label");
  const deviceFrame = $("#device-frame");
  const appMain = $(".app-main");
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
  const interfaceScaleControl = $(".interface-scale");
  const sidebarUtilityStack = $(".sidebar-utility-stack");
  const sidebarEdgeToggle = $("#sidebar-edge-toggle");
  const ipadModeControl = $("#ipad-mode");
  const darkModeControl = $("#dark-mode");
  const syncModeControl = $("#sync-mode");
  const syncPickerTrigger = $("#sync-picker-trigger");
  const syncPickerValue = $("#sync-picker-value");
  const syncPickerOptions = $("#sync-picker-options");
  const statusSyncControl = $(".status-sync");
  sidebarUtilityStack.insertBefore(statusSyncControl, interfaceScaleControl);
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
  const addAlgorithmButton = $("#add-algorithm");
  const algorithmBrowser = $("#algorithm-browser");
  const closeAlgorithmBrowser = $("#close-algorithm-browser");
  const algorithmBrowserSearch = $("#algorithm-browser-search");
  const algorithmBrowserList = $("#algorithm-browser-list");
  const algorithmBrowserPlacement = $("#algorithm-browser-placement");
  const algorithmBrowserPlacementActions = $("#algorithm-browser-placement-actions");
  const algorithmSpecDialog = $("#algorithm-spec-dialog");
  const closeAlgorithmSpec = $("#close-algorithm-spec");
  const algorithmSpecName = $("#algorithm-spec-name");
  const algorithmSpecList = $("#algorithm-spec-list");
  const algorithmSpecNotice = $("#algorithm-spec-notice");
  const cancelAlgorithmSpec = $("#cancel-algorithm-spec");
  const confirmAlgorithmSpec = $("#confirm-algorithm-spec");
  const algorithmLoadDialog = $("#algorithm-load-dialog");
  const closeAlgorithmLoad = $("#close-algorithm-load");
  const algorithmLoadKicker = $("#algorithm-load-kicker");
  const algorithmLoadTitle = $("#algorithm-load-title");
  const algorithmLoadName = $("#algorithm-load-name");
  const algorithmLoadDetail = $("#algorithm-load-detail");
  const algorithmLoadWarning = $("#algorithm-load-warning");
  const algorithmLoadInsert = $("#algorithm-load-insert");
  const algorithmLoadPlacement = $("#algorithm-load-placement");
  const algorithmLoadSpecList = $("#algorithm-load-spec-list");
  const algorithmLoadSpecNotice = $("#algorithm-load-spec-notice");
  const cancelAlgorithmLoad = $("#cancel-algorithm-load");
  const confirmAlgorithmLoad = $("#confirm-algorithm-load");
  const algorithmRemoveDialog = $("#algorithm-remove-dialog");
  const closeAlgorithmRemove = $("#close-algorithm-remove");
  const algorithmRemoveName = $("#algorithm-remove-name");
  const cancelAlgorithmRemove = $("#cancel-algorithm-remove");
  const confirmAlgorithmRemove = $("#confirm-algorithm-remove");
  const refreshPresets = $("#refresh-presets");
  const newPresetFolder = $("#new-preset-folder");
  const presetUp = $("#preset-up");
  const presetBreadcrumbs = $("#preset-breadcrumbs");
  const presetFileList = $("#preset-file-list");
  const presetInspector = $("#preset-inspector");
  const presetLoadDialog = $("#preset-load-dialog");
  const closePresetLoad = $("#close-preset-load");
  const presetLoadKicker = $("#preset-load-kicker");
  const presetLoadTitle = $("#preset-load-title");
  const presetLoadName = $("#preset-load-name");
  const presetLoadDetail = $("#preset-load-detail");
  const presetLoadWarning = $("#preset-load-warning");
  const cancelPresetLoad = $("#cancel-preset-load");
  const confirmPresetLoad = $("#confirm-preset-load");
  const presetFileDialog = $("#preset-file-dialog");
  const closePresetFileDialog = $("#close-preset-file-dialog");
  const presetFileDialogKicker = $("#preset-file-dialog-kicker");
  const presetFileDialogTitle = $("#preset-file-dialog-title");
  const presetFileDialogName = $("#preset-file-dialog-name");
  const presetFileDialogDetail = $("#preset-file-dialog-detail");
  const presetFileDialogField = $("#preset-file-dialog-field");
  const presetFileDialogInput = $("#preset-file-dialog-input");
  const cancelPresetFileDialog = $("#cancel-preset-file-dialog");
  const confirmPresetFileDialog = $("#confirm-preset-file-dialog");
  const presetJsonDialog = $("#preset-json-dialog");
  const closePresetJsonDialog = $("#close-preset-json-dialog");
  const presetJsonDialogTitle = $("#preset-json-dialog-title");
  const presetJsonDialogName = $("#preset-json-dialog-name");
  const presetJsonNameField = $("#preset-json-name-field");
  const presetJsonNameInput = $("#preset-json-name-input");
  const presetJsonDialogInput = $("#preset-json-dialog-input");
  const presetJsonDialogStatus = $("#preset-json-dialog-status");
  const cancelPresetJsonDialog = $("#cancel-preset-json-dialog");
  const confirmPresetJsonDialog = $("#confirm-preset-json-dialog");
  const assistantWorkspace = $("#assistant-workspace");
  const assistantConversation = $(".assistant-conversation");
  const assistantThread = $("#messages");
  const assistantComposeArea = $(".assistant-compose-area", assistantConversation);
  const assistantDock = $("#assistant-dock");
  const assistantDockContent = $("#assistant-dock-content");
  const assistantDockTitle = $("#assistant-dock-title");
  const assistantDockResize = $("#assistant-dock-resize");
  const assistantInput = $("#chat-input");
  const assistantHeading = $("#assistant-heading");
  const assistantSessionTitle = $("#assistant-session-title");
  const assistantDraftContext = $("#assistant-draft-context");
  const assistantAttachmentOptions = $("#assistant-attachment-options");
  const assistantAttachButton = $("#assistant-attach-button");
  const assistantFileInput = $("#assistant-file-input");
  const assistantImageInput = $("#assistant-image-input");
  const assistantFolderInput = $("#assistant-folder-input");
  const assistantAttachmentsCard = $("#assistant-attachments-card");
  const assistantAttachmentsSummary = $("#assistant-attachments-summary");
  const assistantAttachmentList = $("#assistant-attachment-list");
  const assistantSessionList = $("#assistant-session-list");
  const assistantProviderStatus = $("#assistant-provider-status");
  const assistantProviderReadiness = $("#assistant-provider-readiness");
  const assistantModelSetting = $("#assistant-model-setting");
  const assistantModelSelect = $("#assistant-model-select");
  const assistantAccountName = $("#assistant-account-name");
  const assistantAccountDetail = $("#assistant-account-detail");
  const assistantComposeNote = $("#assistant-compose-note");
  const assistantDraftAttachments = new Map();

  let rebootRecovery = null;
  try {
    rebootRecovery = JSON.parse(sessionStorage.getItem("ntPilotRebootRecovery") || "null");
    sessionStorage.removeItem("ntPilotRebootRecovery");
  } catch (_) {
    rebootRecovery = null;
  }

  const MAX_ALGORITHM_SLOTS = 40;
  // The official browser and NT Helper's preset scanner enter the card's
  // conventional preset directory as `/presets/`.
  const PRESET_LIBRARY_ROOT = "/presets/";
  const state = {
    ntTransport: null,
    transportOnline: false,
    reconnectTimer: null,
    reloadAfterReconnect: false,
    liveIdentity: null,
    routingReadPromise: null,
    routingReconcileTimer: null,
    routingModeHydrationPromise: null,
    routingReadToken: 0,
    routingZoom: 1,
    interfaceScale: 100,
    ipadMode: false,
    darkMode: false,
    sidebarCollapsed: false,
    assistantDocked: false,
    assistantHostAvailable: false,
    assistantAccount: null,
    assistantLogin: null,
    assistantThreadId: null,
    assistantThreads: [],
    assistantModels: [],
    assistantSending: false,
    pilotAccentHue: 164,
    routingCanvasSize: { width: 1180, height: 760 },
    routingSnapshot: null,
    routingSelection: null,
    routingBusSelection: null,
    device: "ready",
    view: "editor",
    mappingDirty: false,
    mappingWriteBusy: false,
    selectedMapping: null,
    mappingBaseline: null,
    toastTimer: null,
    learnTimer: null,
    parameterReadToken: 0,
    parameterReadInFlight: Promise.resolve(),
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
    cpuInFlight: null,
    midiEvents: [],
    midiRenderPending: false,
    midiCounts: { all: 0, channel: 0, sysex: 0 },
    algorithmBrowserFilter: "all",
    algorithmLoadStep: "load",
    pendingAlgorithm: null,
    pendingAlgorithmPlacement: null,
    pendingSlotRemoval: null,
    pendingPluginLoad: null,
    slotMutationBusy: false,
    presetPath: PRESET_LIBRARY_ROOT,
    presetEntries: [],
    selectedPresetEntry: null,
    presetBrowserBusy: false,
    presetBrowserError: null,
    pendingPresetLoad: null,
    pendingPresetFileOperation: null,
    pendingPresetDocument: null,
  };
  let hardwareResumeSlotIndex = null;
  const hardwareOperations = new OperationScheduler({
    before: async ({ kind }) => {
      const context = {
        activeSlotIndex: state.activeLiveSlotIndex,
        pendingPoll: stopLivePolling()
      };
      stopCpuPolling();
      await context.pendingPoll?.catch(() => {});
      await state.cpuInFlight?.catch(() => {});
      return context;
    },
    after: async ({ context }) => {
      hardwareResumeSlotIndex = state.activeLiveSlotIndex ?? context?.activeSlotIndex ?? null;
    },
    onStateChange: ({ busy }) => {
      if (busy) return;
      const resumeSlotIndex = hardwareResumeSlotIndex;
      hardwareResumeSlotIndex = null;
      if (!state.ntTransport || !state.transportOnline) return;
      startCpuPolling();
      if (resumeSlotIndex != null) startLivePolling(resumeSlotIndex);
    }
  });
  let algorithmMemoryCheckToken = 0;
  let algorithmMemoryCheckTimer = null;

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
      await runSlotMutationTransportOperation(async () => {
        for (const change of action.changes) {
          await state.ntTransport.writeParameter(change.slotIndex, change.parameterIndex, change[target]);
        }
      });
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
            const routingSlot = state.routingSnapshot?.slots.find(slot => slot.index === change.slotIndex);
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

  function friendlyToastMessage(message) {
    const text = userFacingText(message);
    if (/null is not an object|undefined is not an object|cannot read propert/i.test(text)) return "That view changed unexpectedly. Refresh and try again.";
    if (/readback did not match/i.test(text)) return "The NT did not confirm that change. Refresh and try again.";
    if (/timed? out|timeout/i.test(text)) return "The NT did not respond. Try again.";
    if (/unknown bus|bus unavailable/i.test(text)) return "That bus is no longer available. Refresh Routing.";
    return text;
  }

  function showToast(message, tone = "status") {
    clearTimeout(state.toastTimer);
    const raw = userFacingText(message);
    const inferredError = /failed|could not|did not|no longer|unexpected|invalid|timed? out|unavailable|\berror\b/i.test(raw);
    const resolvedTone = tone === "error" || inferredError ? "error" : tone;
    if (resolvedTone === "error") console.warn("NT Pilot:", raw);
    const visibleMessage = friendlyToastMessage(raw);
    $("span", toast).textContent = visibleMessage;
    toast.classList.toggle("error", resolvedTone === "error");
    toast.classList.toggle("guidance", resolvedTone === "guidance");
    toast.classList.add("visible");
    const timing = resolvedTone === "error"
      ? { base: 6500, perCharacter: 34, maximum: 12000 }
      : resolvedTone === "guidance"
        ? { base: 2600, perCharacter: 28, maximum: 7000 }
        : { base: 1400, perCharacter: 28, maximum: 5000 };
    const duration = Math.min(timing.maximum, timing.base + visibleMessage.length * timing.perCharacter);
    state.toastTimer = setTimeout(() => toast.classList.remove("visible"), duration);
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
    captureMIDILearn(event.message);
    if (event.message.subtype === "cc") applyLiveCCFeedback(event.message);
  }

  function stopMIDILearn(message = null) {
    clearTimeout(state.learnTimer);
    state.learnTimer = null;
    const button = $("#learn-button");
    button.classList.remove("listening");
    $("#learn-label").textContent = "Learn";
    if (message) showToast(message);
  }

  function captureMIDILearn(message) {
    if (!state.learnTimer || message.kind !== "channel" || !state.selectedMapping) return;
    let type = null;
    let controller = 0;
    if (message.subtype === "cc") {
      type = "CC";
      controller = message.controller;
    } else if (message.subtype === "note-on") {
      type = "Note — momentary";
      controller = message.note;
    } else if (message.subtype === "pitch-bend") {
      type = "Pitch bend";
    } else if (message.subtype === "channel-pressure") {
      type = "Channel pressure";
    }
    if (!type) return;
    mapChannel.value = String(message.channel);
    mapType.value = type;
    mapCC.value = String(controller);
    mapEnabled.checked = true;
    markMappingDirty();
    stopMIDILearn(`Captured ${message.label}`);
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
    updateAssistantContext();
  }

  function updateAssistantContext() {
    if (!assistantWorkspace) return;
    const identity = state.liveIdentity;
    const connected = Boolean(state.transportOnline && state.ntTransport && identity);
    const deviceStatus = $("#assistant-device-status");
    const deviceDetail = $("#assistant-device-detail");
    const deviceIndicator = $("#assistant-device-indicator");
    const presetName = $("#assistant-preset-name");
    const presetDetail = $("#assistant-preset-detail");
    const workingStatus = $("#assistant-working-status");
    const liveContextChip = $("#assistant-live-context-chip");
    const readiness = $("#assistant-device-readiness");

    if (connected) {
      const name = identity.presetName || "Unnamed preset";
      deviceStatus.textContent = "disting NT connected";
      deviceDetail.textContent = `${identity.version || "Unknown firmware"} · SysEx ID ${identity.sysexId}`;
      deviceIndicator.classList.add("live");
      presetName.textContent = name;
      presetDetail.textContent = `${identity.slotCount ?? identity.slots?.length ?? 0} / ${MAX_ALGORITHM_SLOTS} algorithm slots · live working state`;
      workingStatus.textContent = state.hasUnsavedWorkingEdits ? "Unsaved working changes" : "No unsaved changes";
      workingStatus.classList.toggle("unsaved", state.hasUnsavedWorkingEdits);
      liveContextChip.classList.add("live");
      $("b", liveContextChip).textContent = `${name} · live`;
      readiness.classList.add("ready");
      $("i", readiness).textContent = "✓";
      $("small", readiness).textContent = `${name} · ${identity.slotCount ?? identity.slots?.length ?? 0} slots`;
      return;
    }

    const reconnecting = state.device === "syncing" || state.device === "disconnected";
    deviceStatus.textContent = reconnecting ? "Waiting for disting NT" : "No NT connected";
    deviceDetail.textContent = reconnecting
      ? "The Assistant will refresh live context when the MIDI endpoint returns."
      : "Connect the module to add live firmware and device state.";
    deviceIndicator.classList.remove("live");
    presetName.textContent = "Unavailable";
    presetDetail.textContent = "No live preset has been read.";
    workingStatus.textContent = "Read-only context";
    workingStatus.classList.remove("unsaved");
    liveContextChip.classList.remove("live");
    $("b", liveContextChip).textContent = reconnecting ? "NT reconnecting" : "No live NT";
    readiness.classList.remove("ready");
    $("i", readiness).textContent = "○";
    $("small", readiness).textContent = reconnecting ? "Waiting for the module to return" : "Connect the module to inspect it";
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
    const operation = runHardwareOperation("parameter-write", async () => {
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
    const operation = runHardwareOperation("parameter-stream", async () => {
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

  function cpuMeterColour(value) {
    const percent = Math.max(0, Math.min(90, Number(value) || 0));
    const hue = percent <= 60
      ? 165 - (percent / 60) * 90
      : percent <= 75
        ? 75 - ((percent - 60) / 15) * 40
        : 35 - ((percent - 75) / 15) * 35;
    return `hsl(${Math.round(hue)} 72% ${state.darkMode ? 66 : 39}%)`;
  }

  function updateCpuMeter(element, value) {
    element.style.setProperty("--cpu-colour", cpuMeterColour(value));
    $("b", element).textContent = `${value}%`;
    element.classList.toggle("danger", Number(value) >= 90);
  }

  function startCpuPolling() {
    stopCpuPolling();
    const cpuLabel = $("#editor-cpu-usage");
    const audioMeter = $("#audio-cpu-meter");
    const overallMeter = $("#overall-cpu-meter");
    const poll = async () => {
      if (!state.ntTransport || !state.transportOnline || document.hidden) return;
      if (hardwareOperations.busy || state.slotMutationBusy || state.pollInFlight || state.routingReadPromise || state.performanceReadPromise) {
        state.cpuTimer = setTimeout(poll, 2000);
        return;
      }
      const request = state.ntTransport.readCpuUsage();
      state.cpuInFlight = request;
      try {
        const usage = await request;
        updateCpuMeter(audioMeter, usage.audioThread);
        updateCpuMeter(overallMeter, usage.overall);
        audioMeter.title = `Algorithm/audio CPU ${usage.audioThread}%. Expert Sleepers recommends keeping this below about 90%.`;
        overallMeter.title = `Overall CPU ${usage.overall}%. This also includes MicroSD and other background activity.`;
        cpuLabel.title = `Audio ${usage.audioThread}% · Overall ${usage.overall}%`;
      } catch (_) {
        // Other live reads have priority on the NT's single-request transport.
      } finally {
        if (state.cpuInFlight === request) state.cpuInFlight = null;
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
    syncPickerValue.textContent = label;
    $$("[data-sync-mode]", syncPickerOptions).forEach(option => option.setAttribute("aria-selected", String(option.dataset.syncMode === mode)));
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
    if (delay == null || hardwareOperations.busy || state.slotMutationBusy || !state.ntTransport || !state.transportOnline || document.hidden) return;
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
          console.warn("NT Pilot live refresh delayed:", error);
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

  function applyPilotAccentFromBus(bus, identity = state.routingSnapshot || state.liveIdentity) {
    if (!identity || !Number.isInteger(Number(bus))) return;
    bus = Number(bus);
    const kind = routingBusKind(bus, identity);
    if (kind === "input") {
      applyPilotAccentHue(212);
      return;
    }
    if (kind === "output") {
      applyPilotAccentHue(0);
      return;
    }
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
    const dock = state.ipadMode ? routingAuxPalette : editorBusDock;
    editorBusDock.classList.toggle("armed", Boolean(entry));
    $$(state.ipadMode ? ".routing-aux-chip[data-bus]" : ".editor-bus-chip[data-value]", dock).forEach(chip => {
      const value = state.ipadMode ? Number(chip.dataset.bus) + 1 : Number(chip.dataset.value);
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
    // iPad mode deliberately reuses the Routing palette as the only bottom
    // rail. Keeping this desktop-only avoids a second, almost-identical UI.
    editorBusDock.classList.toggle("hidden", state.ipadMode || !state.transportOnline || !state.liveIdentity || state.view !== "editor");
    updateBottomBusDockHeight();
  }

  function updateBottomBusDockHeight() {
    requestAnimationFrame(() => {
      const activeDock = !editorBusDock.classList.contains("hidden")
        ? editorBusDock
        : !routingAuxPalette.classList.contains("hidden") && routingAuxPalette.parentElement === deviceFrame
          ? routingAuxPalette
          : null;
      const height = state.ipadMode && activeDock
        ? Math.ceil(activeDock.getBoundingClientRect().height)
        : 0;
      deviceFrame.style.setProperty("--bottom-bus-dock-height", `${height}px`);
    });
  }

  function updateRoutingPaletteVisibility() {
    if (state.ipadMode) {
      const visible = state.view === "routing" || state.view === "editor";
      routingAuxPalette.classList.toggle("hidden", !visible);
      if (visible && state.view === "editor" && state.liveIdentity) {
        renderAuxPalette(state.liveIdentity);
        refreshEditorBusDockState();
      }
    }
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
    if (state.liveIdentity) renderEditorBusDock(state.liveIdentity);
    if (state.routingSnapshot) renderAuxPalette(state.routingSnapshot);
    updateRoutingPaletteVisibility();
    updateBottomBusDockHeight();
  }

  function setIpadMode(enabled, { save = true } = {}) {
    state.ipadMode = Boolean(enabled);
    ipadModeControl.checked = state.ipadMode;
    referenceGuide.classList.toggle("ipad-guide", state.ipadMode);
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
    const snapshots = state.routingSnapshot ? [state.routingSnapshot] : [];
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
    applyPilotAccentFromBus(destinationBus, state.routingSnapshot || state.liveIdentity);
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
    routingExistingRoutesField.classList.toggle("hidden", !allowRouteChanges || isInputAssignment);
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
      applyPilotAccentFromBus(bus, state.routingSnapshot);
      return result;
    }
    if (!state.routingSelection) {
      state.routingSelection = selection;
      port.classList.add("routing-selected-source");
      refreshRoutingPaletteAvailability(selection);
      showToast(selection.parameterIndex == null ? "Choose an algorithm port" : "Choose a compatible port or bus", "guidance");
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
        showToast("Connection removed");
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
      await runHardwareOperation("routing-mutation", async () => {
        await state.ntTransport.writeParameter(slotIndex, parameterIndex, next);
        await loadLiveRouting({ preserveView: true, withinOperation: true });
      });
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
    const originalMode = modeChoice?.details.currentMode;
    const connectingOutput = [first, second].find(item => item.side === "output" && item.parameterIndex != null);
    try {
      const result = await runHardwareOperation("routing-mutation", () => routingLogic.executeRoutingTransaction({
        modeChange: modeChoice ? { before: originalMode, after: modeChoice.mode } : null,
        routesToRemove,
        writeMode: mode => chooseRoutingOutputMode(modeChoice.details, mode),
        writeRoute: writeRoutingSelection,
        apply: () => connectRoutingSelections(first, second)
      }));
      markWorkingEdit();
      recordRoutingHistory(historyBefore, `change routing for ${routingSelectionLabel(connectingOutput || first)}`);
      const routeCopy = result.removedRoutes.length ? ` · removed ${result.removedRoutes.length} previous route${result.removedRoutes.length === 1 ? "" : "s"}` : "";
      const modeCopy = modeChoice ? ` · ${modeChoice.mode === "replace" ? "Replace" : "Add"} mode` : "";
      showToast(`Connected${routeCopy}${modeCopy}`);
      scheduleRoutingReconciliation();
    } catch (error) {
      showToast(error.rollbackErrors?.length ? `${error.message} Rollback also failed; refresh routing.` : error.message);
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

  async function writeRoutingSelection(selection, bus) {
    if (selection.parameterIndex == null || selection.slotIndex == null) throw new Error("That route has no writable NT parameter.");
    if (!routingSelectionAcceptsBus(selection, bus)) {
      throw new Error(`${routingBusLabel(bus, state.routingSnapshot)} is outside this port's permitted bus range.`);
    }
    await state.ntTransport.writeParameter(selection.slotIndex, selection.parameterIndex, bus + 1);
    updateRoutingSnapshotParameter(selection.slotIndex, selection.parameterIndex, bus + 1);
  }

  async function connectRoutingSelections(first, second) {
    const snapshot = state.routingSnapshot;
    const plan = routingLogic.planRoutingConnection(first, second, {
      usedBuses: routingUsedBuses(),
      firstAux: snapshot.inputBusCount + snapshot.outputBusCount,
      auxCount: snapshot.auxBusCount
    });
    await routingLogic.executeConnectionPlan(plan, writeRoutingSelection);
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
    const originalMode = modeChoice?.details.currentMode;
    const originalBus = selection.bus;
    const historyBefore = captureRoutingParameterState();
    try {
      await runHardwareOperation("routing-mutation", () => routingLogic.executeRoutingTransaction({
        modeChange: modeChoice ? { before: originalMode, after: modeChoice.mode } : null,
        routesToRemove,
        writeMode: mode => chooseRoutingOutputMode(modeChoice.details, mode),
        writeRoute: writeRoutingSelection,
        apply: () => writeRoutingSelection(selection, bus),
        restorePrimary: () => writeRoutingSelection(selection, originalBus)
      }));
      markWorkingEdit();
      recordRoutingHistory(historyBefore, `route ${routingSelectionLabel(selection)} to ${bus < 0 ? "None" : routingBusLabel(bus, state.routingSnapshot)}`);
      showToast(bus < 0 ? "Disconnected" : `Connected to ${routingBusContextLabel(bus)}`);
      scheduleRoutingReconciliation();
    } catch (error) {
      showToast(error.rollbackErrors?.length ? `${error.message} Rollback also failed; refresh routing.` : error.message);
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
    applyPilotAccentFromBus(bus, state.routingSnapshot || state.liveIdentity);
    await retarget(bus, anchorElement);
    return true;
  }

  async function handleAuxPaletteClick(target) {
    const chip = target.closest(".routing-aux-chip");
    if (!chip || !state.routingSnapshot) return false;
    const bus = Number(chip.dataset.bus);
    applyPilotAccentFromBus(bus, state.routingSnapshot);
    if (await retargetOpenRoutingConnection(bus, chip)) return true;
    if (state.routingSelection?.parameterIndex != null) {
      const selection = state.routingSelection;
      selection.element.classList.remove("routing-selected-source");
      state.routingSelection = null;
      refreshRoutingPaletteAvailability(null);
      const result = await assignRoutingPort(selection, bus);
      applyPilotAccentFromBus(bus, state.routingSnapshot);
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
    showToast(bus < 0 ? "Choose a port to disconnect" : `Choose a port for ${routingBusContextLabel(bus)}`, "guidance");
    return true;
  }

  async function handleEditorPaletteClick(target) {
    const chip = target.closest(".routing-aux-chip[data-bus]");
    if (!chip || chip.disabled) return;
    const value = Number(chip.dataset.bus) + 1;
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
        if (state.routingSnapshot) await loadLiveRouting({ preserveView: true, withinOperation: true });
      },
      onSuccess: () => {
        applyPilotAccentFromBus(descriptor.bus, state.liveIdentity);
        disarmEditorBusAssignment();
      }
    });
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
        try {
          const result = await runHardwareOperation("routing-mutation", () => routingLogic.executeRoutingTransaction({
            modeChange: modeChoice ? { before: originalMode, after: modeChoice.mode } : null,
            routesToRemove,
            writeMode: mode => chooseRoutingOutputMode(details, mode),
            writeRoute: writeRoutingSelection,
            apply: () => loadLiveRouting({ preserveView: true, withinOperation: true })
          }));
          if (result.modeChanged || result.removedRoutes.length) markWorkingEdit();
          recordRoutingHistory(historyBefore, `change output mode for ${routingSelectionLabel(selection)}`);
          const removedCopy = result.removedRoutes.length ? ` · removed ${result.removedRoutes.length} other route${result.removedRoutes.length === 1 ? "" : "s"}` : "";
          showToast(`Output mode is ${modeChoice?.mode === "replace" ? "Replace" : "Add"}${removedCopy}`);
        } catch (error) {
          showToast(error.rollbackErrors?.length ? `${error.message} Rollback also failed; refresh routing.` : error.message);
        }
      }
    });
    return true;
  }

  function selectRoutingSlot(slotIndex, snapshot = state.routingSnapshot) {
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

  async function loadLiveRouting({ preserveView = false, background = false, withinOperation = false } = {}) {
    if (!state.ntTransport || !state.liveIdentity) return null;
    if (!withinOperation && state.routingReadPromise) return state.routingReadPromise;
    const token = ++state.routingReadToken;
    if (!background) routingLoading.classList.remove("hidden");
    const read = async () => {
      const snapshot = await state.ntTransport.readRoutingSnapshot(state.liveIdentity);
      if (token !== state.routingReadToken) return;
      state.routingSnapshot = snapshot;
      renderRoutingGraph(snapshot, { live: true, preserveView });
      if (!background) {
        routingLoading.classList.add("hidden");
        // The loading treatment already communicates this foreground read.
      }
      state.routingModeHydrationPromise = state.ntTransport.hydrateRoutingOutputModes(snapshot);
      await state.routingModeHydrationPromise;
      if (token !== state.routingReadToken) return;
      renderRoutingGraph(snapshot, { live: true, preserveView: true });
      if (!background) showToast("Routing ready");
    };
    const handleFailure = error => {
      if (token === state.routingReadToken) {
        showToast(background ? `Routing reconciliation failed · ${error.message}` : error.message);
      }
      if (withinOperation) throw error;
    };
    const finish = () => {
      if (token === state.routingReadToken) {
        if (!background) routingLoading.classList.add("hidden");
        if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
      }
      state.routingModeHydrationPromise = null;
    };
    if (withinOperation) return read().catch(handleFailure).finally(finish);
    state.routingReadPromise = runHardwareOperation("routing-read", read).catch(handleFailure).finally(() => {
      finish();
      state.routingReadPromise = null;
    });
    return state.routingReadPromise;
  }

  function updateSidebarCompactState() {
    const compact = state.sidebarCollapsed || state.assistantDocked;
    deviceFrame.classList.toggle("sidebar-compact", compact);
    if (sidebarEdgeToggle) {
      const label = compact ? "Expand sidebar" : "Collapse sidebar";
      sidebarEdgeToggle.setAttribute("aria-label", label);
      sidebarEdgeToggle.title = label;
    }
  }

  function setSidebarCollapsed(collapsed) {
    state.sidebarCollapsed = Boolean(collapsed);
    updateSidebarCompactState();
  }

  function setView(view) {
    if (view === "assistant" && state.assistantDocked) closeAssistantDock();
    if (view !== "editor") disarmEditorBusAssignment();
    state.view = view;
    updateSidebarCompactState();
    updateEditorBusDockVisibility();
    updateRoutingPaletteVisibility();
    viewStack.classList.toggle("editor-mode", view === "editor");
    const viewTitles = {
      editor: "Editor",
      routing: "Routing",
      mapping: "MIDI mapping",
      control: "Performance",
      presets: "Presets",
      assistant: "Assistant",
      status: "Status & setup"
    };
    $("#current-view-title").textContent = viewTitles[view] || "Editor";
    $$("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === view));
    $$("[data-view]").forEach(button => {
      const active = button.dataset.view === view || (state.assistantDocked && button.dataset.view === "assistant");
      button.classList.toggle("active", active);
    });
    viewStack.scrollTop = 0;
    if (view === "routing") {
      if (state.routingSnapshot) selectRoutingSlot(null, state.routingSnapshot);
      requestAnimationFrame(() => fitRoutingGraph("auto"));
      if (state.ntTransport && !state.routingSnapshot) loadLiveRouting();
    }
    if (view === "mapping") {
      const selectedSlot = $(".slot.active", slotList);
      if (state.ntTransport && selectedSlot) queueLiveParameterRead(selectedSlot);
    }
    if (view === "control") {
      renderPerformanceControls();
      if (state.ntTransport && state.transportOnline && !state.performanceItems.length) loadPerformancePage();
    }
    if (view === "presets") loadPresetDirectory();
    if (view === "assistant") {
      updateAssistantContext();
      assistantWorkspace?.classList.remove("sessions-open", "context-open");
    }
  }

  function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  // The NT permits one SysEx conversation at a time. All multi-message or
  // fire-and-readback operations share this scheduler and its quiet window.
  function runHardwareOperation(kind, task, { wake = false } = {}) {
    return hardwareOperations.run(kind, async () => {
      if (!state.ntTransport || !state.transportOnline) throw new Error("The NT is no longer connected.");
      if (wake) {
        await state.ntTransport.wake();
        await wait(80);
      }
      return task();
    });
  }

  function runPresetTransportOperation(task) {
    return runHardwareOperation("preset", task, { wake: true });
  }

  function runSlotMutationTransportOperation(task) {
    return runHardwareOperation("slot-mutation", task);
  }

  function presetPathJoin(path, name) {
    return `${path.endsWith("/") ? path : `${path}/`}${name}`;
  }

  function presetParentPath(path) {
    if (path === PRESET_LIBRARY_ROOT) return PRESET_LIBRARY_ROOT;
    const pieces = path.split("/").filter(Boolean);
    pieces.pop();
    const parent = pieces.length ? `/${pieces.join("/")}` : PRESET_LIBRARY_ROOT;
    return parent.startsWith(PRESET_LIBRARY_ROOT) ? parent : PRESET_LIBRARY_ROOT;
  }

  function formatPresetSize(bytes) {
    if (!Number.isFinite(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function renderPresetBreadcrumbs() {
    presetBreadcrumbs.replaceChildren();
    const root = document.createElement("button");
    root.type = "button";
    root.textContent = "Preset library";
    root.dataset.presetPath = PRESET_LIBRARY_ROOT;
    presetBreadcrumbs.append(root);
    let current = PRESET_LIBRARY_ROOT;
    state.presetPath.slice(PRESET_LIBRARY_ROOT.length).split("/").filter(Boolean).forEach(part => {
      const separator = document.createElement("span");
      separator.textContent = "/";
      const crumb = document.createElement("button");
      crumb.type = "button";
      current += `/${part}`;
      crumb.dataset.presetPath = current;
      crumb.textContent = part;
      presetBreadcrumbs.append(separator, crumb);
    });
    presetUp.disabled = state.presetPath === PRESET_LIBRARY_ROOT || state.presetBrowserBusy;
  }

  function renderPresetInspector() {
    const selected = state.selectedPresetEntry;
    presetInspector.replaceChildren();
    const kicker = document.createElement("span");
    kicker.className = "preset-inspector-kicker";
    const title = document.createElement("h2");
    const copy = document.createElement("p");
    const actions = document.createElement("div");
    actions.className = "preset-inspector-actions";
    const manage = document.createElement("div");
    manage.className = "preset-inspector-manage";
    const append = document.createElement("button");
    append.type = "button";
    append.className = "secondary-button";
    append.id = "append-preset";
    append.textContent = "Append to preset";
    const load = document.createElement("button");
    load.type = "button";
    load.className = "primary-button";
    load.id = "load-preset";
    load.textContent = "Load preset";
    if (!selected) {
      kicker.textContent = "Select a preset";
      title.textContent = "Preset library";
      copy.textContent = "Choose a .json preset from the NT's preset library. Loading replaces the working preset; appending adds its algorithms after the current last slot.";
      append.disabled = true;
      load.disabled = true;
    } else {
      kicker.textContent = "Selected preset";
      title.textContent = selected.name;
      copy.textContent = `${formatPresetSize(selected.size)} · ${state.presetPath}. Load replaces the complete working preset. Append keeps it and adds this preset's algorithms at the end.`;
      append.disabled = state.presetBrowserBusy || !state.transportOnline;
      load.disabled = state.presetBrowserBusy || !state.transportOnline;
      append.addEventListener("click", () => openPresetLoadDialog(true));
      load.addEventListener("click", () => openPresetLoadDialog(false));
      const editDocument = document.createElement("button");
      editDocument.type = "button";
      editDocument.className = "text-button";
      editDocument.textContent = "Edit JSON";
      editDocument.disabled = state.presetBrowserBusy || !state.transportOnline;
      editDocument.addEventListener("click", () => openPresetJsonDialog(selected));
      const renamePreset = document.createElement("button");
      renamePreset.type = "button";
      renamePreset.className = "text-button";
      renamePreset.textContent = "Rename preset";
      renamePreset.disabled = state.presetBrowserBusy || !state.transportOnline;
      renamePreset.addEventListener("click", () => openPresetRenameDialog(selected));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button danger";
      remove.textContent = "Delete";
      remove.disabled = state.presetBrowserBusy || !state.transportOnline;
      remove.addEventListener("click", () => openPresetFileDialog("delete", selected));
      manage.append(renamePreset, editDocument, remove);
    }
    // The destructive/primary controls live in the fixed inspector, so the
    // currently selected preset always has an obvious next action.
    actions.append(load, append);
    presetInspector.append(kicker, title, copy, actions, manage);
  }

  function renderPresetLibrary() {
    renderPresetBreadcrumbs();
    presetFileList.replaceChildren();
    if (state.presetBrowserBusy) {
      const loading = document.createElement("p");
      loading.className = "preset-library-empty";
      loading.textContent = "Reading this folder from the NT…";
      presetFileList.append(loading);
    } else if (!state.transportOnline) {
      const empty = document.createElement("p");
      empty.className = "preset-library-empty";
      empty.textContent = "Connect to browse presets saved on your NT's microSD card.";
      presetFileList.append(empty);
    } else if (state.presetBrowserError) {
      const error = document.createElement("div");
      error.className = "preset-library-empty";
      const copy = document.createElement("p");
      copy.textContent = state.presetBrowserError;
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "secondary-button";
      retry.textContent = "Try again";
      retry.addEventListener("click", () => loadPresetDirectory());
      error.append(copy, retry);
      presetFileList.append(error);
    } else if (!state.presetEntries.length) {
      const empty = document.createElement("p");
      empty.className = "preset-library-empty";
      empty.textContent = state.presetPath === PRESET_LIBRARY_ROOT
        ? "No saved presets are in this library yet."
        : "This preset folder is empty.";
      presetFileList.append(empty);
    } else {
      const entries = state.presetEntries
        .filter(entry => entry.isDirectory || /\.json$/i.test(entry.name))
        .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
      if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "preset-library-empty";
        empty.textContent = "No saved presets are in this folder.";
        presetFileList.append(empty);
      }
      entries.forEach(entry => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = `preset-file-row${state.selectedPresetEntry === entry ? " selected" : ""}${entry.isDirectory ? " directory" : ""}`;
        const icon = document.createElement("span");
        icon.className = "preset-file-icon";
        icon.textContent = entry.isDirectory ? "▰" : "{}";
        const text = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = entry.name;
        const meta = document.createElement("small");
        meta.textContent = entry.isDirectory ? "Folder" : `${formatPresetSize(entry.size)}${/\.json$/i.test(entry.name) ? " · Preset" : " · File"}`;
        text.append(name, meta);
        const affordance = document.createElement("span");
        affordance.className = "preset-file-affordance";
        affordance.textContent = entry.isDirectory ? "Open ›" : /\.json$/i.test(entry.name) ? "Select" : "";
        row.append(icon, text, affordance);
        row.addEventListener("click", () => {
          if (entry.isDirectory) {
            state.presetPath = presetPathJoin(state.presetPath, entry.name);
            state.selectedPresetEntry = null;
            loadPresetDirectory();
          } else if (/\.json$/i.test(entry.name)) {
            state.selectedPresetEntry = entry;
            renderPresetLibrary();
          } else {
            showToast("NT preset files use the .json extension.", "guidance");
          }
        });
        presetFileList.append(row);
      });
    }
    renderPresetInspector();
  }

  async function loadPresetDirectory(path = state.presetPath) {
    if (state.presetBrowserBusy) return;
    if (!state.ntTransport || !state.transportOnline) {
      renderPresetLibrary();
      return;
    }
    state.presetPath = path.startsWith(PRESET_LIBRARY_ROOT) ? path : PRESET_LIBRARY_ROOT;
    state.presetBrowserBusy = true;
    state.presetBrowserError = null;
    renderPresetLibrary();
    try {
      state.presetEntries = await runPresetTransportOperation(() => state.ntTransport.readSDDirectory(state.presetPath));
    } catch (error) {
      state.presetEntries = [];
      const detail = error?.message || "The NT did not return a preset-library response.";
      state.presetBrowserError = `Couldn’t read the NT preset library: ${detail}`;
      showToast(state.presetBrowserError, "guidance");
    } finally {
      state.presetBrowserBusy = false;
      renderPresetLibrary();
    }
  }

  function openPresetLoadDialog(append) {
    const entry = state.selectedPresetEntry;
    if (!entry || state.presetBrowserBusy) return;
    state.pendingPresetLoad = { path: presetPathJoin(state.presetPath, entry.name), append, name: entry.name };
    presetLoadKicker.textContent = append ? "Append preset" : "Load preset";
    presetLoadTitle.textContent = append ? "Append to working preset?" : "Replace working preset?";
    presetLoadName.textContent = entry.name;
    presetLoadDetail.textContent = append
      ? "Its algorithms will be added after the current last algorithm. The NT will reject the operation if the combined preset exceeds its slot or memory limits."
      : "This replaces the complete working preset: algorithms, parameter values, routing, mappings and Performance assignments.";
    presetLoadWarning.textContent = append
      ? "Undo history will be cleared because the NT has no reversible preset-append command. NT Pilot will reread the preset before it returns control."
      : "Any unsaved working changes will be lost. Undo history will be cleared. NT Pilot will reread the loaded preset before it returns control.";
    confirmPresetLoad.textContent = append ? "Append preset" : "Load preset";
    presetLoadDialog.showModal();
  }

  function openPresetFileDialog(mode, entry = null) {
    if (state.presetBrowserBusy || !state.ntTransport || !state.transportOnline) return;
    state.pendingPresetFileOperation = { mode, entry };
    const isNewFolder = mode === "new-folder";
    presetFileDialogKicker.textContent = "Organise presets";
    presetFileDialogTitle.textContent = isNewFolder ? "New folder" : "Delete item?";
    presetFileDialogName.textContent = entry?.name || state.presetPath;
    presetFileDialogDetail.textContent = isNewFolder
      ? `Create a folder in ${state.presetPath}.`
      : entry?.isDirectory
        ? "This permanently deletes the folder only if it is empty."
        : "This permanently deletes this file from the NT microSD card.";
    presetFileDialogField.classList.toggle("hidden", mode === "delete");
    presetFileDialogInput.maxLength = 80;
    presetFileDialogInput.value = "";
    presetFileDialogInput.placeholder = "Folder name";
    confirmPresetFileDialog.textContent = isNewFolder ? "Create folder" : "Delete";
    confirmPresetFileDialog.classList.toggle("danger", mode === "delete");
    presetFileDialog.showModal();
    if (mode !== "delete") requestAnimationFrame(() => presetFileDialogInput.focus());
  }

  async function openPresetRenameDialog(entry) {
    if (!entry || entry.isDirectory || state.presetBrowserBusy || !state.ntTransport || !state.transportOnline) return;
    const path = presetPathJoin(state.presetPath, entry.name);
    state.presetBrowserBusy = true;
    renderPresetLibrary();
    try {
      const bytes = await runPresetTransportOperation(() => state.ntTransport.readSDFile(path));
      const parsed = decodePresetDocument(bytes);
      const documentName = parsed.document && !Array.isArray(parsed.document) && typeof parsed.document.name === "string"
        ? parsed.document.name
        : null;
      if (documentName == null) throw new Error("This preset file has no top-level name field.");
      state.pendingPresetFileOperation = { mode: "rename-preset-document", entry, path, document: parsed.document, documentName };
      presetFileDialogKicker.textContent = "Preset library";
      presetFileDialogTitle.textContent = "Rename preset";
      presetFileDialogName.textContent = entry.name;
      presetFileDialogDetail.textContent = "Updates this preset’s internal name and changes its .json filename to match.";
      presetFileDialogField.classList.remove("hidden");
      $("span", presetFileDialogField).textContent = "Preset name";
      presetFileDialogInput.maxLength = 31;
      presetFileDialogInput.value = documentName.trimEnd();
      presetFileDialogInput.placeholder = "Preset name";
      confirmPresetFileDialog.textContent = "Rename preset";
      confirmPresetFileDialog.classList.remove("danger");
      presetFileDialog.showModal();
      requestAnimationFrame(() => presetFileDialogInput.focus());
    } catch (error) {
      showToast(`Could not open ${entry.name} · ${error.message}`);
    } finally {
      state.presetBrowserBusy = false;
      renderPresetLibrary();
    }
  }

  function decodePresetDocument(bytes) {
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (_) {
      throw new Error("This preset file is not valid UTF-8 JSON.");
    }
    try {
      return { text, document: JSON.parse(text) };
    } catch (error) {
      throw new Error(`This preset file is not valid JSON: ${error.message}`);
    }
  }

  async function openPresetJsonDialog(entry) {
    if (!entry || entry.isDirectory || state.presetBrowserBusy || !state.ntTransport || !state.transportOnline) return;
    const path = presetPathJoin(state.presetPath, entry.name);
    state.presetBrowserBusy = true;
    renderPresetLibrary();
    try {
      const bytes = await runPresetTransportOperation(() => state.ntTransport.readSDFile(path));
      const parsed = decodePresetDocument(bytes);
      const documentName = parsed.document && !Array.isArray(parsed.document) && typeof parsed.document.name === "string"
        ? parsed.document.name
        : null;
      state.pendingPresetDocument = { entry, path, originalBytes: bytes, documentName };
      presetJsonDialogTitle.textContent = "Edit preset JSON";
      presetJsonDialogName.textContent = entry.name;
      presetJsonNameField.classList.toggle("hidden", documentName == null);
      presetJsonNameInput.value = documentName?.trimEnd() || "";
      presetJsonDialogInput.value = JSON.stringify(parsed.document, null, 2);
      presetJsonDialogStatus.textContent = "Validated JSON. Edit any stored preset field, then save it back to this file.";
      presetJsonDialogStatus.className = "preset-json-dialog-status ready";
      confirmPresetJsonDialog.textContent = "Save JSON";
      presetJsonDialog.showModal();
      requestAnimationFrame(() => {
        presetJsonDialogInput.focus();
        presetJsonDialogInput.setSelectionRange(0, 0);
        presetJsonDialogInput.scrollTop = 0;
        presetJsonDialogInput.scrollLeft = 0;
      });
    } catch (error) {
      showToast(`Could not open ${entry.name} · ${error.message}`);
    } finally {
      state.presetBrowserBusy = false;
      renderPresetLibrary();
    }
  }

  function presetDocumentBytes(value, originalName) {
    const text = String(value || "");
    if (!text.trim()) throw new Error("Preset JSON cannot be empty.");
    let document;
    try {
      document = JSON.parse(text);
    } catch (error) {
      throw new Error(`Fix the JSON before saving: ${error.message}`);
    }
    if (originalName != null) {
      const nextName = presetJsonNameInput.value.trim();
      if (!nextName) throw new Error("Enter a preset name.");
      if (nextName !== originalName.trimEnd()) {
        // NT preset documents store the preset title in their top-level
        // `name` field. Preserve its fixed-width padding when changing it.
        document.name = nextName.padEnd(Math.max(31, originalName.length));
        return new TextEncoder().encode(JSON.stringify(document, null, 2));
      }
    }
    return new TextEncoder().encode(text);
  }

  async function savePresetJsonDocument() {
    const pending = state.pendingPresetDocument;
    if (!pending || !state.ntTransport || !state.transportOnline || state.presetBrowserBusy) return;
    let bytes;
    try {
      bytes = presetDocumentBytes(presetJsonDialogInput.value, pending.documentName);
      presetJsonDialogStatus.textContent = "JSON is valid. Saving to the NT…";
      presetJsonDialogStatus.className = "preset-json-dialog-status ready";
    } catch (error) {
      presetJsonDialogStatus.textContent = error.message;
      presetJsonDialogStatus.className = "preset-json-dialog-status error";
      return;
    }
    state.presetBrowserBusy = true;
    confirmPresetJsonDialog.disabled = true;
    try {
      const backupPath = await runPresetTransportOperation(() => storageLogic.replaceFileSafely(state.ntTransport, pending.path, bytes));
      state.selectedPresetEntry = { ...pending.entry, size: bytes.length };
      showToast(backupPath
        ? `Saved JSON; the old backup remains at ${backupPath}`
        : `Saved JSON to ${pending.entry.name}`);
      state.presetBrowserBusy = false;
      state.pendingPresetDocument = null;
      presetJsonDialog.close();
      await loadPresetDirectory();
      state.selectedPresetEntry = state.presetEntries.find(entry => entry.name === pending.entry.name && !entry.isDirectory) || null;
    } catch (error) {
      presetJsonDialogStatus.textContent = `Could not save: ${error.message}`;
      presetJsonDialogStatus.className = "preset-json-dialog-status error";
      showToast(`Could not save ${pending.entry.name} · ${error.message}`);
    } finally {
      state.presetBrowserBusy = false;
      confirmPresetJsonDialog.disabled = false;
      renderPresetLibrary();
    }
  }

  function validatedPresetItemName(value) {
    const name = String(value || "").trim();
    if (!name) throw new Error("Enter a name.");
    if (name.includes("/") || name.includes("\\") || name.includes("\0") || /[\x00-\x1F\x7F-\uFFFF]/.test(name)) {
      throw new Error("Use a short printable name without slashes.");
    }
    return name;
  }

  function validatedPresetName(value) {
    const name = String(value || "").trim();
    if (!name) throw new Error("Enter a preset title.");
    if (name.length > 31) throw new Error("NT preset titles are limited to 31 characters.");
    if (/[^\x20-\x7E]/.test(name)) throw new Error("Use printable ASCII characters for the NT preset title.");
    return name;
  }

  async function applyPresetFileOperation() {
    const pending = state.pendingPresetFileOperation;
    if (!pending || !state.ntTransport || !state.transportOnline || state.presetBrowserBusy) return;
    const { mode, entry } = pending;
    state.presetBrowserBusy = true;
    confirmPresetFileDialog.disabled = true;
    try {
      if (mode === "new-folder") {
        const name = validatedPresetItemName(presetFileDialogInput.value);
        await runPresetTransportOperation(() => state.ntTransport.createSDDirectory(presetPathJoin(state.presetPath, name)));
        showToast(`Created ${name}`);
      } else if (mode === "rename-preset-document") {
        const name = validatedPresetName(presetFileDialogInput.value);
        const targetFilename = `${name}.json`;
        const targetPath = presetPathJoin(state.presetPath, targetFilename);
        const currentPath = pending.path;
        const collision = state.presetEntries.some(item => !item.isDirectory && item.name === targetFilename && item.name !== entry.name);
        if (collision) throw new Error(`A preset named ${targetFilename} already exists in this folder.`);
        const updatedDocument = { ...pending.document, name: name.padEnd(Math.max(31, pending.documentName.length)) };
        const bytes = new TextEncoder().encode(JSON.stringify(updatedDocument, null, 2));
        let backupPath = null;
        if (targetPath === currentPath) {
          backupPath = await runPresetTransportOperation(() => storageLogic.replaceFileSafely(state.ntTransport, currentPath, bytes));
        } else {
          await runPresetTransportOperation(() => state.ntTransport.writeSDFile(targetPath, bytes));
          const verified = await runPresetTransportOperation(() => state.ntTransport.readSDFile(targetPath));
          if (!storageLogic.sameBytes(verified, bytes)) throw new Error("The NT did not confirm the renamed preset contents.");
          await runPresetTransportOperation(() => state.ntTransport.deleteSDPath(currentPath));
        }
        showToast(backupPath ? `Renamed preset; the old backup remains at ${backupPath}` : `Renamed preset to ${name}`);
      } else {
        await runPresetTransportOperation(() => state.ntTransport.deleteSDPath(presetPathJoin(state.presetPath, entry.name)));
        showToast(`Deleted ${entry.name}`);
      }
      state.selectedPresetEntry = null;
      presetFileDialog.close();
      state.presetBrowserBusy = false;
      await loadPresetDirectory();
    } catch (error) {
      state.presetBrowserBusy = false;
      const label = mode === "new-folder" ? "create folder" : mode === "rename-preset-document" ? "rename preset" : mode;
      showToast(`Could not ${label} · ${error.message}`);
    } finally {
      confirmPresetFileDialog.disabled = false;
      renderPresetLibrary();
    }
  }

  async function applyPresetLoad() {
    const pending = state.pendingPresetLoad;
    if (!pending || !state.ntTransport || !state.transportOnline || state.presetBrowserBusy) return;
    const priorSlotCount = state.liveIdentity?.slots?.length ?? 0;
    state.presetBrowserBusy = true;
    confirmPresetLoad.disabled = true;
    try {
      const verified = await runPresetTransportOperation(async () => {
        state.ntTransport.loadPreset(pending.path, { append: pending.append });
        // Loading has no ACK.  Let the NT rebuild the working preset, then
        // reread until it answers normally rather than treating a fixed short
        // delay as confirmation.
        const deadline = Date.now() + 12000;
        let lastError = null;
        await wait(700);
        while (Date.now() < deadline) {
          try {
            const snapshot = await state.ntTransport.readSnapshot();
            if (!pending.append || snapshot.slots.length > priorSlotCount) return snapshot;
          } catch (error) {
            lastError = error;
          }
          await wait(450);
        }
        throw lastError || new Error("The NT did not become ready after loading this preset.");
      });
      state.liveIdentity = verified;
      state.routingSnapshot = null;
      state.performanceItems = [];
      state.performanceEntries.clear();
      state.undoHistory.length = 0;
      state.redoHistory.length = 0;
      state.hasUnsavedWorkingEdits = pending.append;
      state.selectedSlotIndex = verified.slots.length ? (pending.append ? priorSlotCount : 0) : null;
      showLiveIdentity(verified);
      const next = state.selectedSlotIndex == null ? null : $(`.slot[data-index="${state.selectedSlotIndex}"]`, slotList);
      if (next) displaySlot(next);
      updateHistoryControls();
      updateWorkingState();
      presetLoadDialog.close();
      showToast(`${pending.append ? "Appended" : "Loaded"} ${pending.name} and refreshed it from the NT`);
    } catch (error) {
      showToast(`Could not ${pending.append ? "append" : "load"} ${pending.name} · ${error.message}`);
    } finally {
      state.presetBrowserBusy = false;
      confirmPresetLoad.disabled = false;
      state.pendingPresetLoad = null;
      renderPresetLibrary();
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
    return state.device === "labConnected" && state.transportOnline && Boolean(state.ntTransport);
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
    applyMapping.textContent = "Apply to NT";
    applyMapping.disabled = state.mappingWriteBusy || !canMutate() || !state.mappingDirty;
    updateMappingState();
  }

  function currentMappingValues() {
    return {
      version: Number(state.selectedMapping?.dataset.mappingVersion || 7),
      channel: Number(mapChannel.value),
      type: mapType.value,
      cc: Number(mapCC.value),
      min: Number(mapMin.value),
      max: Number(mapMax.value),
      enabled: mapEnabled.checked,
      relative: mapRelative.checked,
      symmetric: mapSymmetric.checked,
      viewChange: state.selectedMapping?.dataset.viewChange === "true"
    };
  }

  function populateMapping(item) {
    state.selectedMapping = item;
    $$(".mapping-item").forEach(row => row.classList.toggle("active", row === item));
    $("#mapping-param").textContent = item.dataset.name;
    $("#mapping-path").textContent = item.dataset.path || item.dataset.category || "Parameter mapping";
    mapChannel.value = item.dataset.channel || "1";
    mapType.value = item.dataset.type || "CC";
    mapCC.value = item.dataset.cc || "0";
    mapMin.value = item.dataset.min || "0";
    mapMax.value = item.dataset.max || "100";
    mapEnabled.checked = item.dataset.enabled === "true";
    mapRelative.checked = item.dataset.relative === "true";
    mapSymmetric.checked = item.dataset.symmetric === "true";
    state.mappingBaseline = currentMappingValues();
    state.mappingDirty = false;
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
    applyMapping.disabled = state.mappingWriteBusy || !canMutate() || !state.mappingDirty;
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
    item.dataset.enabled = String(Boolean(values.enabled));
    item.dataset.mappingVersion = String(values.version || 7);
    item.dataset.min = values.min;
    item.dataset.max = values.max;
    item.dataset.relative = String(Boolean(values.relative));
    item.dataset.symmetric = String(Boolean(values.symmetric));
    item.dataset.viewChange = String(Boolean(values.viewChange));
    item.dataset.draft = "false";
    const label = $("em", item);
    label.textContent = mappingLabel(values);
    label.className = values.enabled ? "mapped-label" : "";
    item.classList.toggle("conflict", mappingIsConflicted());
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

  async function writeSelectedMIDIMapping(values, { record = true, announce = true } = {}) {
    const item = state.selectedMapping;
    if (state.mappingWriteBusy || !item?.dataset.mappingKey || !state.ntTransport || !state.transportOnline) return false;
    const slotIndex = Number(item.dataset.slotIndex);
    const parameterIndex = Number(item.dataset.parameterIndex);
    const name = item.dataset.name;
    const before = state.mappingBaseline;
    state.mappingWriteBusy = true;
    applyMapping.disabled = true;
    mappingConfirmation.className = "confirmed-badge draft verifying";
    mappingConfirmation.innerHTML = "<i></i> Reading back…";
    try {
      const confirmed = await runSlotMutationTransportOperation(() =>
        state.ntTransport.writeMIDIMapping(slotIndex, parameterIndex, values));
      const applied = { version: confirmed.version, ...confirmed.midi };
      const liveEntry = state.liveParameters.get(mappingKey(slotIndex, parameterIndex));
      if (liveEntry) liveEntry.parameter.mapping = confirmed;
      applyMappingToItem(applied);
      state.mappingBaseline = applied;
      state.mappingDirty = false;
      markWorkingEdit();
      if (record) recordHistory({
        type: "midi-mapping",
        slotIndex,
        parameterIndex,
        before,
        after: applied,
        label: `map ${name}`
      });
      if (announce) showToast(`${name} mapping applied and read back from the NT`);
      return true;
    } catch (error) {
      if (announce) showToast(`Could not apply ${name} mapping · ${error.message}`);
      return false;
    } finally {
      state.mappingWriteBusy = false;
      updateMappingState();
    }
  }

  async function applyMIDIMappingHistory(action, direction) {
    const values = action[direction === "undo" ? "before" : "after"];
    try {
      await runSlotMutationTransportOperation(() => state.ntTransport.writeMIDIMapping(
        action.slotIndex,
        action.parameterIndex,
        values
      ));
      if (state.selectedSlotIndex === action.slotIndex) {
        const slot = $(`.slot[data-index="${action.slotIndex}"]`, slotList);
        if (slot) {
          queueLiveParameterRead(slot);
          await state.parameterReadInFlight;
        }
      }
      markWorkingEdit();
      return true;
    } catch (error) {
      showToast(`History apply failed · ${error.message}`);
      return false;
    }
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
    if (state.routingSnapshot) selectRoutingSlot(slotIndex);
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
    item.dataset.enabled = String(!draft && Boolean(midi?.enabled));
    item.dataset.mappingVersion = String(parameter.mapping?.version || 7);
    item.dataset.channel = String(midi?.channel || 1);
    item.dataset.type = midi?.type || "CC";
    item.dataset.min = String(midi?.min ?? parameter.min);
    item.dataset.max = String(midi?.max ?? parameter.max);
    item.dataset.relative = String(Boolean(midi?.relative));
    item.dataset.symmetric = String(Boolean(midi?.symmetric));
    item.dataset.viewChange = String(Boolean(midi?.viewChange));
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
    state.performanceReadPromise = runHardwareOperation("performance-read", async () => {
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
    }).catch(error => {
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
    const operation = runHardwareOperation("performance-write", async () => {
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
    return operation;
  }

  function queuePerformanceValueWrite(entry, value, control) {
    const requestedValue = Math.min(entry.parameter.max, Math.max(entry.parameter.min, Number(value)));
    if (entry.performanceHistoryStart == null && requestedValue !== entry.parameter.value) entry.performanceHistoryStart = entry.parameter.value;
    entry.pendingPerformanceValue = requestedValue;
    if (entry.performanceWriteRunning || !state.ntTransport || !state.transportOnline) return;
    entry.performanceWriteRunning = true;
    const operation = runHardwareOperation("performance-stream", async () => {
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
  }

  async function setSlotBypass(slotIndex, bypassed, control) {
    if (!state.ntTransport || !state.transportOnline || control.dataset.busy === "true") return;
    control.dataset.busy = "true";
    const operation = runHardwareOperation("bypass-write", async () => {
      await state.ntTransport.writeParameter(slotIndex, 0, bypassed ? 1 : 0);
      const identitySlot = state.liveIdentity?.slots.find(slot => slot.index === slotIndex);
      if (identitySlot) identitySlot.bypassed = bypassed;
      const routingSlot = state.routingSnapshot?.slots.find(slot => slot.index === slotIndex);
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
              if (state.routingSnapshot) await loadLiveRouting({ preserveView: true, withinOperation: true });
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
    const token = ++state.parameterReadToken;
    const slotIndex = Number(slot.dataset.index);
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = `Reading ${slot.dataset.algorithm}…`;
    $("#parameter-fixture-note span").textContent = "Reading parameter pages, current values, and native MIDI mappings from the NT.";
    const operation = runHardwareOperation("parameter-read", async () => {
      if (token !== state.parameterReadToken || !state.ntTransport) return;
      const editorState = await state.ntTransport.readSlotEditorState(slotIndex);
      if (token !== state.parameterReadToken) return;
      renderLiveParameters(editorState, {
        index: slotIndex,
        name: slot.dataset.slot,
        algorithmName: slot.dataset.algorithm
      });
      // Selecting a slot is routine; the populated editor is sufficient feedback.
      startLivePolling(slotIndex);
    }).catch(error => {
      if (token !== state.parameterReadToken) return;
      $("#fixture-algorithm").textContent = "Parameter read failed";
      $("#parameter-fixture-note span").textContent = error.message;
      showToast(error.message);
    });
    state.parameterReadInFlight = operation.catch(() => {});
    return operation;
  }

  function clearLiveEditorSlot() {
    stopLivePolling();
    state.parameterReadToken += 1;
    state.selectedSlotIndex = null;
    state.activeLiveSlotIndex = null;
    state.liveParameters.clear();
    disarmEditorBusAssignment();
    clearSmartFeedback();
    $("#slot-kicker").textContent = "Empty working preset";
    $("#slot-heading").textContent = "No algorithms yet";
    $("#parameter-list").replaceChildren();
    $("#parameter-list").classList.add("hidden");
    $("#parameter-fixture-note").classList.remove("hidden");
    $("#fixture-algorithm").textContent = "Add your first algorithm";
    $("#parameter-fixture-note span").textContent = "Use the + beside Algorithms to choose an algorithm and where to add it.";
    mappingSlotSelect.replaceChildren(new Option("Add an algorithm to choose mappings", ""));
    mappingSlotSelect.disabled = true;
  }

  function renderLiveSlots(slots) {
    const colours = ["mint", "yellow", "lilac", "blue"];
    slotList.replaceChildren();
    if (!slots.length) {
      clearLiveEditorSlot();
      return;
    }
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
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "slot-remove";
      remove.dataset.removeSlot = String(slot.index);
      remove.setAttribute("aria-label", `Remove ${slot.name}`);
      remove.title = `Remove ${slot.name}`;
      remove.textContent = "×";
      const colour = document.createElement("i");
      colour.className = `slot-colour ${colourName}`;
      button.append(number, copy, remove, colour);
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

  function selectedLiveSlot() {
    const slots = state.liveIdentity?.slots || [];
    return slots.find(slot => slot.index === state.selectedSlotIndex) || slots.at(-1) || null;
  }

  function closeAlgorithmBrowserDialog() {
    if (algorithmBrowser.open) algorithmBrowser.close();
    state.pendingAlgorithm = null;
    state.pendingAlgorithmPlacement = null;
    algorithmBrowserSearch.value = "";
  }

  function algorithmBrowserSelectionCopy() {
    const algorithm = state.pendingAlgorithm;
    const slot = selectedLiveSlot();
    const used = state.liveIdentity?.slots?.length || 0;
    const capacity = `${used} of ${MAX_ALGORITHM_SLOTS} slots used`;
    if (!algorithm) return { kicker: capacity, detail: used >= MAX_ALGORITHM_SLOTS ? "Remove an algorithm before adding another." : `${MAX_ALGORITHM_SLOTS - used} slot${MAX_ALGORITHM_SLOTS - used === 1 ? "" : "s"} available. Select an algorithm, then choose where it goes.` };
    if (algorithm.isPlugin && !algorithm.isLoaded) return { kicker: `${algorithm.name} · needs load`, detail: "Load this plug-in into the NT before its settings and memory fit can be checked. Loading may reserve memory until reboot." };
    if (!slot) return { kicker: `${algorithm.name} · ${capacity}`, detail: "This will become slot 1." };
    return { kicker: `${algorithm.name} · ${capacity}`, detail: used >= MAX_ALGORITHM_SLOTS ? "No free slot: remove an algorithm before adding another." : `Choose where to add it around ${slot.name}.` };
  }

  function renderAlgorithmBrowserPlacement() {
    const copy = algorithmBrowserSelectionCopy();
    const summary = $("div", algorithmBrowserPlacement);
    summary.replaceChildren();
    const kicker = document.createElement("span");
    kicker.textContent = copy.kicker;
    const detail = document.createElement("strong");
    detail.textContent = copy.detail;
    summary.append(kicker, detail);
    algorithmBrowserPlacementActions.replaceChildren();
    const algorithm = state.pendingAlgorithm;
    const slot = selectedLiveSlot();
    if (!algorithm || state.slotMutationBusy) return;
    if (algorithm.isPlugin && !algorithm.isLoaded) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.loadSelectedPlugin = "true";
      button.classList.add("primary");
      button.textContent = "Load into NT";
      algorithmBrowserPlacementActions.appendChild(button);
      return;
    }
    if ((state.liveIdentity?.slots?.length || 0) >= MAX_ALGORITHM_SLOTS) return;
    const actions = slot
      ? [["before", "Add before"], ["after", "Add after"], ["end", "Add at end"]]
      : [["end", "Add first algorithm"]];
    actions.forEach(([position, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.algorithmPlacement = position;
      button.textContent = label;
      if (index === 1 || (!slot && index === 0)) button.classList.add("primary");
      algorithmBrowserPlacementActions.appendChild(button);
    });
  }

  function renderAlgorithmBrowser() {
    const catalog = state.liveIdentity?.algorithms || [];
    const query = algorithmBrowserSearch.value.trim().toLowerCase();
    const filter = state.algorithmBrowserFilter;
    const algorithms = catalog
      .filter(algorithm => filter === "all" || (filter === "plugin" ? algorithm.isPlugin : !algorithm.isPlugin))
      .filter(algorithm => !query || `${algorithm.name} ${algorithm.factoryName || ""} ${algorithm.filename || ""}`.toLowerCase().includes(query))
      .sort((left, right) => Number(right.isLoaded) - Number(left.isLoaded) || Number(left.isPlugin) - Number(right.isPlugin) || left.name.localeCompare(right.name));
    algorithmBrowserList.replaceChildren();
    if (!algorithms.length) {
      const empty = document.createElement("p");
      empty.className = "algorithm-browser-empty";
      empty.textContent = "No matching algorithms are available on this NT.";
      algorithmBrowserList.appendChild(empty);
    }
    algorithms.forEach(algorithm => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `algorithm-browser-item${algorithm.isPlugin ? " plugin" : ""}${algorithm.isPlugin && !algorithm.isLoaded ? " unloaded" : ""}${state.pendingAlgorithm?.guidKey === algorithm.guidKey ? " selected" : ""}`;
      item.dataset.guidKey = algorithm.guidKey;
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = algorithm.name;
      const detail = document.createElement("small");
      const usedInPreset = (state.liveIdentity?.slots || []).some(slot => slot.guidKey === algorithm.guidKey);
      detail.textContent = algorithm.isPlugin
        ? `${algorithm.isLoaded ? (usedInPreset ? "Loaded plug-in · in preset" : "Loaded in NT · not in preset") : "Installed plug-in · needs load"}${algorithm.filename ? ` · ${algorithm.filename.split(/[\\/]/).pop()}` : ""}`
        : "Built-in algorithm";
      copy.append(title, detail);
      const kind = document.createElement("span");
      kind.className = algorithm.isPlugin && !algorithm.isLoaded ? "algorithm-load" : "algorithm-browser-kind";
      kind.textContent = algorithm.isPlugin ? (algorithm.isLoaded ? "Plug-in" : "Needs load") : "Built-in";
      item.append(copy, kind);
      algorithmBrowserList.appendChild(item);
    });
    $$("[data-algorithm-filter]").forEach(button => button.classList.toggle("active", button.dataset.algorithmFilter === filter));
    renderAlgorithmBrowserPlacement();
  }

  function closeAlgorithmSpecDialog() {
    if (algorithmSpecDialog.open) algorithmSpecDialog.close();
    state.pendingAlgorithmPlacement = null;
    algorithmMemoryCheckToken += 1;
    clearTimeout(algorithmMemoryCheckTimer);
  }

  function closeAlgorithmLoadDialog() {
    if (algorithmLoadDialog.open) algorithmLoadDialog.close();
    state.pendingPluginLoad = null;
    state.algorithmLoadStep = "load";
    state.pendingAlgorithmPlacement = null;
  }

  function renderAlgorithmLoadPlacement() {
    algorithmLoadPlacement.replaceChildren();
    const slot = selectedLiveSlot();
    if (!slot) return;
    const actions = slot
      ? [["before", "Add before"], ["after", "Add after"], ["end", "Add at end"]]
      : [];
    actions.forEach(([placement, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.algorithmLoadPlacement = placement;
      button.classList.toggle("selected", state.pendingAlgorithmPlacement === placement);
      button.setAttribute("aria-pressed", String(state.pendingAlgorithmPlacement === placement));
      button.textContent = label;
      // Bind the selection directly. The dialog is rebuilt after a plug-in load,
      // so this stays reliable in iOS Web MIDI browsers as well as desktop.
      button.addEventListener("click", () => {
        if (state.algorithmLoadStep !== "insert") return;
        state.pendingAlgorithmPlacement = placement;
        renderAlgorithmLoadPage();
        requestAnimationFrame(() => confirmAlgorithmLoad.focus({ preventScroll: true }));
      });
      algorithmLoadPlacement.appendChild(button);
    });
  }

  function renderAlgorithmLoadPage() {
    const algorithm = state.pendingPluginLoad;
    const inserting = state.algorithmLoadStep === "insert";
    if (!algorithm) return;
    algorithmLoadKicker.textContent = inserting ? "Insert algorithm" : "Plug-in runtime";
    algorithmLoadTitle.textContent = inserting ? `Add ${algorithm.name}` : "Load plug-in into NT?";
    algorithmLoadName.textContent = algorithm.name;
    algorithmLoadDetail.textContent = inserting
      ? (selectedLiveSlot() ? "Choose where it goes and set the starting values sent to the NT." : "This will become slot 1. Set the starting values sent to the NT.")
      : "This loads the plug-in code into the NT so its starting settings and memory fit can be checked.";
    algorithmLoadWarning.hidden = inserting;
    algorithmLoadInsert.hidden = !inserting;
    cancelAlgorithmLoad.textContent = inserting ? "Back to algorithms" : "Cancel";
    confirmAlgorithmLoad.textContent = inserting
      ? (state.pendingAlgorithmPlacement ? `Add ${algorithm.name}` : "Choose where to add it")
      : "Load into NT";
    confirmAlgorithmLoad.disabled = inserting && !state.pendingAlgorithmPlacement;
    if (inserting) renderAlgorithmLoadPlacement();
  }

  function openAlgorithmLoadDialog(algorithm) {
    if (!algorithm?.isPlugin || algorithm.isLoaded || state.slotMutationBusy) return;
    state.pendingPluginLoad = algorithm;
    state.algorithmLoadStep = "load";
    state.pendingAlgorithmPlacement = selectedLiveSlot() ? null : "end";
    algorithmLoadSpecList.replaceChildren();
    algorithmLoadSpecNotice.textContent = "";
    algorithmLoadSpecNotice.className = "algorithm-spec-notice";
    renderAlgorithmLoadPage();
    algorithmLoadDialog.showModal();
  }

  function formatMemoryBytes(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  }

  function showAlgorithmMemoryNotice(message, tone = "checking", notice = algorithmSpecNotice) {
    notice.textContent = message;
    notice.className = `algorithm-spec-notice ${tone}`;
  }

  function ntSupportsMemoryPreview() {
    return deviceLogic.supportsMemoryReport(state.liveIdentity?.version);
  }

  async function readAlgorithmMemoryExclusively(algorithm) {
    return runHardwareOperation("memory-read", () => state.ntTransport.readMemoryUsage(algorithm));
  }

  async function checkAlgorithmMemory(algorithm, { updateUi = true, notice = algorithmSpecNotice } = {}) {
    if (!state.ntTransport) return { allowed: true, available: false };
    if (!ntSupportsMemoryPreview()) {
      if (updateUi) showAlgorithmMemoryNotice("NT memory preview requires firmware 1.19 or later. The NT will verify this add.", "checking", notice);
      return { allowed: true, available: false };
    }
    const token = ++algorithmMemoryCheckToken;
    if (updateUi) showAlgorithmMemoryNotice("Checking NT memory for these starting settings…", "checking", notice);
    try {
      const report = await readAlgorithmMemoryExclusively(algorithm);
      if (token !== algorithmMemoryCheckToken) return { allowed: false, stale: true };
      if (!report.available) {
        if (updateUi) showAlgorithmMemoryNotice(report.reason, "blocked", notice);
        return { allowed: false, reason: report.reason };
      }
      const blocked = report.pools.filter(pool => !pool.fits);
      const summary = report.pools.map(pool => `${pool.name} ${formatMemoryBytes(pool.current + pool.required)}/${formatMemoryBytes(pool.total)}`).join(" · ");
      if (blocked.length) {
        const why = blocked.map(pool => `${pool.name} short ${formatMemoryBytes(pool.required - pool.free)}`).join(" · ");
        if (updateUi) showAlgorithmMemoryNotice(`Will not fit: ${why}. ${summary}`, "blocked", notice);
        return { allowed: false, reason: `Not enough NT memory: ${why}.` };
      }
      if (updateUi) showAlgorithmMemoryNotice(`Fits NT memory · ${summary}`, "ready", notice);
      return { allowed: true, report };
    } catch (error) {
      if (token !== algorithmMemoryCheckToken) return { allowed: false, stale: true };
      if (updateUi) showAlgorithmMemoryNotice("NT memory preflight unavailable; the NT will verify the add.", "warning", notice);
      return { allowed: true, available: false, error };
    }
  }

  function queueAlgorithmMemoryCheck(algorithm) {
    clearTimeout(algorithmMemoryCheckTimer);
    algorithmMemoryCheckTimer = setTimeout(() => {
      try { checkAlgorithmMemory(algorithmWithChosenSpecifications(algorithm)); } catch (error) { showAlgorithmMemoryNotice(error.message, "blocked"); }
    }, 180);
  }

  function renderAlgorithmSpecificationFields(algorithm, list, onChange) {
    const specifications = algorithm.specifications || [];
    list.replaceChildren();
    if (!specifications.length) {
      const empty = document.createElement("p");
      empty.className = "algorithm-spec-empty";
      empty.textContent = "This algorithm has no starting settings.";
      list.appendChild(empty);
      return;
    }
    specifications.forEach((specification, index) => {
      const field = document.createElement("label");
      field.className = "algorithm-spec-field";
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = specification.name || `Specification ${index + 1}`;
      const range = document.createElement("small");
      range.textContent = `${specification.min} to ${specification.max}`;
      copy.append(title, range);
      let control;
      if (specification.type === 2 && specification.min === 0 && specification.max === 1) {
        control = document.createElement("select");
        control.append(new Option("Off", "0"), new Option("On", "1"));
      } else {
        control = document.createElement("input");
        control.type = "number";
        control.min = String(specification.min);
        control.max = String(specification.max);
        control.step = "1";
        control.inputMode = "numeric";
      }
      control.dataset.specIndex = String(index);
      control.value = String(specification.defaultValue ?? 0);
      control.addEventListener("input", onChange);
      control.addEventListener("change", onChange);
      field.append(copy, control);
      list.appendChild(field);
    });
  }

  function openAlgorithmSpecDialog(algorithm, placement) {
    const specifications = algorithm.specifications || [];
    if (specifications.length > 3) {
      showToast(`${algorithm.name} reports more than three setup values, which the NT add command cannot send.`);
      return;
    }
    state.pendingAlgorithmPlacement = placement;
    algorithmSpecName.textContent = algorithm.name;
    showAlgorithmMemoryNotice("Checking NT memory for these starting settings…", "checking");
    renderAlgorithmSpecificationFields(algorithm, algorithmSpecList, () => queueAlgorithmMemoryCheck(algorithm));
    const label = placement === "before" ? "Add before" : placement === "after" ? "Add after" : "Add at end";
    confirmAlgorithmSpec.textContent = label;
    algorithmSpecDialog.showModal();
    checkAlgorithmMemory(algorithmWithChosenSpecifications(algorithm));
  }

  function queueAlgorithmLoadMemoryCheck(algorithm) {
    clearTimeout(algorithmMemoryCheckTimer);
    algorithmMemoryCheckTimer = setTimeout(() => {
      try {
        checkAlgorithmMemory(algorithmWithChosenSpecifications(algorithm, algorithmLoadSpecList), { notice: algorithmLoadSpecNotice });
      } catch (error) {
        showAlgorithmMemoryNotice(error.message, "blocked", algorithmLoadSpecNotice);
      }
    }, 180);
  }

  function openAlgorithmLoadInsertPage(algorithm) {
    const specifications = algorithm.specifications || [];
    if (specifications.length > 3) {
      showToast(`${algorithm.name} reports more than three setup values, which the NT add command cannot send.`);
      return;
    }
    state.pendingAlgorithm = algorithm;
    state.pendingPluginLoad = algorithm;
    state.pendingAlgorithmPlacement = selectedLiveSlot() ? null : "end";
    state.algorithmLoadStep = "insert";
    renderAlgorithmSpecificationFields(algorithm, algorithmLoadSpecList, () => queueAlgorithmLoadMemoryCheck(algorithm));
    showAlgorithmMemoryNotice("Checking NT memory for these starting settings…", "checking", algorithmLoadSpecNotice);
    renderAlgorithmLoadPage();
    checkAlgorithmMemory(algorithmWithChosenSpecifications(algorithm, algorithmLoadSpecList), { notice: algorithmLoadSpecNotice });
  }

  function algorithmWithChosenSpecifications(algorithm, list = algorithmSpecList) {
    const specifications = algorithm.specifications || [];
    const chosen = specifications.map((specification, index) => {
      const control = $(`[data-spec-index="${index}"]`, list);
      const value = Number(control?.value);
      if (!Number.isInteger(value) || value < specification.min || value > specification.max) {
        throw new Error(`${specification.name || `Specification ${index + 1}`} must be between ${specification.min} and ${specification.max}.`);
      }
      return { ...specification, defaultValue: value };
    });
    return { ...algorithm, specifications: chosen };
  }

  async function refreshIdentityAfterSlotMutation({ selectSlot = null, refreshRouting = true } = {}) {
    const identity = await runSlotMutationTransportOperation(() =>
      state.ntTransport.readSnapshot({ algorithms: state.liveIdentity?.algorithms }));
    state.liveIdentity = identity;
    state.performanceItems = [];
    state.performanceEntries.clear();
    showLiveIdentity(identity);
    const selected = selectSlot == null ? null : $(`.slot[data-index="${selectSlot}"]`, slotList);
    if (selected) displaySlot(selected);
    if (refreshRouting && (state.routingSnapshot || state.view === "routing")) await loadLiveRouting({ preserveView: true });
    return identity;
  }

  async function waitForSlotMutation(check, failureMessage) {
    const deadline = Date.now() + 10000;
    let lastError = null;
    // The module does not acknowledge 0x32/0x33/0x37. NT Helper uses the
    // same one-second initial settle and ten-second verification window.
    await wait(1000);
    while (Date.now() < deadline) {
      try {
        const result = await check();
        if (result) return result;
      } catch (error) {
        lastError = error;
      }
      await wait(700);
    }
    throw lastError || new Error(failureMessage);
  }

  async function addLiveAlgorithm(algorithm, placement, { record = true, announce = true } = {}) {
    if (!state.ntTransport || !state.transportOnline || state.slotMutationBusy) return false;
    const before = state.liveIdentity;
    const slotCount = before?.slots?.length || 0;
    if (slotCount >= MAX_ALGORITHM_SLOTS) {
      showToast(`All ${MAX_ALGORITHM_SLOTS} algorithm slots are occupied. Remove an algorithm before adding another.`);
      return false;
    }
    const selected = selectedLiveSlot();
    const targetSlot = deviceLogic.slotMutationTarget(slotCount, selected, placement);
    state.slotMutationBusy = true;
    renderAlgorithmBrowserPlacement();
    addAlgorithmButton.disabled = true;
    try {
      let verified = await runSlotMutationTransportOperation(async () => {
        state.ntTransport.addAlgorithm(algorithm);
        const appendedSlot = await waitForSlotMutation(async () => {
          if (await state.ntTransport.readSlotCount() !== slotCount + 1) return null;
          const candidate = await state.ntTransport.readSlotAlgorithm(slotCount);
          return candidate.guidKey === algorithm.guidKey ? candidate : null;
        }, "The NT did not add that algorithm.");
        if (targetSlot !== appendedSlot.index) {
          await state.ntTransport.moveAlgorithm(appendedSlot.index, targetSlot);
          await waitForSlotMutation(async () => {
            if (await state.ntTransport.readSlotCount() !== slotCount + 1) return false;
            const candidate = await state.ntTransport.readSlotAlgorithm(targetSlot);
            return candidate.guidKey === algorithm.guidKey;
          }, "The NT did not place the new algorithm at the requested position.");
        }
        return await state.ntTransport.readSnapshot({ algorithms: before.algorithms });
      });
      const placedSlot = verified.slots[targetSlot];
      if (!placedSlot || placedSlot.guidKey !== algorithm.guidKey) throw new Error("The NT did not place the new algorithm at the requested position.");
      state.liveIdentity = verified;
      state.performanceItems = [];
      state.performanceEntries.clear();
      showLiveIdentity(verified);
      const newSlot = $(`.slot[data-index="${targetSlot}"]`, slotList);
      if (newSlot) displaySlot(newSlot);
      if (state.routingSnapshot || state.view === "routing") await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      if (record) recordHistory({ type: "slot-add", algorithm, targetSlot, label: `add ${algorithm.name}` });
      if (announce) showToast(`Added ${algorithm.name} at slot ${targetSlot + 1} and verified from the NT`);
      return true;
    } catch (error) {
      showToast(`Could not add ${algorithm.name} · ${error.message}`);
      try { await refreshIdentityAfterSlotMutation({ selectSlot: state.selectedSlotIndex }); } catch (_) {}
      return false;
    } finally {
      state.slotMutationBusy = false;
      addAlgorithmButton.disabled = !state.transportOnline;
      renderAlgorithmBrowserPlacement();
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
    }
  }

  async function removeLiveAddedAlgorithm(action, { announce = true } = {}) {
    if (!state.ntTransport || !state.transportOnline || state.slotMutationBusy) return false;
    const existing = state.liveIdentity?.slots?.[action.targetSlot];
    if (!existing || existing.guidKey !== action.algorithm.guidKey) {
      showToast("The added algorithm is no longer at its original slot, so it cannot be safely undone.");
      return false;
    }
    state.slotMutationBusy = true;
    try {
      const previousCount = state.liveIdentity.slots.length;
      const verified = await runSlotMutationTransportOperation(async () => {
        state.ntTransport.removeAlgorithm(action.targetSlot);
        await waitForSlotMutation(async () =>
          await state.ntTransport.readSlotCount() === previousCount - 1,
        "The NT did not remove the added algorithm.");
        return state.ntTransport.readSnapshot({ algorithms: state.liveIdentity?.algorithms });
      });
      if (verified.slots.length !== previousCount - 1) throw new Error("The NT did not remove the added algorithm.");
      state.liveIdentity = verified;
      state.performanceItems = [];
      state.performanceEntries.clear();
      showLiveIdentity(verified);
      const selected = $(`.slot[data-index="${Math.max(0, action.targetSlot - 1)}"]`, slotList);
      if (selected) displaySlot(selected);
      if (state.routingSnapshot || state.view === "routing") await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      if (announce) showToast(`Removed ${action.algorithm.name} and verified from the NT`);
      return true;
    } catch (error) {
      showToast(`Could not undo algorithm add · ${error.message}`);
      return false;
    } finally {
      state.slotMutationBusy = false;
      addAlgorithmButton.disabled = !state.transportOnline;
    }
  }

  function closeAlgorithmRemoveDialog() {
    if (algorithmRemoveDialog.open) algorithmRemoveDialog.close();
    state.pendingSlotRemoval = null;
  }

  function openAlgorithmRemoveDialog(slotIndex) {
    const slot = state.liveIdentity?.slots?.[slotIndex];
    if (!slot || state.slotMutationBusy) return;
    state.pendingSlotRemoval = { index: slot.index, name: slot.name, guidKey: slot.guidKey };
    algorithmRemoveName.textContent = `Remove ${slot.name}?`;
    algorithmRemoveDialog.showModal();
  }

  async function removeLiveAlgorithm(slotToRemove) {
    if (!state.ntTransport || !state.transportOnline || state.slotMutationBusy || !slotToRemove) return false;
    const existing = state.liveIdentity?.slots?.[slotToRemove.index];
    if (!existing || existing.guidKey !== slotToRemove.guidKey) {
      showToast("The slot changed before it could be removed. Please try again.");
      return false;
    }
    const previousCount = state.liveIdentity.slots.length;
    state.slotMutationBusy = true;
    confirmAlgorithmRemove.disabled = true;
    try {
      const verified = await runSlotMutationTransportOperation(async () => {
        state.ntTransport.removeAlgorithm(existing.index);
        await waitForSlotMutation(async () =>
          await state.ntTransport.readSlotCount() === previousCount - 1,
        "The NT did not confirm removal of that slot.");
        return state.ntTransport.readSnapshot({ algorithms: state.liveIdentity?.algorithms });
      });
      if (verified.slots.length !== previousCount - 1) throw new Error("The NT did not confirm removal of that slot.");
      state.liveIdentity = verified;
      state.performanceItems = [];
      state.performanceEntries.clear();
      state.undoHistory.length = 0;
      state.redoHistory.length = 0;
      updateHistoryControls();
      showLiveIdentity(verified);
      const nextSlot = verified.slots[Math.min(existing.index, verified.slots.length - 1)];
      const nextCard = nextSlot ? $(`.slot[data-index="${nextSlot.index}"]`, slotList) : null;
      if (nextCard) displaySlot(nextCard);
      if (state.routingSnapshot || state.view === "routing") await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      showToast(`Removed ${existing.name} and verified from the NT`);
      return true;
    } catch (error) {
      showToast(`Could not remove ${existing.name} · ${error.message}`);
      try { await refreshIdentityAfterSlotMutation({ selectSlot: existing.index }); } catch (_) {}
      return false;
    } finally {
      state.slotMutationBusy = false;
      confirmAlgorithmRemove.disabled = false;
      addAlgorithmButton.disabled = !state.transportOnline;
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
    }
  }

  async function loadPluginFromBrowser(algorithm) {
    if (!state.ntTransport || state.slotMutationBusy) return null;
    state.slotMutationBusy = true;
    renderAlgorithmBrowser();
    try {
      const loaded = await runSlotMutationTransportOperation(async () => {
        state.ntTransport.loadPlugin(algorithm);
        return await waitForSlotMutation(async () => {
          const candidate = await state.ntTransport.readAlgorithmInfo(algorithm.index);
          if (candidate.guidKey !== algorithm.guidKey) throw new Error("The NT catalogue changed while this plug-in was loading.");
          return candidate.isLoaded ? candidate : null;
        }, "The NT did not report this plug-in loaded. Check the native NT screen; rebooting clears resident plug-ins for a clean runtime.");
      });
      state.liveIdentity = { ...state.liveIdentity, algorithms: state.liveIdentity.algorithms.map(item => item.index === loaded.index ? loaded : item) };
      state.pendingAlgorithm = loaded;
      showToast(`${loaded.name} loaded and ready to add`);
      return loaded;
    } catch (error) {
      showToast(`Could not load ${algorithm.name} · ${error.message}`);
      return null;
    } finally {
      state.slotMutationBusy = false;
      renderAlgorithmBrowser();
    }
  }

  async function moveLiveSlot(fromSlot, toSlot, { record = true, announce = true } = {}) {
    if (!state.ntTransport || !state.transportOnline || state.slotMutationBusy || fromSlot === toSlot) return false;
    const moving = state.liveIdentity?.slots?.[fromSlot];
    if (!moving) return false;
    state.slotMutationBusy = true;
    slotList.classList.add("reordering");
    try {
      const identity = await runSlotMutationTransportOperation(async () => {
        await state.ntTransport.moveAlgorithm(fromSlot, toSlot);
        await waitForSlotMutation(async () => {
          const candidate = await state.ntTransport.readSlotAlgorithm(toSlot);
          return candidate.guidKey === moving.guidKey;
        }, "The NT did not move that algorithm.");
        return state.ntTransport.readSnapshot({ algorithms: state.liveIdentity?.algorithms });
      });
      state.liveIdentity = identity;
      state.performanceItems = [];
      state.performanceEntries.clear();
      showLiveIdentity(identity);
      const movedSlot = $(`.slot[data-index="${toSlot}"]`, slotList);
      if (movedSlot) displaySlot(movedSlot);
      if (state.routingSnapshot || state.view === "routing") await loadLiveRouting({ preserveView: true });
      markWorkingEdit();
      if (record) recordHistory({ type: "slot-move", fromSlot, toSlot, label: `move to slot ${toSlot + 1}` });
      if (announce) showToast(`Moved algorithm to slot ${toSlot + 1} and verified from the NT`);
      return true;
    } catch (error) {
      showToast(`Could not move algorithm · ${error.message}`);
      if (state.activeLiveSlotIndex != null) startLivePolling(state.activeLiveSlotIndex);
      return false;
    } finally {
      state.slotMutationBusy = false;
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
    if (action.type === "slot-add") {
      succeeded = direction === "undo"
        ? await removeLiveAddedAlgorithm(action, { announce: false })
        : await addLiveAlgorithm(action.algorithm, action.targetSlot, { record: false, announce: false });
    }
    if (action.type === "parameter-batch") succeeded = await applyParameterHistory(action, direction);
    if (action.type === "midi-mapping") succeeded = await applyMIDIMappingHistory(action, direction);
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
    updateWorkingState();
    const presetName = identity.presetName || "Unnamed preset";
    $("#preset-title").textContent = presetName;
    $("#editor-heading").textContent = presetName;
    $("#editor-slot-count").textContent = `${identity.slotCount} / ${MAX_ALGORITHM_SLOTS} slots`;
    $("#hardware-title").textContent = "disting NT · live";
    $("#hardware-detail").textContent = `${identity.version || "Unknown firmware"} · SysEx ID ${identity.sysexId}`;
    setHardwareStatus("Connected", true);
    editorEmptyState.classList.add("hidden");
    editorShell.classList.remove("hidden");
    addAlgorithmButton.disabled = false;
    renderEditorBusDock(identity);
    renderLiveSlots(identity.slots);
  }

  function setHardwareStatus(label, isGood = false) {
    const status = $("#hardware-status");
    status.textContent = label;
    status.classList.toggle("good", isGood);
  }

  function flushDisconnectedSession() {
    stopMIDILearn();
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
    state.pendingAlgorithm = null;
    state.slotMutationBusy = false;
    addAlgorithmButton.disabled = true;
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
    updateAssistantContext();
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
    state.routingSnapshot = null;
    editorBusDock.classList.add("hidden");
    routingLoading.classList.add("hidden");
    if ($("#midi-monitor-status")) $("#midi-monitor-status").textContent = "Monitor paused · no NT endpoint";
    updateAssistantContext();
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
      let identity;
      if (state.transportOnline) {
        identity = await runHardwareOperation("identity-refresh", () => state.ntTransport.readSnapshot());
      } else {
        await state.ntTransport.connect();
        identity = await state.ntTransport.readSnapshot();
      }
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

  $$("[data-view]").forEach(button => button.addEventListener("click", () => {
    const nextView = button.dataset.view;
    if (state.assistantDocked) {
      if (nextView === "assistant") {
        setSidebarCollapsed(false);
        setView("assistant");
      }
      else setView(nextView);
      return;
    }
    if (state.view === nextView) {
      if (nextView === "assistant") {
        setSidebarCollapsed(true);
        openAssistantDock();
        return;
      }
      setSidebarCollapsed(!state.sidebarCollapsed);
      return;
    }
    setSidebarCollapsed(false);
    setView(nextView);
  }));
  sidebarEdgeToggle?.addEventListener("click", () => setSidebarCollapsed(!state.sidebarCollapsed));
  refreshPresets.addEventListener("click", () => loadPresetDirectory());
  newPresetFolder.addEventListener("click", () => openPresetFileDialog("new-folder"));
  presetUp.addEventListener("click", () => {
    if (state.presetPath !== PRESET_LIBRARY_ROOT) {
      state.presetPath = presetParentPath(state.presetPath);
      state.selectedPresetEntry = null;
      loadPresetDirectory();
    }
  });
  presetBreadcrumbs.addEventListener("click", event => {
    const button = event.target.closest("button[data-preset-path]");
    if (!button || state.presetBrowserBusy) return;
    state.presetPath = button.dataset.presetPath;
    state.selectedPresetEntry = null;
    loadPresetDirectory();
  });
  closePresetLoad.addEventListener("click", () => presetLoadDialog.close());
  cancelPresetLoad.addEventListener("click", () => presetLoadDialog.close());
  confirmPresetLoad.addEventListener("click", applyPresetLoad);
  presetLoadDialog.addEventListener("close", () => {
    if (!state.presetBrowserBusy) state.pendingPresetLoad = null;
  });
  presetLoadDialog.addEventListener("click", event => {
    if (event.target === presetLoadDialog) presetLoadDialog.close();
  });
  closePresetFileDialog.addEventListener("click", () => presetFileDialog.close());
  cancelPresetFileDialog.addEventListener("click", () => presetFileDialog.close());
  confirmPresetFileDialog.addEventListener("click", applyPresetFileOperation);
  presetFileDialog.addEventListener("close", () => {
    if (!state.presetBrowserBusy) state.pendingPresetFileOperation = null;
  });
  presetFileDialog.addEventListener("click", event => {
    if (event.target === presetFileDialog) presetFileDialog.close();
  });
  closePresetJsonDialog.addEventListener("click", () => presetJsonDialog.close());
  cancelPresetJsonDialog.addEventListener("click", () => presetJsonDialog.close());
  confirmPresetJsonDialog.addEventListener("click", savePresetJsonDocument);
  presetJsonDialog.addEventListener("close", () => {
    if (!state.presetBrowserBusy) state.pendingPresetDocument = null;
  });
  presetJsonDialog.addEventListener("click", event => {
    if (event.target === presetJsonDialog) presetJsonDialog.close();
  });
  const openReferenceGuide = () => {
    if (referenceGuide.open) return;
    referenceGuide.showModal();
    guideSearch.focus();
  };
  $("#reference-guide-card").addEventListener("click", openReferenceGuide);
  $("#mapping-routing-help").addEventListener("click", () => {
    openReferenceGuide();
    requestAnimationFrame(() => $("#wiki-mappings").scrollIntoView({ block: "start" }));
  });
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
      await runHardwareOperation("preset-save", async () => {
        state.ntTransport.savePreset(2);
        await wait(350);
      });
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
  routingAuxPalette.addEventListener("click", event => {
    if (state.ipadMode && state.view === "editor") return handleEditorPaletteClick(event.target);
    return handleAuxPaletteClick(event.target);
  });
  $("#routing-connection-cancel").addEventListener("click", closeRoutingConnectionPanel);
  routingConnectionPanel.addEventListener("click", event => {
    const label = event.target.closest("label");
    if (!label) return;
    const control = $("input[type=radio]", label);
    if (!control || control.disabled) return;
    event.preventDefault();
    control.checked = true;
    control.dispatchEvent(new Event("change", { bubbles: true }));
  });
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

  syncPickerTrigger.addEventListener("click", () => {
    const opening = syncPickerOptions.classList.contains("hidden");
    syncPickerOptions.classList.toggle("hidden", !opening);
    syncPickerTrigger.setAttribute("aria-expanded", String(opening));
  });
  syncPickerOptions.addEventListener("click", event => {
    const option = event.target.closest("[data-sync-mode]");
    if (!option) return;
    setSyncMode(option.dataset.syncMode);
    syncPickerOptions.classList.add("hidden");
    syncPickerTrigger.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("pointerdown", event => {
    if (event.target.closest(".sync-picker")) return;
    syncPickerOptions.classList.add("hidden");
    syncPickerTrigger.setAttribute("aria-expanded", "false");
  });
  addAlgorithmButton.addEventListener("click", () => {
    if (!state.transportOnline || !state.liveIdentity) {
      showToast("Connect and read the NT before adding an algorithm");
      return;
    }
    state.pendingAlgorithm = null;
    algorithmBrowserSearch.value = "";
    state.algorithmBrowserFilter = "all";
    renderAlgorithmBrowser();
    algorithmBrowser.showModal();
    algorithmBrowserSearch.focus();
  });
  closeAlgorithmBrowser.addEventListener("click", closeAlgorithmBrowserDialog);
  algorithmBrowser.addEventListener("close", () => {
    state.pendingAlgorithm = null;
    state.pendingAlgorithmPlacement = null;
  });
  algorithmBrowserSearch.addEventListener("input", renderAlgorithmBrowser);
  $$("[data-algorithm-filter]").forEach(button => button.addEventListener("click", () => {
    state.algorithmBrowserFilter = button.dataset.algorithmFilter;
    renderAlgorithmBrowser();
  }));
  algorithmBrowserList.addEventListener("click", event => {
    const item = event.target.closest("[data-guid-key]");
    if (!item) return;
    const algorithm = state.liveIdentity?.algorithms?.find(entry => entry.guidKey === item.dataset.guidKey);
    if (!algorithm) return;
    state.pendingAlgorithm = algorithm;
    state.pendingAlgorithmPlacement = null;
    renderAlgorithmBrowser();
  });
  algorithmBrowserPlacementActions.addEventListener("click", async event => {
    const load = event.target.closest("[data-load-selected-plugin]");
    if (load && state.pendingAlgorithm) {
      openAlgorithmLoadDialog(state.pendingAlgorithm);
      return;
    }
    const action = event.target.closest("[data-algorithm-placement]");
    if (!action || !state.pendingAlgorithm) return;
    openAlgorithmSpecDialog(state.pendingAlgorithm, action.dataset.algorithmPlacement);
  });
  closeAlgorithmSpec.addEventListener("click", closeAlgorithmSpecDialog);
  cancelAlgorithmSpec.addEventListener("click", closeAlgorithmSpecDialog);
  algorithmSpecDialog.addEventListener("close", () => { state.pendingAlgorithmPlacement = null; });
  closeAlgorithmLoad.addEventListener("click", closeAlgorithmLoadDialog);
  cancelAlgorithmLoad.addEventListener("click", closeAlgorithmLoadDialog);
  algorithmLoadDialog.addEventListener("close", () => { state.pendingPluginLoad = null; });
  confirmAlgorithmLoad.addEventListener("click", async () => {
    const algorithm = state.pendingPluginLoad;
    if (!algorithm) return;
    if (state.algorithmLoadStep === "insert") {
      const placement = state.pendingAlgorithmPlacement;
      if (!placement) return;
      let selected;
      try {
        selected = algorithmWithChosenSpecifications(algorithm, algorithmLoadSpecList);
      } catch (error) {
        showAlgorithmMemoryNotice(error.message, "blocked", algorithmLoadSpecNotice);
        return;
      }
      const preflight = await checkAlgorithmMemory(selected, { notice: algorithmLoadSpecNotice });
      if (!preflight.allowed) {
        showToast(preflight.reason || "This algorithm will not fit in available NT memory.");
        return;
      }
      confirmAlgorithmLoad.disabled = true;
      const added = await addLiveAlgorithm(selected, placement);
      if (added) {
        closeAlgorithmLoadDialog();
        closeAlgorithmBrowserDialog();
      } else {
        renderAlgorithmLoadPage();
      }
      return;
    }
    confirmAlgorithmLoad.disabled = true;
    const loaded = await loadPluginFromBrowser(algorithm);
    if (!loaded) {
      confirmAlgorithmLoad.disabled = false;
      renderAlgorithmLoadPage();
      return;
    }
    openAlgorithmLoadInsertPage(loaded);
  });
  confirmAlgorithmSpec.addEventListener("click", async () => {
    const algorithm = state.pendingAlgorithm;
    const placement = state.pendingAlgorithmPlacement;
    if (!algorithm || !placement) return;
    let selected;
    try {
      selected = algorithmWithChosenSpecifications(algorithm);
    } catch (error) {
      showToast(error.message);
      return;
    }
    const preflight = await checkAlgorithmMemory(selected);
    if (!preflight.allowed) {
      showToast(preflight.reason || "This algorithm will not fit in available NT memory.");
      return;
    }
    confirmAlgorithmSpec.disabled = true;
    const added = await addLiveAlgorithm(selected, placement);
    confirmAlgorithmSpec.disabled = false;
    if (added) {
      closeAlgorithmSpecDialog();
      closeAlgorithmBrowserDialog();
    }
  });
  closeAlgorithmRemove.addEventListener("click", closeAlgorithmRemoveDialog);
  cancelAlgorithmRemove.addEventListener("click", closeAlgorithmRemoveDialog);
  algorithmRemoveDialog.addEventListener("close", () => { state.pendingSlotRemoval = null; });
  confirmAlgorithmRemove.addEventListener("click", async () => {
    const removed = await removeLiveAlgorithm(state.pendingSlotRemoval);
    if (removed) closeAlgorithmRemoveDialog();
  });
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
    const remove = event.target.closest("[data-remove-slot]");
    if (remove) {
      event.preventDefault();
      event.stopPropagation();
      openAlgorithmRemoveDialog(Number(remove.dataset.removeSlot));
      return;
    }
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
    if (event.target.closest("[data-bypass-slot], [data-remove-slot]")) {
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
        if (state.routingSnapshot) await loadLiveRouting({ preserveView: true, withinOperation: true });
      },
      onSuccess: () => {
        applyPilotAccentFromBus(descriptor.bus, state.liveIdentity);
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
      showToast("Refresh this slot before adding a mapping");
      return;
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
    if (button.classList.contains("listening")) {
      stopMIDILearn("MIDI Learn cancelled");
      return;
    }
    button.classList.add("listening");
    $("#learn-label").textContent = "Listening…";
    state.learnTimer = setTimeout(() => {
      stopMIDILearn("MIDI Learn timed out without a supported message");
    }, 10000);
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
    restoreMapping(state.mappingBaseline);
    state.mappingDirty = false;
    updateMappingState();
  });

  mappingForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!canMutate()) {
      showToast("Mapping is read-only until the NT is ready");
      return;
    }
    if (!state.mappingDirty) return;
    const next = currentMappingValues();
    await writeSelectedMIDIMapping(next);
  });

  function closeAssistantPanels() {
    assistantWorkspace?.classList.remove("sessions-open", "context-open");
  }

  async function assistantApi(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: { "content-type": "application/json", ...(options.headers || {}) }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Assistant Host returned ${response.status}.`);
    return result;
  }

  function setAssistantProviderState(account, error = null) {
    state.assistantAccount = account || null;
    state.assistantHostAvailable = !error;
    const connected = account?.type === "chatgpt";
    assistantProviderStatus?.classList.toggle("connected", connected);
    assistantProviderStatus?.classList.toggle("error", Boolean(error));
    if (assistantProviderStatus) {
      $("strong", assistantProviderStatus).textContent = error ? "Assistant service unavailable" : connected ? account.email : state.assistantLogin ? "Finish Codex sign-in" : "Codex is ready to connect";
      $("small", assistantProviderStatus).textContent = error || (connected ? `${account.planType || "ChatGPT"} plan · NT Pilot session` : state.assistantLogin ? `Enter ${state.assistantLogin.userCode} at the opened Codex sign-in page.` : "Sign in with your ChatGPT account to use your Codex subscription.");
    }
    if (assistantAccountName) assistantAccountName.textContent = connected ? account.email : "No provider connected";
    if (assistantAccountDetail) assistantAccountDetail.textContent = connected ? `Codex · ${account.planType || "ChatGPT"}` : error ? "Start NT Pilot with the local Host" : "Choose an account to begin";
    if (assistantProviderReadiness) {
      assistantProviderReadiness.classList.toggle("ready", connected);
      $("i", assistantProviderReadiness).textContent = connected ? "✓" : "○";
      $("small", assistantProviderReadiness).textContent = connected ? `Codex · ${account.planType || "ChatGPT"}` : "Account connection pending";
    }
    const connect = $("#assistant-codex-connect");
    if (connect) {
      $("small", connect).textContent = connected ? account.email : "Sign in with your ChatGPT account";
      $("em", connect).textContent = connected ? "Connected" : "Connect";
      connect.classList.toggle("connected", connected);
    }
    assistantModelSetting?.classList.toggle("hidden", !connected);
    const providerLabel = $("#assistant-provider-button span:nth-child(2)");
    if (providerLabel) providerLabel.textContent = connected ? (assistantModelSelect?.selectedOptions[0]?.textContent || "Codex") : "Choose model";
    if (assistantComposeNote) assistantComposeNote.textContent = connected
      ? "Read-only: the Assistant can inspect context and cited NT knowledge, but cannot edit or save."
      : error ? "The NT Pilot Assistant Gateway has not been configured." : "Prompts and attachments stay local until a provider is connected.";
  }

  async function loadAssistantModels() {
    if (!state.assistantAccount || !assistantModelSelect) return;
    const result = await assistantApi("/api/assistant/models");
    state.assistantModels = (result.data || []).filter(model => !model.hidden);
    assistantModelSelect.replaceChildren();
    state.assistantModels.forEach(model => {
      const option = document.createElement("option");
      option.value = model.model;
      option.textContent = model.displayName;
      option.selected = Boolean(model.isDefault);
      assistantModelSelect.appendChild(option);
    });
    const providerLabel = $("#assistant-provider-button span:nth-child(2)");
    if (providerLabel) providerLabel.textContent = assistantModelSelect.selectedOptions[0]?.textContent || "Codex";
  }

  function assistantThreadTitle(thread) {
    return String(thread?.name || thread?.preview || "New conversation").replace(/\s+/g, " ").trim().slice(0, 80) || "New conversation";
  }

  function renderAssistantSessions() {
    if (!assistantSessionList) return;
    assistantSessionList.replaceChildren();
    const threads = state.assistantThreads;
    if (!threads.length) {
      const empty = document.createElement("div");
      empty.className = "assistant-history-empty";
      empty.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM7 4h10v3"/></svg><p>Your conversations will appear here.</p>';
      assistantSessionList.appendChild(empty);
      return;
    }
    threads.forEach(thread => {
      const button = document.createElement("button");
      button.className = `assistant-session${thread.id === state.assistantThreadId ? " active" : ""}`;
      button.type = "button";
      button.dataset.threadId = thread.id;
      const updated = new Date((thread.updatedAt || thread.createdAt) * 1000);
      button.innerHTML = '<span class="assistant-session-icon"><svg viewBox="0 0 24 24"><path d="M5 6h14v10H9l-4 3V6Z"/></svg></span><span><strong></strong><small></small></span>';
      $("strong", button).textContent = assistantThreadTitle(thread);
      $("small", button).textContent = Number.isNaN(updated.valueOf()) ? "Saved session" : updated.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      button.addEventListener("click", () => openAssistantThread(thread.id));
      assistantSessionList.appendChild(button);
    });
  }

  async function loadAssistantThreads() {
    if (!state.assistantAccount) return;
    const result = await assistantApi("/api/assistant/threads");
    state.assistantThreads = result.data || [];
    renderAssistantSessions();
  }

  function clearAssistantMessages() {
    $$(".assistant-message", assistantThread).forEach(message => message.remove());
    assistantThread?.classList.remove("has-messages");
  }

  function extractAssistantUserText(text) {
    const match = String(text || "").match(/<user_request>\n?([\s\S]*?)\n?<\/user_request>/);
    return (match?.[1] || text || "").trim();
  }

  function appendAssistantMessage(role, text = "", { pending = false } = {}) {
    assistantThread?.classList.add("has-messages");
    const article = document.createElement("article");
    article.className = `assistant-message ${role}${pending ? " pending" : ""}`;
    const label = document.createElement("span");
    const body = document.createElement("div");
    label.textContent = role === "user" ? "You" : "NT";
    body.textContent = text;
    article.append(label, body);
    assistantThread?.appendChild(article);
    assistantThread.scrollTop = assistantThread.scrollHeight;
    return article;
  }

  function renderAssistantThread(thread) {
    clearAssistantMessages();
    for (const turn of thread.turns || []) {
      for (const item of turn.items || []) {
        if (item.type === "userMessage") {
          const text = (item.content || []).filter(part => part.type === "text").map(part => part.text).join("\n");
          appendAssistantMessage("user", extractAssistantUserText(text));
        } else if (item.type === "agentMessage" && item.text) {
          appendAssistantMessage("assistant", item.text);
        }
      }
    }
  }

  async function openAssistantThread(threadId) {
    try {
      const result = await assistantApi(`/api/assistant/threads/${encodeURIComponent(threadId)}`);
      state.assistantThreadId = threadId;
      setAssistantConversationTitle(assistantThreadTitle(result.thread), { save: false });
      renderAssistantThread(result.thread);
      renderAssistantSessions();
      closeAssistantPanels();
    } catch (error) {
      showToast(error.message);
    }
  }

  async function refreshAssistantStatus() {
    try {
      const result = await assistantApi("/api/assistant/status");
      setAssistantProviderState(result.account);
      if (result.account) {
        const failures = await Promise.allSettled([loadAssistantModels(), loadAssistantThreads()]);
        const failed = failures.find(result => result.status === "rejected");
        if (failed) showToast(`Codex connected · ${failed.reason.message}`);
      }
    } catch (error) {
      setAssistantProviderState(null, error.message);
    }
  }

  function openAssistantProviderSheet() {
    closeAssistantPanels();
    const sheet = $("#assistant-provider-sheet");
    const backdrop = $("#assistant-provider-backdrop");
    const host = state.assistantDocked ? appMain : assistantWorkspace;
    if (backdrop && backdrop.parentElement !== host) host.appendChild(backdrop);
    if (sheet && sheet.parentElement !== host) host.appendChild(sheet);
    sheet?.classList.remove("hidden");
    backdrop?.classList.remove("hidden");
    refreshAssistantStatus();
  }

  function closeAssistantProviderSheet() {
    $("#assistant-provider-sheet")?.classList.add("hidden");
    $("#assistant-provider-backdrop")?.classList.add("hidden");
  }

  function restoreAssistantSurface() {
    if (!assistantConversation || !assistantThread || !assistantComposeArea) return;
    assistantConversation.append(assistantThread, assistantComposeArea);
    requestAnimationFrame(resizeAssistantInput);
  }

  function closeAssistantDock() {
    state.assistantDocked = false;
    restoreAssistantSurface();
    assistantDock?.classList.add("hidden");
    appMain.classList.remove("assistant-dock-open");
    updateSidebarCompactState();
  }

  function openAssistantDock({ view = "editor" } = {}) {
    if (!assistantDockContent || !assistantThread || !assistantComposeArea) return;
    state.assistantDocked = true;
    assistantDockContent.append(assistantThread, assistantComposeArea);
    assistantDock.classList.remove("hidden");
    appMain.classList.add("assistant-dock-open");
    setView(view);
    requestAnimationFrame(resizeAssistantInput);
  }

  function setAssistantConversationTitle(value, { save = true } = {}) {
    const title = String(value || "").replace(/\s+/g, " ").trim().slice(0, 80) || "New conversation";
    assistantHeading.textContent = title;
    if (assistantSessionTitle) assistantSessionTitle.textContent = title;
    if (assistantDockTitle) assistantDockTitle.textContent = title;
    if (save) {
      try {
        localStorage.setItem("ntPilotAssistantConversationTitle", title);
      } catch (_) {
        // The title remains available for this session.
      }
      if (state.assistantThreadId && state.assistantHostAvailable) {
        assistantApi(`/api/assistant/threads/${encodeURIComponent(state.assistantThreadId)}`, {
          method: "PATCH",
          body: JSON.stringify({ name: title })
        }).then(loadAssistantThreads).catch(error => showToast(`Could not rename conversation · ${error.message}`));
      }
    }
  }

  if (assistantHeading) {
    try {
      setAssistantConversationTitle(localStorage.getItem("ntPilotAssistantConversationTitle"), { save: false });
    } catch (_) {
      setAssistantConversationTitle("New conversation", { save: false });
    }
    assistantHeading.addEventListener("focus", () => {
      assistantHeading.dataset.previousTitle = assistantHeading.textContent;
    });
    assistantHeading.addEventListener("input", () => {
      if (assistantHeading.textContent.length > 80) assistantHeading.textContent = assistantHeading.textContent.slice(0, 80);
      if (assistantSessionTitle) assistantSessionTitle.textContent = assistantHeading.textContent.trim() || "New conversation";
      if (assistantDockTitle) assistantDockTitle.textContent = assistantHeading.textContent.trim() || "New conversation";
    });
    assistantHeading.addEventListener("blur", () => setAssistantConversationTitle(assistantHeading.textContent));
    assistantHeading.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        assistantHeading.blur();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setAssistantConversationTitle(assistantHeading.dataset.previousTitle, { save: false });
        assistantHeading.blur();
      }
    });
  }

  $("#assistant-dock-close")?.addEventListener("click", closeAssistantDock);
  $("#assistant-dock-expand")?.addEventListener("click", () => setView("assistant"));

  try {
    const savedDockWidth = Number(localStorage.getItem("ntPilotAssistantDockWidth"));
    if (savedDockWidth >= 320 && savedDockWidth <= 620) deviceFrame.style.setProperty("--assistant-dock-width", `${savedDockWidth}px`);
  } catch (_) {
    // Use the default dock width.
  }
  let assistantDockResizing = false;
  assistantDockResize?.addEventListener("pointerdown", event => {
    assistantDockResizing = true;
    assistantDockResize.classList.add("dragging");
    assistantDockResize.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  document.addEventListener("pointermove", event => {
    if (!assistantDockResizing) return;
    const bounds = appMain.getBoundingClientRect();
    const maximum = Math.max(320, Math.min(620, bounds.width - 340));
    const width = Math.max(320, Math.min(maximum, event.clientX - bounds.left));
    deviceFrame.style.setProperty("--assistant-dock-width", `${Math.round(width)}px`);
    resizeAssistantInput();
  });
  document.addEventListener("pointerup", () => {
    if (!assistantDockResizing) return;
    assistantDockResizing = false;
    assistantDockResize.classList.remove("dragging");
    try {
      localStorage.setItem("ntPilotAssistantDockWidth", String(Math.round(assistantDock.getBoundingClientRect().width)));
    } catch (_) {
      // The resized dock remains available for this session.
    }
  });

  function resizeAssistantInput() {
    if (!assistantInput) return;
    assistantInput.style.height = "auto";
    assistantInput.style.height = `${Math.min(assistantInput.scrollHeight, 125)}px`;
  }

  function removeAssistantAttachment(attachmentId) {
    assistantDraftAttachments.delete(attachmentId);
    $$('[data-assistant-attachment-id]').find(chip => chip.dataset.assistantAttachmentId === attachmentId)?.remove();
    renderAssistantAttachments();
  }

  function renderAssistantAttachments() {
    if (!assistantAttachmentsCard || !assistantAttachmentList) return;
    const attachments = [...assistantDraftAttachments.entries()];
    assistantAttachmentsCard.classList.toggle("hidden", !attachments.length);
    if (assistantAttachmentsSummary) assistantAttachmentsSummary.textContent = `${attachments.length} conversation attachment${attachments.length === 1 ? "" : "s"}`;
    assistantAttachmentList.replaceChildren();
    attachments.forEach(([attachmentId, attachment]) => {
      const item = document.createElement("li");
      const copy = document.createElement("span");
      const name = document.createElement("b");
      const detail = document.createElement("small");
      const remove = document.createElement("button");
      name.textContent = attachment.label;
      detail.textContent = attachment.kind === "folder" ? attachment.detail : attachment.kind.toUpperCase();
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${attachment.label}`);
      remove.addEventListener("click", () => removeAssistantAttachment(attachmentId));
      copy.append(name, detail);
      item.append(copy, remove);
      assistantAttachmentList.appendChild(item);
    });
  }

  function addAssistantAttachment(label, kind, detail = "Local draft context", payload = null) {
    if (!assistantDraftContext || !label) return;
    const attachmentId = globalThis.crypto?.randomUUID?.() || `attachment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const chip = document.createElement("span");
    chip.className = "assistant-context-chip attachment";
    chip.dataset.assistantDraftAttachment = kind;
    chip.dataset.assistantAttachmentId = attachmentId;
    chip.title = detail;
    const marker = document.createElement("i");
    const name = document.createElement("b");
    name.textContent = label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${label}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => removeAssistantAttachment(attachmentId));
    chip.append(marker, name, remove);
    assistantDraftContext.appendChild(chip);
    assistantDraftAttachments.set(attachmentId, { kind, label, detail, payload });
    renderAssistantAttachments();
  }

  function addAssistantFiles(fileList) {
    const files = [...(fileList || [])];
    files.slice(0, 24).forEach((file, index) => {
      const kind = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "file";
      const label = file.name || (kind === "image" ? `Pasted image ${index + 1}` : `Pasted file ${index + 1}`);
      addAssistantAttachment(label, kind, `${file.type || "File"} · ${file.size.toLocaleString()} bytes`, file);
    });
    if (files.length > 24) showToast(`Attached 24 files · ${files.length - 24} more were skipped`);
  }

  $("#assistant-sessions-toggle")?.addEventListener("click", () => {
    assistantWorkspace.classList.remove("context-open");
    assistantWorkspace.classList.toggle("sessions-open");
  });
  $("#assistant-context-toggle")?.addEventListener("click", () => {
    assistantWorkspace.classList.remove("sessions-open");
    assistantWorkspace.classList.toggle("context-open");
  });
  $("#assistant-panel-scrim")?.addEventListener("click", closeAssistantPanels);
  $$('[data-assistant-close]').forEach(button => button.addEventListener("click", closeAssistantPanels));

  [$("#assistant-provider-button"), $("#assistant-account-settings")].filter(Boolean).forEach(button => {
    button.addEventListener("click", openAssistantProviderSheet);
  });
  $("#assistant-provider-close")?.addEventListener("click", closeAssistantProviderSheet);
  $("#assistant-provider-backdrop")?.addEventListener("click", closeAssistantProviderSheet);
  $$('[data-assistant-provider]').forEach(button => button.addEventListener("click", async () => {
    const labels = { codex: "Codex account sign-in", openai: "OpenAI API setup", openrouter: "OpenRouter setup", anthropic: "Anthropic setup" };
    if (button.dataset.assistantProvider !== "codex") {
      showToast(`${labels[button.dataset.assistantProvider]} is planned after the Codex reliability slice`);
      return;
    }
    if (state.assistantAccount) {
      closeAssistantProviderSheet();
      return;
    }
    let authWindow = null;
    try {
      button.disabled = true;
      authWindow = window.open("about:blank", "ntpilot-codex-login");
      const result = await assistantApi("/api/assistant/login", { method: "POST", body: JSON.stringify({ flow: "browser" }) });
      state.assistantLogin = result.userCode ? { userCode: result.userCode, loginId: result.loginId } : { loginId: result.loginId };
      setAssistantProviderState(null);
      const url = result.authUrl || result.verificationUrl;
      if (url && authWindow) {
        authWindow.opener = null;
        authWindow.location.replace(url);
      } else if (url) {
        await navigator.clipboard?.writeText(url).catch(() => {});
        showToast("Your browser blocked the sign-in window · the sign-in link was copied");
      } else {
        authWindow?.close();
      }
      if (result.userCode) showToast(`Enter code ${result.userCode} in the sign-in window`);
      const deadline = Date.now() + 180000;
      const check = async () => {
        await refreshAssistantStatus();
        if (state.assistantAccount) {
          state.assistantLogin = null;
          closeAssistantProviderSheet();
          showToast("Codex account connected");
          return;
        }
        if (Date.now() < deadline) setTimeout(check, 1200);
      };
      setTimeout(check, 1200);
    } catch (error) {
      state.assistantLogin = null;
      authWindow?.close();
      showToast(error.message);
    } finally {
      button.disabled = false;
    }
  }));

  $("#assistant-codex-logout")?.addEventListener("click", async () => {
    try {
      await assistantApi("/api/assistant/logout", { method: "POST", body: "{}" });
      state.assistantThreadId = null;
      state.assistantLogin = null;
      state.assistantThreads = [];
      state.assistantModels = [];
      assistantModelSelect?.replaceChildren();
      setAssistantProviderState(null);
      clearAssistantMessages();
      renderAssistantSessions();
      setAssistantConversationTitle("New conversation", { save: false });
      showToast("Codex account signed out");
    } catch (error) {
      showToast(error.message);
    }
  });

  assistantModelSelect?.addEventListener("change", () => {
    const providerLabel = $("#assistant-provider-button span:nth-child(2)");
    if (providerLabel) providerLabel.textContent = assistantModelSelect.selectedOptions[0]?.textContent || "Codex";
  });

  $("#assistant-new-session")?.addEventListener("click", () => {
    state.assistantThreadId = null;
    assistantInput.value = "";
    setAssistantConversationTitle("New conversation", { save: false });
    clearAssistantMessages();
    renderAssistantSessions();
    $$('[data-assistant-draft-attachment]').forEach(chip => chip.remove());
    assistantDraftAttachments.clear();
    renderAssistantAttachments();
    resizeAssistantInput();
    closeAssistantPanels();
    assistantInput.focus();
  });

  $("#assistant-session-search")?.addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    $$(".assistant-session").forEach(session => session.classList.toggle("hidden", !session.textContent.toLowerCase().includes(query)));
  });

  $$('[data-assistant-prompt]').forEach(button => button.addEventListener("click", () => {
    assistantInput.value = button.dataset.assistantPrompt;
    resizeAssistantInput();
    assistantInput.focus();
  }));

  function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  async function serializeAssistantAttachments() {
    const serialized = [];
    let totalBytes = 0;
    for (const attachment of assistantDraftAttachments.values()) {
      const files = attachment.kind === "folder" ? [...(attachment.payload || [])] : [attachment.payload];
      for (const file of files.slice(0, 24 - serialized.length)) {
        if (!(file instanceof File)) continue;
        totalBytes += file.size;
        if (totalBytes > 8 * 1024 * 1024) throw new Error("Attachments are limited to 8 MB per message for now.");
        const record = {
          name: file.webkitRelativePath || file.name,
          kind: file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "file",
          type: file.type
        };
        if (record.kind === "image" || record.kind === "pdf") record.dataUrl = await fileAsDataUrl(file);
        else record.text = await file.text();
        serialized.push(record);
      }
      if (serialized.length >= 24) break;
    }
    return serialized;
  }

  function assistantLiveContext() {
    const identity = state.liveIdentity;
    return {
      connected: Boolean(state.transportOnline && state.ntTransport && identity),
      firmware: identity?.version || "unknown",
      sysexId: identity?.sysexId,
      presetName: identity?.presetName || "Unknown preset",
      unsavedChanges: state.hasUnsavedWorkingEdits,
      slots: (state.routingSnapshot?.slots || identity?.slots || []).map(slot => ({
        index: slot.index,
        name: slot.name,
        guidKey: slot.guidKey,
        bypassed: slot.bypassed
      }))
    };
  }

  assistantInput?.addEventListener("input", resizeAssistantInput);
  assistantInput?.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  });
  $("#chat-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const prompt = assistantInput.value.trim();
    if (!prompt || state.assistantSending) return;
    if (!state.assistantAccount) {
      openAssistantProviderSheet();
      return;
    }
    const sendButton = $(".assistant-send-button", event.currentTarget);
    state.assistantSending = true;
    sendButton.disabled = true;
    appendAssistantMessage("user", prompt);
    const reply = appendAssistantMessage("assistant", "Thinking…", { pending: true });
    const replyBody = $("div", reply);
    let receivedText = false;
    try {
      const attachments = await serializeAssistantAttachments();
      const response = await fetch("/api/assistant/turns", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          threadId: state.assistantThreadId,
          prompt,
          model: assistantModelSelect?.value || null,
          context: assistantLiveContext(),
          attachments
        })
      });
      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Assistant Host returned ${response.status}.`);
      }
      assistantInput.value = "";
      resizeAssistantInput();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = done ? "" : lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const message = JSON.parse(line);
          if (message.type === "thread") state.assistantThreadId = message.threadId;
          if (message.type === "delta") {
            if (!receivedText) replyBody.textContent = "";
            receivedText = true;
            replyBody.textContent += message.delta;
            assistantThread.scrollTop = assistantThread.scrollHeight;
          }
          if (message.type === "error") throw new Error(message.message);
        }
        if (done) break;
      }
      reply.classList.remove("pending");
      if (!receivedText) replyBody.textContent = "No response was returned.";
      $$('[data-assistant-draft-attachment]').forEach(chip => chip.remove());
      assistantDraftAttachments.clear();
      renderAssistantAttachments();
      if (assistantHeading.textContent.trim() === "New conversation") setAssistantConversationTitle(prompt.slice(0, 58));
      await loadAssistantThreads();
    } catch (error) {
      reply.classList.remove("pending");
      reply.classList.add("error");
      replyBody.textContent = error.message;
    } finally {
      state.assistantSending = false;
      sendButton.disabled = false;
    }
  });

  assistantAttachButton?.addEventListener("click", event => {
    event.stopPropagation();
    const open = assistantAttachmentOptions.classList.toggle("hidden") === false;
    assistantAttachButton.setAttribute("aria-expanded", String(open));
  });
  $$('[data-assistant-attachment]').forEach(button => button.addEventListener("click", () => {
    const inputs = { file: assistantFileInput, image: assistantImageInput, folder: assistantFolderInput };
    assistantAttachmentOptions.classList.add("hidden");
    assistantAttachButton.setAttribute("aria-expanded", "false");
    inputs[button.dataset.assistantAttachment]?.click();
  }));
  [assistantFileInput, assistantImageInput].filter(Boolean).forEach(input => input.addEventListener("change", () => {
    addAssistantFiles(input.files);
    input.value = "";
  }));
  assistantFolderInput?.addEventListener("change", () => {
    const files = [...assistantFolderInput.files];
    const folderName = files[0]?.webkitRelativePath?.split("/")[0] || "Selected folder";
    if (files.length) addAssistantAttachment(folderName, "folder", `${files.length} local file${files.length === 1 ? "" : "s"} selected`, files);
    assistantFolderInput.value = "";
  });
  let assistantDragDepth = 0;
  assistantWorkspace?.addEventListener("dragenter", event => {
    if (![...(event.dataTransfer?.types || [])].includes("Files")) return;
    event.preventDefault();
    assistantDragDepth += 1;
    assistantWorkspace.classList.add("drag-active");
  });
  assistantWorkspace?.addEventListener("dragover", event => {
    if (![...(event.dataTransfer?.types || [])].includes("Files")) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  });
  assistantWorkspace?.addEventListener("dragleave", () => {
    assistantDragDepth = Math.max(0, assistantDragDepth - 1);
    if (!assistantDragDepth) assistantWorkspace.classList.remove("drag-active");
  });
  assistantWorkspace?.addEventListener("drop", event => {
    event.preventDefault();
    assistantDragDepth = 0;
    assistantWorkspace.classList.remove("drag-active");
    addAssistantFiles(event.dataTransfer?.files);
  });
  assistantComposeArea?.addEventListener("paste", event => {
    const clipboard = event.clipboardData;
    const pastedFiles = [...(clipboard?.files || [])];
    if (!pastedFiles.length) {
      [...(clipboard?.items || [])].forEach(item => {
        if (item.kind !== "file") return;
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      });
    }
    const pastedText = clipboard?.getData("text/plain") || "";
    if (!pastedFiles.length && event.target === assistantInput) return;
    event.preventDefault();
    if (pastedFiles.length) addAssistantFiles(pastedFiles);
    if (pastedText) {
      const start = assistantInput.selectionStart ?? assistantInput.value.length;
      const end = assistantInput.selectionEnd ?? start;
      assistantInput.setRangeText(pastedText, start, end, "end");
      resizeAssistantInput();
    }
    assistantInput.focus();
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".assistant-attachment-menu")) {
      assistantAttachmentOptions?.classList.add("hidden");
      assistantAttachButton?.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAssistantPanels();
      closeAssistantProviderSheet();
    }
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

  const initialMapping = $(".mapping-item.active");
  if (initialMapping) populateMapping(initialMapping);
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
  state.sidebarCollapsed = false;
  const recoveredView = ["editor", "routing", "mapping", "control", "status", "assistant"].includes(rebootRecovery?.view)
    ? rebootRecovery.view
    : "editor";
  setView(recoveredView);
  refreshAssistantStatus();
  readRealIdentity();
})();
