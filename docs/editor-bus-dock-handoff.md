# NT Pilot Editor Bus Dock — UX and Implementation Handoff

## Status

Implemented in the standalone browser UI on 25 September 2026. Chrome/hardware validation is pending. The VS Code Web MIDI bridge bundle is intentionally deferred until the browser interaction is approved, so its copied UI remains at the pre-implementation snapshot state.

Recovery snapshot: `/home/nymph/DistingNT/ntpilot-snapshot-before-editor-bus-dock-20260925-153030`

The user’s goal is to preserve the disting NT's core strength: an NT bus-assignment parameter can use nearly any available physical input, physical output, or auxiliary bus. The editor must make that flexibility quick to see and quick to use without turning it into an artificial source/destination-routing wizard.

## Scope

This design applies to the **Editor page only**.

It does not authorise a redesign of the Routing page, the outer application frame, scrolling, dragging, or the existing Editor slot-list / parameter-panel layout. If the concept proves useful in Editor, it may later be reused on Routing as a separate decision.

## Non-negotiable layout constraints

- Preserve the existing Editor structure: slot list on the left, selected algorithm parameters in the main parameter panel.
- Do **not** add permanent vertical sidebars, rails, or grid columns around the parameter list. They would squeeze rows and risk the scrolling/layout regressions already experienced.
- Do **not** enlarge the existing compact Aux-bus chip scale. The current Routing-page Aux rainbow is already usable with fingers and is the visual reference.
- Do **not** replace the normal parameter slider or numeric value for bus-assignment parameters. The raw parameter value remains useful and visible.
- Do **not** move permanent-save behaviour into parameter or bus assignment. Assignments update NT working memory; only **Save preset** persists the loaded preset.

## Editor Bus Dock

Add a compact, sticky, two-row Bus Dock above the Editor parameter pages, inside the parameter panel.

```
A1 A2 A3 A4 … A44
I1 I2 I3 … I12        [       None       ]        O1 O2 … O8
```

### First row: Aux buses

- The first row is the existing compact rainbow Aux language: `A1` through `A44`.
- Reuse the current Routing-page Aux chip component, including its dimensions, rounded rectangle shape, white label treatment, and each Aux bus's existing rainbow colour.
- `None` must be removed from the left of this Aux row. It belongs in the centre of row two.
- The row can retain horizontal overflow on narrower screens; it must not wrap or be made larger merely for a future iPad build.

### Second row: physical I/O and None

- Inputs are compact blue chips, horizontally grouped on the left: `I1` through `I12`.
- Outputs are compact red chips, horizontally grouped on the right: `O1` through `O8`.
- A visibly larger, clear, neutral **None** button sits in the centre. It is the explicit disconnect action.
- No dropdowns are part of this approved design.
- No extra “Inputs” or “Outputs” labels are required. Position, `I`/`O` names, and colour are enough.

### Sticky behaviour

- The two-row dock remains available while the user scrolls through a long algorithm's parameter pages.
- It must be implemented without changing the existing outer Editor sizing or scroll ownership. The parameter panel remains the same page/scroll structure.
- The dock is compact at rest. It becomes an active assignment surface only after a parameter’s bus chip is armed.

## Parameter-row layout

The parameter-row structure is deliberately ordered as follows:

```
Kick:Input/Left   [+]   ───────── slider ─────────   21   [ A17 ]
```

When the parameter already has native MIDI mapping:

```
Kick:Input/Left   Ch 15 · CC 80   ─── slider ───   21   [ A17 ]
```

### Column and content rules

1. **Parameter title** remains at the left, with its parameter number/subtitle below.
2. **Native MIDI mapping control** moves immediately after the title on the title line:
   - unmapped: a compact `+` mapping affordance;
   - mapped: a compact channel/controller label, for example `Ch 15 · CC 80`.
   - It must remain attached to the identity of that exact parameter, rather than living at the far right of the row.
3. **Slider** remains in its current central lane.
4. **Numeric raw value** remains visible after the slider.
5. **Bus chip** is the final far-right element for every NT-reported bus-assignable parameter.

Normal non-bus parameters keep the same title, MIDI control, slider, and numeric value, but have no final bus chip.

### Bus chips

- A bus chip is a real, reusable component — not a dot, text link, tiny badge, or dropdown.
- Its size must match the current Routing-page Aux rainbow bus buttons exactly.
- It uses the same rounded-rectangle shape, colour language, and white label treatment as the dock:
  - `A17` uses that Aux bus’s rainbow colour;
  - `I5` uses input blue;
  - `O3` uses output red;
  - `None` uses a restrained neutral treatment.
- The visible chip may be compact, but it needs a comfortably tappable hit target.
- This component visually proves that the row’s raw numeric value is currently represented by that concrete bus assignment.

## Bus-assignment interaction

### Arm a parameter

1. The user taps the **far-right bus chip**, not the parameter title and not anywhere in the row.
2. No write occurs yet.
3. The selected bus chip gains a clear mint outer ring with a gentle breathing/throbbing animation.
4. The chip’s own colour remains unchanged; mint means “currently armed”, not “this bus is mint”.
5. With reduced motion enabled, use a steady clear ring rather than animation.

### Make an assignment

1. While a bus chip is armed, tap an Aux chip, an Input chip, an Output chip, or the centred None button in the Bus Dock.
2. The corresponding NT parameter value changes immediately in **working memory**.
3. Update the parameter slider, raw numeric value, far-right bus chip, and dock selection together.
4. The mint ring stops as soon as the assignment completes.
5. Update the shared Routing representation/state from that same assignment. There must not be competing Editor and Routing copies of a connection.
6. Do not silently save the preset file. The existing explicit Save preset flow remains the only persistence action.

### Cancel

Tapping the armed bus chip again, or an explicit harmless cancellation affordance if one is later needed, cancels selection without writing. Do not make a click on the parameter title perform a disconnect or reassignment.

### Flexibility rules

- Show the bus chip for **every parameter the NT reports as bus-assignable**, including algorithm-specific audio, CV, gate, trigger, and custom routing parameters.
- Do not build a hand-authored list of “audio I/O” parameters.
- Do not infer or impose a source/destination restriction from a parameter name or its input/output presentation metadata.
- The parameter’s actual NT-reported range/capability is the authority for what may be assigned.
- Inputs, outputs, and Aux buses are presented as one flexible NT bus universe; their placement/colour helps comprehension but does not reduce capability.
- Output Add/Replace mode remains a distinct control where the NT exposes it. It is not confused with the bus chip.

## Bypass and modulation are separate concerns

This Bus Dock does not solve every routing-status problem.

- **Slot bypass** is a slot/common NT state. It needs its own later, reliable presentation and must not be guessed from algorithm parameters containing the word “bypass”. A bypassed slot must remain visible in Editor and Routing, with its wiring intact.
- **Parameter modulation** is distinct from bus assignment. A later improvement can add a small dashed modulation indicator beside the exact parameter being modulated, backed by real mapping data. Do not pretend the global routing mask identifies a precise parameter target by itself.

## What must not be changed during this work

- Do not change outer-window padding, rounded corners, global app height, or sidebar geometry.
- Do not change Routing-page pan/drag/scroll ownership or existing Routing-page layout as part of this task.
- Do not alter the compact dimensions of the existing Aux rainbow chips.
- Do not remove parameter sliders, numeric raw values, or native MIDI mappings from the parameter editor.
- Do not introduce a dropdown-based bus assignment UX.
- Do not auto-save a preset because a bus assignment changed.

## Recommended safe implementation sequence

1. Create a static, isolated visual mock of the Editor parameter panel using the exact two-row dock and parameter-row ordering above. Do not modify the live Editor or Routing layout at this stage.
2. Get visual approval for spacing, chip dimensions, sticky behaviour, and the armed-ring state.
3. Add the reusable bus-chip component and title-line MIDI mapping placement to Editor rows, without changing connection writes yet.
4. Wire the arm/select state and Bus Dock to existing NT parameter writes. Use the same confirmed working-memory write path already used for routing assignments.
5. After a write, update the shared live state and refresh/reconcile the Routing representation without disturbing its scroll/pan position.
6. Test at minimum: Aux assignment, physical input assignment, physical output assignment, None/disconnect, cancelled arming, mapped parameter label, un-mapped `+`, output mode, explicit Save preset, and Editor-to-Routing state coherence.

## Acceptance criteria

- A user can see a parameter’s current bus at a glance from its matching bus chip.
- A user can assign any supported I/O or Aux bus using exactly two deliberate taps: parameter bus chip, then dock choice.
- The app never hides the NT’s flexible bus model behind direction-based restrictions.
- Editor remains compact and readable; no side rails or additional editor columns appear.
- Existing Routing layout and behaviour remain unaffected by the Editor UI work.
- Saving remains explicit and separate from experimentation.
