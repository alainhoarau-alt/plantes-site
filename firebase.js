import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgNCQWXZMBtfP4OZ7iAgl1DoGb_AnFPJ8",
  authDomain: "plantes-tropicales-reunion.firebaseapp.com",
  projectId: "plantes-tropicales-reuni-70561", // 🔥 CORRIGÉ
  storageBucket: "plantes-tropicales-reunion.firebasestorage.app",
  messagingSenderId: "309600533699",
  appId: "1:309600533699:web:5b6e7d723e45fcb5dbf676"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };