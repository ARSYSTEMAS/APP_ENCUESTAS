export default function obtenerCookiesUsuario() {
    const nameCookies = 'auth-DkE';
    const objUser = $cookies.get('auth-DkE');
    const userName = objUser?.user;
    const token = objUser?.token;
    const uuid = objUser?.uuid;
    const department = objUser?.department;
    const company = objUser?.company;
    const rol = objUser?.rol;
    return {objUser, userName, nameCookies, token, uuid, department, company, rol};
  }
  