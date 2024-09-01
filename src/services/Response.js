import { ref } from 'vue'
import axios from 'axios';
import Entorno from '../function/entorno'
import { toast } from 'vue3-toastify';
import Database from "../function/database";

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


    async add(data){
        
        const url = `${RUTA}/Response`
        let response = null
      await  axios.post(url, data)
          .then(function (resp) {
            response = resp
          })
          .catch(function (error) {
            response = error
            return toast.error('Ocurrio un error, intente nuevamente', {
              position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',      
            });
          });

          return response
    }


    async unique({ params, token }) {
        const url = `${RUTA}/Response/unique`;
    
        try {
          const response = await axios.get(url, { params });
    
          if (response.data.error) {
            ErrorConnectios(response.status, response.statusText);
          }
          this.data.value = await response.data.body;
        } catch (error) {
          console.error(error);
        }
      }

}



export default Service