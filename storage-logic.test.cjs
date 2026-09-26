"use strict";

const assert = require("node:assert/strict");
const { replaceFileSafely } = require("./storage-logic.js");

function mockTransport(initial, hooks = {}) {
  const files = new Map(Object.entries(initial).map(([path, bytes]) => [path, Uint8Array.from(bytes)]));
  return {
    files,
    async writeSDFile(path, bytes) {
      files.set(path, Uint8Array.from(bytes));
      if (hooks.afterWrite) await hooks.afterWrite(path, files);
    },
    async readSDFile(path) {
      if (!files.has(path)) throw new Error(`missing ${path}`);
      return Uint8Array.from(files.get(path));
    },
    async renameSDPath(from, to) {
      if (!files.has(from) || files.has(to)) throw new Error("rename failed");
      files.set(to, files.get(from));
      files.delete(from);
      if (hooks.afterRename) await hooks.afterRename(from, to, files);
    },
    async deleteSDPath(path) {
      if (hooks.beforeDelete) await hooks.beforeDelete(path, files);
      if (!files.delete(path)) throw new Error(`missing ${path}`);
    }
  };
}

(async () => {
  const path = "/presets/Live.json";
  const oldBytes = [1, 2, 3];
  const newBytes = Uint8Array.from([4, 5, 6]);

  const success = mockTransport({ [path]: oldBytes });
  assert.equal(await replaceFileSafely(success, path, newBytes, "success"), null);
  assert.deepEqual([...success.files.get(path)], [...newBytes]);
  assert.deepEqual([...success.files.keys()], [path]);

  let failedInstalledRename = false;
  const ambiguous = mockTransport({ [path]: oldBytes }, {
    afterRename: async (from, to) => {
      if (from.endsWith(".tmp") && !failedInstalledRename) {
        failedInstalledRename = true;
        throw new Error("rename response timed out");
      }
    }
  });
  await assert.rejects(() => replaceFileSafely(ambiguous, path, newBytes, "ambiguous"), /timed out/);
  assert.deepEqual([...ambiguous.files.get(path)], oldBytes);
  assert.deepEqual([...ambiguous.files.keys()], [path]);

  const retainedBackup = mockTransport({ [path]: oldBytes }, {
    beforeDelete: async target => {
      if (target.endsWith(".bak")) throw new Error("card busy");
    }
  });
  const backupPath = await replaceFileSafely(retainedBackup, path, newBytes, "retained");
  assert.equal(backupPath, "/presets/.ntpilot-retained.bak");
  assert.deepEqual([...retainedBackup.files.get(path)], [...newBytes]);
  assert.deepEqual([...retainedBackup.files.get(backupPath)], oldBytes);

  console.log("storage-logic: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
