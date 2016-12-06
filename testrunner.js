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
      eval(testCode.data);
      self.postMessage([true, '']);
    } catch (e) {
      // Chai puts its exception messages inside its `d` field.
      self.postMessage([false, e.d && e.d.message || e.message || typeof(e)]);
    }
  });
}());
