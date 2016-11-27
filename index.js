(function () {

  const addTestButton = document.getElementById("addtest");
  const testList = document.getElementById("testlist");

  function addTest() {
    let newTest = document.createElement("textarea");
    newTest.innerHTML = '// Test';
    newTest.addEventListener('input', autoresize, false);
    testList.appendChild(newTest);
  }

  function autoresize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight+'px';
    this.scrollTop = this.scrollHeight;
    window.scrollTo(window.scrollLeft,(this.scrollTop + this.scrollHeight));
  }

  addTestButton.onclick = addTest;
  addTest();
}());
