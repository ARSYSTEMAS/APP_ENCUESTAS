<script setup>
import { onMounted, ref } from "vue"
import Swal from "sweetalert2"
import AuthService from "../services/AuthServices"
import ServiceCompany from "../services/Company"
import ServiceDepartments from "../services/Departments"
import PasswordForm from '../components/PasswordForm.vue'
import ObtenerFecha from '../function/ObtenerFecha';
import obtenerCookiesUsuario from '../function/cookies'
import DataTable from '../components/dataTable/DataTableUsers.vue'
import { toast } from 'vue3-toastify'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const service = new AuthService()
const Bd = service.getFuentesData()
const _columns = service.getFuentesColumn()
 
const serviceCompany = new ServiceCompany()
const BdCompany = serviceCompany.getFuentesData()

const serviceDepartments = new ServiceDepartments()
const BdDepartments = serviceDepartments.getFuentesData()

const operation = ref('Registrar')
const operationReset = ref('Limpiar')

const usuario = ref()
const password = ref()
const nombreusuario = ref()
const empresa = ref(0)
const departamento = ref(0)
const activo = ref('')
const rol = ref(0)

const myInput = ref(null);
const BdEdit = ref(null)  //identifica el reg a actualizar


onMounted(async () => {

  try {

    await service.all(token)
    await serviceCompany.all(token)

    focusInput()

  } catch (error) {
    console.error(error)
  }


})


async function addData(event) {

  event.preventDefault()



  if (!usuario.value || !nombreusuario.value || !activo.value || (!password.value && BdEdit.value == null)) {

    return toast.error('Todos los campos son requeridos', {
      transition: toast.TRANSITIONS.ZOOM,
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      theme: 'dark',

    });
  }



  if (BdEdit.value == null) {

    const formData = {
      Nombre: nombreusuario.value,
      Usuario: usuario.value,
      Password: password.value,
      IdCompany: empresa.value,
      IdDepartments: departamento.value,
      Activo: activo.value,
      RolAdministrator: rol.value,
      UsrCrea: userName,
      FecCrea: ObtenerFecha()
    }

    //Aqui Guardamos en el Backend
    await service.InsertUserData({ data: formData, token: token })
    clearFields()
    focusInput()

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Usuario Creado',
      showConfirmButton: false,
      timer: 1500
    })
    RefreshData()
  } else {
    Swal.fire({
      title: '¿Quieres actualizar los cambios?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      denyButtonText: `No Actualizar`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {


        const dataUsers = {
          Id: BdEdit.value,
          Nombre: nombreusuario.value,
          Activo: activo.value,
          IdCompany: empresa.value,
          IdDepartments: departamento.value,
          RolAdministrator: rol.value,
          UsrAct: userName,
          FecAct: ObtenerFecha()
        }


        const dataAuth = {
          Id: BdEdit.value,
          Usuario: usuario.value,
          Password: password.value,
          UsrAct: userName,
          FecAct: ObtenerFecha()
        }

        if (password.value == '') { delete dataAuth.Password }

        //Aqui Actualizamos en el Backend
        await service.UpdateUsuario({ data: dataUsers, token: token })
        await service.UpdateAuth({ data: dataAuth, token: token })
        BdEdit.value = null
        clearFields()
        focusInput()
        operation.value = 'Registrar'
        operationReset.value = 'Limpiar'

        Swal.fire('Actualizado!', '', 'success')
        RefreshData()
      } else if (result.isDenied) {
        BdEdit.value = null
        operation.value = 'Registrar'
        operationReset.value = 'Limpiar'
        clearFields()
        Swal.fire('Los cambios no se guardaron', '', 'info')
      }
    })

  }
}

async function deleteData(id) {



  Swal.fire({
    icon: "warning",
    title: "Estas Seguro?",
    text: "Esta accion es irreversible!",
    showCancelButton: true,
    confirmButtonText: "Si, Eliminar!",
    cancelButtonText: "No, Cancelar!",
  }).then(async (result) => {
    if (result.value) {

      //Aqui Eliminamos en el Backend
      await service.DeleteAuth(id, token)
      await service.DeleteUser(id, token)
      Swal.fire({
        icon: "success",
        title: "Eliminado!",
        text: "El registro a sido eliminado",
        showConfirmButton: false,
        timer: 1500,
      });
      RefreshData()
    }
  });
}

function editData(id) {
  operation.value = 'Actualizar Datos'
  operationReset.value = 'Cancelar'
  const foundData = Bd.value.filter(data => data.Id == id)
  usuario.value = foundData[0].Usuario
  nombreusuario.value = foundData[0].Nombre
  password.value = ''
  empresa.value = foundData[0].IdCompany
  departamento.value = foundData[0].IdDepartments
  listDepartments()
  activo.value = foundData[0].Activo
  rol.value = foundData[0].RolAdministrator
  BdEdit.value = id
  focusInput()
}


function clearFields() {
  usuario.value = ''
  password.value = ''
  nombreusuario.value = ''
  empresa.value = ''
  departamento.value = ''
  activo.value = ''
  BdEdit.value = null
  operation.value = 'Registrar'
  operationReset.value = 'Limpiar'
  focusInput()

}

const focusInput = () => {
  myInput.value.focus();
};


function onInputValue(value) {
  password.value = value;
}

function RefreshData() {

  window.location.reload()

}

async function listDepartments() {

  const where = {
    IdEmpresa: empresa.value
  }

  await serviceDepartments.unique({ params: where, token: token }) // obtengo los datos de los departamentos por empresas
}

</script>

<template>




  <div class="card m-1">
    <div class="card-header py-3">
      <h5 class="mb-1">Creación de usuarios</h5>
    </div>

    <div class="card-body">
      <form v-on:submit.prevent="addData">

        <div class="row mb-4">
          <div class="col">
            <div class="form-outline">
              <input type="email" id="usuario" ref="myInput" required v-model="usuario"
                class="form-control form-control" />
              <label class="form-label" for="usuario">Usuario*</label>
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
          <label class="form-label" for="nombreusuario">Nombre*</label>
        </div>


        <div class="form-outline mb-4">
          <select class="form-select" id="empresa" required @change="listDepartments(empresa)"
            aria-label="Floating label select example" v-model="empresa">
            <option value='all'>Todas las Empresas</option>
            <option v-for="company in BdCompany" :key="company.Id" :value="company.IdCompany">{{ company.NameCompany
              }}</option>
          </select>
          <label class="form-label" for="usuario">Empresa*</label>
        </div>

        <div class="form-outline mb-4">
          <select class="form-select" id="departamento" required aria-label="Floating label select example"
            v-model="departamento">
            <option value='all'>Todas los Departamentos</option>
            <option v-for="department in BdDepartments" :key="department.Id" :value="department.IdDepartments">{{
              department.NameDepartments }}</option>
          </select>
          <label class="form-label" for="usuario">Departamento*</label>
        </div>

        <!-- Select -->
        <div class="form-outline mb-4">
          <select class="form-select form-select" aria-label=".form-select example" id="activo" required
            v-model="activo">
            <option value=''>Seleccione una opción</option>
            <option value=1>Si</option>
            <option value=2>No</option>
          </select>
          <label class="form-label" for="nombreusuario">Activo*</label>
        </div>

        <!-- Select -->
        <div class="form-outline mb-4">
          <select class="form-select form-select" aria-label=".form-select example" id="activo" required v-model="rol">
            <option value=1>Si</option>
            <option value=0>No</option>
          </select>
          <label class="form-label" for="nombreusuario">Rol de Administrador*</label>
        </div>

        <input type="submit" :class="[operation == 'Registrar' ? 'btn btn-primary' : 'btn btn-success']"
          v-bind:value="operation" />
        <input type="button" @click="clearFields" class="btn btn-warning m-2" v-bind:value="operationReset" />
        <p class="required-field text-wrap">(*) Campos Obligatorios</p>

      </form>
    </div>
  </div>

  <div>

    <DataTable :items="Bd" :columns="_columns" @sayUpdate="editData" @sayDelete="deleteData" />
  </div>

</template>

<style scoped>
.text-xxs {
  font-size: 14px;
}

.text-xs {
  font-size: 12px;
}
</style>
