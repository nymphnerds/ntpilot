# Changelog

## Unreleased — 2026-09-25

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
- Added visible Add/Replace chips and an anchored Add/Replace choice before supported algorithm-output assignments.
- Fixed physical-output assignment so outputs with fixed or unavailable mode metadata still connect; editable Add/Replace continues to work on physical and Aux destination busses.
- Added direction checks for physical I/O and preserved pending port/Aux selections while output-mode metadata finishes loading.
- Positioned the Add/Replace choice beside the user's latest pointer or touch location for every routing assignment.
- Hydrated output-mode relationships from firmware `ioFlags` and SysEx `0x55`, with cached associations and verified parameter writes.
- Distinguished editable, fixed, loading and failed output-mode metadata so Routing never invents an Add/Replace choice for algorithms that do not expose one.
- Corrected physical I/O labels to use numbers only; Aux labels retain the `A` prefix.
- Preserved graph scrolling, panning and responsive fitting while auto-collapsing the navigation sidebar.

### MIDI and connection lifecycle

- Added automatic Web MIDI connection on browser startup.
- Added endpoint cleanup, pending-request cancellation and automatic retry after an NT reboot.
- Prevented Fast polling from colliding with routing and output-mode transactions.
- Fixed parsing of null-terminated parameter names longer than 24 characters, which previously corrupted I/O flags and caused false `0x55` probes.
- Added transport coverage for output-mode usage responses.

### Naming and presentation

- Renamed the product surface to **NT Pilot**.
- Refined the Input, Output, Aux and Mod colour language.
- Improved compact and full-screen layout behaviour.
- Unified dropdown styling, including a clearer Mapping algorithm selector.

### Performance and Assistant

- Replaced the static Performance mockup with four-per-page live controls generated from the selected algorithm's enabled native MIDI mappings.
- Routed Performance sliders through the same continuous, verified NT parameter-write path as Editor sliders.
- Made empty Performance positions link clearly to Mapping instead of pretending assignments exist.
- Marked Assistant as an unconnected interface preview, disabled its fake actions and removed false provider/context status.

### Deferred

- Synchronizing and packaging the VS Code Web MIDI bridge is intentionally deferred until the standalone Chrome build is approved.
