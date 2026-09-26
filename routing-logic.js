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

  function planRoutingConnection(first, second, { usedBuses = [], firstAux = 0, auxCount = 0 } = {}) {
    const parameters = [first, second].filter(item => item?.parameterIndex != null);
    const endpoints = [first, second].filter(item => item?.parameterIndex == null && Number(item?.bus) >= 0);
    if (!parameters.length) throw new Error("Choose at least one writable algorithm port.");

    if (endpoints.length) {
      if (parameters.length !== 1) throw new Error("Choose one algorithm port and one physical bus.");
      const compatibilityError = endpointCompatibilityError(parameters[0], endpoints[0]);
      if (compatibilityError) throw new Error(compatibilityError);
      if (!selectionAcceptsBus(parameters[0], endpoints[0].bus)) throw new Error("The selected physical bus is outside this port's permitted range.");
      return { bus: endpoints[0].bus, writes: [{ selection: parameters[0], bus: endpoints[0].bus, previousBus: parameters[0].bus }] };
    }

    if (parameters.length !== 2 || parameters[0].side === parameters[1].side) {
      throw new Error("Choose one algorithm output and one algorithm input.");
    }
    const output = parameters.find(item => item.side === "output");
    const input = parameters.find(item => item.side === "input");
    if (!output || !input) throw new Error("Choose one algorithm output and one algorithm input.");

    let bus = output.bus;
    const writes = [];
    if (bus < 0) {
      const used = new Set(usedBuses);
      bus = Array.from({ length: auxCount }, (_, index) => firstAux + index)
        .find(candidate => !used.has(candidate) && selectionAcceptsBus(output, candidate) && selectionAcceptsBus(input, candidate));
      if (bus == null) throw new Error("No free Aux bus is permitted by both ports.");
      writes.push({ selection: output, bus, previousBus: output.bus });
    } else if (!selectionAcceptsBus(input, bus)) {
      throw new Error("The output bus is not permitted by the selected input.");
    }
    writes.push({ selection: input, bus, previousBus: input.bus });
    return { bus, writes };
  }

  async function executeConnectionPlan(plan, writeRoute) {
    const attempted = [];
    try {
      for (const write of plan.writes) {
        attempted.push(write);
        await writeRoute(write.selection, write.bus);
      }
      return plan;
    } catch (cause) {
      const rollbackErrors = [];
      for (const write of [...attempted].reverse()) {
        try { await writeRoute(write.selection, write.previousBus); } catch (error) { rollbackErrors.push(error); }
      }
      const failure = new Error(cause.message, { cause });
      failure.rollbackErrors = rollbackErrors;
      throw failure;
    }
  }

  async function executeRoutingTransaction({
    modeChange = null,
    routesToRemove = [],
    writeMode,
    writeRoute,
    apply,
    restorePrimary = null
  }) {
    const modeChanged = Boolean(modeChange && modeChange.before !== modeChange.after);
    const removedRoutes = [];
    let modeAttempted = false;
    let applyStarted = false;
    try {
      if (modeChanged) {
        modeAttempted = true;
        await writeMode(modeChange.after);
      }
      for (const route of routesToRemove) {
        removedRoutes.push(route);
        await writeRoute(route, -1);
      }
      applyStarted = true;
      await apply();
      return { modeChanged, removedRoutes };
    } catch (cause) {
      const rollbackErrors = [];
      if (applyStarted && restorePrimary) {
        try { await restorePrimary(); } catch (error) { rollbackErrors.push(error); }
      }
      for (const route of [...removedRoutes].reverse()) {
        try { await writeRoute(route, route.bus); } catch (error) { rollbackErrors.push(error); }
      }
      if (modeAttempted) {
        try { await writeMode(modeChange.before); } catch (error) { rollbackErrors.push(error); }
      }
      const failure = new Error(cause.message, { cause });
      failure.rollbackErrors = rollbackErrors;
      throw failure;
    }
  }

  return {
    selectionAcceptsBus,
    endpointCompatibilityError,
    writableOutputRoutesForBus,
    planRoutingConnection,
    executeConnectionPlan,
    executeRoutingTransaction
  };
});
