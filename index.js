(function () {

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const addTestButton = document.getElementById("addtest");
  const testList = document.getElementById("testlist");

  function addTest() {
    let newTest = document.createElement("textarea");
    newTest.setAttribute('placeholder', 'Write test code here. Last expression is the assertion.');
    newTest.addEventListener('input', runTest, false);
    testList.appendChild(newTest);
  }

  function runTest() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight+'px';
    this.scrollTop = this.scrollHeight;
    window.scrollTo(window.scrollLeft,(this.scrollTop + this.scrollHeight));
    evalTest(this);
  }

  function evalTest(textarea) {
    try {
      let pass = eval(editor.getValue() + ";" + textarea.value);
      textarea.style.borderLeftColor = pass ? PASS_COLOR : FAIL_COLOR;
    } catch (e) {
      textarea.style.borderLeftColor = FAIL_COLOR;
    }
  }

  function runAllTests() {
    tests = document.querySelectorAll("#testlist textarea");
    for (let test of tests) {
      evalTest(test);
    }
  }

  editor.getSession().on('change', runAllTests);

  addTestButton.onclick = addTest;
  addTest();
}());
