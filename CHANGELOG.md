# Changelog

## Unreleased — 2026-09-25

### Assistant

- Rebuilt the placeholder as a responsive desktop/iPad workspace with session navigation, a focused conversation surface and an inspectable live-context rail.
- Added honest local prompt drafting, file/image/folder attachment chips and starter prompts without simulating provider responses.
- Bound the context rail to the real NT connection, firmware, working preset, slot count and unsaved working-memory state.
- Added visible knowledge provenance and a permanent user-only Save boundary; this milestone remains read-only until provider and safety backends are connected.
- Added tablet drawers, touch-sized controls and compact phone layouts for sessions and current context.

### Editor

- Added live parameter writes during slider movement with NT readback.
- Replaced native-looking parameter rails with touch-friendly NT Pilot sliders and visible mint progress.
- Added deterministic, very subtle colour signatures to parameter rows for tracking long lists.
- Added Fast, Slow and Manual synchronization modes, with Fast as the default.
- Added a sticky two-row bus dock: Aux buses above, numbered physical inputs and outputs below, and a central None action.
- Added compact bus chips to firmware-reported bus-assignment parameters and a clear armed assignment state.
- Moved native MIDI mapping controls alongside parameter titles.
- Shared algorithm selection across category pages.
- Added explicit working-memory and unsaved-change state.

### Routing

- Reworked the routing graph to show all connections when no algorithm is selected.
- Added independent Input, Output, Aux and Mod visibility controls under the master Signals switch.
- Restored dashed modulation cables and distinct rainbow Aux cables.
- Added curved cable breakpoints, consistent endpoint stubs and thinner cable rendering.
- Added compact physical I/O banks and conditional USB Audio From/To Host side nodes.
- Added direct bus assignment without confirmation dialogs.
- Added visible Add/Replace chips and a compact pointer-positioned choice popup before supported algorithm-output assignments.
- Fixed physical-output assignment so outputs with fixed or unavailable mode metadata still connect; editable Add/Replace continues to work on physical and Aux destination busses.
- Added direction checks for physical I/O and preserved pending port/Aux selections while output-mode metadata finishes loading.
- Kept routing decisions visible in the popup until the user explicitly connects or cancels.
- Hydrated output-mode relationships from firmware `ioFlags` and SysEx `0x55`, with cached associations and verified parameter writes.
- Distinguished editable, fixed, loading and failed output-mode metadata so Routing never invents an Add/Replace choice for algorithms that do not expose one.
- Added a compact connection popup showing the exact source and destination, native Add/Replace mode, existing-route handling, plain-language explanations and explicit Cancel/Connect actions for physical and Aux destinations.
- Added signal-order visualization for Replace: earlier routes that remain configured but are overwritten by a later Replace are faded and dashed, while the effective Replace cable is emphasized and explains the state on hover.
- Corrected physical I/O labels to use numbers only; Aux labels retain the `A` prefix.
- Preserved graph scrolling, panning and responsive fitting while auto-collapsing the navigation sidebar.
- Consolidated the duplicated connection, direct-assignment and output-mode write/rollback loops onto one tested routing transaction executor.
- Added controller-level coverage for ordered writes, partial-removal rollback, primary-route restoration, reverse-order route restoration and rollback failure reporting.
- Replaced the competing live/snapshot routing fields with one canonical routing snapshot.
- Extracted DOM-independent connection planning for direct physical routes and automatic free-Aux assignment, with complete write rollback tests.

### Architecture

- Replaced the preset, memory, slot and parameter write queues with one tested hardware-operation scheduler.
- Moved Editor, Performance, bypass, history, MIDI Mapping, routing, slot lifecycle and preset mutations through the same quiet transport window.
- Scheduled foreground parameter, Performance and routing reads through the same coordinator while retaining guarded lightweight CPU/value polling.
- Extracted firmware-version capabilities and slot-placement policy into a tested device-logic module, with firmware 1.19 memory support represented explicitly.

### MIDI and connection lifecycle

- Added automatic Web MIDI connection on browser startup.
- Added endpoint cleanup, pending-request cancellation and automatic retry after an NT reboot.
- Start the fresh-port retry loop as soon as either NT MIDI endpoint disconnects instead of depending on Chrome to emit a later endpoint-return event.
- After the rebooted NT answers a fresh identity request, reload the browser once to discard Chrome's dead Web MIDI objects, restore the previous view and reconnect automatically.
- Prevented Fast polling from colliding with routing and output-mode transactions.
- Fixed parsing of null-terminated parameter names longer than 24 characters, which previously corrupted I/O flags and caused false `0x55` probes.
- Added transport coverage for output-mode usage responses.
- Replaced the simulated Mapping Apply and MIDI Learn flows with official `0x4E` writes, `0x4B` readback, real incoming-message capture and global Undo/Redo.
- Preserved mapping-version fields that are not directly exposed by the form and added exact-payload transport coverage.
- Serialized mapping, parameter-history, remove and reorder operations against live polling.

### Presets and slot lifecycle

- Required append verification to observe an increased slot count instead of accepting an unchanged preset.
- Preserved the unsaved-working-memory indicator across routine identity refreshes.
- Reused the algorithm catalogue during routine slot mutations instead of rereading every catalogue entry.
- Made same-path preset JSON replacement recoverable with a verified temporary file, backup rename and rollback.
- Extracted the recoverable SD-file replacement transaction into a tested browser/Node module, including ambiguous rename-timeout recovery and retained-backup reporting.

### Naming and presentation

- Renamed the product surface to **NT Pilot**.
- Refined the Input, Output, Aux and Mod colour language.
- Improved compact and full-screen layout behaviour.
- Unified dropdown styling, including a clearer Mapping algorithm selector.
- Removed the hard-coded sample preset, parameter and mapping markup from disconnected startup.
- Removed canned Assistant proposals and fake action handlers while keeping the future surface explicitly unavailable.
- Removed the Assistant notification badge, which implied unavailable functionality had produced a message.
- Removed the corresponding dead proposal, change-card and unused Assistant fact styling.
- Reworked the preset JSON dialog into a responsive desktop editor with a substantially larger document surface, compact metadata row and near-full-screen mobile layout.

### Performance and Assistant

- Replaced the static Performance mockup with four-per-page live controls generated from the selected algorithm's enabled native MIDI mappings.
- Routed Performance sliders through the same continuous, verified NT parameter-write path as Editor sliders.
- Made empty Performance positions link clearly to Mapping instead of pretending assignments exist.
- Marked Assistant as an unconnected interface preview, disabled its fake actions and removed false provider/context status.

### Deferred

- Synchronizing and packaging the VS Code Web MIDI bridge is intentionally deferred until the standalone Chrome build is approved.
