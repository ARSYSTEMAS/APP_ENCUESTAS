<script setup>
import { onMounted, ref } from "vue"
import AuthService from "../services/AuthServices"
import PasswordForm from '../components/PasswordForm.vue'
import ObtenerFecha from '../function/ObtenerFecha';
import obtenerCookiesUsuario from '../function/cookies'
import { toast } from 'vue3-toastify';
import UuidService from "../services/GenerateUUID"

const service = new AuthService()
const Bd = service.getFuentesData()

const usuario = ref()
const password = ref('')
const nombreusuario = ref()
const idUsuario = ref('')

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const uuid = obtenerCookiesUsuario().objUser.uuid
const token = obtenerCookiesUsuario().token

const Uuid_Service = new UuidService()

onMounted(async () => {

  try {
    await service.GetDataUser(userName)
    nombreusuario.value = Bd.value[0]?.Nombre
    usuario.value = Bd.value[0]?.Usuario
    idUsuario.value = Bd.value[0]?.Id
  } catch (error) {
    console.error(error)
  }

})


async function updateDataUser(event) {

  event.preventDefault()

  if (nombreusuario?.value != '' && usuario?.value != '') {

    const dataUser = {
      Id: idUsuario.value,
      Nombre: nombreusuario.value,
      Activo: 1,
      UsrAct: userName,
      FecAct: ObtenerFecha()
    }

    const dataAuth = {
      Id: idUsuario.value,
      Usuario: usuario.value,
      Password: password.value,
      UsrAct: userName,
      FecAct: ObtenerFecha()
    }

    if (password.value == '') { delete dataAuth.Password }

    try {
      await service.UpdateUsuario({ data: dataUser, token: token }) // Actualiza tabla Usuarios
      await service.UpdateAuth({ data: dataAuth, token: token })

      toast.success("Datos Actualizados, inicia sesión nuevamente", {
        position: toast.POSITION.TOP_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
      });

      $cookies.remove(obtenerCookiesUsuario().nameCookies)
      //   eliminamos la sessionActiva
      Uuid_Service.uuIdDelete({ uuid: uuid, Usuario: userName })
      RefreshData();
    } catch (error) {

      console.error(error)
    }


  } else {

    toast.error('Sin datos requeridos', {
      transition: toast.TRANSITIONS.ZOOM,
      position: toast.POSITION.TOP_LEFT,
      theme: 'dark',

    });
  }

}

function onInputValue(value) {

  password.value = value;
}


function RefreshData() {

  setTimeout(() => {
    window.location.reload()
  }, "2000");

}

</script>

<template>
  <div class="card m-1">
    <div class="card-header py-3">
      <h5 class="mb-1">Creación de usuarios</h5>
    </div>
    <div class="card-body">
      <form v-on:submit.prevent="updateDataUser">

        <div class="row mb-4">
          <div class="col">
            <div class="form-outline">
              <input type="email" id="usuario" required v-model="usuario" class="form-control form-control" />
              <label class="form-label" for="usuario">Usuario</label>
            </div>
          </div>
          <div class="col">
            <div class="form-outline">
              <PasswordForm @input-value="onInputValue" />
            </div>
          </div>
        </div>

        <!-- Text input -->
        <div class="form-outline mb-4">
          <input type="text" id="nombreusuario" required v-model="nombreusuario" class="form-control form-control" />
          <label class="form-label" for="nombreusuario">Nombre</label>
        </div>

        <button type="submit" class="btn btn-primary btn btn-block">
          Actualizar Datos
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
.required-field {
  color: red;
  font-size: small;
}
</style>
