import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDocs,
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";


// ===============================
// 🔐 PROTECTION ADMIN
// ===============================
if (localStorage.getItem("admin") !== "true") {
  window.location.href = "login.html";
}


// ===============================
// 🚀 INIT
// ===============================
console.log("admin.js chargé 🔥");

document.addEventListener("DOMContentLoaded", () => {

  surveillerMembres();
  surveillerDons(); // 🔥 maintenant connecté à Stripe
  viderDons();
  activerRecherche();

  // ===============================
  // 💳 FORMULAIRE PAIEMENT STRIPE (manuel)
  // ===============================
  const formPaiement = document.getElementById("form-paiement");

  if (formPaiement) {
    formPaiement.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nom = document.getElementById("nom").value.trim();
      const prenom = document.getElementById("prenom").value.trim();
      const email = document.getElementById("email").value.trim();
      const type = document.getElementById("type").value;
      const montant = Number(document.getElementById("montant").value);

      if (!nom || !prenom || !email) {
        afficherMessagePaiement("❌ Champs obligatoires manquants", "red");
        return;
      }

      try {
        await addDoc(collection(db, "membres"), {
          nom,
          prenom,
          email,
          type,
          montant,
          date: new Date(),
          source: "stripe manuel"
        });

        afficherMessagePaiement("✅ Paiement ajouté avec succès !", "green");
        formPaiement.reset();

      } catch (err) {
        console.error("Erreur Firebase :", err);
        afficherMessagePaiement("❌ Erreur lors de l'ajout", "red");
      }
    });
  }

});


// ===============================
// 💬 MESSAGE
// ===============================
function afficherMessagePaiement(texte, couleur) {
  const el = document.getElementById("message-paiement");
  if (!el) return;

  el.innerHTML = texte;
  el.style.color = couleur;
}


// ===============================
// 📅 FORMAT DATE
// ===============================
function formaterDate(date) {
  if (!date) return "";

  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleString("fr-FR");
  }

  const d = new Date(date);
  if (isNaN(d)) return "";

  return d.toLocaleDateString("fr-FR");
}


// ===============================
// 👥 MEMBRES
// ===============================
function surveillerMembres() {
  const table = document.querySelector("#table-membres tbody");
  const totalZone = document.getElementById("total-membres");

  if (!table) return;

  onSnapshot(collection(db, "membres"), (snapshot) => {

    table.innerHTML = "";
    let total = 0;

    [...snapshot.docs].reverse().forEach(docSnap => {
      const m = docSnap.data();
      const id = docSnap.id;

      total++;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${m.nom || ""}</td>
        <td>${m.prenom || ""}</td>
        <td>${m.email || ""}</td>
        <td>${m.type || ""}</td>
        <td>${formaterDate(m.date)}</td>
        <td><button class="btn-supprimer" data-id="${id}" data-type="membre">🗑️</button></td>
      `;

      table.appendChild(row);
    });

    if (totalZone) {
      totalZone.innerHTML = `👥 Total membres : <strong>${total}</strong>`;
    }

    activerSuppression();
  });
}


// ===============================
// 💰 DONS (🔥 STRIPE AUTO)
// ===============================
function surveillerDons() {
  const table = document.querySelector("#table-dons tbody");
  const totalZone = document.getElementById("total-dons");

  if (!table) return;

  // 🔥 on écoute la collection Stripe
  const q = query(collection(db, "paiements"), orderBy("date", "desc"));

  onSnapshot(q, (snapshot) => {

    table.innerHTML = "";
    let total = 0;

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;

      const montant = parseFloat(d.montant) || 0;
      total += montant;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>—</td>
        <td>${d.email || ""}</td>
        <td style="color:green;font-weight:bold;">${montant} €</td>
        <td>${formaterDate(d.date)}</td>
        <td><button class="btn-supprimer" data-id="${id}" data-type="paiement">🗑️</button></td>
      `;

      table.appendChild(row);
    });

    if (totalZone) {
      totalZone.innerHTML = `💰 Total collecté : <strong>${total} €</strong>`;
    }

    activerSuppression();
  });
}


// ===============================
// 🗑️ SUPPRESSION
// ===============================
function activerSuppression() {
  document.querySelectorAll(".btn-supprimer").forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.getAttribute("data-id");
      const type = btn.getAttribute("data-type");

      const confirmation = confirm("🗑 Supprimer définitivement cet élément ?");
      if (!confirmation) return;

      let collectionName = null;

      if (type === "membre") collectionName = "membres";
      else if (type === "paiement") collectionName = "paiements";
      else if (type === "don") collectionName = "dons";

      if (!collectionName) {
        console.error("Type inconnu :", type);
        return;
      }

      try {
        await deleteDoc(doc(db, collectionName, id));
        alert("✅ Élément supprimé avec succès");
      } catch (err) {
        console.error("Erreur suppression :", err);
      }

    });

  });
}

// ===============================
// ⚡ DONNÉES TEST
// ===============================

window.ajouterDonneesTest = async function () {
  if (!confirm("Ajouter des données test ?")) return;

  // 🔥 MEMBRES
  await addDoc(collection(db, "membres"), {
    nom: "HOARAU",
    prenom: "ALAIN",
    email: "alain@test.com",
    type: "simple",
    date: new Date()
  });

  await addDoc(collection(db, "membres"), {
    nom: "LEGRAND",
    prenom: "NOEMIE",
    email: "noemie@test.com",
    type: "bienfaiteur",
    date: new Date()
  });

  // 🔥 DONS
  await addDoc(collection(db, "dons"), {
    nom: "Martin",
    email: "martin@test.com",
    montant: 50,
    date: new Date()
  });

  await addDoc(collection(db, "dons"), {
    nom: "Durand",
    email: "durand@test.com",
    montant: 100,
    date: new Date()
  });

  // 🔥 PAIEMENTS
  await addDoc(collection(db, "paiements"), {
    nom: "Paul",
    prenom: "Jean",
    email: "paul@test.com",
    montant: 20,
    type: "adhesion",
    date: new Date()
  });

  alert("✅ Données test ajoutées !");
}
// ===============================
// 🗑️ VIDER DONS
// ===============================
function viderDons() {
  const btn = document.getElementById("vider-dons");
  if (!btn) return;

  btn.addEventListener("click", async () => {

    if (!confirm("Supprimer TOUS les dons Stripe ?")) return;

    try {
      const snapshot = await getDocs(collection(db, "paiements"));

      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "paiements", docSnap.id));
      }

    } catch (err) {
      console.error("Erreur suppression totale :", err);
    }

  });
}


// ===============================
// 🔍 RECHERCHE
// ===============================
function activerRecherche() {
  const input = document.getElementById("search");

  if (!input) return;

  input.addEventListener("input", () => {

    const filtre = input.value.toLowerCase();
    const lignes = document.querySelectorAll("#table-membres tbody tr");

    lignes.forEach(ligne => {
      const texte = ligne.innerText.toLowerCase();
      ligne.style.display = texte.includes(filtre) ? "" : "none";
    });

  });
}


// ===============================
// 🔓 LOGOUT
// ===============================
window.logout = function() {
  localStorage.removeItem("admin");
  window.location.href = "login.html";
};