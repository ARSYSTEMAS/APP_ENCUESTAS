export default function validatePropertyAndValue(objeto, clave) {
    return objeto.hasOwnProperty(clave) && objeto[clave] != null;
  }