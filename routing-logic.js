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

  return { selectionAcceptsBus, endpointCompatibilityError };
});
