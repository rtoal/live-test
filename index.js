(function () {

  function $(selector) {return document.querySelector(selector);}
  function $$(selector) {return Array.from(document.querySelectorAll(selector));}

  const PASS_COLOR = "rgb(92,190,93)";
  const FAIL_COLOR = "rgb(209,70,78)";

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
    textArea.worker = new Worker('testrunner.js');
    textArea.worker.addEventListener('message', result => {
      textArea.style.borderLeftColor = result.data ? PASS_COLOR : FAIL_COLOR
    });
    return textArea;
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
    let before = beforeContainer.style.display === 'none' ? '' : setupArea.value;
    textArea.worker.postMessage(`${editor.getValue()}\n;${before}\n;${test}`);
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

  // TODO - needs better error handling, because so many things can go wrong....
  function load() {
    let key = prompt('Enter a local storage key from which to load your work');
    if (!key) return;
    let bundle = JSON.parse(localStorage.getItem('livetdd-' + key));
    if (!(bundle && 'setup' in bundle && 'tests' in bundle && 'code' in bundle)) {
      alert('Not a valid snapshot');
      return;
    }
    editor.setValue(bundle.code);
    if (!bundle.setup) {
      hideSetup();
    } else {
      showSetup();
      setupArea.value = bundle.setup;
    }
    $$("#testwrapper div").forEach(div => div.remove());
    bundle.tests.forEach(test => addTest().value = test);
    // TODO - looks like we need to size the boxes after loading, who knew.
  }

  function save() {
    let key = prompt('Enter a local storage key at which to save your work');
    if (!key) return;
    localStorage.setItem(`livetdd-${key}`, JSON.stringify({
      setup: beforeContainer.style.display === 'none' ? null : setupArea.value,
      tests: $$("#testwrapper textarea").map(area => area.value),
      code: editor.getValue()
    }));
    alert(`Saved to local storage at ${key}`);
  }

  function exportAll() {
    // TODO
  }

  function runCoverage() {
    // TODO
  }

  function initializeModal(trigger, modal) {
    const dismiss = e => {
      modal.style.display = 'none';
      document.body.removeEventListener('keyup', dismiss);
    };
    trigger.addEventListener('click', () => {
      modal.style.display = 'block';
      document.body.addEventListener('keyup', dismiss);
    });
    modal.addEventListener('click', dismiss);
  }

  setupArea.setAttribute('placeholder', 'Add code to be run before every test here.');
  setupArea.addEventListener('input', () => {sizeBox(setupArea); runAllTests();});
  $('.addsetup').addEventListener('click', showSetup);
  $('.addtest').addEventListener('click', addTest);
  hideSetup();
  addTest();

  initializeModal($("#helpbutton"), $(".modal"));
  $("#loadbutton").addEventListener('click', load);
  $("#savebutton").addEventListener('click', save);
  $("#exportbutton").addEventListener('click', exportAll);
  $("#coveragebutton").addEventListener('click', runCoverage);
  editor.getSession().on('change', runAllTests);
}());
