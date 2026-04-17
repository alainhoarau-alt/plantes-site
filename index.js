const express = require("express");
const Stripe = require("stripe");
const admin = require("firebase-admin");

const app = express();

// =========================
// ✅ CORS
// =========================
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// =========================
// 🔐 STRIPE
// =========================
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// =========================
// 🔥 FIREBASE
// =========================
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// =========================
// 🔔 WEBHOOK
// =========================
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("🔥 Webhook reçu");
  } catch (err) {
    console.log("❌ Erreur signature :", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    db.collection("paiements").add({
      email: session.customer_details?.email || "non fourni",
      montant: session.amount_total / 100,
      date: new Date(),
    });

    console.log("💰 Paiement enregistré");
  }

  res.sendStatus(200);
});

// =========================
// BODY PARSER
// =========================
app.use(express.json());

// =========================
// 💳 CREATE CHECKOUT SESSION
// =========================
app.post("/create-checkout-session", async (req, res) => {
  const { amount, email } = req.body;

  const finalAmount = Math.round(Number(amount) * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Don association"
            },
            unit_amount: finalAmount
          },
          quantity: 1
        }
      ],

      mode: "payment",

      success_url:
        "https://plantes-tropicales-reuni-70561.web.app/success.html",

      cancel_url:
        "https://plantes-tropicales-reuni-70561.web.app/cancel.html"
    });

    res.json({ url: session.url });

  } catch (error) {
    console.log("❌ Erreur Stripe :", error);
    res.status(500).send("Erreur paiement");
  }
});

// =========================
// 🚀 SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur port " + PORT);
});
