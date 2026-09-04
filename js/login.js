const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (!loginForm) {
  console.error("No existe el formulario con id='loginForm'.");
}

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  loginError.textContent = "";

  const correoInput = document.getElementById("correo");
  const claveInput = document.getElementById("clave");

  if (!correoInput || !claveInput) {
    loginError.textContent = "Error interno: faltan campos de login.";
    return;
  }

  if (typeof IMVICTO_USERS === "undefined") {
    loginError.textContent = "Error interno: no se cargó config.js.";
    console.error("No existe IMVICTO_USERS. Revisa que config.js cargue antes que login.js.");
    return;
  }

  const correo = correoInput.value.trim().toLowerCase();
  const clave = claveInput.value.trim();

  const usuario = IMVICTO_USERS.find((user) => {
    return user.correo.toLowerCase() === correo && user.clave === clave;
  });

  if (!usuario) {
    loginError.textContent = "Correo o contraseña incorrectos.";
    return;
  }

  sessionStorage.setItem("imvicto_user", JSON.stringify({
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  }));

  console.log("[LOGIN] Usuario guardado:", usuario);

  if (usuario.rol === "admin") {
    window.location.href = "./admin.html";
    return;
  }

  if (usuario.rol === "vendedor") {
    window.location.href = "./vendedor.html";
    return;
  }

  loginError.textContent = "El usuario no tiene un rol válido.";
});