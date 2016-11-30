(function () {

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const addSetupButton = document.querySelector(".addsetup");
  const addTestButton = document.querySelector(".addtest");
  const testContainer = document.getElementById("testwrapper");
  const beforeContainer = document.getElementById("beforewrapper");
  const setupArea = addDeleteableTextArea(beforeContainer, hideSetup);

  // Creates a div with a text area and a close button, returns the textarea.
  // You can give a callback to do something after removing the div.
  function addDeleteableTextArea(container, callback) {
    let div = document.createElement("div");
    let textArea = document.createElement("textarea");
    let closer = document.createElement("span");
    closer.className = "deletebutton";
    closer.innerHTML = "&#x2296;";
    div.appendChild(textArea);
    div.appendChild(closer);
    closer.addEventListener('click', () => callback(div));
    container.appendChild(div);
    return textArea;
  }

  // Adds a new text area for tests. Shift+Enter also creates a new one.
  function addTest() {
    let textArea = addDeleteableTextArea(testContainer, div => div.remove());
    textArea.setAttribute('placeholder', 'Write a test here. Last expression is the assertion.');
    textArea.addEventListener('input', () => {sizeBox(textArea); evalTest(textArea);});
    textArea.addEventListener('keydown', e => {
      if (e.keyCode === 13 && e.shiftKey) {
        addTest();
        e.preventDefault();
        return false;
      }
      if (e.keyCode === 13 && e.ctrlKey) {
        editor.focus();
        e.preventDefault();
        return false;
      }
    });
    textArea.focus();
  }

  function sizeBox(box) {
    box.style.height = 'auto';
    box.style.height = box.scrollHeight + 'px';
    box.scrollTop = box.scrollHeight;
    window.scrollTo(window.scrollLeft, (box.scrollTop + box.scrollHeight));
  }

  function evalTest(textArea) {
    let test = textArea.value;
    if (test.trim() === '') {
      textArea.style.borderLeftColor = FAIL_COLOR;
      return;
    }
    try {
      let before = beforeContainer.style.display === 'none' ? '' : setupArea.value;
      let pass = eval(editor.getValue() + "\n;" + before + "\n;" + test);
      textArea.style.borderLeftColor = pass ? PASS_COLOR : FAIL_COLOR;
    } catch (e) {
      textArea.style.borderLeftColor = FAIL_COLOR;
    }
  }

  function runAllTests() {
    for (let test of document.querySelectorAll("#testwrapper textarea")) {
      evalTest(test);
    }
  }

  function showSetup() {
    beforeContainer.style.display = 'block';
    addSetupButton.style.display = 'none';
    runAllTests();
  }

  function hideSetup() {
    beforeContainer.style.display = 'none';
    addSetupButton.style.display = 'inline';
    runAllTests();
  }

  setupArea.setAttribute('placeholder', 'Add code to be run before every test here.');
  setupArea.addEventListener('input', () => {sizeBox(setupArea); runAllTests();});
  addSetupButton.addEventListener('click', showSetup);
  addTestButton.addEventListener('click', addTest);
  hideSetup();
  addTest();

  let helpModal = document.querySelector(".modal");
  helpModal.onclick = () => helpModal.style.display = 'none';
  document.querySelector("#helpbutton").addEventListener('click', () => {
    helpModal.style.display = 'block';
  });
  editor.getSession().on('change', runAllTests);
}());
