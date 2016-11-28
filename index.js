(function () {

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const addTestButton = document.querySelector(".addtest");
  const testList = document.getElementById("testlist");

  function addDeleteableTextArea(container) {
    let div = document.createElement("div");
    let textArea = document.createElement("textarea");
    let closeRegion = document.createElement("span");
    closeRegion.className = "deletetest";
    closeRegion.innerHTML = "&#x2296;";
    div.appendChild(textArea);
    div.appendChild(closeRegion);
    closeRegion.onclick = () => div.remove();
    container.appendChild(div);
    return textArea;
  }

  function addTest() {
    let textArea = addDeleteableTextArea(testList);
    textArea.setAttribute('placeholder', 'Write test code here. Last expression is the assertion.');
    textArea.addEventListener('input', runTest, false);
    textArea.addEventListener('keydown', e => {
      if (e.keyCode === 13 && e.shiftKey) {
        addTest();
        e.preventDefault();
        return false;
      }
    });
    textArea.focus();
  }

  function runTest() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    this.scrollTop = this.scrollHeight;
    window.scrollTo(window.scrollLeft, (this.scrollTop + this.scrollHeight));
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
    for (let test of document.querySelectorAll("#testlist textarea")) {
      evalTest(test);
    }
  }

  editor.getSession().on('change', runAllTests);

  addTestButton.onclick = addTest;
  addTest();
}());
