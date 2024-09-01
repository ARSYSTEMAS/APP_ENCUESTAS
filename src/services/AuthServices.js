import { ref } from 'vue'
import axios from 'axios';
import FormatearFecha from '../function/FormatearFecha'
import Entorno from '../function/entorno'
import  ErrorConnectios from '../function/errorsConnection'
import Database from "../function/database";

const DB = Database()
const { RUTA } = Entorno();

class AuthService{

    constructor(){
        this.jwt = ref()
        this.error = ref()
        this.data = ref([])
        this.columns = ref([])
    }

    getJwt(){
        return this.jwt
    }

    getError(){
        return this.error
    }

    getFuentesData(){

        return this.data
    }

    getFuentesColumn(){

        return this.columns
    }


    async all(token){ 

        try {
            const url = `${RUTA}/Auth/`
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

            this.columns.value =  Object.keys(this.data.value[0]).filter(key => {
              // Aquí debes especificar las claves que deseas obtener
             return  key == 'Id'|| key == 'Nombre'|| key == 'Usuario' || key == 'UsrCrea' || key == 'FecCrea';
            });
          } catch (error) {
            console.error(error);
          }
    
   
    } 

    
    async login(usuario, password){
        try {
            const response = await axios.post(`${RUTA}/Auth/login`, {
                Usuario: usuario,
                Password: password
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            if ('errors' in response) {
                this.error.value = "Login failed"
                return false
            } else {
                this.jwt.value = response.data.body
                return true
            }
        } catch (error) {
            this.error.value = error
        }
    } 

    
    async GetDataUser(id) {
        try {
            const response = await axios.get(`${RUTA}/Auth/${id}`);
            this.data.value = DB === "mysql" ? await response.data.body : await response.data.body["recordset"] ;
        } catch (error) {
            console.error(error);
        }
    }


    async DeleteUser(Id,token){
        
        const url = `${RUTA}/Usuarios/delete`

       await axios.put(url, { Id: Id }, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
          .then(function (response) {
        //    console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
          
    } 

    
    async DeleteAuth(Id,token){
        
        const url = `${RUTA}/Auth/delete`

      await  axios.put(url, { Id: Id }, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
          .then(function (response) {
        //    console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    } 



    
    async InsertUserData({data,token}){
        

        const url = `${RUTA}/Usuarios/`
  
       await axios.post(url, data,{
          headers: {
              'Authorization': `Bearer ${token}`, // notice the Bearer before your token
          }
      })
          .then(function (response) {
          //  console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    }



        
    async UpdateUsuario({data, token}){
        
        const url = `${RUTA}/Usuarios/`
  
       await axios.put(url, data ,{
        headers: { Authorization: `Bearer ${token}` },
      })
          .then(function (response) {
          //  console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    }

 
    async UpdateAuth({data,token}){

        const url = `${RUTA}/Auth/`
  
     await   axios.put(url, data,{
        headers: { Authorization: `Bearer ${token}` },
      })
          .then(function (response) {
          //  console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
     }



}

export default AuthService
