const express = require("express");
const Stripe = require("stripe");
const admin = require("firebase-admin");

const app = express();

app.use("/webhook", express.raw({ type: "application/json" }));

const stripe = Stripe(process.env.STRIPEKEY);
const endpointSecret = "whsec_d1a1d0d2748d46b0dee6...";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
});

const db = admin.firestore();

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log("❌ Erreur signature :", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("💰 Paiement reçu !");

    db.collection("paiements").add({
      email: session.customer_details.email,
      montant: session.amount_total / 100,
      date: new Date(),
    });

    console.log("🔥 Ajout Firebase OK");
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});