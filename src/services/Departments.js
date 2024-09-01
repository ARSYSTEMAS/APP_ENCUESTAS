import { ref } from "vue";
import axios from "axios";
import Entorno from "../function/entorno";
import ErrorConnectios from "../function/errorsConnection";
import Database from "../function/database";

const DB = Database()
const { RUTA } = Entorno();

class Service {
  constructor() {
    this.data = ref([]);
    this.columns = ref([]);
  }

  getFuentesData() {
    return this.data;
  }

  getFuentesColumn() {
    return this.columns;
  }

 
  async all() {
    try {
        const url = `${RUTA}/Departments`;
        const response = await axios.get(url);
        if (response.data.error) {  

          ErrorConnectios(response.status,response.statusText)

      }

       this.data.value = DB === "mysql" ? await response.data.body : await response.data.body["recordset"] ;
    } catch (error) {
        console.error(error);
    }
}


  async unique({ params, token }) {
    const url = new URL(`${RUTA}/Departments/unique`);

    // Agregar parámetros a la URL si es necesario
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    try {
      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`, // token
        },
      });

      if (response.data.error) {
        ErrorConnectios(response.status, response.statusText);
      } else {
        this.data.value = response.data.body;
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  }

}

export default Service;
