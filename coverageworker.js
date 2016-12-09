// A worker that runs coverage reports.

(function() {
  importScripts('lib/chai-3.5.0.min.js');
  importScripts('lib/esprima.js');
  importScripts('lib/escodegen.browser.js');
  importScripts('lib/instrumenter.js');

  // When the worker begins, record the set of global variables (including those
  // from the imported scripts, which we need).
  let properGlobals = new Set(Object.keys(self));

  // Removes all globals that were user-added, so the worker can be reused.
  function deleteNonProperGlobals() {
    for (let key of Object.keys(self)) {
      if (!(properGlobals.has(key))) {
        delete self[key];
      }
    }
  }

  // Instanbul will store the coverage object in self.__coverage__.
  function computeCoverage(bundle) {
    let instrumenter = new Instrumenter();
    let code = [instrumenter.instrumentSync(bundle.code)];
    let setup = bundle.setup || '';
    bundle.tests.forEach(test => {
      code.push(`(function () {
        ${setup};
        ${test};
      }())`);
    });
    return code.join(';\n');
  }

  self.addEventListener('message', message => {
    try {
      deleteNonProperGlobals();
      eval(`(function(){${computeCoverage(message.data)}}())`);
      self.postMessage([true, self.__coverage__]);
    } catch (e) {
      // Chai puts its exception messages inside its `d` field.
      self.postMessage([false, e.d && e.d.message || e.message || typeof(e)]);
    }
  });
}());
