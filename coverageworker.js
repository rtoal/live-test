// A worker that runs coverage reports.

(function() {
  importScripts('lib/chai-3.5.0.min.js');
  importScripts('lib/esprima.js');
  importScripts('lib/escodegen.browser.js');
  importScripts('lib/instrumenter.js');

  // When the worker begins, record the set of global variables (including those from
  // imported scripts, which we need). That way we can get rid of any globals created
  // by the code we are executing between runs.
  let properGlobals = new Set(Object.keys(self));

  // Disable console logging while running coverage.
  let console = {
    log() {},
    error() {},
    info() {},
  };

  // Remove all globals that were user-added, so the worker can be reused.
  function deleteNonProperGlobals() {
    for (let key of Object.keys(self)) {
      if (!(properGlobals.has(key))) {
        delete self[key];
      }
    }
  }

  // Instanbul will store the coverage object in self.__coverage__, so nothing to return.
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
  // Send back the coverage object or a falsy value. If a syntax error occurs, send
  // back false immediately. For all other errors, send back the coverage object,
  // because we still want to see the coverage when there are runtime errors.
  self.addEventListener('message', message => {
    deleteNonProperGlobals();
    try {
      eval(`(function(){${computeCoverage(message.data)}}())`);
    } catch (e) {
      if (e.name === 'SyntaxError') {
        self.postMessage(false);
        return;
      }
    }
    self.postMessage(self.__coverage__);
  });
}());
