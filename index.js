(function () {

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const addSetupButton = document.querySelector(".addsetup");
  const addTestButton = document.querySelector(".addtest");
  const testList = document.getElementById("testlist");
  let setupArea;

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
    closer.addEventListener('click', () => div.remove());
    if (callback) closer.addEventListener('click', callback);
    container.appendChild(div);
    return textArea;
  }

  // Adds a new text area for tests. Shift+Enter also creates a new one.
  function addTest() {
    let textArea = addDeleteableTextArea(testList);
    textArea.setAttribute('placeholder', 'Write test code here. Last expression is the assertion.');
    textArea.addEventListener('input', () => {sizeBox(textArea); evalTest(textArea);});
    textArea.addEventListener('keydown', e => {
      if (e.keyCode === 13 && e.shiftKey) {
        addTest();
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

  function evalTest(textarea) {
    let before = setupArea ? setupArea.value : '';
    try {
      let pass = eval(editor.getValue() + "\n;" + before + "\n;" + textarea.value);
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

  addSetupButton.onclick = () => {
    setupArea = addDeleteableTextArea(document.getElementById('beforewrapper'), () => {
      addSetupButton.style.display = 'inline';
    });
    setupArea.addEventListener('input', () => {sizeBox(setupArea); runAllTests();});
    addSetupButton.style.display = 'none'
  };

  addTestButton.onclick = addTest;
  addTest();

  editor.getSession().on('change', runAllTests);
}());
