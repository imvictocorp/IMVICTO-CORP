(function () {
  const form = document.getElementById("loginForm");
  const toast = document.getElementById("toast");

  if (!form) {
    console.error("No existe #loginForm en login.html");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const correo = String(form.correo?.value || "").trim().toLowerCase();
    const clave = String(form.clave?.value || "").trim();

    if (typeof IMVICTO_USERS === "undefined") {
      showToast("No se cargó config.js. Revisa que esté antes de login.js.", true);
      return;
    }

    const user = IMVICTO_USERS.find((u) => {
      return String(u.correo || "").trim().toLowerCase() === correo &&
             String(u.clave || "").trim() === clave;
    });

    if (!user) {
      showToast("Correo o contraseña incorrectos.", true);
      return;
    }

    sessionStorage.setItem("imvicto_user", JSON.stringify({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    }));

    if (user.rol === "admin") {
      window.location.href = "admin.html";
      return;
    }

    if (user.rol === "vendedor") {
      window.location.href = "vendedor.html";
      return;
    }

    showToast("El usuario no tiene un rol válido.", true);
  });

  function showToast(message, isError) {
    if (!toast) {
      alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.style.background = isError ? "#8f241d" : "#0d2944";

    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3500);
  }
})();