// A worker that runs coverage reports.

(function() {
  importScripts('lib/chai-3.5.0.min.js');
  importScripts('lib/esprima.js');
  importScripts('lib/escodegen.browser.js');
  importScripts('lib/instrumenter.js');

  // When the worker begins, record the set of global variables (including those
  // from the imported scripts, which we need).
  let properGlobals = new Set(Object.keys(self));

  let console = {
    log() {},
    error() {},
    info() {},
  };

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

  // Receive a message of the form {code:, setup:, tests:}, then compute the coverage.
  // Sends back the coverage object or undefined. If a syntax error occurs, we send
  // back undefined immediately. For all other errors, we send back the coverage
  // object anyway.
  self.addEventListener('message', message => {
    try {
      deleteNonProperGlobals();
      eval(`(function(){${computeCoverage(message.data)}}())`);
      self.postMessage(self.__coverage__);
    } catch (e) {
      if (e.name === 'SyntaxError') {
        self.postMessage(false);
        return;
      }
      self.postMessage(self.__coverage__);
    }
  });
}());
