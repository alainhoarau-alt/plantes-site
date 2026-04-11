import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("🔥 marche.js connecté");

const form = document.getElementById("form");
const grid = document.getElementById("grid");
const zoom = document.getElementById("zoom");
const zoomImg = document.getElementById("zoom-img");

let annonces = [];

/* ========================= */
/* 🔥 TEMPS RÉEL FIREBASE */
/* ========================= */
onSnapshot(collection(db, "annonces"), (snapshot) => {
  annonces = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  afficherAnnonces();
});

/* ========================= */
/* ➕ AJOUTER AVEC COMPRESSION */
/* ========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const plante = document.getElementById("plante").value;
  const email = document.getElementById("email").value;
  const prix = document.getElementById("prix").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("image").files[0];

  if (!plante || !email) {
    alert("Champs obligatoires !");
    return;
  }

  if (!file) {
    alert("Ajoute une image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.src = event.target.result;

    img.onload = async function () {

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const MAX_WIDTH = 400;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL("image/jpeg", 0.6);

      try {
        await addDoc(collection(db, "annonces"), {
          plante,
          email,
          prix,
          desc,
          image: compressed,
          date: new Date()
        });

        form.reset();

      } catch (error) {
        console.error("❌ Erreur Firebase :", error);
        alert("Erreur lors de l'ajout");
      }
    };
  };

  reader.readAsDataURL(file);
});

/* ========================= */
/* 📊 AFFICHAGE */
/* ========================= */
function afficherAnnonces() {

  grid.innerHTML = "";

  if (annonces.length === 0) {
    grid.innerHTML = "<p>Aucune annonce</p>";
    return;
  }

  annonces
    .slice()
    .reverse()
    .forEach(a => {

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${a.image}" class="zoomable">
        <h3>${a.plante}</h3>
        <p>${a.prix || ""}</p>
        <p>${a.desc || ""}</p>
        <button class="contact" data-email="${a.email}">📩 Contact</button>
        <button class="delete" data-id="${a.id}">🗑️</button>
      `;

      grid.appendChild(div);
    });

  activerSuppression();
}

/* ========================= */
/* 🗑️ SUPPRESSION */
/* ========================= */
function activerSuppression() {

  document.querySelectorAll(".delete").forEach(btn => {

    btn.onclick = async () => {

      if (!confirm("Supprimer cette annonce ?")) return;

      const id = btn.getAttribute("data-id");

      try {
        await deleteDoc(doc(db, "annonces", id));
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    };
  });
}

/* ========================= */
/* 📩 CONTACT (FIABLE 100%) */
/* ========================= */
document.addEventListener("click", function(e) {

  if (e.target.classList.contains("contact")) {

    const email = e.target.getAttribute("data-email");

    if (!email) {
      alert("❌ Email manquant");
      return;
    }

    window.open("https://mail.google.com/mail/?view=cm&to=" + email, "_blank");
  }

});

/* ========================= */
/* 🔍 ZOOM IMAGE */
/* ========================= */
document.addEventListener("click", (e) => {

  if (e.target.classList.contains("zoomable")) {
    zoom.style.display = "flex";
    zoomImg.src = e.target.src;
  }
});

zoom.addEventListener("click", () => {
  zoom.style.display = "none";
});