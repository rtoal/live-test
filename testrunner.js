// A web worker that runs tests

self.addEventListener('message', testCode => {
  try {
    // TODO: Bundle an explanation with the result if the test fails
    self.postMessage(!!eval(testCode.data));
  } catch (e) {
    // TODO: Bundle the exception text with the result
    self.postMessage(false);
  }
});
