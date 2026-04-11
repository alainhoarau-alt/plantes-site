import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

console.log("adhesion.js chargé 🔥");

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-adhesion");
  const message = document.getElementById("message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const telephone = document.getElementById("telephone").value.trim();
    const adresse = document.getElementById("adresse").value.trim();
    const type = document.getElementById("type").value;
    const newsletter = document.getElementById("newsletter").checked;

    // ===============================
    // 🔒 VALIDATION
    // ===============================
    if (!nom || !prenom || !email) {
      afficherMessage("❌ Merci de remplir les champs obligatoires", "red");
      return;
    }

    try {

      // ===============================
      // 🔍 VERIFIER SI EMAIL EXISTE
      // ===============================
      const q = query(
        collection(db, "membres"),
        where("email", "==", email)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        afficherMessage("⚠️ Cet email est déjà inscrit", "orange");
        return;
      }

      // ===============================
      // 🔥 AJOUT FIREBASE
      // ===============================
      await addDoc(collection(db, "membres"), {
        nom,
        prenom,
        email,
        telephone,
        adresse,
        type,
        newsletter,
        date: new Date()
      });

      console.log("✅ Membre ajouté");

     afficherMessage("💳 Redirection vers le paiement sécurisé...", "green");

// 🔁 redirection vers Stripe après 1,5s
setTimeout(() => {
  window.location.href = "https://buy.stripe.com/test_00w6oHc961S80LBaKB6Na01";
}, 1500);

form.reset();

    } catch (err) {
      console.error("❌ Erreur Firebase :", err);
      afficherMessage("❌ Une erreur est survenue", "red");
    }

  });

});


// ===============================
// 💬 MESSAGE
// ===============================
function afficherMessage(texte, couleur) {
  const message = document.getElementById("message");
  if (!message) return;

  message.innerHTML = texte;
  message.style.color = couleur;
}