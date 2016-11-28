(function () {

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const addTestButton = document.getElementById("addtest");
  const testList = document.getElementById("testlist");

  function addTest() {
    let newTest = document.createElement("textarea");
    newTest.innerHTML = '// Describe test here';
    newTest.addEventListener('input', runTest, false);
    testList.appendChild(newTest);
    runTest.call(newTest);
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
      let pass = eval(textarea.value);
      textarea.style.borderLeftColor = pass ? PASS_COLOR : FAIL_COLOR;
    } catch (e) {
      textarea.style.borderLeftColor = FAIL_COLOR;
    }
  }

  addTestButton.onclick = addTest;
  addTest();
}());
