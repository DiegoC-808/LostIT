// "sent" son las que mandé y "received" las que me llegaron, igual que el parámetro box del servidor

function showTab(box){
    let sent_tab = document.getElementById('sentTab'),
        received_tab = document.getElementById('receivedTab');

    document.getElementById('sentRequestsSection').hidden = box != 'sent';
    document.getElementById('receivedRequestsSection').hidden = box != 'received';

    if (box == 'sent') {
        sent_tab.classList.add('active');
        received_tab.classList.remove('active');
    }
    else {
        sent_tab.classList.remove('active');
        received_tab.classList.add('active');
    }
    sent_tab.setAttribute('aria-selected', box == 'sent');
    received_tab.setAttribute('aria-selected', box == 'received');
    loadRequests(box);
}

function statusBadge(status){
    if (status == 'aceptada') {
        return newElement('span', 'badge bg-success', 'Aceptada');
    }
    if (status == 'rechazada') {
        return newElement('span', 'badge bg-danger', 'Rechazada');
    }
    return newElement('span', 'badge bg-warning text-dark', 'Pendiente');
}

function loadRequests(box){
    let container = document.getElementById(box + 'RequestsContainer'),
        empty = document.getElementById(box + 'RequestsEmpty'),
        error_box = document.getElementById('requestsError');

    hideMessage(error_box);

    callServer('/api/requests?box=' + box + '&limit=50', {
        headers: authHeaders()
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;

        container.innerHTML = '';
        if (result.total == 0) {
            empty.classList.remove('d-none');
        }
        else {
            empty.classList.add('d-none');
        }
        for (let i = 0; i < result.data.length; i++) {
            container.append(requestCard(result.data[i], box));
        }
    })
    .catch(err => {
        console.error('Error al cargar las solicitudes:', err);
    });
}

function requestCard(request, box){
    let column = newElement('div', 'col-12'),
        card = newElement('article', 'card border-0 shadow-sm'),
        body = newElement('div', 'card-body'),
        row = newElement('div', 'd-flex flex-column flex-md-row justify-content-between gap-3'),
        info = newElement('div', ''),
        side = newElement('div', 'text-md-end'),
        buttons = newElement('div', 'mt-3 d-flex gap-2 justify-content-md-end');

    info.append(newElement('h3', 'h5', request.publication_title));
    if (box == 'sent') {
        info.append(newElement('p', 'text-muted mb-1', 'Solicitud enviada al propietario.'));
    }
    else {
        info.append(newElement('p', 'text-muted mb-1', 'Solicitud de recuperación recibida.'));
        info.append(newElement('p', 'small mb-1', 'Solicitante: ' + request.requester_name));
    }
    info.append(newElement('p', 'small mb-1', 'Fecha: ' + formatCreated(request.created_at)));
    info.append(newElement('p', 'small mb-0', 'Mensaje: ' + request.message));

    if (request.status == 'aceptada' && box == 'sent') {
        info.append(newElement('p', 'small text-success mt-2 mb-0', 'El dueño aceptó tu solicitud. Ponte de acuerdo con él para recoger tu objeto.'));
    }

    side.append(statusBadge(request.status));

    if (request.status == 'pendiente' && box == 'sent') {
        let cancel = newElement('button', 'btn btn-outline-danger btn-sm', 'Cancelar solicitud');
        cancel.setAttribute('type', 'button');
        cancel.addEventListener('click', () => {cancelRequest(request._id)});
        buttons.append(cancel);
    }
    if (request.status == 'pendiente' && box == 'received') {
        let accept = newElement('button', 'btn btn-success btn-sm', 'Aceptar'),
            reject = newElement('button', 'btn btn-outline-danger btn-sm', 'Rechazar');

        accept.setAttribute('type', 'button');
        reject.setAttribute('type', 'button');
        accept.addEventListener('click', () => {answerRequest(request._id, 'aceptada')});
        reject.addEventListener('click', () => {answerRequest(request._id, 'rechazada')});
        buttons.append(accept, reject);
    }
    side.append(buttons);

    row.append(info, side);
    body.append(row);
    card.append(body);
    column.append(card);
    return column;
}

// Solo el dueño de la publicación acepta o rechaza. Al aceptar, la publicación queda resuelta
function answerRequest(id, status){
    callServer('/api/requests/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: status })
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        if (status == 'aceptada') {
            alert("Aceptaste la solicitud. La publicación quedó como resuelta");
        }
        else {
            alert("Rechazaste la solicitud");
        }
        loadRequests('received');
    })
    .catch(err => {
        console.error('Error al contestar la solicitud:', err);
    });
}

function cancelRequest(id){
    callServer('/api/requests/' + id, {
        method: 'DELETE',
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        alert("Solicitud cancelada");
        loadRequests('sent');
    })
    .catch(err => {
        console.error('Error al cancelar la solicitud:', err);
    });
}

if (sessionStorage.token) {
    document.getElementById('sentTab').addEventListener('click', () => {showTab('sent')});
    document.getElementById('receivedTab').addEventListener('click', () => {showTab('received')});
    showTab('sent');
}
