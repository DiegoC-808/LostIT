

// Obtener todas las secciones
const views = {
    inicio: document.getElementById("inicioSection"),
    publicar: document.getElementById("publicarSection"),
    detalle: document.getElementById("detalleSection"),
    misPublicaciones: document.getElementById("misPublicacionesSection")
};

// Función para mostrar una vista
function showView(viewName) {

    // Ocultar todas las secciones
    Object.values(views).forEach(section => {
        if (section) {
            section.hidden = true;
        }
    });

    // Mostrar la sección seleccionada
    if (views[viewName]) {
        views[viewName].hidden = false;
    }

    // Actualizar el enlace activo del menú
    document.querySelectorAll("[data-view]").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.view === viewName
        );
    });

    // Actualizar la dirección interna de la página
    history.replaceState(null, "", `#${viewName}`);

    // Volver al inicio de la página
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Detectar clics en los enlaces y botones con data-view
document.querySelectorAll("[data-view]").forEach(element => {

    element.addEventListener("click", function(event) {
        event.preventDefault();

        const viewName = this.dataset.view;

        showView(viewName);
    });

});

// Mostrar la vista inicial
const initialView = window.location.hash.replace("#", "");

if (views[initialView]) {
    showView(initialView);
} else {
    showView("inicio");
}


// BOTÓN PARA LIMPIAR LOS FILTROS
const clearFiltersButton = document.getElementById("clearFilters");

if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", function() {
        document.getElementById("searchText").value = "";
        document.getElementById("filterType").value = "";
        document.getElementById("filterCategory").value = "";
        document.getElementById("filterLocation").value = "";
        document.getElementById("sortDate").value = "newest";
    });
}


// CERRAR SESIÓN
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();

        // Por ahora, eliminamos los datos locales de sesión
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // Regresar al inicio de sesión
        window.location.href = "auth.html";
    });
}
