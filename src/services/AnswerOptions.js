import { ref } from 'vue'
import axios from 'axios';
import Entorno from '../function/entorno'
import FormatearFecha from '../function/FormatearFecha'
import  ErrorConnectios from '../function/errorsConnection'
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



   
    async add({data,token}){
        
        const url = `${RUTA}/AnswerOptions`

       await axios.post(url, data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
          .then(function (response) {

            // toast.success("Opción añadida", {
            //   position: toast.POSITION.BOTTOM_LEFT,
            //     transition: toast.TRANSITIONS.SLIDE,
            //     autoClose: 1000,
            //     theme: 'dark',
            // });
          })
          .catch(function (error) {

            return toast.error('Ocurrio un error, intente nuevamente', {
              position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',
            });
          });
    }


    async all(token){ 


        try {
            const url = `${RUTA}/AnswerOptions`
            const response = await fetch(url, {
              headers: {
                  'Content-type': 'application/json',
                  'Authorization': `Bearer ${token}`, // notice the Bearer before your token
              }
            });
            const json = await response.json();
            this.data.value = DB === "mysql" ? await json.body : await json.body["recordset"];

            this.data.value.forEach(item => {
                item.FecCrea ? item.FecCrea = FormatearFecha(item.FecCrea) : null;
                item.FecAct ? item.FecAct = FormatearFecha(item.FecAct) : null;
              });

              if (this.data.value.length == 0){
                this.data.value =  [{"Id": "0", "Nombre":"NO HAY ENCUESTAS"}]
              }

            this.columns.value =  Object.keys(this.data.value[0]).filter(key => {
              // Aquí debes especificar las claves que deseas obtener
             return  key == 'Id'|| key == 'Nombre'||  key == 'UsrCrea' || key == 'FecCrea' || key == 'UsrAct' || key == 'FecAct';
            });
          } catch (error) {
            
             toast.error('Ocurrio un error. No se pudieron mostrar los datos', {
              position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',
            });
          }
    
   
    }

    async del({ params, token }) {
        
        const url = `${RUTA}/AnswerOptions/delete`
      let response = null

       await  axios.put(url, { params }, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
          .then(function (response) {
            response = response
            toast.success("Opción eliminada", {
              position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',
            });

          })
          .catch(function (error) {
            response = error
            return toast.error('Ocurrio un error. No se pudo eliminar', {
              position: toast.POSITION.BOTTOM_LEFT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',
            });
          });
          
          return response
    } 


    async update({ data, params, token }) {
       
      const url = `${RUTA}/AnswerOptions/`

     await axios.put(url,{data,params}, {
      headers: { 'Authorization': `Bearer ${token}` }
  })
        .then(function (response) {
           
          // toast.success("Registro actualizado", {
          //   position: toast.POSITION.BOTTOM_LEFT,
          //     transition: toast.TRANSITIONS.SLIDE,
          //     autoClose: 2000,
          //     theme: 'dark',
          // });

          console.log(response)

        })
        .catch(function (error) {
         
          return toast.error('Ocurrio un error. No se pudo actualizar', {
              position: toast.POSITION.BOTTOM_LEFT,
              transition: toast.TRANSITIONS.SLIDE,
              autoClose: 2000,
              theme: 'dark',
          });

        });
  }


    async unique({ params, token }) {
      const url = new URL(`${RUTA}/AnswerOptions/unique`);
  
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

export default Service