

// Obtener todas las secciones
const views = {
    inicio: document.getElementById("inicioSection"),
    publicar: document.getElementById("publicarSection"),
    detalle: document.getElementById("detalleSection"),
    misPublicaciones: document.getElementById("misPublicacionesSection")
};

let categories_list = [];
let publications_page = 1;
let current_publication;
let editing_publication_id;
let request_modal,
    report_modal,
    delete_publication_modal;

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

    // Cargar los datos de la vista desde el servidor
    if (viewName == 'inicio') {
        loadPublications();
    }
    if (viewName == 'misPublicaciones') {
        loadMyPublications();
    }
}

// Detectar clics en los enlaces y botones con data-view
document.querySelectorAll("[data-view]").forEach(element => {

    element.addEventListener("click", function(event) {
        event.preventDefault();

        const viewName = this.dataset.view;

        // "Publicar objeto" siempre abre el formulario vacío
        if (viewName == 'publicar') {
            newPublicationForm();
        }

        showView(viewName);
    });

});


// ---------- CATEGORÍAS ----------

function readCategories(){
    return callServer('/api/categorias', {
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        categories_list = result;
        fillCategorySelect('filterCategory', 'Todas');
        fillCategorySelect('publicationCategory', 'Selecciona una categoría');
    });
}

function fillCategorySelect(select_id, first_text){
    let select = document.getElementById(select_id);
    select.innerHTML = '<option value="">' + first_text + '</option>';

    for (let i = 0; i < categories_list.length; i++) {
        let option = document.createElement('option');
        option.value = categories_list[i]._id;
        option.innerText = categories_list[i].name;
        select.append(option);
    }
}

// La publicación guarda el id de la categoría; aquí se busca su nombre
function categoryName(id){
    for (let i = 0; i < categories_list.length; i++) {
        if (categories_list[i]._id == id) {
            return categories_list[i].name;
        }
    }
    // El servidor solo manda las categorías activas
    return 'Categoría desactivada';
}


// ---------- LISTA DE PUBLICACIONES ----------

function loadPublications(page){
    if (page != undefined) publications_page = page;

    let filters = 'page=' + publications_page + '&limit=6',
        search = document.getElementById('searchText').value.trim(),
        type = document.getElementById('filterType').value,
        category = document.getElementById('filterCategory').value,
        location = document.getElementById('filterLocation').value.trim();

    if (search != '') filters += '&search=' + search;
    if (type != '') filters += '&type=' + type;
    if (category != '') filters += '&category=' + category;
    if (location != '') filters += '&location=' + location;
    filters += '&sort=' + document.getElementById('sortDate').value;

    callServer('/api/publicaciones?' + filters, {
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;

        if (result.data.length == 0 && result.page > 1) {
            loadPublications(result.page - 1);
            return;
        }
        // El admin también ve las ocultas y las resueltas, así que a él se le muestra el estado
        fillCards('publicationsContainer', 'publicationsEmpty', result.data, getUser().role == 'admin');
        showPagination(document.getElementById('publicationsPagination'), result, loadPublications);
    })
    .catch(err => {
        console.error('Error al cargar las publicaciones:', err);
    });
}

function loadMyPublications(){
    callServer('/api/publicaciones?mine=true&limit=50', {
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        fillCards('myPublicationsContainer', 'myPublicationsEmpty', result.data, true);
    })
    .catch(err => {
        console.error('Error al cargar mis publicaciones:', err);
    });
}

function fillCards(container_id, empty_id, publications, mine){
    let container = document.getElementById(container_id),
        empty = document.getElementById(empty_id);

    container.innerHTML = '';
    if (publications.length == 0) {
        empty.classList.remove('d-none');
    }
    else {
        empty.classList.add('d-none');
    }
    for (let i = 0; i < publications.length; i++) {
        container.append(publicationCard(publications[i], mine));
    }
}

function typeBadge(type){
    if (type == 'encontrado') {
        return newElement('span', 'badge bg-success mb-2', 'Encontrado');
    }
    return newElement('span', 'badge bg-danger mb-2', 'Perdido');
}

function statusText(status){
    if (status == 'resuelta') return 'Resuelta';
    if (status == 'oculta') return 'Oculta por el administrador';
    return 'Activa';
}

function publicationCard(publication, mine){
    let column = newElement('div', 'col-md-6 col-lg-4'),
        card = newElement('article', 'card h-100 shadow-sm border-0'),
        body = newElement('div', 'card-body'),
        details = newElement('button', 'btn btn-outline-primary w-100', 'Ver detalles');

    if (publication.images.length > 0) {
        let image = newElement('img', 'card-img-top');
        image.src = publication.images[0];
        image.alt = publication.title;
        image.style.height = '200px';
        image.style.objectFit = 'cover';
        card.append(image);
    }

    body.append(typeBadge(publication.type));
    body.append(newElement('h3', 'h5 card-title', publication.title));
    body.append(newElement('p', 'card-text text-muted', publication.description));
    body.append(newElement('p', 'small mb-1', 'Ubicación: ' + publication.location));
    body.append(newElement('p', 'small text-muted', 'Categoría: ' + categoryName(publication.category)));
    if (mine) {
        body.append(newElement('p', 'small fw-semibold', 'Estado: ' + statusText(publication.status)));
    }

    details.setAttribute('type', 'button');
    details.addEventListener('click', () => {showDetail(publication._id)});
    body.append(details);

    card.append(body);
    column.append(card);
    return column;
}

// Paginado como el de la Práctica 4, con los datos que regresa paginate del servidor
function showPagination(pagination, result, on_page){
    pagination.innerHTML = '';

    if (result.total_pages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';

    addPageButton(pagination, 'Anterior', result.page - 1, result.page == 1, false, on_page);
    for (let i = 1; i <= result.total_pages; i++) {
        addPageButton(pagination, i, i, false, i == result.page, on_page);
    }
    addPageButton(pagination, 'Siguiente', result.page + 1, result.page == result.total_pages, false, on_page);
}

function addPageButton(pagination, text, page, disabled, active, on_page){
    let item = newElement('li', 'page-item'),
        link = newElement('a', 'page-link', text);

    if (disabled) item.classList.add('disabled');
    if (active) item.classList.add('active');
    link.setAttribute('href', '#');
    link.addEventListener('click', () => {
        event.preventDefault();
        if (!disabled) on_page(page);
    });
    item.append(link);
    pagination.append(item);
}


// ---------- DETALLE ----------

function showDetail(id){
    callServer('/api/publicaciones/' + id, {
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(publication => {
        if (publication == undefined) return;
        current_publication = publication;
        fillDetail(publication);
        showView('detalle');
    })
    .catch(err => {
        console.error('Error al cargar la publicación:', err);
    });
}

function fillDetail(publication){
    let user = getUser(),
        badge = document.getElementById('detailStatus'),
        image = document.getElementById('detailImage'),
        gallery = document.getElementById('detailGallery'),
        is_owner = publication.owner == user.id;

    badge.classList.remove('bg-success', 'bg-danger');
    if (publication.type == 'encontrado') {
        badge.classList.add('bg-success');
        badge.innerText = 'Encontrado';
    }
    else {
        badge.classList.add('bg-danger');
        badge.innerText = 'Perdido';
    }

    document.getElementById('detailTitle').innerText = publication.title;
    document.getElementById('detailDescription').innerText = publication.description;
    document.getElementById('detailCategory').innerText = categoryName(publication.category);
    document.getElementById('detailLocation').innerText = publication.location;
    document.getElementById('detailDate').innerText = formatDate(publication.date);
    document.getElementById('detailAuthor').innerText = publication.owner_name;
    document.getElementById('detailState').innerText = statusText(publication.status);

    // Hasta tres fotos: la primera grande y las demás abajo para cambiarla
    gallery.innerHTML = '';
    if (publication.images.length > 0) {
        image.src = publication.images[0];
        image.style.display = 'block';
    }
    else {
        image.style.display = 'none';
    }
    if (publication.images.length > 1) {
        for (let i = 0; i < publication.images.length; i++) {
            let thumb = newElement('img', 'rounded');
            thumb.src = publication.images[i];
            thumb.alt = 'Foto ' + (i + 1);
            thumb.style.width = '70px';
            thumb.style.height = '70px';
            thumb.style.objectFit = 'cover';
            thumb.style.cursor = 'pointer';
            thumb.addEventListener('click', () => {image.src = publication.images[i]});
            gallery.append(thumb);
        }
    }

    // Solo se reclaman objetos encontrados, activos y que no son tuyos
    if (publication.type == 'encontrado' && publication.status == 'activa' && !is_owner) {
        document.getElementById('openRequestModal').style.display = 'inline-block';
    }
    else {
        document.getElementById('openRequestModal').style.display = 'none';
    }

    // Cualquiera puede reportar una publicación activa que no sea suya
    if (publication.status == 'activa' && !is_owner) {
        document.getElementById('openReportModal').style.display = 'inline-block';
    }
    else {
        document.getElementById('openReportModal').style.display = 'none';
    }

    // El dueño edita, marca como encontrado o borra su publicación
    document.getElementById('ownerActions').hidden = !is_owner;
    if (is_owner) {
        let can_edit = publication.status == 'activa',
            resolve = document.getElementById('markResolvedButton');

        resolve.hidden = !can_edit;
        document.getElementById('editPublicationButton').hidden = !can_edit;
        if (publication.type == 'perdido') {
            resolve.innerText = 'Marcar como encontrado';
        }
        else {
            resolve.innerText = 'Marcar como entregado';
        }
    }
}


// ---------- PUBLICAR Y EDITAR ----------

function newPublicationForm(){
    editing_publication_id = undefined;
    document.getElementById('publicationForm').reset();
    document.getElementById('publicarTitle').innerText = 'Publicar un objeto';
    document.getElementById('publishButton').innerText = 'Publicar';
    hideMessage(document.getElementById('publicationError'));
}

function editPublication(){
    let publication = current_publication;

    newPublicationForm();
    editing_publication_id = publication._id;
    document.getElementById('publicationType').value = publication.type;
    document.getElementById('publicationTitle').value = publication.title;
    document.getElementById('publicationDescription').value = publication.description;
    document.getElementById('publicationCategory').value = publication.category;
    document.getElementById('publicationLocation').value = publication.location;
    document.getElementById('publicationDate').value = publication.date.split('T')[0];
    for (let i = 0; i < publication.images.length; i++) {
        document.getElementById('publicationImage' + (i + 1)).value = publication.images[i];
    }
    document.getElementById('publicarTitle').innerText = 'Editar publicación';
    document.getElementById('publishButton').innerText = 'Guardar cambios';
    showView('publicar');
}

// Si hay editing_publication_id es una edición (PUT); si no, una publicación nueva (POST)
function savePublication(){
    event.preventDefault();
    let error_box = document.getElementById('publicationError'),
        url = '/api/publicaciones',
        method = 'POST',
        publication = {
            type: document.getElementById('publicationType').value,
            title: document.getElementById('publicationTitle').value.trim(),
            description: document.getElementById('publicationDescription').value.trim(),
            category: document.getElementById('publicationCategory').value,
            location: document.getElementById('publicationLocation').value.trim(),
            date: document.getElementById('publicationDate').value,
            images: []
        };

    // Las fotos van como enlaces, máximo tres
    for (let i = 1; i <= 3; i++) {
        let image = document.getElementById('publicationImage' + i).value.trim();
        if (image != '') {
            publication.images.push(image);
        }
    }

    if (editing_publication_id != undefined) {
        url = '/api/publicaciones/' + editing_publication_id;
        method = 'PUT';
    }

    hideMessage(error_box);

    callServer(url, {
        method: method,
        headers: authHeaders(),
        body: JSON.stringify(publication)
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        if (method == 'PUT') {
            alert("Publicación actualizada");
        }
        else {
            alert("Publicación creada");
        }
        newPublicationForm();
        showView('misPublicaciones');
    })
    .catch(err => {
        console.error('Error al guardar la publicación:', err);
    });
}

// Marcar como encontrado (o entregado) deja la publicación como resuelta
function markResolved(){
    callServer('/api/publicaciones/' + current_publication._id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'resuelta' })
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        alert("La publicación quedó como resuelta");
        current_publication = result;
        fillDetail(result);
    })
    .catch(err => {
        console.error('Error al marcar la publicación:', err);
    });
}

function deletePublication(){
    callServer('/api/publicaciones/' + current_publication._id, {
        method: 'DELETE',
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        delete_publication_modal.hide();
        alert("Publicación eliminada");
        showView('misPublicaciones');
    })
    .catch(err => {
        console.error('Error al eliminar la publicación:', err);
    });
}


// ---------- SOLICITAR RECUPERACIÓN ----------

function sendRequest(){
    event.preventDefault();
    let error_box = document.getElementById('requestError'),
        message = document.getElementById('requestMessage').value.trim();

    hideMessage(error_box);

    callServer('/api/requests', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ publication: current_publication._id, message: message })
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        request_modal.hide();
        document.getElementById('requestForm').reset();
        alert("Solicitud enviada. Puedes ver cómo va en Solicitudes");
    })
    .catch(err => {
        console.error('Error al enviar la solicitud:', err);
    });
}


// ---------- REPORTAR ----------

function sendReport(){
    event.preventDefault();
    let error_box = document.getElementById('reportError'),
        reason = document.getElementById('reportReason').value.trim();

    hideMessage(error_box);

    callServer('/api/reportes', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ publication: current_publication._id, reason: reason })
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        report_modal.hide();
        document.getElementById('reportForm').reset();
        alert("Reporte enviado. El administrador lo va a revisar");
    })
    .catch(err => {
        console.error('Error al enviar el reporte:', err);
    });
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
        loadPublications(1);
    });
}


if (sessionStorage.token) {
    request_modal = new bootstrap.Modal(document.getElementById('requestModal'));
    report_modal = new bootstrap.Modal(document.getElementById('reportModal'));
    delete_publication_modal = new bootstrap.Modal(document.getElementById('deletePublicationModal'));

    document.getElementById('searchForm').addEventListener('submit', () => {
        event.preventDefault();
        loadPublications(1);
    });
    document.getElementById('publicationForm').addEventListener('submit', savePublication);
    document.getElementById('requestForm').addEventListener('submit', sendRequest);
    document.getElementById('reportForm').addEventListener('submit', sendReport);
    document.getElementById('openReportModal').addEventListener('click', () => {
        document.getElementById('reportForm').reset();
        hideMessage(document.getElementById('reportError'));
    });
    document.getElementById('openRequestModal').addEventListener('click', () => {
        document.getElementById('requestForm').reset();
        hideMessage(document.getElementById('requestError'));
    });
    document.getElementById('markResolvedButton').addEventListener('click', markResolved);
    document.getElementById('editPublicationButton').addEventListener('click', editPublication);
    document.getElementById('deletePublicationButton').addEventListener('click', () => {delete_publication_modal.show()});
    document.getElementById('confirmDeletePublicationButton').addEventListener('click', deletePublication);

    // Mostrar la vista inicial cuando ya están las categorías
    readCategories().then(() => {
        // Si la sesión venció, readResponse ya mandó al login
        if (!sessionStorage.token) return;

        const initialView = window.location.hash.replace("#", "");

        if (views[initialView] && initialView != 'detalle') {
            showView(initialView);
        } else {
            showView("inicio");
        }
    })
    .catch(err => {
        console.error('Error al cargar las categorías:', err);
        alert("No se pudo conectar con el servidor");
    });
}
