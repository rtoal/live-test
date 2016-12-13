(function () {

  function $(selector) {return document.querySelector(selector);}
  function $$(selector) {return Array.from(document.querySelectorAll(selector));}

  const PASS_COLOR = "rgb(92,190,93)";
  const FAIL_COLOR = "rgb(209,70,78)";

  const beforeContainer = $("#beforewrapper");
  const setupArea = addDeleteableTextArea(beforeContainer, hideSetup);
  const coverageWorker = new Worker('coverageworker.js');

  // Creates a div with a text area, a button, and a reporting line;
  // returns the textarea. Supply a callback for the button.
  function addDeleteableTextArea(container, callback) {
    let div = document.createElement("div");
    let textArea = document.createElement("textarea");
    let closer = document.createElement("span");
    let reportDiv = document.createElement("div");
    closer.className = "deletebutton";
    closer.innerHTML = "&#x2296;"; // Can also try "&#x1f5d1;";
    reportDiv.className = "testoutput";
    div.appendChild(textArea);
    div.appendChild(closer);
    div.appendChild(reportDiv);
    closer.addEventListener('click', () => callback(div));
    container.appendChild(div);
    return textArea;
  }

  // Adds a new text area for tests. Shift+Enter also creates a new one.
  function addTest() {
    let textArea = addDeleteableTextArea($("#testwrapper"), div => div.remove());
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
      textArea.style.borderLeftColor = result.data[0] ? PASS_COLOR : FAIL_COLOR
      if (textArea.nextSibling.nextSibling) {
        textArea.nextSibling.nextSibling.innerHTML = result.data[1];
      }
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
    let key = prompt('Enter a local storage key at which to save your work');
    if (!key) return;
    localStorage.setItem(`livetdd-${key}`, JSON.stringify(serialize()));
    alert(`Saved to local storage at ${key}`);
  }

  function exportAll() {
    alert('Export is not yet implemented');
    // TODO
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

  // Statement and function coverage
  coverageWorker.addEventListener('message', message => {
    let [ok, details] = message.data;
    if (ok) {
      let coverage = details[Object.keys(details)];
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
    }
  });

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
  $("#duplicatebutton").addEventListener('click', () => {alert("Not implemented");});
  $("#exportbutton").addEventListener('click', exportAll);
  editor.getSession().on('change', runAllTests);
  editor.getSession().on('change', debouncedCoverage);
}());
