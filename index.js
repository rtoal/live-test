(function () {

  function $(selector) {return document.querySelector(selector);}
  function $$(selector) {return Array.from(document.querySelectorAll(selector));}

  const PASS_COLOR = "green";
  const FAIL_COLOR = "red";

  const beforeContainer = $("#beforewrapper");
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
    let textArea = addDeleteableTextArea($("#testwrapper"), div => div.remove());
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
    $$("#testwrapper textarea").forEach(test => evalTest(test));
  }

  function showSetup() {
    beforeContainer.style.display = 'block';
    $('.addsetup').style.display = 'none';
    runAllTests();
  }

  function hideSetup() {
    beforeContainer.style.display = 'none';
    $('.addsetup').style.display = 'inline';
    runAllTests();
  }

  function load(key) {
    let bundle = localStorage.getItem('livetdd-' + key, JSON.stringify(bundle));
    // TODO - validate item
    editor.setValue(bundle.code);
    // TODO - add setup
    // TODO - add tests
  }

  function save() {
    console.log('woo')
    let key = prompt('Enter a local storage key at which to save your work');
    if (!key) return;
    let bundle = {
      setup: beforeContainer.style.display === 'none' ? null : setupArea.value,
      tests: $$("#testwrapper textarea").map(area => area.value),
      code: editor.getValue()
    };
    localStorage.setItem('livetdd-' + key, JSON.stringify(bundle));
  }

  setupArea.setAttribute('placeholder', 'Add code to be run before every test here.');
  setupArea.addEventListener('input', () => {sizeBox(setupArea); runAllTests();});
  $('.addsetup').addEventListener('click', showSetup);
  $('.addtest').addEventListener('click', addTest);
  hideSetup();
  addTest();

  let helpModal = $(".modal");
  helpModal.onclick = () => helpModal.style.display = 'none';
  $("#helpbutton").addEventListener('click', () => {helpModal.style.display = 'block';});
  $("#loadbutton").addEventListener('click', load);
  $("#savebutton").addEventListener('click', save);
  editor.getSession().on('change', runAllTests);
}());
