const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (!loginForm) {
  console.error("No existe el formulario con id='loginForm'.");
} else {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    loginError.textContent = "";

    const correoInput = document.getElementById("correo");
    const claveInput = document.getElementById("clave");

    const correo = correoInput.value.trim().toLowerCase();
    const clave = claveInput.value;

    try {
      const { data, error } =
        await window.supabaseClient.auth.signInWithPassword({
          email: correo,
          password: clave
        });

      if (error) {
        console.error("[LOGIN] Error:", error);
        loginError.textContent = "Correo o contraseña incorrectos.";
        return;
      }

      const user = data.user;

      // Buscar el perfil del usuario
      const { data: perfil, error: perfilError } =
        await window.supabaseClient
          .from("profiles")
          .select("id, nombre, apellido, email, telefono, empresa, rol")
          .eq("id", user.id)
          .single();

      if (perfilError) {
        console.error("[LOGIN] Error obteniendo perfil:", perfilError);
        loginError.textContent =
          "El usuario inició sesión, pero no tiene un perfil configurado.";
        return;
      }

      // Guardar información básica para la interfaz
      sessionStorage.setItem(
        "imvicto_user",
        JSON.stringify(perfil)
      );

      console.log("[LOGIN] Usuario autenticado:", perfil);

      // Redireccionar según el rol
      if (perfil.rol === "admin") {
        window.location.href = "./admin.html";
        return;
      }

      if (perfil.rol === "vendedor") {
        window.location.href = "./vendedor.html";
        return;
      }

      loginError.textContent =
        "El usuario no tiene un rol válido.";

    } catch (error) {
      console.error("[LOGIN] Error inesperado:", error);
      loginError.textContent =
        "Ocurrió un error al iniciar sesión.";
    }
  });
}