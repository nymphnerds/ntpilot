(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.NTPilotOperationScheduler = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  class OperationScheduler {
    constructor({ before = null, after = null, onStateChange = null } = {}) {
      this.before = before;
      this.after = after;
      this.onStateChange = onStateChange;
      this.tail = Promise.resolve();
      this.pendingCount = 0;
      this.activeKind = null;
    }

    get busy() {
      return this.pendingCount > 0;
    }

    notify() {
      this.onStateChange?.({ busy: this.busy, pendingCount: this.pendingCount, activeKind: this.activeKind });
    }

    run(kind, task, options = {}) {
      if (typeof task !== "function") return Promise.reject(new Error("A scheduled operation requires a task."));
      this.pendingCount += 1;
      this.notify();
      const operation = this.tail.catch(() => {}).then(async () => {
        this.activeKind = kind;
        this.notify();
        let context;
        let taskError = null;
        try {
          context = await this.before?.({ kind, options });
          return await task(context);
        } catch (error) {
          taskError = error;
          throw error;
        } finally {
          try {
            await this.after?.({ kind, options, context, error: taskError });
          } finally {
            this.activeKind = null;
            this.notify();
          }
        }
      });
      this.tail = operation.catch(() => {});
      return operation.finally(() => {
        this.pendingCount -= 1;
        this.notify();
      });
    }

    async drain() {
      await this.tail.catch(() => {});
    }
  }

  return { OperationScheduler };
});
