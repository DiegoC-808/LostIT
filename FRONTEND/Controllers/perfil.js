let delete_account_modal;

// Pinta los datos del usuario en la vista del perfil
function showProfile(user){
    let avatar = document.getElementById('profileAvatar');

    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileEmail').innerText = user.email;
    document.getElementById('profileFullName').innerText = user.name;
    document.getElementById('profileEmailDetail').innerText = user.email;
    document.getElementById('profileCreatedAt').innerText = formatCreated(user.created_at);

    if (user.role == 'admin') {
        document.getElementById('profileRole').innerText = 'Administrador';
    }
    else {
        document.getElementById('profileRole').innerText = 'Usuario';
    }

    if (user.avatar) {
        avatar.src = user.avatar;
        avatar.style.display = 'block';
    }
    else {
        avatar.style.display = 'none';
    }
}

function loadProfile(){
    let user = getUser();

    callServer('/api/users/' + user.id, {
        headers: authHeaders()
    })
    .then(response => readResponse(response))
    .then(result => {
        if (result == undefined) return;
        sessionStorage.setItem('user', JSON.stringify(result));
        showProfile(result);
    })
    .catch(err => {
        console.error('Error al cargar el perfil:', err);
    });
}

function showEditSection(){
    let user = getUser();

    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editAvatar').value = '';
    if (user.avatar) {
        document.getElementById('editAvatar').value = user.avatar;
    }
    hideMessage(document.getElementById('profileError'));

    document.getElementById('profileViewSection').hidden = true;
    document.getElementById('editProfileSection').hidden = false;
}

function showViewSection(){
    document.getElementById('profileViewSection').hidden = false;
    document.getElementById('editProfileSection').hidden = true;
}

function updateProfile(){
    event.preventDefault();
    let user = getUser();
    let data = new FormData(event.target);
    let error_box = document.getElementById('profileError');

    hideMessage(error_box);

    callServer('/api/users/' + user.id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        sessionStorage.setItem('user', JSON.stringify(result));
        showProfile(result);
        document.getElementById('userNameNav').innerText = 'Hola, ' + result.name;
        showViewSection();
        alert("Perfil actualizado");
    })
    .catch(err => {
        console.error('Error al actualizar el perfil:', err);
    });
}

function deleteAccount(){
    event.preventDefault();
    let user = getUser();
    let data = new FormData(event.target);
    let error_box = document.getElementById('deleteAccountError');

    hideMessage(error_box);

    // El servidor pide la contraseña en el body para borrar la cuenta
    callServer('/api/users/' + user.id, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(response => readResponse(response, error_box))
    .then(result => {
        if (result == undefined) return;
        delete_account_modal.hide();
        alert("Tu cuenta se eliminó");
        logout();
    })
    .catch(err => {
        console.error('Error al eliminar la cuenta:', err);
    });
}

if (sessionStorage.token) {
    delete_account_modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));

    document.getElementById('editProfileButton').addEventListener('click', showEditSection);
    document.getElementById('cancelEdit').addEventListener('click', showViewSection);
    document.getElementById('editProfileForm').addEventListener('submit', updateProfile);
    document.getElementById('deleteAccountForm').addEventListener('submit', deleteAccount);

    showProfile(getUser());
    loadProfile();
}
