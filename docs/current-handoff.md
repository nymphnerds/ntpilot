# NT Pilot development handoff

Last updated: 26 September 2026

## Tomorrow: start here

- Current pushed commit: `b042f13` (`Use routing assignment flow directly from editor`).
- The user stopped for the night immediately after requesting an architecture audit. Do **not** resume feature work or apply another routing UI patch first.
- The immediate bug was that Editor had acquired its own routing-popup adapter. It performed a full routing scan before showing a reduced popup, making iOS slow and inconsistent with Routing.
- Commit `b042f13` removed that adapter. Editor now creates a routing selection and hands it directly to the same `assignRoutingPort()` path used by Routing.
- The user has not yet hardware-tested `b042f13`. First confirm on the iPad that an Editor bus choice opens promptly and presents the same appropriate decision UI as the Routing page.
- The user explicitly wants structural correction rather than more band-aids. Discuss and perform the refactor incrementally, with behaviour-locking tests first and small reversible commits.
- During the audit no application files were changed or pushed. This handoff is the only subsequent local edit.

### Audit findings

1. Routing still has two transaction implementations: `finishRoutingConnection()` and `assignRoutingPort()`. Both perform mode writes, route removal, rollback, history, full refresh, polling restart and notifications. They must converge on one transaction executor.
2. A single routing assignment currently calls `loadLiveRouting()`, which rereads all slots and output-mode metadata. This is a major source of iOS latency. Use targeted local/readback updates where correctness permits; reserve a complete snapshot rebuild for entry, explicit refresh and recovery.
3. Editor, Performance, routing, bypass and history have separate parameter-write pipelines. They share `state.parameterWriteQueue`, but duplicate mutation, error, history and UI synchronization policy.
4. `state.liveRouting` and `state.routingSnapshot` are competing owners of effectively the same routing model. Consolidate to one canonical routing state.
5. Some routing decisions are reconstructed from DOM elements. Routing selections and port metadata must be model objects independent of whether desktop graph or iPad list has rendered.
6. Popup rendering, connection policy, NT mutation, rollback and notification copy are interleaved. The popup should render a pure connection plan; one controller should validate and execute that plan.
7. `app.js` is approximately 3,900 lines and contains unrelated Editor, Routing, Performance, history, polling, reconnect and layout behaviour.
8. There is no routing transaction test suite. Existing automated coverage is primarily the Web MIDI transport.

### Safe refactor order

1. Add behaviour-locking tests for input reassignment, output Add/Replace, keep/disconnect other routes, rollback after partial failure, undo of compound changes, and identical Editor/Routing intents.
2. Introduce canonical DOM-independent `RoutingSelection`, `ConnectionIntent` and `ConnectionPlan` data shapes without changing the UI.
3. Extract one routing transaction executor responsible for validation, serialized writes, rollback, history and refresh policy.
4. Move `assignRoutingPort()` onto it, verify, then move `finishRoutingConnection()` onto it and delete the duplicate transaction code.
5. Make both Editor and Routing produce the same `ConnectionIntent`; neither page should own routing policy.
6. Replace `liveRouting`/`routingSnapshot` with one canonical store after both paths use the controller.
7. Consolidate general parameter mutation only after routing is stable.
8. Split modules last. Avoid a large file move while behaviour is still changing.

Do not claim zero regression risk. Keep every stage testable and reversible, do not redesign visuals during the refactor, and do not delete an old path until tests prove the replacement has equivalent behaviour.

## Second major missing system: add and manage algorithms/plug-ins

NT Pilot can currently edit, route, bypass and reorder algorithms already present in a preset, but it does not provide the complete slot lifecycle. This is the next major product feature after the routing architecture is stabilized.

Required user workflow:

- Add a factory algorithm or installed plug-in to an empty slot.
- Browse and search the algorithms and plug-ins actually available on the connected NT rather than relying on a hard-coded catalogue.
- Clearly distinguish factory algorithms from plug-ins and show the authoritative name plus any firmware-exposed author, version, compatibility or resource information.
- Replace an occupied slot with an explicit warning about affected routing, mappings, Performance assignments and unsaved working state.
- Handle a full ten-slot preset with an understandable choice: replace a slot, cancel, or reorder first. Never silently overwrite a slot.
- Remove an algorithm with equivalent impact information and confirmation.
- Reread the authoritative slot/preset state from the NT after every successful mutation.
- Integrate add, replace and remove into the same Undo/Redo model where the official NT API provides enough information to restore the previous state safely.
- Work consistently in desktop and iPad modes without separate mutation implementations.

Architecture requirements:

1. Create one canonical slot-mutation controller for add, replace, remove and reorder. Editor cards and any future browser are only clients of this controller.
2. Keep algorithm discovery/catalogue reads separate from preset mutation writes.
3. Represent every requested change as a previewable plan containing the target slot, selected algorithm/plug-in and known affected state before any write occurs.
4. Serialize mutations through the same hardware command queue and reconnect protection used by other NT writes.
5. Verify every mutation using NT readback; do not optimistically fabricate the new slot state.
6. Preserve the existing selected slot when possible and deliberately choose the new selection after add/replace/remove.
7. Add protocol-level and controller-level tests before exposing destructive replace/remove controls.

Before implementation, reread the latest official disting NT manual and API/SysEx documentation to establish the authoritative commands and limitations for algorithm enumeration, plug-in enumeration, slot creation, replacement and removal. Do not infer these operations from NT Helper UI behaviour and do not create separate factory/plugin write paths unless the hardware API genuinely requires them.

## Repository and runtime

- Development checkout: `/home/nymph/DistingNT/ntpilot`
- Branch: `main`
- Remote: `git@github.com:nymphnerds/ntpilot.git`
- Browser target: desktop Chrome at `http://localhost:8766`
- Hardware target: Expert Sleepers disting NT over Web MIDI/SysEx
- Recovery snapshot made before the routing-truth work: `/home/nymph/DistingNT/ntpilot-snapshot-before-routing-truth-20260925-162514`

This checkout is in the `NymphsCore_Lite` WSL development environment. The standalone browser build is the active target. Do not copy these changes into the VS Code bridge until the user explicitly resumes that work.

## Product direction

NT Pilot is not intended to reproduce NT Helper's routing UI. NT Helper is used as a protocol and behavioural reference; NT Pilot's interaction model is deliberately more direct, compact and touch-friendly.

The root README records the concrete improvements over NT Helper. Preserve that distinction: borrow protocol truth, not its cable labels, default focus behaviour, post-connection mode workflow or graph composition.

The central model is the NT bus universe:

- Physical inputs and outputs are numbered chips; their colour and bank labels communicate direction.
- Aux buses retain rainbow `A1`–`A44` labels.
- Any parameter that the firmware reports as bus-assignable receives the same compact chip treatment.
- Parameter modulation is separate from signal routing and uses dashed gold cables.
- Add/Replace belongs to an algorithm output writing to a bus, not to the Aux bus itself.

## Current Editor behaviour

- The selected slot is shared across Editor and Mapping views.
- The bus dock is fixed beneath the top application bar, outside the scrolling parameter content.
- Row one contains the compact Aux rainbow.
- Row two contains numbered blue inputs on the left, a large neutral None control in the centre, and numbered red outputs on the right.
- Parameter rows are ordered as title and MIDI mapping control, slider, raw value, then bus chip.
- Tapping the bus chip arms it with a mint breathing ring; tapping a dock chip writes the corresponding parameter value.
- Slider changes stream to the NT while dragging rather than waiting for pointer release.
- Fast sync is the default. The UI calls the former Smart mode Slow.
- Algorithm list and bus dock remain fixed while the parameter pane scrolls.
- Editor and Performance use the same custom NT Pilot slider language and continuous verified write path.
- Long parameter lists use deterministic low-opacity row tints and fine matching edges so adjacent controls remain easy to track.
- Every live algorithm card exposes a quick bypass toggle. Bypassed slots use a clear low-opacity treatment and an animated `Zzz` indicator in both Editor and Routing.
- Algorithm cards support drag-and-drop reordering through the NT's native reorder command. Writes are reread and verified before the UI accepts the new order.
- Text Undo/Redo controls and `Ctrl/Cmd+Z` / `Shift+Ctrl/Cmd+Z` cover verified slot moves.
- Selected Editor slots use a stronger solid tint derived from their unique colour; unselected slots retain fine boundaries.
- The compact sidebar remains visible in Routing at normal desktop widths.

## Performance and Assistant

- Performance is no longer static sample content or derived from MIDI mappings. It reads the NT's preset-wide native Performance Page assignments, four controls per page.
- Moving a Performance slider writes the exact same live parameter as its Editor row; polling keeps both representations synchronized.
- String-valued and binary parameters show their real labels instead of streams of raw numbers. Continuous controls coalesce writes while dragging.
- Performance assignments remain global when a different Editor algorithm is selected.
- Assistant remains intentionally unimplemented. Its page is visibly marked as an interface preview, all write/chat actions are disabled, and Status no longer claims an AI provider is connected.

## Status, reference and visual identity

- A persisted Dark mode switch is available in the sidebar independently of iPad mode. It uses layered charcoal-blue surfaces across the complete interface, including detached routing popups and the wiki dialog, while preserving semantic input/output/Aux/modulation colours.
- Status card typography now uses a consistent hierarchy; live hardware state is a readable badge rather than tiny incidental text.
- The entire Knowledge card opens a built-in, searchable, text-first NT wiki.
- The wiki condenses the official firmware 1.18 manual into 15 operational sections with a contents column and page-specific links back to the official PDF.
- The header uses the supplied transparent NT Pilot emblem from `assets/nt-pilot-emblem.png`.
- The default interface accent is neutral mint. Selecting an Aux chip previews that bus colour across the interface, and a confirmed Aux assignment retains it. Selecting a port alone does not imply an Aux colour.

## Current Routing behaviour

- In iPad mode, Routing uses a full-width vertical algorithm list with large named input/output rows and explicit coloured bus badges rather than the desktop cable matrix. The fixed bottom bus dock matches Editor.

- Routing shows the complete graph by default while retaining the compact sidebar.
- Clicking empty graph space clears algorithm focus and restores the complete view.
- The master Signals switch controls all cable types. Input, Output, Aux and Mod buttons independently filter categories.
- Signal inputs are blue, physical outputs red, Aux routes use their bus colour, and modulation is gold and dashed.
- Cables leave and enter the correct side of algorithm cards, with equal endpoint stubs and subtle curved corners.
- Physical input/output banks share a top alignment. Optional USB Audio From Host and USB Audio To Host algorithms occupy compact side positions beneath their corresponding physical bank.
- Side stacks are centred against the total central algorithm list.
- Add/Replace chips are always visible on output rows. Editable chips are backed by a real NT mode-controller parameter; fixed or unresolved chips are read-only.
- Output-mode chips explicitly distinguish editable Add/Replace, known fixed mode, disconnected fixed mode, metadata loading and metadata failure. A missing `0x55` association never fabricates an editable Replace option.
- New assignments are confirmed in a compact popup positioned beside the pointer/touch target. Outputs keep NT Add/Replace visibly separate from “Keep existing”/“Disconnect other routes.” Input confirmation states the old and new sources and makes clear that only that input changes, because Add/Replace does not apply to reads.
- While a connection confirmation is open, selecting another Aux chip in either Routing or Editor retargets the same pending algorithm port and refreshes the popup; users do not need to cancel and select the port again.
- Routing-mask-only reads are presented as derived routing rather than exposing internal “implicit read” terminology. Standard polysynth gate inputs show their editable Pitch CV count directly on the parent gate row, with automatically consecutive Pitch CV buses indented underneath. Unrecognised derived reads use a safe “Also uses” fallback and remain non-editable.
- Replace has repeatedly confused users because it sounds like a routing replacement. It is not: no parameter assignment is disconnected. Replace overwrites the signal accumulated on that bus at the algorithm's ordered slot position. Writes from earlier slots remain configured but are inaudible downstream of that Replace; writes from later slots still contribute.
- The graph makes that signal-order result explicit. A route whose contribution is masked by a later Replace remains present as a faded dashed cable, the effective Replace writer is emphasized, and its native SVG hover text explains the state. A truly disconnected route has no cable. Apply this consistently to physical-output and Aux-bus paths.
- Assigning a supported algorithm output to a physical or Aux bus opens the shared connection popup before writing.
- Direct output-mode edits also use the shared popup.
- A route can be created in either interaction order: choose the port then Aux, or Aux then port.
- Physical outputs accept algorithm outputs in both click orders. Add/Replace applies to the algorithm's bus write regardless of whether the destination bus feeds a physical output or is an Aux bus; fixed-mode outputs connect without requiring a mode controller.
- Physical input/output direction is validated before writes, and routing selections survive the background `0x55` mode-metadata hydration redraw.
- Routing assignments now stop blocking on a complete post-write routing scan. Each changed NT parameter still receives the transport's targeted readback verification, the verified value is applied to the local routing snapshot immediately, and a debounced quiet full snapshot/mode reconciliation follows in the background.
- Bypass is directly available on routing algorithm blocks and uses an intentionally subtle sleeping treatment.

## Bus dock and expansion

- Aux, input and output chips use one responsive chip size so their banks remain visually aligned as the window changes.
- Physical inputs and outputs are grouped before expander outputs.
- The bus universe is read from SysEx `0x60`; the UI does not assume the factory I/O counts.
- Native outputs 1–8 and the first NTX-8CV bank 9–16 share the same physical row. Further banks remain on that row while space exists, then wrap as complete, labelled rows.
- Placeholder NTX chips are faded off-white and have an immediate custom tooltip explaining numbering, multiple-module handling and the maximum configuration.
- Scrollbars are visually hidden in the algorithm/parameter region so they do not cover the thin per-row colour boundary.

## Add/Replace architecture

The implementation now follows NT Helper's hardware-truth path:

1. Read all slot parameter metadata.
2. Treat `ioFlags & 8` as the sole authoritative output-mode marker.
3. Query SysEx `0x55` for each marked mode parameter.
4. Cache `mode parameter -> affected output parameters` for the connected preset shape.
5. Derive each output chip from the actual mode parameter value (`0 = Add`, `1 = Replace`).
6. On output-to-Aux assignment, present the choice immediately.
7. Pause live polling, write the selected mode, write the bus assignment, then rebuild from NT readback.

Do not restore name-based mode guessing. A critical parser bug was fixed: parameter names are null-terminated and are not limited to 24 characters. The former 24-character cap interpreted long-name bytes as metadata, generated false mode flags, caused many `0x55` timeouts and made Routing extremely slow.

Initial routing content renders before output-mode hydration completes. If a user opens the choice during hydration, the action waits for the same hydration promise rather than bypassing the popup.

## Connection lifecycle

- Chrome requests the NT Web MIDI ports automatically.
- Disconnect flushes routing state, polling, selections and pending UI work.
- Reconnect cancels any stale SysEx request, discards old port objects, reacquires both endpoints and rereads identity.
- A disconnect immediately starts fresh endpoint reacquisition; failed reconnects continue every 1.2 seconds because NT USB MIDI ports can return after the module itself boots.
- Once a rebooted NT answers again, the app records the current view, performs one browser reload to discard Chrome's stale Web MIDI objects, restores that view and automatically reconnects.
- Transport still permits one outstanding SysEx request. All polling, parameter writes and routing transactions must continue to coordinate through the existing stop/wait/restart pattern.

## Current asset versions

- `styles.css?v=20260926-225`
- `web-midi-transport.js?v=20260925-44`
- `routing-logic.js?v=20260925-2`
- `app.js?v=20260926-164`

Increment the relevant query whenever browser-visible JavaScript or CSS changes.

## Verified in this session

- The user supplied a screenshot confirming that the Add/Replace popover now appears for an output connection.
- Physical input/output labels now show numbers only; Aux retains `A`.
- JavaScript syntax checks pass.
- `web-midi-transport.test.cjs` passes, including SysEx `0x55` parsing.
- `git diff --check` passes.
- Native Performance Page string/value queries, dual CPU meter parsing, bypass writes, slot reordering and firmware-reported bus counts have automated transport coverage.
- All 15 built-in wiki contents links resolve to their matching text section.

## Hardware tests still needed

1. Choose both Add and Replace on a known mode-capable output, then confirm the output chip and NT parameter retain the selected mode after refresh.
2. Assign the same output to an occupied Aux bus in both modes and confirm audible/graph behaviour.
3. Confirm a controller shared by multiple outputs updates every affected chip.
4. Confirm Mod-only filtering shows the known modulation route with Input, Output and Aux disabled and Signals enabled.
5. Reboot the NT while Routing is open and verify automatic recovery without a manual browser refresh.
6. Compare first-load and post-edit routing load time now that long parameter names parse correctly and `0x55` relationships are cached.
7. Test USB Audio From Host and USB Audio To Host placement in a blank patch containing those factory algorithms.

## Known boundaries and risks

- The compact pointer-positioned popup replaces the oversized bottom-inspector form. Hardware still needs to confirm Add/Replace persistence and the multi-write “Disconnect other routes” transaction on both physical and Aux destinations.
- Output-mode metadata is optional on older firmware. An output without an authoritative `0x55` association must remain fixed/read-only rather than guessed.
- The routing graph uses the aggregate `0x61` masks for overview cables and individual parameter metadata/values for editable ports. Keep those concepts separate.
- Routing hydration is intentionally non-blocking, but the single-request transport remains a performance constraint.
- The standalone and VS Code copies have diverged. Do not mechanically overwrite either copy when bridge work resumes; port reviewed changes deliberately.

## Checks

```bash
node --check app.js
node --check web-midi-transport.js
node web-midi-transport.test.cjs
git diff --check
```

## Next recommended step

Hardware-test pushed commit `b042f13` first. If its Editor popup is still not identical to Routing, diagnose the single shared path rather than adding an Editor adapter. Then begin the test-first routing consolidation described at the top of this document.
