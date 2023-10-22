const express = require("express");
const app = express();
const { resolve } = require("path");
require("dotenv").config();

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require("stripe")(process.env.API_KEY);

// Middlewares
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/* 1. The ConnectionToken's secret lets you connect to any Stripe Terminal reader and take payments with your Stripe account. */
app.post("/connection_token", async (req, res) => {
  let connectionToken = await stripe.terminal.connectionTokens.create();
  res.json({ secret: connectionToken.secret });
});

/* 2. Create Location for simulated reader */
const createLocation = async () => {
  const location = await stripe.terminal.locations.create({
    display_name: "My First Store",
    address: {
      line1: "1234 Main Street",
      city: "San Francisco",
      postal_code: "94111",
      state: "CA",
      country: "US",
    },
  });
  return location;
};

/* 8. Create Payment Intent */
app.post("/create_payment_intent", async (req, res) => {
  // For Terminal payments, the 'payment_method_types' parameter must include
  // 'card_present'.
  // To automatically capture funds when a charge is authorized,
  // set `capture_method` to `automatic`.
  const intent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
    payment_method_types: ["card_present"],
    capture_method: "manual", // When this is set to manual, payment authorization and capture happens in different steps
  });
  res.json(intent);
});

/* 11. Endpoint to capture PaymentIntent */
app.post("/capture_payment_intent", async (req, res) => {
  const intent = await stripe.paymentIntents.capture(
    req.body.payment_intent_id
  );
  res.send(intent);
});

app.listen(8080, () => console.log("Node server listening on port 8080!"));
