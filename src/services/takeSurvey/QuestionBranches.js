import { ref } from 'vue'
import axios from 'axios';
import Entorno from '../../function/entorno'
import FormatearFecha from '../../function/FormatearFecha'
import  ErrorConnectios from '../../function/errorsConnection'
import { toast } from 'vue3-toastify';
import Database from "../../function/database";

const DB = Database()
const { RUTA } = Entorno();

class Service{

    constructor(){

        this.data = ref([])
        this.columns = ref([]) 
      
    }


    getFuentesData(){

        return this.data
    }

    getFuentesColumn(){

        return this.columns
    }

    async unique({ params, token }) {
      const url = new URL(`${RUTA}/TakeSurvey/uniqueBranches`);
  
      // Agregar parámetros a la URL si es necesario
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );
  
      try {
        const response = await axios.get(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`, //  token
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

export default Service