"use strict";

const assert = require("node:assert/strict");
const { executeRoutingTransaction, planRoutingConnection, executeConnectionPlan } = require("./routing-logic.js");

(async () => {
  const output = { side: "output", slotIndex: 0, parameterIndex: 2, bus: -1, minimum: 0, maximum: 64 };
  const input = { side: "input", slotIndex: 1, parameterIndex: 3, bus: 4, minimum: 0, maximum: 64 };
  const planned = planRoutingConnection(output, input, { usedBuses: [20], firstAux: 20, auxCount: 3 });
  assert.equal(planned.bus, 21);
  assert.deepEqual(planned.writes.map(write => [write.selection.side, write.bus, write.previousBus]), [
    ["output", 21, -1],
    ["input", 21, 4]
  ]);
  const direct = planRoutingConnection(input, { side: "source", bus: 5, parameterIndex: null });
  assert.deepEqual(direct.writes.map(write => [write.selection.side, write.bus]), [["input", 5]]);
  assert.throws(() => planRoutingConnection(output, { side: "source", bus: 5, parameterIndex: null }), /physical input can only connect to an algorithm input/i);
  assert.throws(() => planRoutingConnection(output, input, { usedBuses: [20, 21, 22], firstAux: 20, auxCount: 3 }), /no free aux bus/i);

  const planCalls = [];
  await assert.rejects(() => executeConnectionPlan(planned, async (selection, bus) => {
    planCalls.push([selection.side, bus]);
    if (selection === input && bus === planned.bus) throw new Error("input write failed");
  }), error => {
    assert.equal(error.message, "input write failed");
    assert.deepEqual(error.rollbackErrors, []);
    return true;
  });
  assert.deepEqual(planCalls, [
    ["output", 21], ["input", 21], ["input", 4], ["output", -1]
  ]);

  const calls = [];
  const routeA = { id: "a", bus: 12 };
  const routeB = { id: "b", bus: 18 };
  const result = await executeRoutingTransaction({
    modeChange: { before: "add", after: "replace" },
    routesToRemove: [routeA, routeB],
    writeMode: async mode => calls.push(["mode", mode]),
    writeRoute: async (route, bus) => calls.push(["route", route.id, bus]),
    apply: async () => calls.push(["apply"])
  });
  assert.deepEqual(calls, [
    ["mode", "replace"],
    ["route", "a", -1],
    ["route", "b", -1],
    ["apply"]
  ]);
  assert.equal(result.modeChanged, true);
  assert.deepEqual(result.removedRoutes, [routeA, routeB]);

  calls.length = 0;
  await assert.rejects(() => executeRoutingTransaction({
    modeChange: { before: "add", after: "replace" },
    routesToRemove: [routeA, routeB],
    writeMode: async mode => calls.push(["mode", mode]),
    writeRoute: async (route, bus) => calls.push(["route", route.id, bus]),
    apply: async () => {
      calls.push(["apply"]);
      throw new Error("connection failed");
    },
    restorePrimary: async () => calls.push(["primary", "restore"])
  }), error => {
    assert.equal(error.message, "connection failed");
    assert.deepEqual(error.rollbackErrors, []);
    return true;
  });
  assert.deepEqual(calls, [
    ["mode", "replace"],
    ["route", "a", -1],
    ["route", "b", -1],
    ["apply"],
    ["primary", "restore"],
    ["route", "b", 18],
    ["route", "a", 12],
    ["mode", "add"]
  ]);

  calls.length = 0;
  await assert.rejects(() => executeRoutingTransaction({
    routesToRemove: [routeA, routeB],
    writeMode: async () => {},
    writeRoute: async (route, bus) => {
      calls.push(["route", route.id, bus]);
      if (route === routeB && bus === -1) throw new Error("remove failed");
    },
    apply: async () => calls.push(["apply"]),
    restorePrimary: async () => calls.push(["primary", "restore"])
  }), /remove failed/);
  assert.deepEqual(calls, [
    ["route", "a", -1],
    ["route", "b", -1],
    ["route", "b", 18],
    ["route", "a", 12]
  ]);

  calls.length = 0;
  await assert.rejects(() => executeRoutingTransaction({
    routesToRemove: [],
    writeMode: async () => {},
    writeRoute: async () => {},
    apply: async () => {
      calls.push(["apply"]);
      throw new Error("readback failed");
    },
    restorePrimary: async () => calls.push(["primary", "restore"])
  }), /readback failed/);
  assert.deepEqual(calls, [["apply"], ["primary", "restore"]]);

  calls.length = 0;
  await assert.rejects(() => executeRoutingTransaction({
    modeChange: { before: "add", after: "replace" },
    writeMode: async mode => {
      calls.push(["mode", mode]);
      if (mode === "replace") throw new Error("mode readback failed");
    },
    writeRoute: async () => {},
    apply: async () => {}
  }), /mode readback failed/);
  assert.deepEqual(calls, [["mode", "replace"], ["mode", "add"]]);

  calls.length = 0;
  await assert.rejects(() => executeRoutingTransaction({
    modeChange: { before: "add", after: "replace" },
    routesToRemove: [routeA],
    writeMode: async mode => {
      calls.push(["mode", mode]);
      if (mode === "add") throw new Error("mode rollback failed");
    },
    writeRoute: async (route, bus) => {
      calls.push(["route", route.id, bus]);
      if (bus === route.bus) throw new Error("route rollback failed");
    },
    apply: async () => { throw new Error("apply failed"); }
  }), error => {
    assert.equal(error.message, "apply failed");
    assert.equal(error.rollbackErrors.length, 2);
    return true;
  });

  console.log("routing-logic: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
