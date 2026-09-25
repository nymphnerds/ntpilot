# NTPilot VS Code Web MIDI

This is the local-Windows VS Code host for the NTPilot interface. It packages the
existing NTPilot UI in a webview and provides `navigator.requestMIDIAccess()` through
`jazz-midi-vscode` and the local Windows MIDI backend.

## Deliberate boundaries

- The browser/iPad implementation remains unchanged and independent.
- The extension declares `extensionKind: ["ui"]`, so it runs locally in Windows even
  when NTPilot's source workspace is Remote WSL.
- Read only sends no mutations. Read + write requires the existing per-change
  confirmation and NT read-back.

## Development

Run `npm install` from this folder on the host used to package the extension. The
package includes the existing Windows Jazz MIDI backend binaries. The command
**NTPilot: Open** opens the panel beside the active editor.

## Packaging

The extension must be packaged and installed locally in VS Code, not installed into
the Remote WSL extension host. Do not use the old `vscode-midi-companion` prototype;
it was deliberately removed.
