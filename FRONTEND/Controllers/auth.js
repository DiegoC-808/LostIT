
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

        hideMessage(loginError);
        hideMessage(registerError);
    }

    // Mostrar registro
    function showRegisterForm() {
        loginSection.hidden = true;
        registerSection.hidden = false;

        hideMessage(loginError);
        hideMessage(registerError);
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
            showMessage(loginError, "Completa todos los campos.");
            return;
        }

        callServer('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => readResponse(response, loginError))
        .then(data => {
            if (data == undefined) return;
            saveSession(data);
        })
        .catch(err => {
            console.error('Error en login:', err);
        });
    });

    // Validar registro
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            showMessage(registerError, "Completa todos los campos.");
            return;
        }

        if (name.length < 3) {
            showMessage(registerError, "El nombre debe tener al menos 3 caracteres.");
            return;
        }

        if (password.length < 8) {
            showMessage(registerError, "La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage(registerError, "Las contraseñas no coinciden.");
            return;
        }

        callServer('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, email: email, password: password, confirm_password: confirmPassword })
        })
        .then(response => readResponse(response, registerError))
        .then(data => {
            if (data == undefined) return;
            saveSession(data);
        })
        .catch(err => {
            console.error('Error en registro:', err);
        });
    });

    // Pantalla inicial
    showLoginForm();
});
