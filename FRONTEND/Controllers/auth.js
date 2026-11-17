
document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginError = document.getElementById("loginError");
    const registerError = document.getElementById("registerError");

    // Mostrar inicio de sesión
    function showLoginForm() {
        loginSection.hidden = false;
        registerSection.hidden = true;

        loginError.textContent = "";
        registerError.textContent = "";
    }

    // Mostrar registro
    function showRegisterForm() {
        loginSection.hidden = true;
        registerSection.hidden = false;

        loginError.textContent = "";
        registerError.textContent = "";
    }

    // Cambiar a registro
    showRegister.addEventListener("click", (event) => {
        event.preventDefault();
        showRegisterForm();
    });

    // Cambiar a inicio de sesión
    showLogin.addEventListener("click", (event) => {
        event.preventDefault();
        showLoginForm();
    });

    // Validar inicio de sesión
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            loginError.textContent = "Completa todos los campos.";
            return;
        }

        loginError.textContent =
            "El inicio de sesión todavía no está conectado al servidor.";
    });

    // Validar registro
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            registerError.textContent = "Completa todos los campos.";
            return;
        }

        if (name.length < 3) {
            registerError.textContent = "El nombre debe tener al menos 3 caracteres.";
            return;
        }

        if (password.length < 8) {
            registerError.textContent = "La contraseña debe tener al menos 8 caracteres.";
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = "Las contraseñas no coinciden.";
            return;
        }

        registerError.textContent =
            "El registro está validado, pero todavía no está conectado al servidor.";
    });

    // Pantalla inicial
    showLoginForm();
});
