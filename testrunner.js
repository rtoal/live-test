// A reusable web worker that runs tests.

(function() {
  importScripts('lib/chai-3.5.0.min.js');

  // When the worker begins, record the set of global variables (including those from
  // imported scripts, which we need). That way we can get rid of any globals created
  // by the code we are executing between runs.
  let properGlobals = new Set(Object.keys(self));

  // Hide the global console object behind a local console that captures output.
  let consoleOutput = [];
  let console = {
    log(line) {consoleOutput.push('ℹ️ ' + line);}
  }

  // Remove all globals that were user-added, so the worker can be reused.
  function deleteNonProperGlobals() {
    for (let key of Object.keys(self)) {
      if (!(properGlobals.has(key))) {
        delete self[key];
      }
    }
  }

  // Receive a message containing the code to run (it will include the program and
  // a test). Send back a triple [success, capturedOutput, errorMessage]. The first
  // component is a boolean, the second collects everything sent to console.log,
  // and the last is an error message, if any.
  self.addEventListener('message', testCode => {
    // Each test begins with the global object untarnished with previous mutations...
    deleteNonProperGlobals();
    // ... and fresh console output.
    consoleOutput = [];
    try {
      eval(testCode.data);
      self.postMessage([true, consoleOutput, '']);
    } catch (e) {
      // Chai puts its exception messages inside its `d` field.
      let errorMessage = e.d && e.d.message || e.message || typeof(e);
      self.postMessage([false, consoleOutput, '⛔️ ' + errorMessage]);
    }
  });
}());
