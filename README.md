# NT Pilot

NT Pilot is a browser-based editor and routing workspace for the Expert Sleepers disting NT. It connects directly from desktop Chrome or Edge through Web MIDI and edits the currently loaded preset in NT working memory.

## Current capabilities

- Reads the live preset, loaded algorithm slots, parameter pages, values and native MIDI mappings.
- Writes parameter changes continuously while sliders move and verifies them by readback.
- Provides Fast, Slow and Manual synchronization modes; Fast is the default.
- Shares the selected algorithm between Editor, Routing and MIDI Mapping views.
- Exposes a sticky Editor bus dock with all Aux, physical input and physical output buses.
- Shows compact bus chips on every firmware-reported bus-assignable parameter.
- Displays the complete routing graph by default, with independent Input, Output, Aux and Mod cable filters.
- Supports direct routing edits and explicit Add/Replace selection for algorithm outputs whose controller is reported by NT metadata.
- Handles NT USB MIDI disconnects and retries connection after a module reboot.
- Keeps working-memory edits separate from the explicit **Save preset** action.

## How NT Pilot improves on the NT Helper workflow

NT Helper remains an important protocol and hardware-behaviour reference. NT Pilot deliberately uses a different interaction model intended to make the NT's unusually flexible routing system faster to understand and operate, especially on a touch screen.

- **Bus assignment happens where parameters are edited.** Every firmware-reported bus parameter gets a compact assignment chip. Tap the chip, then tap an Aux, input, output or None chip in the persistent dock. There is no need to leave the Editor or translate a raw number manually.
- **One consistent visual bus language.** Aux buses keep the same rainbow colour everywhere. Physical inputs and outputs use blue and red banks with simple numeric labels. Parameter chips, routing endpoints and cables therefore describe the same underlying bus without redundant cable-number text.
- **Complete routing is the default.** Routing opens with no algorithm artificially selected, so the whole preset is visible. Selecting a card focuses it; clicking empty space returns to the complete graph.
- **Useful layers instead of one crowded diagram.** Input, Output, Aux and Mod cables can be inspected independently under a master Signals switch. Modulation remains visually distinct with dashed gold wiring.
- **Add/Replace is chosen before the write.** NT Helper automatically forces Replace for some algorithm-to-algorithm connections and exposes mode toggling afterward. NT Pilot asks Add or Replace at the moment a mode-capable algorithm output is assigned to an Aux bus, then writes both the real output-mode controller and bus parameter.
- **Hardware truth without UI guesswork.** NT Pilot uses firmware I/O flags and SysEx `0x55` relationships to associate an Add/Replace controller with its exact output parameters. Fixed or unresolved outputs stay visibly read-only instead of being inferred from names.
- **Editor and Routing share state.** Algorithm selection and confirmed bus changes carry across category pages, so the user does not have to relocate the same slot repeatedly.
- **Working edits are explicit.** Changes affect NT working memory immediately, while permanent preset saving remains a separate, visible action.
- **Compact side nodes preserve the graph.** Physical I/O and conditional USB audio algorithms live in aligned side stacks instead of adding more permanent graph columns. The central algorithm list remains the primary reading path.

These differences are product choices, not a fork of NT Helper's presentation. When protocol behaviour is uncertain, NT Helper and the disting NT documentation are used to establish hardware truth; NT Pilot then presents that truth through its own workflow.

## Running locally

Serve this directory over HTTP and open it in desktop Chrome or Edge. The current development server is normally available at:

```text
http://localhost:8766
```

Grant SysEx access when prompted, connect the disting NT MIDI input/output pair, and use **Refresh** to reread the device.

The browser may cache JavaScript aggressively during development. If the version query shown at the bottom of `index.html` changes, use a hard refresh.

## Safety model

Parameter and routing changes are applied immediately to the loaded preset's working memory. They are not persisted to disk until **Save preset** is explicitly selected and confirmed. The NT save command has no acknowledgement, so persistence should be verified on hardware when important.

## Development

Run the transport checks with:

```bash
node --check app.js
node --check web-midi-transport.js
node web-midi-transport.test.cjs
git diff --check
```

The standalone browser implementation is the current source of truth. The VS Code Web MIDI bridge is intentionally deferred until the Chrome UX and hardware behaviour are approved.

See [the current handoff](docs/current-handoff.md) for architecture, test state and remaining work.
