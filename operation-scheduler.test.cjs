"use strict";

const assert = require("node:assert/strict");
const { OperationScheduler } = require("./operation-scheduler.js");

(async () => {
  const calls = [];
  const states = [];
  let releaseFirst;
  const firstGate = new Promise(resolve => { releaseFirst = resolve; });
  const scheduler = new OperationScheduler({
    before: async ({ kind }) => {
      calls.push(["before", kind]);
      return { kind };
    },
    after: async ({ kind, context, error }) => calls.push(["after", kind, context.kind, error?.message || null]),
    onStateChange: state => states.push({ ...state })
  });

  const first = scheduler.run("first", async () => {
    calls.push(["task", "first"]);
    await firstGate;
    return 1;
  });
  const second = scheduler.run("second", async () => {
    calls.push(["task", "second"]);
    throw new Error("second failed");
  });
  const third = scheduler.run("third", async () => {
    calls.push(["task", "third"]);
    return 3;
  });

  await Promise.resolve();
  assert.equal(scheduler.busy, true);
  assert.equal(scheduler.pendingCount, 3);
  releaseFirst();
  assert.equal(await first, 1);
  await assert.rejects(second, /second failed/);
  assert.equal(await third, 3);
  await scheduler.drain();
  assert.equal(scheduler.busy, false);
  assert.deepEqual(calls, [
    ["before", "first"], ["task", "first"], ["after", "first", "first", null],
    ["before", "second"], ["task", "second"], ["after", "second", "second", "second failed"],
    ["before", "third"], ["task", "third"], ["after", "third", "third", null]
  ]);
  assert.ok(states.some(state => state.pendingCount === 3));
  assert.equal(states.at(-1).pendingCount, 0);

  console.log("operation-scheduler: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
