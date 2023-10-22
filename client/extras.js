var discoveredReaders;
var paymentIntentId;

const discoverButton = document.getElementById("discover-button");
discoverButton.addEventListener("click", async (event) => {
  discoverReaderHandler();
});

const connectButton = document.getElementById("connect-button");
connectButton.addEventListener("click", async (event) => {
  connectReaderHandler(discoveredReaders);
});

const collectButton = document.getElementById("collect-button");
collectButton.addEventListener("click", async (event) => {
  amount = document.getElementById("amount-input").value;
  collectPayment(amount);
});

const captureButton = document.getElementById("capture-button");
captureButton.addEventListener("click", async (event) => {
  capture(paymentIntentId);
});

function log(method, message) {
  var logs = document.getElementById("logs");
  var title = document.createElement("div");
  var log = document.createElement("div");
  var lineCol = document.createElement("div");
  var logCol = document.createElement("div");
  title.classList.add("row");
  title.classList.add("log-title");
  title.textContent = method;
  log.classList.add("row");
  log.classList.add("log");
  var hr = document.createElement("hr");
  var pre = document.createElement("pre");
  var code = document.createElement("code");
  code.textContent = formatJson(JSON.stringify(message, undefined, 2));
  pre.append(code);
  log.append(pre);
  logs.prepend(hr);
  logs.prepend(log);
  logs.prepend(title);
}

function stringLengthOfInt(number) {
  return number.toString().length;
}

function padSpaces(lineNumber, fixedWidth) {
  // Always indent by 2 and then maybe more, based on the width of the line
  // number.
  return " ".repeat(2 + fixedWidth - stringLengthOfInt(lineNumber));
}

function formatJson(message) {
  var lines = message.split("\n");
  var json = "";
  var lineNumberFixedWidth = stringLengthOfInt(lines.length);
  for (var i = 1; i <= lines.length; i += 1) {
    line = i + padSpaces(i, lineNumberFixedWidth) + lines[i - 1];
    json = json + line + "\n";
  }
  return json;
}
