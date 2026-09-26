#!/usr/bin/env node
import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { CodexAppServerClient } from "./codex-app-server-client.mjs";
import { KnowledgeService } from "../../ntpilot-knowledge/lib/knowledge-service.mjs";

const hostDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(hostDir, "..");
const dataDir = path.resolve(process.env.NTPILOT_DATA_DIR || path.join(os.homedir(), ".ntpilot"));
const runtime = path.resolve(process.env.NTPILOT_CODEX_RUNTIME || path.join(dataDir, "runtime", "codex"));
const knowledgeDir = path.resolve(publicDir, "../ntpilot-knowledge");
const port = Number(process.env.NTPILOT_PORT || 8766);
const bindHost = process.env.NTPILOT_HOST || "127.0.0.1";
const aliasPorts = String(process.env.NTPILOT_ALIAS_PORTS || "")
  .split(",")
  .map(value => Number(value.trim()))
  .filter(value => Number.isInteger(value) && value > 0 && value !== port);

await mkdir(path.join(dataDir, "sessions"), { recursive: true, mode: 0o700 });

const pack = JSON.parse(await readFile(path.join(knowledgeDir, "dist/knowledge-pack.json"), "utf8"));
const knowledge = new KnowledgeService(pack);
const definitions = JSON.parse(await readFile(path.join(knowledgeDir, "tools/tool-definitions.json"), "utf8")).tools;
const safeToolName = name => name.replaceAll(".", "_");
const dynamicTools = definitions.map(tool => ({ name: safeToolName(tool.name), description: tool.description, inputSchema: tool.inputSchema }));

const sessions = new Map();
const runtimeArgs = ["app-server", "--disable", "shell_tool", "--disable", "unified_exec", "--disable", "apps", "--disable", "plugins", "--disable", "browser_use", "--disable", "computer_use", "--disable", "image_generation", "--disable", "multi_agent", "--disable", "hooks", "--disable", "goals"];

async function handleServerRequest(message) {
  if (message.method === "item/tool/call") {
    const { tool, arguments: args } = message.params;
    let result;
    if (tool === "knowledge_search") result = knowledge.search(args);
    else if (tool === "knowledge_open") result = knowledge.open(args);
    else if (tool === "algorithm_reference_resolve") result = knowledge.resolveManualAlgorithm(args);
    else throw new Error(`Unknown read-only tool: ${tool}`);
    return { success: true, contentItems: [{ type: "inputText", text: JSON.stringify(result) }] };
  }
  if (message.method.includes("requestApproval")) return { decision: "decline" };
  if (message.method === "execCommandApproval" || message.method === "applyPatchApproval") return { decision: "denied" };
  throw new Error(`Unsupported Assistant request: ${message.method}`);
}

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

async function browserSession(req, res) {
  let id = cookieValue(req, "ntpilot_ai_session");
  if (!/^[a-f0-9]{64}$/.test(id || "")) {
    id = randomBytes(32).toString("hex");
    const secure = process.env.NTPILOT_SECURE_COOKIES === "true" ? "; Secure" : "";
    res.setHeader("set-cookie", `ntpilot_ai_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`);
  }
  if (sessions.has(id)) return sessions.get(id);
  const root = path.join(dataDir, "sessions", id);
  const accountDir = path.join(root, "codex");
  const contextDir = path.join(root, "context");
  await mkdir(accountDir, { recursive: true, mode: 0o700 });
  await mkdir(contextDir, { recursive: true, mode: 0o700 });
  const client = new CodexAppServerClient({ command: runtime, cwd: contextDir, env: { ...process.env, CODEX_HOME: accountDir }, args: runtimeArgs });
  client.on("stderr", chunk => { const text = String(chunk).trim(); if (text) process.stderr.write(`[assistant:${id.slice(0, 8)}] ${text}\n`); });
  client.setServerRequestHandler(handleServerRequest);
  const session = { id, client, contextDir };
  sessions.set(id, session);
  return session;
}

async function appServer(session) { await session.client.start(); return session.client; }
function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(payload), "cache-control": "no-store", "access-control-allow-origin": "*" });
  res.end(payload);
}
async function readJson(req, limit = 20 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request is too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}
function normalizedContext(value = {}) {
  return {
    connected: Boolean(value.connected), firmware: String(value.firmware || "unknown").slice(0, 80),
    sysexId: Number.isFinite(value.sysexId) ? value.sysexId : null,
    presetName: String(value.presetName || "Unknown preset").slice(0, 160), unsavedChanges: Boolean(value.unsavedChanges),
    slots: Array.isArray(value.slots) ? value.slots.slice(0, 40).map(slot => ({ index: Number(slot.index), name: String(slot.name || ""), guid: String(slot.guidKey || slot.guid || ""), bypassed: Boolean(slot.bypassed) })) : []
  };
}
function turnInput(prompt, context, attachments = []) {
  const input = [];
  const documents = [];
  let budget = 180000;
  for (const attachment of attachments.slice(0, 24)) {
    if (attachment.kind === "image" && /^data:image\//.test(attachment.dataUrl || "")) input.push({ type: "image", url: attachment.dataUrl, detail: "auto" });
    else if (typeof attachment.text === "string" && budget > 0) {
      const text = attachment.text.slice(0, budget); budget -= text.length;
      documents.push(`<attachment name=${JSON.stringify(String(attachment.name || "document"))}>\n${text}\n</attachment>`);
    } else documents.push(`<attachment name=${JSON.stringify(String(attachment.name || "file"))}>Binary attachment supplied without extracted text.</attachment>`);
  }
  input.unshift({ type: "text", text: `<nt_pilot_context read_only="true">\n${JSON.stringify(normalizedContext(context), null, 2)}\n</nt_pilot_context>\n${documents.join("\n")}\n<user_request>\n${prompt}\n</user_request>`, text_elements: [] });
  return input;
}
const instructions = `You are the NT Pilot Assistant for the Expert Sleepers disting NT. This milestone is strictly read-only. Never edit files or presets, execute commands, send MIDI/SysEx, save hardware state, or claim you did. Use live NT context as device truth. Use knowledge_search and knowledge_open for NT facts and cite their exact citation and locator. Preserve firmware scope. Be concise.`;
async function newThread(session, model) {
  const app = await appServer(session);
  const result = await app.request("thread/start", { model: model || null, cwd: session.contextDir, runtimeWorkspaceRoots: [session.contextDir], approvalPolicy: "never", sandbox: "read-only", developerInstructions: instructions, dynamicTools, environments: [], serviceName: "NT Pilot" });
  return result.thread;
}

async function api(req, res, url) {
  const session = await browserSession(req, res);
  const app = await appServer(session);
  if (req.method === "GET" && url.pathname === "/api/assistant/status") {
    const result = await app.request("account/read", { refreshToken: false });
    return json(res, 200, { available: true, account: result.account, requiresOpenaiAuth: result.requiresOpenaiAuth });
  }
  if (req.method === "POST" && url.pathname === "/api/assistant/login") {
    const body = await readJson(req);
    const remoteFlow = process.env.NTPILOT_LOGIN_FLOW === "device";
    return json(res, 200, await app.request("account/login/start", remoteFlow || body.flow === "device" ? { type: "chatgptDeviceCode" } : { type: "chatgpt", codexStreamlinedLogin: true }));
  }
  if (req.method === "POST" && url.pathname === "/api/assistant/logout") { await app.request("account/logout", {}); return json(res, 200, { ok: true }); }
  if (req.method === "GET" && url.pathname === "/api/assistant/models") return json(res, 200, await app.request("model/list", { limit: 100, includeHidden: false }));
  if (req.method === "GET" && url.pathname === "/api/assistant/threads") return json(res, 200, await app.request("thread/list", { limit: 100, sortKey: "updated_at", sortDirection: "desc", cwd: session.contextDir }));
  const match = url.pathname.match(/^\/api\/assistant\/threads\/([^/]+)$/);
  if (match && req.method === "GET") return json(res, 200, await app.request("thread/read", { threadId: decodeURIComponent(match[1]), includeTurns: true }));
  if (match && req.method === "PATCH") { const body = await readJson(req); const name = String(body.name || "New conversation").replace(/\s+/g, " ").trim().slice(0, 80); await app.request("thread/name/set", { threadId: decodeURIComponent(match[1]), name }); return json(res, 200, { ok: true, name }); }
  if (req.method === "POST" && url.pathname === "/api/assistant/turns") {
    const body = await readJson(req); const prompt = String(body.prompt || "").trim();
    if (!prompt) return json(res, 400, { error: "Prompt is required." });
    const threadId = String(body.threadId || "") || (await newThread(session, body.model)).id;
    res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", connection: "keep-alive" });
    const send = event => res.write(`${JSON.stringify(event)}\n`); send({ type: "thread", threadId });
    let turnId = null;
    const cleanup = () => app.off("notification", listener);
    const listener = message => {
      const params = message.params || {}; if (params.threadId !== threadId) return;
      if (message.method === "turn/started") turnId = params.turn?.id || params.turnId || turnId;
      if (message.method === "item/agentMessage/delta" && (!turnId || params.turnId === turnId)) send({ type: "delta", delta: params.delta });
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) { cleanup(); send({ type: "completed" }); res.end(); }
    };
    app.on("notification", listener); res.on("close", cleanup);
    try {
      const started = await app.request("turn/start", { threadId, input: turnInput(prompt, body.context, body.attachments), cwd: session.contextDir, runtimeWorkspaceRoots: [session.contextDir], approvalPolicy: "never", sandboxPolicy: { type: "readOnly", networkAccess: false }, environments: [], model: body.model || null });
      turnId = started.turn?.id || turnId;
    } catch (error) { cleanup(); send({ type: "error", message: error.message }); res.end(); }
    return;
  }
  json(res, 404, { error: "Unknown API route." });
}

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };
async function staticFile(res, url) {
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filename = path.resolve(publicDir, `.${requested}`);
  if (!filename.startsWith(`${publicDir}${path.sep}`)) return json(res, 403, { error: "Forbidden." });
  try { const stat = await import("node:fs/promises").then(fs => fs.stat(filename)); if (!stat.isFile()) throw new Error(); res.writeHead(200, { "content-type": mime[path.extname(filename)] || "application/octet-stream", "cache-control": "no-cache" }); createReadStream(filename).pipe(res); }
  catch { json(res, 404, { error: "Not found." }); }
}
const handleRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${bindHost}:${port}`}`);
  try {
    if (url.pathname.startsWith("/api/assistant/")) await api(req, res, url);
    else await staticFile(res, url);
  } catch (error) {
    if (!res.headersSent) json(res, error.statusCode || 500, { error: error.message });
    else res.end();
  }
};
const servers = [port, ...aliasPorts].map(listenPort => {
  const server = http.createServer(handleRequest);
  server.listen(listenPort, bindHost, () => console.log(`NT Pilot: http://${bindHost}:${listenPort}`));
  return server;
});
console.log(`Isolated Assistant runtime: ${runtime}`);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  for (const session of sessions.values()) session.client.stop();
  let pending = servers.length;
  for (const server of servers) server.close(() => { if (--pending === 0) process.exit(0); });
});
