(function () {

  function $(selector) {return document.querySelector(selector);}
  function $$(selector) {return Array.from(document.querySelectorAll(selector));}

  const PASS_COLOR = "rgb(92,190,93)";
  const FAIL_COLOR = "rgb(209,70,78)";
  const SLOW_TEST_THRESHOLD = 3000;

  const beforeContainer = $("#beforewrapper");
  const setupArea = addTextArea(beforeContainer, hideSetup);
  const coverageWorker = new Worker('coverageworker.js');
  let localStorageName = 'default';

  // Creates a div with a text area, a button, and a reporting line;
  // returns the textarea. Supply a callback for the button.
  function addTextArea(container, callback) {
    let div = document.createElement("div");
    let textArea = document.createElement("textarea");
    let closer = document.createElement("span");
    let errorDiv = document.createElement("div");
    let reportDiv = document.createElement("div");
    closer.className = "deletebutton";
    closer.innerHTML = "&#x2296;"; // Can also try "&#x1f5d1;";
    errorDiv.className = "testerror";
    reportDiv.className = "testoutput";
    div.appendChild(textArea);
    div.appendChild(closer);
    div.appendChild(errorDiv);
    div.appendChild(reportDiv);
    closer.addEventListener('click', () => callback(div));
    container.appendChild(div);
    return textArea;
  }

  // Adds a new text area for tests. Shift+Enter also creates a new one.
  function addTest() {
    let textArea = addTextArea($("#testwrapper"), div => div.remove());
    textArea.setAttribute('placeholder', 'Write a test, like chai.assert.equal(2+2, 4)');
    textArea.addEventListener('input', () => {sizeBox(textArea); evalTest(textArea);});
    textArea.addEventListener('input', debouncedCoverage);
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
      textArea.pendingCalls--;
      textArea.lastReceipt = new Date();
      let [success, output, errorMessage] = result.data;
      textArea.style.borderLeftColor = success ? PASS_COLOR : FAIL_COLOR;
      if (textArea.nextSibling.nextSibling) {
        textArea.nextSibling.nextSibling.innerHTML = errorMessage;
        if (textArea.nextSibling.nextSibling.nextSibling) {
          textArea.nextSibling.nextSibling.nextSibling.innerHTML = output.join('<br>');
        }
      }
    });
    textArea.pendingCalls = 0;
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
    textArea.pendingCalls++;
    textArea.lastCall = new Date();
    textArea.worker.postMessage(`"use strict";\n${editor.getValue()}\n;${before}\n;${test}`);
  }

  function runAllTests() {
    $$("#testwrapper textarea").forEach(test => evalTest(test));
  }

  function sizeAllBoxes() {
    $$("#testwrapper textarea").forEach(box => sizeBox(box));
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

  function serialize() {
    return {
      setup: beforeContainer.style.display === 'none' ? null : setupArea.value,
      tests: $$("#testwrapper textarea").map(area => area.value),
      code: editor.getValue()
    }
  }

  function load() {
    let key = prompt('Enter a local storage key from which to load your work');
    if (!key) return;
    localStorageName = key;
    let bundle = JSON.parse(localStorage.getItem('livetdd-' + key));
    if (!(bundle && 'setup' in bundle && 'tests' in bundle && 'code' in bundle)) {
      alert('Not a valid snapshot');
      return;
    }
    editor.setValue(bundle.code, -1);
    if (!bundle.setup) {
      hideSetup();
    } else {
      showSetup();
      setupArea.value = bundle.setup;
    }
    $$("#testwrapper div").forEach(div => div.remove());
    bundle.tests.forEach(test => addTest().value = test);
    sizeAllBoxes();
    runAllTests();
  }

  function save() {
    if (!localStorageName) {
      saveAs();
      return;
    }
    localStorage.setItem(`livetdd-${localStorageName}`, JSON.stringify(serialize()));
    flash(`Saved to local storage at ${localStorageName}`);
  }

  function saveAs() {
    let key = prompt('Enter a local storage key at which to save your work');
    if (!key) return;
    localStorageName = key;
    save();
  }

  function exportAll() {
    alert('Export is not yet implemented');
    // TODO
  }

  function flash(message) {
    $('#flash').innerHTML = message;
    $('#flash').style.right = '0';
    setTimeout(() => $('#flash').style.right = '-320px', 2000);
  }

  // TODO This belongs in a class. This file is getting out of hand.
  let allMarkers = [];
  function mark(start, end) {
    let range = new Range(start.line-1, start.column, end.line-1, end.column);
    allMarkers.push(editor.session.addMarker(range, 'uncovered', 'text'));
  }
  function clearAllMarkers() {
    while (allMarkers.length > 0) editor.session.removeMarker(allMarkers.pop())
  }

  function runCoverage() {
    clearAllMarkers();
    coverageWorker.postMessage(serialize());
  }
  const debouncedCoverage = _.debounce(runCoverage, 500);

  // The coverage worker return a pair [ok, message]. If ok, we highlight the
  // uncovered regions of code. Right now we have only satement coverage and
  // function coverage.
  coverageWorker.addEventListener('message', message => {
    if (!message.data) {
      return;
    }
    let coverage = message.data[Object.keys(message.data)];
    for (let key in coverage.s) {
      if (coverage.s[key] === 0) {
        let range = coverage.statementMap[key];
        mark(range.start, range.end)
      }
    }
    for (let key in coverage.f) {
      if (coverage.f[key] === 0) {
        let range = coverage.fnMap[key].loc;
        mark(range.start, range.end)
      }
    }
  });

  function monitorTests() {
    $$("#testwrapper textarea").forEach(test => {
      let now = new Date();
      if (!test.dead && test.pendingCalls > 0 && now-test.lastCall > SLOW_TEST_THRESHOLD) {
        test.dead = true;
        test.style.background = 'red';
        test.worker.terminate();
        test.nextSibling.nextSibling.innerHTML = 'Test is too slow, so I killed it';
        console.log(`Probably dead ${test.pendingCalls}`);
      }
    });
    setTimeout(monitorTests, 3000);
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

  function addListeners() {
    setupArea.setAttribute('placeholder', 'Add code to be run before every test here.');
    setupArea.addEventListener('input', () => {sizeBox(setupArea); runAllTests();});
    setupArea.value = 'let eq = chai.assert.equal;\nlet ok = chai.assert.ok;';
    $('.addsetup').addEventListener('click', showSetup);
    $('.addtest').addEventListener('click', addTest);
    initializeModal($("#helpbutton"), $(".modal"));
    $("#loadbutton").addEventListener('click', load);
    $("#savebutton").addEventListener('click', save);
    $("#saveasbutton").addEventListener('click', saveAs);
    $("#exportbutton").addEventListener('click', exportAll);
    editor.getSession().on('change', runAllTests);
    editor.getSession().on('change', debouncedCoverage);
  }

  addListeners();
  showSetup();
  addTest();
  monitorTests();
}());
