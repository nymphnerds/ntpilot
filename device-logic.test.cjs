"use strict";

const assert = require("node:assert/strict");
const { firmwareParts, firmwareAtLeast, supportsMemoryReport, slotMutationTarget } = require("./device-logic.js");

assert.deepEqual(firmwareParts("1.19.0-beta.2"), [1, 19, 0]);
assert.deepEqual(firmwareParts("unknown"), [0, 0, 0]);
assert.equal(firmwareAtLeast("1.19.0", 1, 19), true);
assert.equal(firmwareAtLeast("1.18.9", 1, 19), false);
assert.equal(firmwareAtLeast("2.0", 1, 19), true);
assert.equal(supportsMemoryReport("1.19.0"), true);
assert.equal(supportsMemoryReport("1.18.0"), false);
assert.equal(slotMutationTarget(10, { index: 4 }, "before"), 4);
assert.equal(slotMutationTarget(10, { index: 4 }, "after"), 5);
assert.equal(slotMutationTarget(10, null, "after"), 10);
assert.equal(slotMutationTarget(10, { index: 4 }, 99), 10);

console.log("device-logic: ok");
