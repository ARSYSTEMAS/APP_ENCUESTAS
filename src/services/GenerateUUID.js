import { ref } from 'vue'
import axios from 'axios';
import Entorno from '../function/entorno'
import  ErrorConnectios from '../function/errorsConnection'
import Database from "../function/database";

const DB = Database()
const { RUTA } = Entorno();

class Service{

    constructor(){

        this.data = ref([])
      
    }


    getFuentesData(){

        return this.data
    }


    async Uuid(uuid) { 
        try {
            const response = await axios.get(`${RUTA}/GenerateUUID/${uuid}`);  

            if (response.data.error) {  

                ErrorConnectios(response.status,response.statusText)
   
            }
            this.data.value = DB === "mysql" ? await response.data.body : await response.data.body["recordset"] ;

        } catch (error) {
            console.error(error);
        }
    }


    async UuidPost(data){
        
        const url = `${RUTA}/GenerateUUID`
        
      await  axios.post(url, data)
          .then(function (response) {
          })
          .catch(function (error) {
            console.log(error);
          });
    }

    
    async uuIdDelete(params){

        const url = `${RUTA}/GenerateUUID/`
  
     await   axios.put(url,params)
          .then(function (response) {
        //   console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    } 
}

export default Service