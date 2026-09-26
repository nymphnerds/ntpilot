# NT Pilot

NT Pilot is a browser-based editor and routing workspace for the Expert Sleepers disting NT. It connects directly from desktop Chrome or Edge through Web MIDI and edits the currently loaded preset in NT working memory.

## Current capabilities

- Reads the live preset, loaded algorithm slots, parameter pages, values, native mappings, Performance Page assignments and both NT CPU meters.
- Writes parameter changes continuously while sliders move and verifies them by readback.
- Provides Fast, Slow and Manual synchronization modes; Fast is the default.
- Shares the selected algorithm between Editor, Routing and MIDI Mapping views.
- Builds a live four-controls-per-page surface from the preset-wide native NT Performance Page, including string values, binary controls and custom labels.
- Exposes a sticky Editor bus dock with all Aux, physical input, physical output and firmware-reported NTX-8CV buses.
- Shows compact bus chips on every firmware-reported bus-assignable parameter.
- Displays the complete routing graph by default, with independent Input, Output, Aux and Mod cable filters.
- Supports direct routing edits and explicit Add/Replace selection for algorithm outputs whose controller is reported by NT metadata.
- Supports bidirectional port-first or Aux-first routing assignment, algorithm bypass from Editor and Routing, and animated bypass indicators.
- Supports verified drag-and-drop algorithm reordering with Undo/Redo history and keyboard shortcuts.
- Browses the NT algorithm catalogue, loads installed plug-ins, and adds or removes algorithms with targeted device verification.
- Browses the NT `/presets/` library and supports load, append, rename, byte-verified JSON editing, folders and delete operations.
- Edits native NT MIDI mappings with real `0x4E` writes, `0x4B` readback, incoming-message MIDI Learn and Undo/Redo.
- Uses the selected Aux bus colour as the interface accent while keeping an unassigned state neutral.
- Includes a searchable, text-first NT wiki condensed from the official firmware 1.18 manual, with page-specific source links.
- Handles NT USB MIDI disconnects and retries connection after a module reboot.
- Keeps working-memory edits separate from the explicit **Save preset** action.
- Provides the UI and client contract for a read-only Assistant: provider sign-in, model choice, persistent/renameable sessions, streamed replies, live NT context and attachments.
- Uses a deployable Assistant service with per-device, isolated Codex accounts. Its packaged server runtime is independent of a user’s workstation CLI, VS Code and login state.

## How NT Pilot improves on the NT Helper workflow

NT Helper remains an important protocol and hardware-behaviour reference. NT Pilot deliberately uses a different interaction model intended to make the NT's unusually flexible routing system faster to understand and operate, especially on a touch screen.

- **Bus assignment happens where parameters are edited.** Every firmware-reported bus parameter gets a compact assignment chip. Tap the chip, then tap an Aux, input, output or None chip in the persistent dock. There is no need to leave the Editor or translate a raw number manually.
- **One consistent visual bus language.** Aux buses keep the same rainbow colour everywhere. Physical inputs and outputs use blue and red banks with simple numeric labels. Parameter chips, routing endpoints and cables therefore describe the same underlying bus without redundant cable-number text.
- **Complete routing is the default.** Routing opens with no algorithm artificially selected, so the whole preset is visible. Selecting a card focuses it; clicking empty space returns to the complete graph.
- **Useful layers instead of one crowded diagram.** Input, Output, Aux and Mod cables can be inspected independently under a master Signals switch. Modulation remains visually distinct with dashed gold wiring.
- **Add/Replace is chosen before the write.** NT Pilot asks at the moment a mode-capable algorithm output is assigned to a physical-output or Aux bus, then writes both the real output-mode controller and bus parameter. The compact popup separately offers whether to keep or disconnect other editable routes, because that is a different operation.
- **Replace is not disconnect.** This distinction is a frequent source of confusion for disting NT users. Add combines an algorithm's output with the bus. Replace overwrites the bus signal at that algorithm's position in the ordered slot chain, but it does not remove earlier assignments. Later slots can still write afterward. NT Pilot therefore keeps overwritten routes visible as faded dashed cables, emphasizes the effective Replace cable, and removes a cable only when its assignment is actually set to None.
- **Hardware truth without UI guesswork.** NT Pilot uses firmware I/O flags and SysEx `0x55` relationships to associate an Add/Replace controller with its exact output parameters. Fixed or unresolved outputs stay visibly read-only instead of being inferred from names.
- **Editor and Routing share state.** Algorithm selection and confirmed bus changes carry across category pages, so the user does not have to relocate the same slot repeatedly.
- **Slot management stays live.** Drag-and-drop order changes, bypass toggles and Undo/Redo operate on NT working memory and are verified from the module.
- **Expansion follows hardware truth.** Physical bus counts come from firmware. NTX-8CV output banks remain on the current row while space exists and wrap cleanly only when required.
- **Working edits are explicit.** Changes affect NT working memory immediately, while permanent preset saving remains a separate, visible action.
- **Compact side nodes preserve the graph.** Physical I/O and conditional USB audio algorithms live in aligned side stacks instead of adding more permanent graph columns. The central algorithm list remains the primary reading path.

These differences are product choices, not a fork of NT Helper's presentation. When protocol behaviour is uncertain, NT Helper and the disting NT documentation are used to establish hardware truth; NT Pilot then presents that truth through its own workflow.

## Running locally

Start the local NT Pilot Host, then open it in desktop Chrome or Edge:

```bash
node host/ntpilot-host.mjs
```

The Host serves the UI at:

```text
http://localhost:8766
```

Grant SysEx access when prompted, connect the disting NT MIDI input/output pair, and use **Refresh** to reread the device.

Open **Assistant → Choose model → Codex subscription** to sign this NT Pilot session in or out. The hosted build uses the same API and UI from desktop, iPad and later AUv3; see [the Assistant service deployment notes](docs/assistant-service.md). OpenAI API, OpenRouter and Anthropic support belong behind the same service contract.

The browser may cache JavaScript aggressively during development. If the version query shown at the bottom of `index.html` changes, use a hard refresh.

## Safety model

Parameter and routing changes are applied immediately to the loaded preset's working memory. They are not persisted to disk until **Save preset** is explicitly selected and confirmed. The NT save command has no acknowledgement, so persistence should be verified on hardware when important.

## Development

Run the baseline checks with:

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

The standalone browser implementation is the current source of truth. The VS Code Web MIDI bridge is intentionally deferred until the Chrome UX and hardware behaviour are approved.

See [the current handoff](docs/current-handoff.md) and [the baseline audit](docs/baseline-audit-2026-09-26.md) for architecture, protocol sources, test state and remaining work.

The built-in wiki is a concise operational guide, not a replacement for Expert Sleepers' documentation. It links to the [official firmware 1.18 manual](https://www.expert-sleepers.co.uk/downloads/manuals/disting_NT_user_manual_1.18.pdf) and the [firmware/manual archive](https://www.expert-sleepers.co.uk/distingNTfirmwareupdates.html).
