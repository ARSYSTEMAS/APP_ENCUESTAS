export default function ObtenerFecha() {
 //FUNCIONA PARA MYSQL
 const date = new Date();
 const year = date.getFullYear();
 const month = ("0" + (date.getMonth() + 1)).slice(-2); // Los meses en JavaScript comienzan desde 0
 const day = ("0" + date.getDate()).slice(-2);
 const hours = ("0" + date.getHours()).slice(-2);
 const minutes = ("0" + date.getMinutes()).slice(-2);
 const seconds = ("0" + date.getSeconds()).slice(-2);
 
 const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
 
 return result;
 
  //FUNCIONA PARA SQLSERVER
  // const hora = new Date().toLocaleTimeString('en-US');
  // const HoraNow = hora.replace(/(a. m.|p. m.)/gi, '');
  // const date = new Date().toLocaleString('en-US');
  // const formattedDate = date.split(',')[0].split('/');
  // const year = formattedDate[2];
  // const month = formattedDate[0].length === 1 ? '0' + formattedDate[0] : formattedDate[0];
  // const day = formattedDate[1].length === 1 ? '0' + formattedDate[1] : formattedDate[1];
  // const result = `${year}-${month}-${day} ${HoraNow}`;

  //     return result
}

