export default function errorConnections(codeError,nameError) {


    let messageError = '';

    switch (codeError) {
        case 600:
            messageError = 'No tienes conexión a internet. Verifica la conexión.';
            break;
        case 500:
            messageError = 'Error interno del servidor. Problema con la conexión al servidor. Refresca la página.';
            break;
        case 400:
            messageError = 'El servidor no puede procesar o reconocer la solicitud.';
            break;
        case 401:
            messageError = 'La petición (request) no ha sido ejecutada porque carece de credenciales válidas de autenticación para el recurso solicitado.';
            break;
        case 403:
            messageError = 'El servidor ha recibido y ha entendido la petición, pero rechaza enviar una respuesta.';
            break;
        case 404:
                messageError = 'Ruta,url,enlace o servidor web ha sido eliminado o trasladado a otro URL';
                break;
        case 502:
            messageError = 'Puerta de enlace no válida.';
            break;
        case 503:
            messageError = 'Servicio no disponible.';
            break;
        case 504:
            messageError = 'No se pudo obtener una respuesta a tiempo. Inténtalo nuevamente.';
            break;
        case 429:
            messageError = 'Inválido, la consulta trajo más de un registro.';
            break;
        case 408:
            messageError = 'El servidor ha decidido cerrar la conexión en lugar de continuar esperando. Inténtalo nuevamente.';
            break;
        default:
            messageError = nameError;
            break;
    }

   
    if(messageError){

        toast.error(messageError, {
            transition: toast.TRANSITIONS.ZOOM,
            position: toast.POSITION.TOP_LEFT,
        
        });
    }


}

