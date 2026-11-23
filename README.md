#Web LostIT

Proyecto de Web final del curso 2026.

## Tecnologias 
- HTML
- CSS
- JavaScript
- Node.js con Express
- MongoDB Atlas con Mongoose
- bcrypt y JWT para el inicio de sesion

## Como ejecutarlo 
1. Entra a la carpeta `BACKEND` y corre `npm install`
2. Copia `config.example.js` como `config.js` y pon tu conexion de Atlas, una llave para los tokens y la contraseña del admin. `config.js` no se sube al repo
3. Desde la carpeta `BACKEND` corre `node server.js` y abre http://localhost:3000/views/login.html
4. Al conectarse a la base, el servidor crea solo las categorias base y el usuario admin si todavia no existen

Las pruebas de cada ruta estan en `BACKEND/test.http` (extension REST Client).

## API
Todas las rutas empiezan con `/api`. Menos el login y el registro, todas piden el token del login en el header `Authorization`.

| Metodo | Ruta | Que hace | Quien |
|---|---|---|---|
| POST | /login | Inicia sesion, regresa el token y el usuario | Todos |
| POST | /register | Crea una cuenta, regresa el token y el usuario | Todos |
| GET | /users?search=&page=&limit= | Lista de usuarios | Admin |
| GET | /users/:id | Perfil | El mismo usuario o admin |
| PUT | /users/:id | Edita nombre, correo, foto o contraseña | El mismo usuario o admin |
| DELETE | /users/:id | Borra la cuenta (pide la contraseña en el body) y sus publicaciones | El mismo usuario o admin |
| GET | /publicaciones?search=&type=&category=&location=&sort=&mine=&page=&limit= | Busca publicaciones con filtros, orden y paginado (la busqueda no distingue mayusculas) | Usuarios |
| GET | /publicaciones/:id | Detalle de una publicacion | Usuarios |
| POST | /publicaciones | Publica un objeto perdido o encontrado (maximo 3 imagenes) | Usuarios |
| PUT | /publicaciones/:id | Edita o marca como resuelta | El dueño (el admin solo cambia el estado para ocultar) |
| DELETE | /publicaciones/:id | Borra la publicacion y sus solicitudes | El dueño o admin |
| GET | /requests?box=sent\|received&status= | Solicitudes enviadas o recibidas | Usuarios |
| POST | /requests | Pide un objeto encontrado | Usuarios (no el dueño) |
| PUT | /requests/:id | Acepta o rechaza (el dueño) o cambia el mensaje (quien la mando) | Usuarios |
| DELETE | /requests/:id | Cancela la solicitud | Quien la mando o admin |
| GET | /categorias | Lista de categorias | Usuarios |
| POST, PUT, DELETE | /categorias/:id | Administra categorias (no se borra una que se usa) | Admin |
| POST | /reportes | Reporta una publicacion | Usuarios |
| GET, PUT, DELETE | /reportes/:id | Revisa los reportes | Admin |
| GET | /admin/dashboard | Totales para el panel | Admin |
| POST, PUT, DELETE | /admin/create-user, /admin/update-user/:id, /admin/delete-user/:id | Administra usuarios | Admin |

## Reglas de negocio
1. Solo los usuarios con sesion pueden publicar
2. Cada publicacion es de un usuario y solo el puede editarla o borrarla
3. Solo se pueden pedir objetos encontrados, nunca una publicacion propia, y cada usuario tiene una sola solicitud pendiente por objeto
4. Las solicitudes empiezan pendientes; cuando el dueño acepta una, la publicacion queda resuelta y las demas pendientes de ese objeto se rechazan
5. El admin maneja las categorias, revisa los reportes y puede ocultar publicaciones

## Autores 
- Diego Ivan Castro Piña
- Enrique Javier Perez Amaya
- Santiago Barragan Pinzon
