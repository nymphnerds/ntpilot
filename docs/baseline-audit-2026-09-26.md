# NT Pilot baseline audit

Date: 26 September 2026

This audit covers the standalone browser app in `/home/nymph/DistingNT/ntpilot`. The abandoned `vscode-webmidi/` copy is explicitly outside the baseline and was not changed.

## Sources checked

- All current repository documentation: `README.md`, `CHANGELOG.md`, `docs/current-handoff.md`, `docs/editor-bus-dock-handoff.md`, and the Pages workflow.
- Expert Sleepers disting NT user manual 1.18, especially the preset, mapping, routing, Performance Page, storage, MIDI and SysEx sections.
- The current official `expertsleepersltd/distingNT` browser editor and tools repository.
- The current official `expertsleepersltd/distingNT_API` repository.

Official references:

- <https://www.expert-sleepers.co.uk/distingNTfirmwareupdates.html>
- <https://github.com/expertsleepersltd/distingNT>
- <https://github.com/expertsleepersltd/distingNT_API>

The latest released manual/firmware found during this audit is 1.18.0. NT Pilot also contains explicitly gated support for the `0x39` memory report documented by the current official development editor/API for firmware 1.19 and later. Released behaviour and development-branch behaviour must remain labelled separately.

## Baseline scope

The current product is a Web MIDI/SysEx editor for the NT working preset. Its supported baseline is:

- connect/reconnect and read device identity;
- inspect and edit live parameter values;
- inspect and edit firmware-reported routing and output modes;
- inspect Performance Page assignments and operate their parameters;
- browse, load, append, rename, edit and delete preset documents under `/presets/`;
- browse the device algorithm catalogue, load installed plug-ins, add/remove/reorder slots;
- inspect and edit native NT MIDI mappings;
- keep all working-memory changes distinct from the explicit preset save command.

The Assistant is intentionally unavailable. The VS Code bridge and a future AUv3 are not part of this baseline.

## Protocol truth used by the app

The relevant official SysEx commands are:

| Command | Purpose in NT Pilot |
| --- | --- |
| `0x32` | Add algorithm (native command appends; NT Pilot may then move it) |
| `0x33` | Remove algorithm |
| `0x34` | Load or append preset |
| `0x36` | Save preset option |
| `0x37` | Move algorithm |
| `0x38` | Load plug-in code |
| `0x39` | Development/1.19+ memory report, version-gated |
| `0x40`–`0x46` | Slot/parameter identity, values and writes |
| `0x47` | Set working preset name |
| `0x4B` | Read parameter mapping |
| `0x4E` | Write native MIDI mapping |
| `0x50`–`0x57` | Value strings, pages, output-mode usage and Performance Page |
| `0x60`–`0x62` | Bus counts, routing summary and CPU |
| `0x7A` | SD-card directory/file protocol |

Add, remove, move, plug-in load, preset load and preset save do not provide a normal success acknowledgement. The application must establish the result through targeted readback where the protocol permits it and must not describe a sent command as an acknowledged write.

## Fixed in this audit pass

### MIDI Mapping was an unfinished simulation

- Implemented official `0x4E` mapping writes.
- Preserve mapping version, view-change, type, relative, symmetric, enabled, channel, controller and range fields.
- Retry `0x4B` readback and reject a write whose device state does not match.
- Replaced the timer-generated fake Learn result with capture from real incoming CC, note-on, pitch-bend or channel-pressure messages.
- Added mapping changes to global Undo/Redo.
- Corrected the live-write gate, which previously disabled Apply while the device was actually in the connected state.
- Added transport fixtures and assertions for the exact mapping payload and readback.

### Working-preset state could be lost in the UI

- `showLiveIdentity()` no longer clears the unsaved-working-memory flag merely because the app refreshed its snapshot.
- Preset append now requires the slot count to increase; an unchanged count is no longer accepted as success.

### Hardware operations could collide with polling

- Parameter-history replay now uses a quiet transport window.
- Remove, undo-add and reorder now use the same polling/queue exclusion used by other slot mutations.
- Move/remove verification uses targeted slot count or GUID reads before accepting a refreshed snapshot.

### Routine slot refreshes were unnecessarily expensive

- `readSnapshot()` can reuse the already-read algorithm catalogue after add/remove/move.
- Initial connection and preset load still reread the catalogue, where loaded plug-in state may legitimately differ.

### Routing rollback was duplicated

- Connection, direct bus assignment and direct output-mode changes now use one DOM-independent transaction executor for ordered mode changes, route removals, the primary action and reverse rollback.
- Added pure tests for successful ordering, connection failure, partial route-removal failure and rollback failures.

### Architecture cleanup follow-up

- Replaced the separate preset, memory and parameter-write queues with one `OperationScheduler` shared by foreground reads and every mutation family.
- Collapsed `liveRouting` and `routingSnapshot` into one canonical routing snapshot.
- Extracted pure connection planning and complete connection-write rollback from the DOM-heavy application.
- Extracted firmware 1.19 capability checks and slot-placement policy into `device-logic.js`.
- Retained CPU/value polling as lightweight guarded reads; the scheduler pauses and drains them before exclusive hardware work.

### Preset JSON replacement could corrupt the only copy

- Same-path JSON edits now write and byte-verify a temporary file, rename the original to a unique backup, install and verify the replacement, and roll back on failure.
- A backup that cannot be cleaned up is reported rather than hidden.
- The replacement transaction is isolated in `storage-logic.js` and tested for ambiguous post-rename timeouts as well as the normal path.

### UI residue overstated the implementation

- Removed the hard-coded Witchboard slots, parameters and mappings from initial HTML.
- Removed canned Assistant proposals and fake change handlers.
- Kept the Assistant as an explicit unavailable future surface.
- Connected the Mapping “Routing help” control to the built-in mapping guide.

## Important remaining architecture work

These are not release blockers for the now-honest mapping implementation, but they prevent calling the codebase streamlined:

1. `app.js` remains about 5,600 lines and owns most view rendering, polling, history, reconnect and layout behaviour; scheduling and several domain rules have now been extracted.
2. The routing mutation entry points share tested planning, ordered writes and rollback, but history, refresh and notification policy still remain in UI-heavy callers.
3. Routing has one canonical `state.routingSnapshot`; model-owned port metadata should next replace selection details reconstructed from rendered datasets.
4. General hardware operations now share one scheduler, but their post-write model/history/UI policies are still implemented by each feature controller.
5. Controller-level tests cover routing plans/rollback, storage replacement and scheduler ordering; compound history and rendered view equivalence still need coverage.
6. The monolithic stylesheet still needs broader selector-usage and visual-regression coverage; the known removed Assistant proposal styles were deleted in this pass.

## Recommended cleanup sequence

1. Extend routing plan tests for Add/Replace, keep/disconnect and compound history.
2. Move remaining DOM-derived port metadata into the canonical routing model.
3. Move shared post-write state/history/refresh policy behind feature controllers using the common scheduler.
4. Split `app.js` incrementally by responsibility: transport session, preset controller, slot lifecycle, parameter editor, mapping, performance and routing views.
5. Add a real browser smoke test for disconnected startup, connection, view switching and dialog wiring. Node syntax and domain fixtures alone cannot catch DOM regressions.

## AUv3 preparation boundary

Do not port the browser UI or Web MIDI transport directly into an AUv3. The reusable layer should be the canonical device/preset model plus intent/transaction rules. An AUv3 will have different lifecycle, threading, MIDI routing, state restoration and host-automation constraints. Finish the controller/store extraction and protocol fixtures first; then define an adapter boundary that both Web MIDI and a native iOS transport can implement.

## Verification commands

```bash
node --check app.js
node --check web-midi-transport.js
node --check web-midi-transport.test.cjs
node device-logic.test.cjs
node operation-scheduler.test.cjs
node routing-logic.test.cjs
node storage-logic.test.cjs
node web-midi-transport.test.cjs
git diff --check
```
