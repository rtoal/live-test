(function () {

  const addTestButton = document.getElementById("addtest");
  const testList = document.getElementById("testlist");

  function addTest() {
    let newTest = document.createElement("textarea");
    newTest.innerHTML = '// Test';
    testList.appendChild(newTest);
  }
  addTestButton.onclick = addTest;
}());
