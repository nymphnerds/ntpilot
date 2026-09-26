(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.NTPilotDeviceLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function firmwareParts(version) {
    const values = String(version || "").match(/\d+/g)?.map(Number) || [];
    return [values[0] || 0, values[1] || 0, values[2] || 0];
  }

  function firmwareAtLeast(version, requiredMajor, requiredMinor = 0, requiredPatch = 0) {
    const current = firmwareParts(version);
    const required = [requiredMajor, requiredMinor, requiredPatch];
    for (let index = 0; index < required.length; index += 1) {
      if (current[index] > required[index]) return true;
      if (current[index] < required[index]) return false;
    }
    return true;
  }

  function supportsMemoryReport(version) {
    return firmwareAtLeast(version, 1, 19, 0);
  }

  function slotMutationTarget(slotCount, selectedSlot, placement) {
    if (Number.isInteger(placement)) return Math.max(0, Math.min(slotCount, placement));
    if (placement === "before" && selectedSlot) return selectedSlot.index;
    if (placement === "after" && selectedSlot) return selectedSlot.index + 1;
    return slotCount;
  }

  return { firmwareParts, firmwareAtLeast, supportsMemoryReport, slotMutationTarget };
});
