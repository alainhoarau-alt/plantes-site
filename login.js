function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "admin" && pass === "974") {

    // 🔐 on active la session admin
    localStorage.setItem("admin", "true");

    // 👉 redirection vers admin
    window.location.href = "admin.html";

  } else {
    document.getElementById("error").style.display = "block";
  }
}