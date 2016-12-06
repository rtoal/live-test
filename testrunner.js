// A reusable web worker that runs tests.

(function() {
  importScripts('lib/chai-3.5.0.min.js');

  // When the worker begins, record the set of global variables (including chai).
  let properGlobals = new Set(Object.keys(self));

  // Removes all globals that were user-added, so the worker can be reused.
  function deleteNonProperGlobals() {
    for (let key of Object.keys(self)) {
      if (!(properGlobals.has(key))) {
        delete self[key];
      }
    }
  }

  self.addEventListener('message', testCode => {
    try {
      // Each test begins with the global object untarnished with previous mutations.
      deleteNonProperGlobals();
      // TODO: Don't just return a boolean; bundle the failure reason if any
      self.postMessage(!!eval(testCode.data));
    } catch (e) {
      // TODO: Bundle the exception text with the result
      self.postMessage(false);
    }
  });
}());
