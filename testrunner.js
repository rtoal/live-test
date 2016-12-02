// A reusable web worker that runs tests.

(function() {

  // When the worker begins, record the set of global variables.
  let properGlobals = new Set(Object.keys(self));

  // Removes all globals that were user-added, so the worker can be reused.
  function deleteNonProperGlobals() {
    for (key in Object.keys(self)) {
      if (!(key in properGlobals)) {
        delete self[key];
      }
    }
  }

  self.addEventListener('message', testCode => {
    try {
      deleteNonProperGlobals();
      // TODO: Bundle an explanation with the result if the test fails
      self.postMessage(!!eval(testCode.data));
    } catch (e) {
      // TODO: Bundle the exception text with the result
      self.postMessage(false);
    }
  });
}());
