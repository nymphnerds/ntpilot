import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import readline from "node:readline";

export class CodexAppServerClient extends EventEmitter {
  constructor({ command = "codex", args = ["app-server"], env = process.env, cwd = process.cwd() } = {}) {
    super();
    this.command = command;
    this.args = args;
    this.env = env;
    this.cwd = cwd;
    this.child = null;
    this.nextId = 1;
    this.pending = new Map();
    this.startPromise = null;
    this.serverRequestHandler = null;
  }

  async start() {
    if (this.child) return;
    if (this.startPromise) return this.startPromise;
    this.startPromise = this.#start();
    try { await this.startPromise; } finally { this.startPromise = null; }
  }

  async #start() {
    const child = spawn(this.command, this.args, { cwd: this.cwd, env: this.env, stdio: ["pipe", "pipe", "pipe"] });
    this.child = child;
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", chunk => this.emit("stderr", chunk));
    child.once("error", error => this.#fail(error));
    child.once("exit", (code, signal) => this.#fail(new Error(`Codex App Server stopped (${signal || (code ?? "unknown")}).`)));
    readline.createInterface({ input: child.stdout, crlfDelay: Infinity }).on("line", line => this.#handleLine(line));
    await this.request("initialize", {
      clientInfo: { name: "ntpilot", title: "NT Pilot", version: "0.1.0" },
      capabilities: { experimentalApi: true, requestAttestation: false }
    });
    this.notify("initialized", {});
  }

  request(method, params = {}) {
    if (!this.child?.stdin?.writable) return Promise.reject(new Error("Codex App Server is not running."));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.#send({ method, id, params });
    });
  }

  notify(method, params = {}) { this.#send({ method, params }); }
  respond(id, result) { this.#send({ id, result }); }
  respondError(id, message, code = -32000) { this.#send({ id, error: { code, message } }); }
  setServerRequestHandler(handler) { this.serverRequestHandler = handler; }
  stop() { this.child?.kill(); this.child = null; }

  #send(message) {
    if (!this.child?.stdin?.writable) throw new Error("Codex App Server is not running.");
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  #handleLine(line) {
    if (!line.trim()) return;
    let message;
    try { message = JSON.parse(line); } catch (error) {
      this.emit("protocolError", new Error(`Invalid App Server JSON: ${error.message}`));
      return;
    }
    if (Object.hasOwn(message, "id") && (Object.hasOwn(message, "result") || Object.hasOwn(message, "error"))) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || "Codex App Server request failed."));
      else pending.resolve(message.result);
      return;
    }
    if (Object.hasOwn(message, "id") && message.method) {
      Promise.resolve(this.serverRequestHandler?.(message))
        .then(result => this.respond(message.id, result ?? {}))
        .catch(error => this.respondError(message.id, error.message));
      return;
    }
    if (message.method) this.emit("notification", message);
  }

  #fail(error) {
    this.child = null;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    this.emit("disconnected", error);
  }
}
