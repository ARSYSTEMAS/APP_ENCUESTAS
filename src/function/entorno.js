export default function entorno() {

    let RUTA = ''
    let RUTA_UPLOAD = ''
    let RUTA_DOWNLOAD = ''
    let  RUTA_LINK = ''
    
    if( process.env.NODE_ENV === 'development'){

        RUTA = process.env.VUE_APP_RUTA_API_DEVELOPMENT
        RUTA_UPLOAD = process.env.VUE_APP_URL_PUBLIC_DEVELOPMENT
        RUTA_DOWNLOAD = process.env.VUE_APP_RUTA_DOWNLOAD_DEVELOPMENT
        RUTA_LINK = process.env.VUE_APP_LINK_DEVELOPMENT
    }else{

        RUTA = process.env.VUE_APP_RUTA_API_PRODUCTION
        RUTA_UPLOAD = process.env.VUE_APP_URL_PUBLIC
        RUTA_DOWNLOAD = process.env.VUE_APP_RUTA_DOWNLOAD_PRODUCTION
        RUTA_LINK = process.env.VUE_APP_LINK_PRODUCTION
    }

    return { RUTA, RUTA_UPLOAD, RUTA_DOWNLOAD, RUTA_LINK }
}