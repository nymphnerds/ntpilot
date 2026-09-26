# NT Pilot development handoff

Last updated: 26 September 2026

## Tomorrow: start here

- Current code baseline before the 26 September audit changes: commit `80bdc0c` (`Open preset JSON editor at document start`).
- Read `docs/baseline-audit-2026-09-26.md` for the official-source protocol inventory, fixes made during the audit and the ordered cleanup path.
- Standalone-only recovery snapshot: `/home/nymph/DistingNT/ntpilot-standalone-snapshot-ui-milestone-20260926-120311` at UI commit `fd738fa`, including this refreshed handoff and no VS Code extension files.
- **Hard scope boundary:** the VS Code extension is abandoned/out of scope. Do not inspect, edit, sync, port to, test, package or document `vscode-webmidi/**`. Its existing uncommitted files belong to the user and must remain untouched. All future work targets only the standalone browser app.
- The user has hardware-tested the shared Editor/Routing connection popup, iPad routing list, popup retargeting, immediate verified routing writes, dark mode and reconnect flow. The routing interaction is now substantially usable on the real NT and iPad Web MIDI browser.
- Recent work removed the blocking full routing scan from the connection transaction. Each parameter write still receives targeted NT readback; the local port updates immediately and a quiet debounced full reconciliation follows.
- Recent UI polish added bus-aware popup/sidebar colours for Aux, physical input and physical output selections; reliable touch radio choices; calmer severity-aware notifications with adaptive reading time; and independent Audio/Overall CPU colour spectra with larger dots.
- Sync and interface Scale form a matched compact stack at the bottom of the sidebar in both desktop and iPad modes, with Sync directly above Scale and identical outer dimensions for the active mode.
- Sync uses an app-rendered three-choice menu rather than a native browser select, so its popup follows light/dark styling consistently in the iPad Web MIDI browser.
- The built-in wiki becomes a near-edge-to-edge full-page reader in iPad mode, with larger navigation, search, article and footer typography while retaining independent contents/article scrolling.
- The first safe algorithm-add slice is now implemented: the `Algorithms [+]` browser reads the live NT catalogue, distinguishes built-ins from plug-ins, loads an unloaded plug-in through the NT first, then adds with named starting settings and verifies each NT readback. Add/load operations explicitly pause parameter and CPU polling; because `0x32`/`0x38` have no ACK, they wait one second and then poll only the affected slot count, slot GUID or catalogue entry for up to ten seconds before a complete UI refresh.
- The NT SysEx add command only appends. NT Pilot turns **Add before**, **Add after** and **Add at end** into one transaction: append, native move if needed, then reread the complete preset and verify the requested GUID at its target slot.
- This slice refuses a full 40-slot preset. Do not add destructive replacement by chaining remove/add: the old slot's complete specification state cannot yet be restored safely. Implement replacement only as a previewable, tested, reversible lifecycle plan.
- An algorithm add is represented as one Undo/Redo history action; Undo removes only the exact verified newly-added slot, and Redo recreates it at the original target position.
- The standalone app now has a **Presets** page between Performance and Assistant. It is a preset library rooted at `/presets/`, never a general SD-card browser: it shows preset JSON files and folders only. The official browser and NT Helper's SD-card preset scanner both enter that directory as `/presets/`. It sends the official fire-and-forget Wake command (`0x07`) before each card operation, then uses the official `0x7A` directory operation with a dedicated, operation-matched ten-second transaction while live parameter and CPU polling are paused. The Web MIDI receiver reassembles fragmented `F0…F7` input before matching replies, following NT Helper's scheduler: large directory listings must not be discarded merely because the browser splits them across MIDI input events. Preset-library failures display the actual NT response or timeout rather than a generic error. It supports folder navigation, new-folder, **Rename preset**, **Edit JSON**, and delete actions, and lets a selected `.json` preset either replace the working preset (`0x34 append=0`) or append after its final algorithm (`0x34 append=1`). **Rename preset** updates both the selected document’s fixed-width root `name` field and its matching `.json` filename: it writes and byte-verifies the new file first, then deletes the old file. **Edit JSON** downloads the selected file using `0x7A/02`, validates its UTF-8 JSON, and writes it back with the documented `0x7A/04` 512-byte chunks; it rereads and byte-verifies the saved document. Loading has no native ACK, so the UI waits for the NT to become readable and then refreshes its snapshot before returning control. The API has no native insert-in-the-middle preset operation; do not imply one in future UI.

## Assistant product decisions — preserve these

The Assistant is a central product goal, not a decorative chat page. It must improve
on NT Helper's failure modes: partially completed edits, stalled algorithm insertion,
confusion around names/GUIDs, destructive live mutation, loss of context after an NT
reboot, and no durable conversation history.

- Keep three responsibilities distinct. **NT Pilot** owns the live device model,
  deterministic operations, verification, Undo/Redo and the explicit save control.
  **The Assistant** understands the request, consults cited knowledge and proposes
  high-level intents. **The NT** remains the authority for actual connected state.
- Never let a model invent raw SysEx or directly improvise a hardware mutation. A
  future write-capable Assistant must call typed NT Core intents which validate,
  preview, serialize, read back and report every step.
- The current Assistant milestone is deliberately read-only. The later editing flow
  must prepare a visible in-memory change plan, allow review/approval, and leave the
  final **Save preset** action to the user. Assistant activity must never silently save
  a preset to the card.
- Reboots and disconnects are normal workflow events. Conversation and pending-plan
  state must survive them. After reconnection, reread the NT, compare actual state
  with the last verified checkpoint, then resume or re-plan; never assume a command
  completed merely because it was sent.
- Build reusable, platform-neutral TypeScript **NT Core** around the canonical
  device/preset model, intents and transactions. The browser/Web MIDI app is the
  current implementation; an iOS AUv3 wrapper and native transport come last, after
  those boundaries are stable. Do not port browser UI or Web MIDI code directly into
  the AUv3.
- Knowledge order is: live device metadata; matching official user manual; firmware
  notes; official C++/Lua API; official editor protocol evidence; verified plug-in
  docs; explicitly labelled community evidence. Manual 1.18 is the present semantic
  baseline (438 pages), while firmware 1.19 is the release target. Never silently
  treat a 1.18 fact as proven for 1.19.
- The sibling `ntpilot-knowledge` repository already builds the cited knowledge pack
  and exposes the read-only `knowledge_search`, `knowledge_open` and
  `algorithm_reference_resolve` contracts. Exact identifiers and writable values
  must still resolve against the live NT before any later mutation.

### Assistant experience agreed in this session

- Full Assistant page first; a resizable left dock beside the collapsed app sidebar
  while editing so the patch and chat remain visible together. The composer must
  always remain usable in the dock.
- Clicking a selected category a second time is the compact-sidebar gesture for all
  categories. Do not add a large labelled “Collapse sidebar” row or a large “Dock in
  Editor” control. Keep the small bottom-edge arrow and the Assistant navigation
  interaction.
- Conversations are persistent and renameable. Provider/account setup happens in an
  overlay on the Assistant page, not by navigating to Settings.
- The composer follows the existing NT Pilot visual language: roomy text area with a
  compact lower action row, aligned attachment/model/send controls, Enter to send and
  Shift+Enter for a newline. Do not copy NT Helper's send-button treatment.
- Accept text paste, pasted images, drag/drop, documents, images, presets, code and
  selected folders. Show attached items in both the draft and the visible context
  list. Current client limits are 24 files and 8 MB per message.
- The provider menu is designed for Codex subscription, OpenAI API, OpenRouter and
  Anthropic. Only Codex subscription is functional today; the other three are honest
  placeholders and must not appear connected.

### Codex account boundary and current implementation

- The user must sign in, sign out and switch ChatGPT/Codex subscription accounts from
  **inside NT Pilot**. This must not depend on their personal Codex CLI, VS Code login,
  shell configuration or desktop account state.
- The NT Pilot Assistant service packages its own Codex runtime. Each browser/native
  client receives an opaque HTTP-only cookie and an isolated server-side account
  directory, conversation store and App Server process. Models are read dynamically
  from the signed-in account; do not maintain a hard-coded model list.
- Local browser sign-in works now. The remote/iPad deployment uses device
  authorization through the same NT Pilot UI. This service is still a development
  deployment, not a finished public service; production needs HTTPS, private
  persistent credential storage, rate limiting, idle-session cleanup and deployment.
- A 404 on `/api/assistant/status` was caused by old static Python servers on ports
  `4173` and `8767`. `host/ntpilot-host.mjs` now supports alias ports so all current
  local tabs can use the real API from one process. Start tomorrow with:

  ```bash
  NTPILOT_ALIAS_PORTS=4173,8767 node host/ntpilot-host.mjs
  ```

  Canonical URL: `http://localhost:8766`. The alias URLs are development convenience
  only. At handoff, all three status endpoints returned HTTP 200 and a clean signed-out
  session successfully started a new Codex device-login flow.
- Important unfinished attachment work: images and text files reach the model, but PDF
  extraction is not restored in the rewritten service yet. A PDF currently arrives as
  a binary attachment marker. Add bounded server-side extraction and container support
  before claiming that the Assistant can read PDFs.
- Full service/deployment notes are in `docs/assistant-service.md`; knowledge rules are
  in the sibling `ntpilot-knowledge/AGENTS.md` and `README.md`.

### Audit findings

1. `finishRoutingConnection()`, `assignRoutingPort()` and direct output-mode changes now use the tested `executeRoutingTransaction()` for ordered mode/removal/application writes and rollback. History, polling, refresh and notifications are still UI-level concerns and should move behind a full controller next.
2. The routing latency problem is mitigated, not architecturally finished. Assignments now update the verified parameter locally and debounce a full reconciliation, but snapshot mutation, targeted DOM updates and reconciliation policy still live inside UI-heavy `app.js` functions.
3. Editor, Performance, routing, bypass, history, mapping, slot and preset operations now share one `OperationScheduler`. Their UI update, error-copy and history policies remain separate and should converge gradually.
4. Routing now has one canonical `state.routingSnapshot`; the duplicate `state.liveRouting` owner has been removed.
5. Direct/algorithm connection planning is now DOM-independent in `routing-logic.js`, but some selection construction still begins from rendered port datasets. Complete model-owned port metadata remains the next routing-store step.
6. Popup rendering, connection policy, NT mutation, rollback and notification copy are interleaved. The popup should render a pure connection plan; one controller should validate and execute that plan.
7. `app.js` remains about 5,600 lines and still contains unrelated Editor, Routing, Performance, history, reconnect, notification and layout behaviour. Domain rules and scheduling have begun moving into modules, but view/controller splitting remains.
8. Routing transaction and connection-plan tests now cover ordered writes, partial failure, rollback and free-Aux planning. Compound history and rendered Editor/Routing intent equivalence still need browser/controller coverage.

### Safe refactor order

1. Extend the current tests to cover output Add/Replace, keep/disconnect, compound history and identical rendered Editor/Routing intents.
2. Complete model-owned `RoutingSelection` metadata so DOM datasets are only view bindings; `ConnectionPlan` is now pure and tested.
3. Extend the transaction controller boundary to own history and refresh policy; serialization, ordered writes and rollback are now shared.
4. Keep all three migrated routing entry points on `executeRoutingTransaction()` while moving their remaining shared UI-side policy behind the controller.
5. Make both Editor and Routing produce the same `ConnectionIntent`; neither page should own routing policy.
6. Keep `state.routingSnapshot` as the sole routing owner and remove any new parallel caches during later extraction.
7. Move common post-write model/history updates behind the scheduler without degrading continuous slider coalescing.
8. Split view/controller modules incrementally now that domain planning and scheduling are behaviour-locked.

Do not claim zero regression risk. Keep every stage testable and reversible, do not redesign visuals during the refactor, and do not delete an old path until tests prove the replacement has equivalent behaviour.

## Second major missing system: add and manage algorithms/plug-ins

NT Pilot can now browse live factory algorithms and installed plug-ins, load an installed plug-in, then add it before, after or at the end of the selected slot. The browser always exposes those three placement choices after an available algorithm is selected; it does not pre-judge slot capacity or imply a replacement. An unloaded plug-in opens its compact Load popup; after the NT confirms the load, that same popup becomes the insertion form with placement choices, firmware-reported starting specifications, memory result and the final Add action. Each add mutation is read back from the NT before the UI accepts it.

Every live Editor algorithm card also has an explicit remove control: a compact red × on desktop hover and a touch-sized control in iPad mode. Its confirmation names the exact algorithm and explains that later slots shift up. NT Pilot sends the official `0x33 <slot>` command, then rereads and requires the slot count to decrease before accepting the delete. Removal clears local Undo/Redo because a removed algorithm's specification state cannot yet be reconstructed safely.

Required user workflow:

- Add a factory algorithm or installed plug-in at a chosen insertion point.
- Browse and search the algorithms and plug-ins actually available on the connected NT rather than relying on a hard-coded catalogue.
- Clearly distinguish factory algorithms from plug-ins and show the authoritative name plus any firmware-exposed author, version, compatibility or resource information.
- Replace an occupied slot with an explicit warning about affected routing, mappings, Performance assignments and unsaved working state.
- Handle a full 40-slot preset with an understandable choice: replace a slot, cancel, or reorder first. Never silently overwrite a slot.
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
- Current standalone-only UI milestone snapshot: `/home/nymph/DistingNT/ntpilot-standalone-snapshot-ui-milestone-20260926-120311`

This checkout is in the `NymphsCore_Lite` WSL development environment. The standalone browser build is the only active target. The VS Code bridge is permanently out of scope unless the user explicitly reverses that decision in a future request.

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
- Assistant now has a platform-neutral HTTP contract for status, login/logout, models, threads and streamed turns. Each browser/native client receives an opaque HTTP-only session whose provider account, conversations and App Server process are isolated on the NT Pilot service.
- **Hard boundary:** NT Pilot never reads or alters a user’s workstation Codex CLI, VS Code configuration or login. The deployable service carries its own runtime and owns provider credentials, cited knowledge tools and enforcement of the no-MIDI/no-preset-save safety policy. Remote deployments use device authorization so sign-in does not depend on a desktop localhost callback.
- Start the local UI/service with `node host/ntpilot-host.mjs` and use `http://localhost:8766`. The same container can be hosted for desktop, iPad and later AUv3 clients; see `docs/assistant-service.md`.

## Status, reference and visual identity

- A persisted Dark mode switch is available in the sidebar independently of iPad mode. It uses layered charcoal-blue surfaces across the complete interface, including detached routing popups and the wiki dialog, while preserving semantic input/output/Aux/modulation colours.
- Status card typography now uses a consistent hierarchy; live hardware state is a readable badge rather than tiny incidental text.
- The entire Knowledge card opens a built-in, searchable, text-first NT wiki.
- The wiki condenses the official firmware 1.18 manual into 15 operational sections with a contents column and page-specific links back to the official PDF.
- The header uses the supplied transparent NT Pilot emblem from `assets/nt-pilot-emblem.png`.
- The default interface accent is neutral mint. Bus selection previews and retains the semantic bus colour across the sidebar and popup: blue for physical inputs, coral/red for physical outputs and the individual rainbow hue for Aux buses.
- Routine notifications are compact, calm pills rather than black technical banners. Guidance follows the current bus accent, genuine errors receive a distinct treatment, common transport failures are translated into useful actions, and display time scales with message length and severity. Raw diagnostic detail remains in the browser console.
- Audio and Overall CPU values each have a larger dot and matching text colour on a continuous teal-to-red 0–90% spectrum. The built-in wiki reflects the firmware 1.18 guidance to keep total algorithm/audio CPU below about 90%; Overall also includes MicroSD and background work and has no separately documented hard limit.

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
- While a connection confirmation is open, selecting another Aux or physical bus chip in either Routing or Editor retargets the same pending algorithm port and refreshes the popup; users do not need to cancel and select the port again.
- Enabled popup choices use explicit touch handling for the iPad Web MIDI browser. Input reassignment hides irrelevant output-mode/route-removal decisions. Add/Replace is enabled only when the NT exposes an authoritative editable mode parameter, while Disconnect other routes is enabled only when other editable outputs target the destination.
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
6. On output-to-bus assignment, present the choice immediately for both physical outputs and Aux buses.
7. Pause live polling, write and read back the selected mode and bus assignment, update only the verified local port, then reconcile a complete authoritative snapshot quietly in the background.

Do not restore name-based mode guessing. A critical parser bug was fixed: parameter names are null-terminated and are not limited to 24 characters. The former 24-character cap interpreted long-name bytes as metadata, generated false mode flags, caused many `0x55` timeouts and made Routing extremely slow.

Initial routing content renders before output-mode hydration completes. If a user opens the choice during hydration, the action waits for the same hydration promise rather than bypassing the popup.

## Connection lifecycle

- Chrome requests the NT Web MIDI ports automatically.
- Disconnect flushes routing state, polling, selections and pending UI work.
- Reconnect cancels any stale SysEx request, discards old port objects, reacquires both endpoints and rereads identity.
- A disconnect immediately starts fresh endpoint reacquisition; failed reconnects continue every 1.2 seconds because NT USB MIDI ports can return after the module itself boots.
- Once a rebooted NT answers again, the app records the current view, performs one browser reload to discard Chrome's stale Web MIDI objects, restores that view and automatically reconnects.
- Transport still permits one outstanding SysEx request. All polling, parameter writes and routing transactions must continue to coordinate through the existing stop/wait/restart pattern.

## Algorithm add limits and plug-ins

- The 1.19 target supports **40 slots**. The add browser always shows `used / 40`; placement is unavailable only when all 40 are occupied.
- Built-ins are immediately available. An installed plug-in that is not resident is selectable but needs **Load into NT**. Its compact Load popup states that code may remain resident until reboot; once loaded, that same popup switches straight to placement, starting settings and Add. It sends `0x38` and polls only that catalogue record for up to ten seconds—important for slower C++ plug-ins.
- `isLoaded` is treated as device truth. A loaded plug-in used by a slot reads **in preset**; a loaded plug-in with no matching slot reads **Loaded in NT · not in preset**. Removing a slot (`0x33`) never claims to free code memory because the API has no unload command.
- On firmware 1.19+, the starting-settings dialog serializes a SysEx `0x39` query with the selected first three specification values. It accepts the documented three- or four-row response, shows SRAM/DRAM/DTC/ITC projected `used / total`, and blocks only a validated pool shortfall. Timeouts and malformed replies are neutral “preflight unavailable” states, never false memory warnings.
- A load timeout says that the device did not report the plug-in loaded; SysEx does not supply a precise cause. It advises a reboot to clear resident plug-ins and checking the native NT screen rather than guessing it is a memory failure.

## Current asset versions

- `styles.css?v=20260926-260`
- `web-midi-transport.js?v=20260926-59`
- `routing-logic.js?v=20260926-4`
- `storage-logic.js?v=20260926-1`
- `operation-scheduler.js?v=20260926-1`
- `device-logic.js?v=20260926-1`
- `app.js?v=20260926-200`

Increment the relevant query whenever browser-visible JavaScript or CSS changes.

## Verified in this session

- The Assistant UI now provides a full-page workspace, renameable/persistent sessions,
  live NT and knowledge context, an in-Editor resizable left dock, attachment controls,
  paste/drop handling, model selection and Enter-to-send.
- Codex subscription sign-in, sign-out and account switching run through NT Pilot's
  own isolated service/runtime rather than the workstation CLI or VS Code account.
- A clean signed-out browser session returned the complete dynamic model catalogue and
  successfully started a new Codex device-login flow.
- The real Assistant API now serves local development ports `4173`, `8766` and `8767`
  from one process; `/api/assistant/status` returned HTTP 200 on all three after the
  stale static-server 404 was fixed.
- The user hardware-tested the unified connection popup from both Routing and Editor, including retargeting an open popup to another bus.
- The user confirmed that removing the blocking complete post-write scan made connection completion substantially faster.
- The user confirmed automatic NT reconnection/reload after a hardware reboot works.
- The user confirmed the iPad routing list, bottom bus dock, dark mode and current styling on the real iPad Web MIDI browser.
- The user supplied screenshots confirming the Add/Replace popover appears for output connections and that derived Pitch CV routing is understandable in the iPad list.
- Physical input/output labels now show numbers only; Aux retains `A`.
- JavaScript syntax checks pass.
- `routing-logic.test.cjs` passes, including success ordering, partial failure, compound rollback and rollback-error reporting.
- `storage-logic.test.cjs` passes, including successful replacement, rollback after an ambiguously successful rename and retained-backup reporting.
- `operation-scheduler.test.cjs` passes, including strict serialization, failure isolation and queue recovery.
- `device-logic.test.cjs` passes, including firmware 1.19 capability gating and slot-placement policy.
- Headless Chrome loads every cache-versioned asset and reaches the honest disconnected startup state without a startup exception.
- `web-midi-transport.test.cjs` passes, including SysEx `0x55` parsing.
- `git diff --check` passes.
- Native Performance Page string/value queries, dual CPU meter parsing, bypass writes, slot reordering and firmware-reported bus counts have automated transport coverage.
- All 15 built-in wiki contents links resolve to their matching text section.

## Hardware tests still needed

1. Apply, disable, Undo and Redo a native MIDI mapping; refresh and confirm channel, type, controller, flags and limits remain identical on the NT.
2. Run MIDI Learn with CC, note, pitch bend and channel pressure messages from the actual controller path.
3. Edit an existing preset JSON file in place, then confirm the NT can load it and no `.ntpilot-*` backup remains after a successful write.
4. Choose both Add and Replace on a known mode-capable output, then confirm the output chip and NT parameter retain the selected mode after refresh.
5. Assign the same output to an occupied Aux bus in both modes and confirm audible/graph behaviour.
6. Confirm a controller shared by multiple outputs updates every affected chip.
7. Confirm Mod-only filtering shows the known modulation route with Input, Output and Aux disabled and Signals enabled.
8. Confirm the new explicit touch radio handling actually changes Add/Replace and Keep/Disconnect choices in the iPad Web MIDI browser.
9. Test physical-input and physical-output popup accent colours and retargeting after the latest cache-bumped build.
10. Test USB Audio From Host and USB Audio To Host placement in a blank patch containing those factory algorithms.

## Known boundaries and risks

- The compact pointer-positioned popup replaces the oversized bottom-inspector form. Hardware still needs to confirm Add/Replace persistence and the multi-write “Disconnect other routes” transaction on both physical and Aux destinations.
- Output-mode metadata is optional on older firmware. An output without an authoritative `0x55` association must remain fixed/read-only rather than guessed.
- The routing graph uses the aggregate `0x61` masks for overview cables and individual parameter metadata/values for editable ports. Keep those concepts separate.
- Routing hydration is intentionally non-blocking, but the single-request transport remains a performance constraint.
- Ignore the divergent VS Code copy completely. It is not a release target and must not be modified as part of standalone NT Pilot work.

## Checks

```bash
node --check app.js
node --check web-midi-transport.js
node device-logic.test.cjs
node operation-scheduler.test.cjs
node routing-logic.test.cjs
node storage-logic.test.cjs
node web-midi-transport.test.cjs
git diff --check
```

## Next recommended step

Stabilize the read-only Assistant end to end before granting it any write authority:
add automated service/API tests, restore bounded PDF text extraction, test persistent
session history and account switching, add idle-process cleanup/rate limiting, and
exercise an NT reboot while a conversation remains open. Then define the first typed,
preview-only NT Core intents for explaining and planning patch changes. Do not expose
Assistant-driven mutation until those intents share NT Pilot's scheduler, readback,
rollback and reconnect rules and the user-facing review flow is proven.

Continue the test-first routing consolidation in parallel only when it supports that
same NT Core boundary: lock down Add/Replace, Keep/Disconnect, rollback and compound
Undo, then make Editor and Routing produce one canonical `ConnectionIntent`.
