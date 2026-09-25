# NT Pilot development handoff

Last updated: 25 September 2026

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

## Current Routing behaviour

- Entering Routing collapses the sidebar and shows the complete graph by default.
- Clicking empty graph space clears algorithm focus and restores the complete view.
- The master Signals switch controls all cable types. Input, Output, Aux and Mod buttons independently filter categories.
- Signal inputs are blue, physical outputs red, Aux routes use their bus colour, and modulation is gold and dashed.
- Cables leave and enter the correct side of algorithm cards, with equal endpoint stubs and subtle curved corners.
- Physical input/output banks share a top alignment. Optional USB Audio From Host and USB Audio To Host algorithms occupy compact side positions beneath their corresponding physical bank.
- Side stacks are centred against the total central algorithm list.
- Add/Replace chips are always visible on output rows. Editable chips are backed by a real NT mode-controller parameter; fixed or unresolved chips are read-only.
- Assigning a supported algorithm output to an Aux bus opens the anchored Add/Replace choice before writing.

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
- Failed reconnects retry every 1.2 seconds because NT USB MIDI ports can return after the module itself boots.
- Transport still permits one outstanding SysEx request. All polling, parameter writes and routing transactions must continue to coordinate through the existing stop/wait/restart pattern.

## Current asset versions

- `styles.css?v=20260925-62`
- `web-midi-transport.js?v=20260925-40`
- `app.js?v=20260925-87`

Increment the relevant query whenever browser-visible JavaScript or CSS changes.

## Verified in this session

- The user supplied a screenshot confirming that the Add/Replace popover now appears for an output connection.
- Physical input/output labels now show numbers only; Aux retains `A`.
- JavaScript syntax checks pass.
- `web-midi-transport.test.cjs` passes, including SysEx `0x55` parsing.
- `git diff --check` passes.

## Hardware tests still needed

1. Choose both Add and Replace on a known mode-capable output, then confirm the output chip and NT parameter retain the selected mode after refresh.
2. Assign the same output to an occupied Aux bus in both modes and confirm audible/graph behaviour.
3. Confirm a controller shared by multiple outputs updates every affected chip.
4. Confirm Mod-only filtering shows the known modulation route with Input, Output and Aux disabled and Signals enabled.
5. Reboot the NT while Routing is open and verify automatic recovery without a manual browser refresh.
6. Compare first-load and post-edit routing load time now that long parameter names parse correctly and `0x55` relationships are cached.
7. Test USB Audio From Host and USB Audio To Host placement in a blank patch containing those factory algorithms.

## Known boundaries and risks

- The screenshot proves popup presentation, not yet successful hardware persistence for both choices.
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

Start with the seven hardware checks above before making further visual changes. If Add/Replace persistence fails, inspect the received `0x55` association and subsequent `0x46`/`0x45` write/readback for the selected slot and parameter; do not add another heuristic fallback.
