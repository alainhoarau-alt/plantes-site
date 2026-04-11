import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

console.log("don-form.js chargé 🔥");

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-don");
  const message = document.getElementById("message");

  if (!form) {
    console.error("form non trouvé ❌");
    return;
  }

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const montant = parseFloat(document.getElementById("montant").value);

    if (!nom || !email || !montant) {
      message.innerHTML = "❌ Merci de remplir tous les champs";
      message.style.color = "red";
      return;
    }

    try {

      await addDoc(collection(db, "dons"), {
        nom,
        email,
        montant,
        date: new Date()
      });

      console.log("🔥 DON AJOUTÉ");

      message.innerHTML = `❤️ Merci ${nom} pour votre don de ${montant} €`;
      message.style.color = "green";

      form.reset();

    } catch (err) {
      console.error("Erreur Firebase :", err);
      message.innerHTML = "❌ Erreur lors du don";
    }

  });

});