export default function FormatearFecha(fecha) {

    const date = new Date(fecha);
    
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
   
    date.setDate(date.getDate());
    
    const formattedDate = date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let isFecha
    fecha ?  isFecha = formattedDate : isFecha = ''
    return isFecha
   }
   
   
   
   