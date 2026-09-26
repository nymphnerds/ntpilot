(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.NTPilotStorageLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function sameBytes(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }

  async function replaceFileSafely(transport, path, bytes, token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`) {
    const slash = path.lastIndexOf("/");
    const directory = path.slice(0, slash + 1);
    const temporaryPath = `${directory}.ntpilot-${token}.tmp`;
    const backupPath = `${directory}.ntpilot-${token}.bak`;
    let originalMoved = false;
    let replacementInstalled = false;

    await transport.writeSDFile(temporaryPath, bytes);
    const staged = await transport.readSDFile(temporaryPath);
    if (!sameBytes(staged, bytes)) {
      try { await transport.deleteSDPath(temporaryPath); } catch (_) {}
      throw new Error("The NT did not confirm the staged file contents; the original was not changed.");
    }

    try {
      await transport.renameSDPath(path, backupPath);
      originalMoved = true;
      await transport.renameSDPath(temporaryPath, path);
      replacementInstalled = true;
      const confirmed = await transport.readSDFile(path);
      if (!sameBytes(confirmed, bytes)) throw new Error("The NT did not confirm the replacement file contents.");
    } catch (error) {
      if (!originalMoved) {
        try {
          await transport.readSDFile(backupPath);
          originalMoved = true;
        } catch (_) {}
      }
      if (!replacementInstalled) {
        try {
          replacementInstalled = sameBytes(await transport.readSDFile(path), bytes);
        } catch (_) {}
      }
      const rollbackErrors = [];
      if (replacementInstalled) {
        try { await transport.deleteSDPath(path); } catch (rollbackError) { rollbackErrors.push(rollbackError); }
      }
      if (originalMoved) {
        try { await transport.renameSDPath(backupPath, path); } catch (rollbackError) { rollbackErrors.push(rollbackError); }
      }
      try { await transport.deleteSDPath(temporaryPath); } catch (_) {}
      if (rollbackErrors.length) {
        throw new Error(`${error.message} Automatic rollback also failed; the backup is ${backupPath}.`);
      }
      throw error;
    }

    try {
      await transport.deleteSDPath(backupPath);
      return null;
    } catch (_) {
      return backupPath;
    }
  }

  return { sameBytes, replaceFileSafely };
});
