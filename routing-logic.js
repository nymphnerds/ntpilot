(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.NTPilotRoutingLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function selectionAcceptsBus(selection, bus) {
    if (selection?.parameterIndex == null) return true;
    const value = bus + 1;
    return value >= selection.minimum && value <= selection.maximum;
  }

  function endpointCompatibilityError(parameter, endpoint) {
    if (!parameter || !endpoint) return "Choose one algorithm port and one physical bus.";
    if (endpoint.side === "source" && parameter.side !== "input") {
      return "A physical input can only connect to an algorithm input.";
    }
    if (endpoint.side === "sink" && parameter.side !== "output") {
      return "A physical output can only connect from an algorithm output.";
    }
    return null;
  }

  function writableOutputRoutesForBus(slots, bus, incomingOutput = null) {
    return (slots || []).flatMap(slot => (slot.ioParameters || [])
      .filter(parameter => (parameter.ioFlags & 0x02)
        && Number(parameter.value) - 1 === bus
        && !(slot.index === incomingOutput?.slotIndex && parameter.index === incomingOutput?.parameterIndex))
      .map(parameter => ({
        side: "output",
        bus,
        slotIndex: slot.index,
        parameterIndex: parameter.index,
        minimum: Number(parameter.min),
        maximum: Number(parameter.max)
      })));
  }

  return { selectionAcceptsBus, endpointCompatibilityError, writableOutputRoutesForBus };
});
