<script setup>
import { computed, defineProps, ref, onMounted } from 'vue';
import obtenerCookiesUsuario from '@/function/cookies'
import SearchForm from './SearchForm.vue';
import Multiselect from 'vue-multiselect'
import AuthService from "@/services/AuthServices"
import ServiceLibraryQuestions from '@/services/LibraryQuestions'
import ServiceLibraryAnswers from '@/services/LibraryAnswers'
import { toast } from 'vue3-toastify';
import generateUuid from 'generate-uuid';

const service_users = new AuthService()
const bd_service_users = service_users.getFuentesData()

const service_library_question = new ServiceLibraryQuestions()

const service_library_answer = new ServiceLibraryAnswers()
const bd_service_library_answer = service_library_answer.getFuentesData()


const userName = obtenerCookiesUsuario().userName
const department = obtenerCookiesUsuario().department
const rol = obtenerCookiesUsuario().rol
const token = obtenerCookiesUsuario().token

//import FilterRadios from './FilterRadios.vue';
//import FilterDropDown from './FilterDropDown.vue';

const value = ref([])
const options = ref([])
const questionExport = ref()

const searchFilter = ref('')
const radioFilter = ref('')
const statusFilter = ref([])

const emit = defineEmits(['sayDelete', 'sayUpdate'])

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

onMounted(async () => {

    await service_users.all(token)


    options.value = bd_service_users.value

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
    // SI TIENE ROL ADMINISTRADOR NO APLICA EL FILTRO 
    if (!rol) items = items.filter(data => data.IdDepartments === department)

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


        items = items.filter(item =>
            item.Id == searchFilter.value ||
            item.TextoPregunta.toUpperCase().includes(searchFilter.value.toUpperCase()) ||
            item.UsrCrea.toUpperCase().includes(searchFilter.value.toUpperCase())
        );
    }

    return items;

})



function buttonDelete(dataField) {
    emit("sayDelete", dataField)

}

function buttonUpdate(dataField) {
    emit("sayUpdate", dataField)

}

function showModalExport(question) {

    questionExport.value = question

    value.value = []
}

async function exportQuestion() {

    const where = {
        IdQuestion: questionExport.value.IdQuestion
    }

    // BUSCO LAS OPCIONES DE ESA PREGUNTA
    await service_library_answer.unique({ params: where, token: token })

    toast.loading("Guardando, por favor espere...", {
                position: toast.POSITION.BOTTOM_CENTER,
                transition: toast.TRANSITIONS.SLIDE,
                theme: 'dark',
            });

    try {
        //Insertamos la cabezera para los usuarios seleccionados
        for (const element of value.value) {

            const IdQuestion = generateUuid();

            const dataLibraryQuestion = {
                IdQuestion: IdQuestion,
                TextoPregunta: questionExport.value.TextoPregunta,
                IdTipreg: questionExport.value.IdTipreg,
                IdDepartments: element.IdDepartments,
                UsrCrea: userName.toUpperCase()
            }

     

            // REALIZO LA INSERCION DE LA CABEZERA
            await service_library_question.add({ data: dataLibraryQuestion, token: token })

      
            // ALMACENO LAS OPCIONES QUE TIENE LA PREGUNTA
            for (const item of bd_service_library_answer.value) {

                const dataLibraryAnswer = {
                    IdQuestion: IdQuestion,
                    TextoRespuesta: item.TextoRespuesta,
                    IndexTarget: item.IndexTarget,
                    UsrCrea: userName.toUpperCase()
                }

                await service_library_answer.add({ data: dataLibraryAnswer, token: token })
            }
        }
    } catch (error) {
        console.error("Error al realizar la exportación de pregunta a la biblioteca:", error);
    }

    toast.clearAll();
    window.location.reload()
}


</script>


<template>
    <div v-if="items?.length > 0" class="card my-4 p-3 mt-5">
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
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                            v-for="column in columns" :key="column">{{ column }}</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder text-center opacity-7">
                            <span>Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in filteredItems" :key="index">
                        <td class="text-uppercase text-xs" v-for="column in columns" :key="column">{{ row[column] }}
                        </td>

                        <td class="d-grid gap-2 d-md-flex justify-content-md-end">

                            <button class='btn btn-danger btn-circle' title="Eliminar Pregunta" @click="buttonDelete(row?.IdQuestion)">
                                <i class="fa-solid fa-trash" style="font-size:15px;"></i>
                            </button>

                            <button class='btn btn-primary btn-circle' title="Actualizar Pregunta" @click="buttonUpdate(row?.IdQuestion)">
                                <i class="fa-solid fa-pen-to-square" style="font-size:15px;"></i></button>

                            <button v-if="rol" data-bs-toggle="modal" data-bs-target="#exportquestion"
                                class='btn btn-warning btn-circle' title="Exporta Pregunta" @click="showModalExport(row)">
                                <i class="fa-solid fa-file-import" style="font-size:15px;"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="exportquestion" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Exportar preguntas</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                    <div><label class="typo__label">Listado de Usuarios</label>
                        <multiselect v-model="value" tag-placeholder="Add this as new tag" placeholder="Buscar usuario"
                            label="Nombre" track-by="Usuario" :options="options" :multiple="true"></multiselect>
                    </div>
                    <!-- <pre class="language-json"><code>{{ value }}</code></pre> -->

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="exportQuestion">Exportar</button>
                </div>
            </div>
        </div>
    </div>


</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style scoped>
.text-xxs {
    font-size: 14px;
}

.text-xs {
    font-size: 12px;
}
</style>
