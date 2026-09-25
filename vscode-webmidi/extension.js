"use strict";

const fs = require("fs");
const vscode = require("vscode");

function assetUri(webview, extensionUri, name) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", name)).toString();
}

function panelHtml(webview, extensionUri) {
  const indexPath = vscode.Uri.joinPath(extensionUri, "media", "index.html").fsPath;
  const nonce = String(Date.now());
  let html = fs.readFileSync(indexPath, "utf8");
  html = html.replace(
    "<head>",
    `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">`
  );
  html = html.replace(/styles\.css\?v=[^"]+/, assetUri(webview, extensionUri, "styles.css"));
  html = html.replace(
    `<script src="web-midi-transport.js?v=20260922-28"></script>`,
    `<script nonce="${nonce}" src="${assetUri(webview, extensionUri, "jazz-midi-vscode.js")}"></script>\n  <script nonce="${nonce}" src="${assetUri(webview, extensionUri, "web-midi-shim.js")}"></script>\n  <script nonce="${nonce}" src="${assetUri(webview, extensionUri, "web-midi-transport.js")}"></script>`
  );
  html = html.replace(
    `<script src="app.js?v=20260922-47"></script>`,
    `<script nonce="${nonce}" src="${assetUri(webview, extensionUri, "app.js")}"></script>`
  );
  return html;
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand("ntpilot.open", () => {
    let jazz;
    try {
      jazz = require("jazz-midi-vscode");
    } catch (error) {
      vscode.window.showErrorMessage(`NTPilot could not load the local MIDI bridge: ${error.message}`);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "ntpilot",
      "NTPilot",
      vscode.ViewColumn.Beside,
      { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")] }
    );
    jazz.init(panel);
    panel.webview.html = panelHtml(panel.webview, context.extensionUri);
  }));
}

function deactivate() {}

module.exports = { activate, deactivate };
