// Funciones que usan todas las vistas para la sesión y para hablar con el servidor.
// Va antes del controlador de cada vista, como el env.js de la Práctica 4.

function getUser(){
    return JSON.parse(sessionStorage.user);
}

// Headers de cada petición: el token va en Authorization, como lo revisa verifyToken
function authHeaders(){
    return {
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.token
    };
}

function saveSession(data){
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    goHome();
}

function goHome(){
    if (getUser().role == 'admin') {
        window.location.href = 'admin.html';
    }
    else {
        window.location.href = 'publicaciones.html';
    }
}

function logout(){
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Sin sesión solo se puede estar en el login; con sesión, el login manda a la vista que toca
function validateLogin(){
    let in_login = window.location.href.includes('login.html');

    if (!sessionStorage.token && !in_login) {
        alert("Favor de iniciar sesión");
        window.location.href = 'login.html';
        return;
    }
    if (sessionStorage.token && in_login) {
        goHome();
    }
}

// "Cargando" con Lottie mientras hay llamadas al servidor, como en la clase de Lottie, BCRYPT y JWT.
// Se cuenta cuántas llamadas van para quitarlo hasta que termine la última.
let pending_calls = 0;

function showLoading(){
    let overlay = document.getElementById('loadingOverlay');
    pending_calls++;
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading(){
    let overlay = document.getElementById('loadingOverlay');
    pending_calls--;
    if (pending_calls <= 0) {
        pending_calls = 0;
        if (overlay) overlay.style.display = 'none';
    }
}

// Todas las vistas llaman al servidor con esta función: es fetch, pero enseña el cargando
function callServer(url, options){
    showLoading();
    return fetch(url, options)
    .then(response => {
        hideLoading();
        return response;
    })
    .catch(err => {
        hideLoading();
        throw err;
    });
}

// Si la respuesta salió bien regresa el JSON. Si no, muestra el mensaje del servidor
// en error_box (o en un alert) y regresa undefined. Si el token ya no sirve, cierra la sesión.
function readResponse(response, error_box){
    if (response.ok) {
        return response.json();
    }
    return response.text().then(text => {
        if (response.status == 401 && text.includes('sesión')) {
            alert(text);
            logout();
            return;
        }
        showMessage(error_box, text);
    });
}

function showMessage(box, text){
    if (box == undefined) {
        alert(text);
        return;
    }
    box.innerText = text;
    box.classList.remove('d-none');
}

function hideMessage(box){
    box.innerText = '';
    box.classList.add('d-none');
}

// Crea un elemento con sus clases y su texto
function newElement(tag, classes, text){
    let element = document.createElement(tag);
    if (classes != '') {
        element.setAttribute('class', classes);
    }
    if (text != undefined) {
        element.innerText = text;
    }
    return element;
}

// Para la fecha del objeto ("2026-11-20T00:00:00.000Z" -> "20/11/2026"), como en la Práctica 4
function formatDate(date){
    if (date == undefined) return '';
    let partes = date.split('T')[0].split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// Para fechas con hora (created_at): el servidor las guarda en UTC y aquí se pasan a la hora local,
// con getDate y getMonth como el getToday de la Práctica 4
function formatCreated(date){
    if (date == undefined) return '';
    let created = new Date(date),
        month = created.getMonth() + 1,
        day = created.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    return day + '/' + month + '/' + created.getFullYear();
}

validateLogin();

if (sessionStorage.token) {
    let logout_button = document.getElementById('logoutButton'),
        admin_link = document.getElementById('adminLink'),
        user_name = document.getElementById('userNameNav');

    // En el header se ve quién inició sesión
    if (user_name) {
        user_name.innerText = 'Hola, ' + getUser().name;
    }

    if (logout_button) {
        logout_button.addEventListener('click', () => {
            event.preventDefault();
            logout();
        });
    }
    if (admin_link && getUser().role == 'admin') {
        admin_link.hidden = false;
    }
}
