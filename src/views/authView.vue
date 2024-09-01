<script setup>
import { ref } from 'vue'
import AuthService from '../services/AuthServices'
import { useRouter } from 'vue-router';
import obtenerCookiesUsuario from '../function/cookies'
import generateUuid from 'generate-uuid';
import UuidService from "../services/GenerateUUID"
import { toast } from 'vue3-toastify';
import Swal from "sweetalert2";
import MenuNavegacion from '../components/SideNav.vue';
import PasswordForm from '../components/PasswordFormAuth.vue'

const setIsAuthenticated = $cookies.get(obtenerCookiesUsuario().nameCookies)

let usuario = ref('')
let password = ref('')

const field_message_usuario = ref(true);
const field_message_password = ref(true);

const router = useRouter()


function navigateToRoute() {
  router.push('/')
}

function Refresh() {

  setTimeout(() => {
    window.location.reload()
  }, "2000");


}

const errorFields = () => {


  if (usuario.value === '') {

    field_message_usuario.value = false
  } else {
    field_message_usuario.value = true
  }


  if (password.value === '') {

    field_message_password.value = false
  } else {

    field_message_password.value = true
  }
}




const handleLogin = async (event) => {

  event.preventDefault();

  errorFields()

  if (!usuario.value || !password.value) { return }


  const Auth = new AuthService()
  const Uuid_Service = new UuidService()

  const success = await Auth.login(usuario.value, password.value)

  if (success) {
    
    Swal.fire({
      timer: 1500,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading()
      },
      willClose: async () => {

        const Token = Auth.getJwt()

        const uuid = generateUuid();

        const data = {
          Uuid: uuid,
          usuario: usuario.value,
          Active: 1
        }

        await Auth.GetDataUser(usuario.value)
        const bd_user = Auth.getFuentesData()

        
        const company= bd_user.value[0]?.IdCompany
        const department= bd_user.value[0]?.IdDepartments
        const rol = bd_user.value[0]?.RolAdministrator

        //////////cookies Authentication//////////
        $cookies.set(obtenerCookiesUsuario().nameCookies, { user: usuario.value, token: Token.value, uuid: uuid, company:company, department: department, rol:rol })

        //Aqui Guardamos el idSessions en el Backend
        Uuid_Service.UuidPost(data)


        const notify = () => {
          const id = toast.loading(
            'Por favor espere...',
            toast.success("¡Inicio de sesión correctamente!", {
              theme: 'dark',

            }),
          );

          setTimeout(() => {
            toast.update(id, {
              render: Msg,
              autoClose: true,
              closeOnClick: true,
              closeButton: true,
              type: 'success',
              isLoading: false,
            });

            setTimeout(() => {
              toast.done(id);
            }, 1000);
          }, 3000);
        };


        notify()
        navigateToRoute()
        Refresh()
      },
    });

  } else {

    const error = Auth.getError()

    let messageerror = {
      'ERR_NETWORK': 'No hay Conexion con la Bases de Datos.',
      'ERR_BAD_RESPONSE': 'Usuario y/o Password Incorrecto'
    }[error.value['code']] || '';

    toast.error(messageerror, {
      transition: toast.TRANSITIONS.ZOOM,
      position: toast.POSITION.TOP_LEFT,
      autoClose: 3000,
      theme: 'dark',

    });
  }

}
function onInputValue(value) {
  password.value = value
  errorFields()
}
const ENTORNO = ref(process.env.NODE_ENV)
</script>

<template>

  <div v-if="setIsAuthenticated">
    <MenuNavegacion />
  </div>

  <div v-else>



    <section class="vh-100" style="background-color: #feda02;">
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col col-xl-10">
            <div class="card" style="border-radius: 1rem;">
              <div class="row g-0">
                <div class="col-md-6 col-lg-5 d-none d-md-block">
                  <img src="@/assets/img/LogoDakaAuth.png" alt="login form" class="img-fluid" :title=ENTORNO
                    style="border-radius: 1rem 0 0 1rem;" />
                </div>
                <div class="col-md-6 col-lg-7 d-flex align-items-center">
                  <div class="card-body p-4 p-lg-5 text-black">
                    <!-- <div class="row d-flex justify-content-center align-items-center h-100"> -->
                     
                    <form v-on:submit.prevent="handleLogin">

                      <div class="d-flex align-items-center mb-3 pb-1">
                        <i class="fa-solid fa-square-poll-vertical fa-2x me-3" style="color: #004390;"></i>
                        <span class="h4 fw-bold mb-0">Sistema integrado de encuestas y formularios</span>
                       
                      </div>
                      
                      <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Iniciar sesión en su cuenta</h5>

                      <div class="form-outline mb-4">
                        <span class="error" :hidden="field_message_usuario">Por favor ingresa un
                          email valido</span>
                        <input type="email" @change="errorFields()" id="usuario" v-model="usuario"
                          class="form-control form-control-lg " />

                        <label class="form-label" for="usuario">Usuario</label>
                      </div>

                      <div class="form-outline mb-4">

                        <span class="error" :hidden="field_message_password">
                          Por favor, ingrese una contraseña </span>
                        <PasswordForm @input-value="onInputValue" />

                      </div>

                      <div class="pt-1 mb-4">
                        <button class="btn btn-dark btn-lg btn-block" type="submit">Sign In</button>
                      </div>
                    </form>
                    <p class="fw-light fw-bold text-sm text-center">Version:1.3.8</p>
                    <!-- </div> -->
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          
        </div>
       
      </div>
    </section>
  </div>

</template>

<style scoped>
.containerpage {

  background-color: #34343A;
}


.header-card {

  background-color: #252527;
}

.bg-gray-200 {
  background-color: #f0f2f5 !important;
}

.foo-bar {
  color: #f00;
}

.error {

  /* top: 64px; */
  color: #E91D1A;
  /* display: block; */
  font-size: 12px;
  font-weight: 400;
  /* left: 0; */
  text-align: left;
  /* position: absolute; */
}
</style>