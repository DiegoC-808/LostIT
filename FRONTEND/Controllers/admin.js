let category_modal,
    delete_category_modal;
let deleting_category_id;

// Muestra una sección del panel: dashboard, categories o moderation
function showSection(name){
    document.getElementById('adminDashboardSection').hidden = name != 'dashboard';
    document.getElementById('categoriesSection').hidden = name != 'categories';
    document.getElementById('moderationSection').hidden = name != 'moderation';
    document.getElementById('reportsSection').hidden = name != 'reports';
    hideMessage(document.getElementById('adminError'));

    if (name == 'dashboard') loadDashboard();
    if (name == 'categories') loadCategories();
    if (name == 'moderation') loadModeration();
    if (name == 'reports') loadReports();
}

function loadDashboard(){
    callServer('/api/admin/dashboard', {
        headers: authHeaders()
    })
    .then(response => readResponse(response, document.getElementById('adminError')))
    .then(result => {
        if (result == undefined) return;
        document.getElementById('totalUsers').innerText = result.totalUsers;
        document.getElementById('totalPublications').innerText = result.totalPublications;
        document.getElementById('totalRequests').innerText = result.totalRequests;
        document.getElementById('openReports').innerText = result.openReports;
    })
    .catch(err => {
        console.error('Error al cargar el panel:', err);
    });
}

// ---------- CATEGORÍAS ----------

function loadCategories(){
    callServer('/api/categorias', {
        headers: authHeaders()
    })
    .then(response => readResponse(response, document.getElementById('adminError')))
    .then(categories => {
        if (categories == undefined) return;
        let body = document.getElementById('categoriesTableBody');

        body.innerHTML = '';
        if (categories.length == 0) {
            document.getElementById('categoriesEmpty').classList.remove('d-none');
        }
        else {
            document.getElementById('categoriesEmpty').classList.add('d-none');
        }
        for (let i = 0; i < categories.length; i++) {
            body.append(categoryRow(categories[i]));
        }
    })
    .catch(err => {
        console.error('Error al cargar las categorías:', err);
    });
}

function categoryRow(category){
    let row = document.createElement('tr'),
        actions = newElement('td', 'text-end'),
        edit = newElement('button', 'btn btn-outline-primary btn-sm me-1', 'Editar'),
        toggle = newElement('button', 'btn btn-outline-secondary btn-sm me-1', 'Desactivar'),
        remove = newElement('button', 'btn btn-outline-danger btn-sm', 'Eliminar'),
        status = newElement('td', ''),
        description = category.description;

    if (!description) description = '-';

    if (category.active) {
        status.append(newElement('span', 'badge bg-success', 'Activa'));
    }
    else {
        status.append(newElement('span', 'badge bg-secondary', 'Inactiva'));
        toggle.innerText = 'Activar';
    }

    edit.addEventListener('click', () => {openEditCategory(category)});
    toggle.addEventListener('click', () => {updateCategory(category._id, { active: !category.active })});
    remove.addEventListener('click', () => {openDeleteCategory(category._id)});
    actions.append(edit, toggle, remove);

    row.append(newElement('td', 'fw-semibold', category.name), newElement('td', '', description), status, actions);
    return row;
}

function openNewCategory(){
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModalLabel').innerText = 'Nueva categoría';
    hideMessage(document.getElementById('categoryError'));
}

function openEditCategory(category){
    document.getElementById('categoryId').value = category._id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = '';
    if (category.description) {
        document.getElementById('categoryDescription').value = category.description;
    }
    document.getElementById('categoryModalLabel').innerText = 'Editar categoría';
    hideMessage(document.getElementById('categoryError'));
    category_modal.show();
}

// Si el formulario trae id es una edición (PUT); si no, una categoría nueva (POST)
function saveCategory(){
    event.preventDefault();
    let id = document.getElementById('categoryId').value,
        error_box = document.getElementById('categoryError'),
        category = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim()
        };

    if (id != '') {
        updateCategory(id, category, error_box);
        return;
    }

    callServer('/api/categorias', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(category)
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        category_modal.hide();
        alert("Categoría creada");
        loadCategories();
    })
    .catch(err => {
        console.error('Error al crear la categoría:', err);
    });
}

// Si no hay error_box (activar o desactivar desde la tabla), el error sale en un alert
function updateCategory(id, body, error_box){
    callServer('/api/categorias/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body)
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        category_modal.hide();
        alert("Categoría actualizada");
        loadCategories();
    })
    .catch(err => {
        console.error('Error al actualizar la categoría:', err);
    });
}

function openDeleteCategory(id){
    deleting_category_id = id;
    hideMessage(document.getElementById('deleteCategoryError'));
    delete_category_modal.show();
}

// El servidor no deja borrar una categoría que usa alguna publicación: ahí se muestra su mensaje
function deleteCategory(){
    callServer('/api/categorias/' + deleting_category_id, {
        method: 'DELETE',
        headers: authHeaders()
    })
    .then(response => readResponse(response, document.getElementById('deleteCategoryError')))
    .then(result => {
        if (result == undefined) return;
        delete_category_modal.hide();
        alert("Categoría eliminada");
        loadCategories();
    })
    .catch(err => {
        console.error('Error al eliminar la categoría:', err);
    });
}

// ---------- MODERACIÓN DE PUBLICACIONES ----------

function loadModeration(){
    // El admin recibe todas las publicaciones, también las ocultas y las resueltas
    callServer('/api/publicaciones?limit=100', {
        headers: authHeaders()
    })
    .then(response => readResponse(response, document.getElementById('adminError')))
    .then(result => {
        if (result == undefined) return;
        let body = document.getElementById('moderationTableBody');

        body.innerHTML = '';
        if (result.total == 0) {
            document.getElementById('moderationEmpty').classList.remove('d-none');
        }
        else {
            document.getElementById('moderationEmpty').classList.add('d-none');
        }
        for (let i = 0; i < result.data.length; i++) {
            body.append(moderationRow(result.data[i]));
        }
    })
    .catch(err => {
        console.error('Error al cargar las publicaciones:', err);
    });
}

function moderationRow(publication){
    let row = document.createElement('tr'),
        status = newElement('td', ''),
        actions = newElement('td', 'text-end'),
        type = 'Perdido';

    if (publication.type == 'encontrado') type = 'Encontrado';

    if (publication.status == 'activa') {
        status.append(newElement('span', 'badge bg-success', 'Activa'));
    }
    else if (publication.status == 'resuelta') {
        status.append(newElement('span', 'badge bg-primary', 'Resuelta'));
    }
    else {
        status.append(newElement('span', 'badge bg-secondary', 'Oculta'));
    }

    if (publication.status == 'oculta') {
        let show = newElement('button', 'btn btn-outline-success btn-sm', 'Mostrar');
        show.addEventListener('click', () => {moderate(publication._id, 'activa')});
        actions.append(show);
    }
    else {
        let hide = newElement('button', 'btn btn-outline-danger btn-sm', 'Ocultar');
        hide.addEventListener('click', () => {moderate(publication._id, 'oculta')});
        actions.append(hide);
    }

    row.append(newElement('td', 'fw-semibold', publication.title), newElement('td', '', publication.owner_name), newElement('td', '', type), status, actions);
    return row;
}

// El admin solo cambia el estado de una publicación ajena: ocultarla o volver a mostrarla
function moderate(id, status){
    callServer('/api/publicaciones/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: status })
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        if (status == 'oculta') {
            alert("La publicación quedó oculta");
        }
        else {
            alert("La publicación se volvió a mostrar");
        }
        loadModeration();
    })
    .catch(err => {
        console.error('Error al moderar la publicación:', err);
    });
}

// ---------- REPORTES ----------

function loadReports(){
    callServer('/api/reportes?limit=100', {
        headers: authHeaders()
    })
    .then(response => readResponse(response, document.getElementById('adminError')))
    .then(result => {
        if (result == undefined) return;
        let body = document.getElementById('reportsTableBody');

        body.innerHTML = '';
        if (result.total == 0) {
            document.getElementById('reportsEmpty').classList.remove('d-none');
        }
        else {
            document.getElementById('reportsEmpty').classList.add('d-none');
        }
        for (let i = 0; i < result.data.length; i++) {
            body.append(reportRow(result.data[i]));
        }
    })
    .catch(err => {
        console.error('Error al cargar los reportes:', err);
    });
}

function reportRow(report){
    let row = document.createElement('tr'),
        status = newElement('td', ''),
        actions = newElement('td', 'text-end'),
        hide = newElement('button', 'btn btn-outline-danger btn-sm me-1', 'Ocultar publicación'),
        remove = newElement('button', 'btn btn-outline-secondary btn-sm', 'Eliminar');

    if (report.status == 'abierto') {
        let reviewed = newElement('button', 'btn btn-outline-primary btn-sm me-1', 'Marcar revisado');
        status.append(newElement('span', 'badge bg-warning text-dark', 'Abierto'));
        reviewed.addEventListener('click', () => {reviewReport(report._id)});
        actions.append(reviewed);
    }
    else {
        status.append(newElement('span', 'badge bg-success', 'Revisado'));
    }

    hide.addEventListener('click', () => {hideReported(report)});
    remove.addEventListener('click', () => {deleteReport(report._id)});
    actions.append(hide, remove);

    row.append(newElement('td', 'fw-semibold', report.publication_title), newElement('td', '', report.reporter_name), newElement('td', '', report.reason), newElement('td', '', formatCreated(report.created_at)), status, actions);
    return row;
}

// quiet: cuando se llama después de ocultar la publicación, para no sacar dos alertas
function reviewReport(id, quiet){
    callServer('/api/reportes/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'revisado' })
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        if (!quiet) alert("Reporte marcado como revisado");
        loadReports();
    })
    .catch(err => {
        console.error('Error al revisar el reporte:', err);
    });
}

// Oculta la publicación reportada y deja el reporte como revisado
function hideReported(report){
    callServer('/api/publicaciones/' + report.publication, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'oculta' })
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        alert("La publicación quedó oculta");
        if (report.status == 'abierto') {
            reviewReport(report._id, true);
        }
        else {
            loadReports();
        }
    })
    .catch(err => {
        console.error('Error al ocultar la publicación:', err);
    });
}

function deleteReport(id){
    callServer('/api/reportes/' + id, {
        method: 'DELETE',
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        alert("Reporte eliminado");
        loadReports();
    })
    .catch(err => {
        console.error('Error al eliminar el reporte:', err);
    });
}

if (sessionStorage.token && getUser().role != 'admin') {
    alert("Solo el administrador puede entrar a este panel");
    window.location.href = 'publicaciones.html';
}
else if (sessionStorage.token) {
    category_modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    delete_category_modal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));

    document.getElementById('manageCategoriesButton').addEventListener('click', () => {showSection('categories')});
    document.getElementById('managePublicationsButton').addEventListener('click', () => {showSection('moderation')});
    document.getElementById('backToDashboardButton').addEventListener('click', () => {showSection('dashboard')});
    document.getElementById('backToDashboardFromModeration').addEventListener('click', () => {showSection('dashboard')});
    document.getElementById('manageReportsButton').addEventListener('click', () => {showSection('reports')});
    document.getElementById('backToDashboardFromReports').addEventListener('click', () => {showSection('dashboard')});
    document.getElementById('newCategoryButton').addEventListener('click', openNewCategory);
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);
    document.getElementById('confirmDeleteCategoryButton').addEventListener('click', deleteCategory);

    showSection('dashboard');
}
