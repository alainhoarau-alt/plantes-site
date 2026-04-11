import { 
  collection, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

console.log("don.js temps réel 🔥");

document.addEventListener("DOMContentLoaded", () => {
  afficherTotalTempsReel();
});


// ===============================
// 💰 TOTAL EN TEMPS RÉEL
// ===============================
function afficherTotalTempsReel() {

  const zone = document.getElementById("total-dons");
  if (!zone) return;

  onSnapshot(collection(db, "dons"), (snapshot) => {

    let total = 0;

    snapshot.forEach(doc => {
      total += doc.data().montant || 0;
    });

    zone.innerHTML = `💰 <strong>Total collecté :</strong> <strong class="montant">${total} €</strong>`;

  });

}