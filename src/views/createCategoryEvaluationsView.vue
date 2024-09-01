<script setup>
import { onMounted, ref, defineAsyncComponent, watch, computed } from "vue"
import Swal from "sweetalert2"
import ObtenerFecha from '../function/ObtenerFecha';
import obtenerCookiesUsuario from '../function/cookies'
//import DataTable from '@/components/dataTable/DataTableEvaluations.vue'
import { toast } from 'vue3-toastify'
import Evaluations from '@/services/Evaluations'

const DataTable = defineAsyncComponent(() =>
    import('@/components/dataTable/DataTableEvaluations.vue')
)

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const service = new Evaluations()
const Bd = service.getFuentesData()
const _columns = service.getFuentesColumn()

const operation = ref('Registrar')
const operationReset = ref('Limpiar')

const name = ref()

const myInput = ref(null);
const BdEdit = ref(null)  //identifica el reg a actualizar

let loading = ref(true)

const change = ref(false)
const changeData = computed(() => change.value)

onMounted(async () => {

  try {

    await listTable()
    loading.value = false

    focusInput()

  } catch (error) {
    console.error(error)
  }


})


const activeChange = () => change.value = !change.value;
const focusInput = () => myInput.value.focus();

async function listTable() {

try {
    
  await service.all(token)

} catch (error) {
    console.error(error)
}

}

async function addData(event) {

  event.preventDefault()


  if (!name.value) {

    return toast.error('Todos los campos son requeridos', {
      transition: toast.TRANSITIONS.ZOOM,
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      theme: 'dark',

    });
  }



  if (BdEdit.value == null) {

    const formData = {
      Name: name.value,
      UsrCrea: userName,
      FecCrea: ObtenerFecha()
    }

    //Aqui Guardamos en el Backend
    await service.insert({ data: formData, token: token })
    activeChange()
    clearFields()
    focusInput()

    Swal.fire({
      icon: 'success',
      title: 'Categoria Creada',
      showConfirmButton: false,
      timer: 1500
    })

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


        const formData = {
          Id: BdEdit.value,
          Name: name.value,
          UsrAct: userName,
          FecAct: ObtenerFecha()
        }

        //Aqui Actualizamos en el Backend
        await service.Update({ data: formData, token: token })
        activeChange()
        BdEdit.value = null
        clearFields()
        focusInput()
        operation.value = 'Registrar'
        operationReset.value = 'Limpiar'

        Swal.fire('Actualizado!', '', 'success')
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
      await service.Del({Id:id}, token)
      activeChange()
      Swal.fire({
        icon: "success",
        title: "Eliminado!",
        text: "El registro a sido eliminado",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
}

function editData(id) {
  operation.value = 'Actualizar Datos'
  operationReset.value = 'Cancelar'
  const foundData = Bd.value.filter(data => data.Id == id)
  name.value = foundData[0].Name
  BdEdit.value = id

  focusInput()
}


function clearFields() {
  name.value = ''
  BdEdit.value = null
  operation.value = 'Registrar'
  operationReset.value = 'Limpiar'
  focusInput()

}

watch(changeData, async () => {

try {

    await listTable();

} catch (error) {
    console.error("Error initializing list:", error);
}
}, { deep: true });

</script>

<template>




  <div class="card m-1">
    <div class="card-header py-3">
      <h5 class="mb-1">Categoria de Evaluaciones</h5>
    </div>

    <div class="card-body">
      <form v-on:submit.prevent="addData">

        <!-- Text input -->
        <div class="form-outline mb-4">
          <input type="text" id="name" ref="myInput" required v-model="name" class="form-control form-control" />
          <label class="form-label" for="name">Nombre de la categoria*</label>
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
