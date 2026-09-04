const IMVICTO_SESSION_KEY = "imvicto_user";

function getCurrentPage() {
  return window.location.pathname.split("/").pop().toLowerCase();
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(IMVICTO_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem(IMVICTO_SESSION_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem(IMVICTO_SESSION_KEY);
}

function goToLogin() {
  const page = getCurrentPage();
  if (page !== "login.html") {
    window.location.replace("./login.html");
  }
}

function getAllowedRoles() {
  const page = getCurrentPage();

  if (document.body?.dataset?.roles) {
    return document.body.dataset.roles.split(",").map((role) => role.trim());
  }

  if (page === "admin.html") {
    return ["admin"];
  }

  if (page === "vendedor.html") {
    return ["vendedor", "admin"];
  }

  return null;
}

function protectPage() {
  const page = getCurrentPage();

  if (page === "login.html") {
    return;
  }

  const user = getCurrentUser();

  console.log("[IMVICTO AUTH] Página:", page);
  console.log("[IMVICTO AUTH] Usuario activo:", user);

  if (!user) {
    console.warn("[IMVICTO AUTH] No hay sesión activa. Redirigiendo a login.");
    goToLogin();
    return;
  }

  const allowedRoles = getAllowedRoles();

  console.log("[IMVICTO AUTH] Roles permitidos:", allowedRoles);

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    alert("No tienes permiso para entrar a esta vista.");
    clearCurrentUser();
    goToLogin();
    return;
  }

  const sessionLabel = document.getElementById("sessionLabel");
  if (sessionLabel) {
    sessionLabel.textContent = `${user.nombre} · ${user.rol}`;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function logout() {
  clearCurrentUser();
  window.location.href = "./login.html";
}

window.IMVICTO_AUTH = {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  protectPage,
  logout
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", protectPage);
} else {
  protectPage();
}