import { ref } from "vue";
import axios from "axios";
import Entorno from "../function/entorno";
import ErrorConnectios from "../function/errorsConnection";
import FormatearFecha from "../function/FormatearFecha";
import Database from "../function/database";

const DB = Database();
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

  async all(token) {
    try {
      const url = `${RUTA}/Evaluations/`;
      const response = await fetch(url, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`, // notice the Bearer before your token
        },
      });
      const json = await response.json();
      this.data.value =
        DB === "mysql" ? await json.body : await json.body["recordset"];

      this.data.value.forEach((item) => {
        item.FecCrea ? (item.FecCrea = FormatearFecha(item.FecCrea)) : null;
        item.FecAct ? (item.FecAct = FormatearFecha(item.FecAct)) : null;
      });

      this.columns.value = Object.keys(this.data.value[0]).filter((key) => {
        // Aquí debes especificar las claves que deseas obtener
        return (
          key == "Id" || key == "Name" || key == "UsrCrea" || key == "FecCrea"
        );
      });
    } catch (error) {
      console.error(error);
    }
  }

  async insert({ data, token }) {
    const url = `${RUTA}/Evaluations/`;

    await axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(function (response) {
        //  console.log(response);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async Update({ data, token }) {
    const url = `${RUTA}/Evaluations/`;

    await axios
      .put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(function (response) {
        //  console.log(response);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async Del(params = {}, token) {
    const url = `${RUTA}/Evaluations`;

    await axios
      .delete(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async unique({ params, token }) {
    const url = new URL(`${RUTA}/Evaluations/unique`);

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
