/* 4. Fetch Connection Token */
function fetchConnectionToken() {
  // Do not cache or hardcode the ConnectionToken. The SDK manages the ConnectionToken's lifecycle.
  return fetch("http://localhost:8080/connection_token", { method: "POST" })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return data.secret;
    });
}

/* 5. Initialize the SDK */
var terminal = StripeTerminal.create({
  onFetchConnectionToken: fetchConnectionToken,
  onUnexpectedReaderDisconnect: unexpectedDisconnect,
});

function unexpectedDisconnect() {
  // In this function, your app should notify the user that the reader disconnected.
  // You can also include a way to attempt to reconnect to a reader.
  console.log("Disconnected from reader");
}

/* 6. Connect to Simulated Reader */
function discoverReaderHandler() {
  var config = { simulated: true }; // Add `location` key with locationID value for non-simulated reader
  terminal.discoverReaders(config).then(function (discoverResult) {
    if (discoverResult.error) {
      console.log("Failed to discover: ", discoverResult.error);
    } else if (discoverResult.discoveredReaders.length === 0) {
      console.log("No available readers.");
    } else {
      discoveredReaders = discoverResult.discoveredReaders;
      log("terminal.discoverReaders", discoveredReaders);
    }
  });
}

/* 7. Connect to simulated reader */
function connectReaderHandler(discoveredReaders) {
  // Just select the first reader here.
  var selectedReader = discoveredReaders[0];
  terminal.connectReader(selectedReader).then(function (connectResult) {
    if (connectResult.error) {
      console.log("Failed to connect: ", connectResult.error);
    } else {
      console.log("Connected to reader: ", connectResult.reader.label);
      log("terminal.connectReader", connectResult);
    }
  });
}

/* 9. Fetch PaymentIntent */
function fetchPaymentIntentClientSecret(amount) {
  const bodyContent = JSON.stringify({ amount: amount });
  return fetch("http://localhost:8080/create_payment_intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyContent,
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return data.client_secret;
    });
}

/* 10. Collect & Process Payment */
function collectPayment(amount) {
  fetchPaymentIntentClientSecret(amount).then(function (client_secret) {
    terminal.setSimulatorConfiguration({ testCardNumber: "4242424242424242" });
    terminal.collectPaymentMethod(client_secret).then(function (result) {
      if (result.error) {
        // Placeholder for handling result.error
      } else {
        log("terminal.collectPaymentMethod", result.paymentIntent);
        terminal.processPayment(result.paymentIntent).then(function (result) {
          if (result.error) {
            console.log(result.error);
          } else if (result.paymentIntent) {
            paymentIntentId = result.paymentIntent.id;
            log("terminal.processPayment", result.paymentIntent);
          }
        });
      }
    });
  });
}

/* 12. Capture PaymentIntent */
function capture(paymentIntentId) {
  return fetch("http://localhost:8080/capture_payment_intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      log("server.capture", data);
    });
}
