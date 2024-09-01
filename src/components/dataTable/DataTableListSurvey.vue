<script setup>

import { computed, defineProps, ref } from 'vue';
import SearchForm from './SearchForm.vue';
import ServiceEncuestas from '../../services/Survey'
import ServiceQuestion from '../../services/Questions'
import obtenerCookiesUsuario from '../../function/cookies'
import ObtenerFecha from '../../function/ObtenerFecha';
import generateUuid from 'generate-uuid';
import { toast } from 'vue3-toastify';
import FormatearFecha from '../../function/FormatearFecha'


const service_question = new ServiceQuestion()

const service = new ServiceEncuestas()

const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const searchFilter = ref('')
const radioFilter = ref('')
const statusFilter = ref([])



const props = defineProps({
    items: {
        type: Array,
        required: true
    },

    columns: {
        type: Array,
        required: true
    },

})


function handleSearch(search) {

    searchFilter.value = search

}

function handleFilterRadios(filter) {

    radioFilter.value = filter

}

function handleFilterStatus(status) {

    if (statusFilter.value.includes(status)) {


        return statusFilter.value.splice(statusFilter.value.indexOf(status), 1);
    }

    return statusFilter.value.push(status)
}

const filteredItems = computed(() => {

    let items = props.items;

    switch (radioFilter.value) {

        case "today":

            items = items.filter(item => new Date(item.updated_at).getDate() === new Date().getDate());

            break;


        case "past":

            items = items.filter(item => new Date(item.updated_at).getDate() < new Date().getDate());

            break;
    }


    if (statusFilter.value.length) {

        items = items.filter(item => statusFilter.value.includes(item.status));
    }

    if (searchFilter.value != '') {

        // FILTROS DE BUSQUEDAS

        items = items.filter(item =>
            item.Id == searchFilter?.value ||
            item.Nombre.toUpperCase().includes(searchFilter.value?.toUpperCase()) ||
            item.UsrCrea.toUpperCase().includes(searchFilter.value?.toUpperCase())
        );


    }

    return items;

})

const emit = defineEmits(['sayDelete', 'sayUpdate','sayChange'])

function buttonDelete(dataField) {
    emit("sayDelete", dataField)

}

function buttonUpdate(dataField) {
    emit("sayUpdate", dataField)

}

async function updateEstate(id, value) {


    const data = {
        Id: id,
        Estado: value,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

   await service.Update({data:data, token:token})

   emit("sayChange")
}

async function generateLink(id) {

    //Generamos un id unico para la encuesta
   // const generateLink = generateUuid(); //Generamos un Id unico
    const generateLink = Date.now() //Generamos un Id unico mas corto

    toast.success('Link de la ruta generada', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: 3000,
        theme:'dark'
    });


    const data = {
        Id: id,
        UrlSurvey: generateLink,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    await service.Update({data:data,token:token})
    emit("sayChange")
}

</script>


<template>

    <div v-if="items.length > 0" class="card my-4 p-3">
        <div class="container">

            <div class="row">

                <div class="d-grid gap-2 d-md-flex justify-content-md-end">

                    <SearchForm @search="handleSearch" />
                </div>

            </div>

        </div>
        <div class="table-responsive">
            <table id="myTable" class="table align-middle table-striped  mt-1">
                <thead>
                    <tr>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Id</th>
                        <th class="text-uppercase text-start text-xxs fw-bold">Nombre</th>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Creado por</th>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Fecha</th>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Actualizado por</th>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Fecha actualizado</th>
                        <th  class="text-uppercase text-start text-xxs fw-bold">Departamento</th>
                        <th class="text-uppercase text-start text-xxs fw-bold">Estado </th>
                        <th class="text-uppercase text-start text-xxs fw-bold">
                        </th>
                        <th class="text-uppercase text-start text-xxs fw-bold">
                        </th>
                        <th class="text-uppercase text-start text-xxs fw-bold">
                        </th>
                    </tr>
                </thead>
                <tbody>

                    <tr v-for=" row in filteredItems" :key="row.Id">
                        <td  class="text-uppercase text-xs text-start"> {{ row.Id }} </td>
                        <td class="text-uppercase text-xs text-start tooltip-container" style="cursor: pointer;">
                            <router-link :to="{ name: 'createSurvey', params: { id: row.Id } }"
                                :class="{ 'text-uppercase text-xs': row.Id >= 0 }">
                                {{ row.Id > 0 ? row.Nombre : '' }}
                            </router-link>
                            <span class="tooltip">{{ row.Respuestas ? row.Respuestas : 0 }} Respuestas</span>
                        </td>
                        <td class="text-start text-uppercase text-start text-xs"> {{ row.UsrCrea }} </td>
                        <td class="text-uppercase text-xs text-start"> {{ FormatearFecha(row.FecCrea) }} </td>
                        <td class="text-uppercase text-xs text-start"> {{ row.UsrAct }} </td>
                        <td class="text-uppercase text-xs text-start"> {{ FormatearFecha(row.FecAct) }} </td>
                        <td class="text-uppercase text-xs text-start"> {{ row.IdDepartments }} </td>
                        <td class="text-uppercase text-xs text-start">


                            <div v-if="row.Id > 0" class="dropdown">
                                <button title="Activar o cerrar encuesta"
                                    :class="{ 'btn btn-success dropdown-toggle btn-sm text-light': row.Estado === 1, 'btn btn-warning dropdown-toggle btn-sm text-light': row.Estado === 0 }"
                                    type="button" id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
                                    {{ row.Estado == 1 ? 'Activo' : 'Cerrado' }}
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenu2">
                                    <li v-if="row.Estado == 0"><button class="dropdown-item"
                                            @click="updateEstate(row.Id, 1)" type="button">Activo</button></li>
                                    <li v-if="row.Estado == 1"><button class="dropdown-item"
                                            @click="updateEstate(row.Id, 0)" type="button">Cerrado</button></li>
                                </ul>
                            </div>



                        </td>

                        <td v-if="row.Id > 0" class="justify-content-md-end">
                         
                                <button class='btn btn-danger btn-circle' @click="buttonDelete(row?.Id)">
                                    <i class="fa-solid fa-trash" style="font-size:15px;" title="Eliminar Encuesta"></i>
                                </button>
                        </td>    
                            
                        <td v-if="row.Id > 0" class="justify-content-md-end">
                                <button class='btn btn-primary btn-circle' @click="buttonUpdate(row?.Id)">
                                    <i class="fa-solid fa-pen-to-square" style="font-size:15px;"
                                        title="Actualizar Encuesta"></i></button>
                        </td>    

                        <td v-if="row.Id > 0" class="justify-content-center"> 
                                <button v-if="!row.UrlSurvey" class='btn btn-secondary btn-circle' @click="generateLink(row?.Id)">
                                    <i class="fa-solid fa-link" style="font-size:15px;" title="Generar Link"></i>
                                </button>
                         
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>

</template>

<style scoped>
.tooltip-container {
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
}

.tooltip {
    position: absolute;
    top: 0;
    left: 30%;
    transform: translateX(-50%);
    padding: 0.3em 0.6em;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
    background: #212529;
    color: aliceblue;
    border-radius: 5px;
    width: 10em;
    text-align: center;
}

.tooltip::before {
    position: absolute;
    content: "";
    height: 0.6em;
    width: 0.6em;
    bottom: -0.2em;
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    background: aliceblue;
    ;
}

.tooltip-container:hover .tooltip {
    top: -50%;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    animation: shake 500ms ease-in-out forwards;
}

.tooltip-container:hover .text::before {
    top: 0;
}

.text-xxs {
    font-size: 11px;
    text-justify: auto;
}

.text-xs {
    font-size: 12px;
}




</style>
