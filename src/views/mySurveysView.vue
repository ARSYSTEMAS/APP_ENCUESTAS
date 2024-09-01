<script setup>
import { ref, onMounted, watch, computed, defineAsyncComponent } from 'vue';
import obtenerCookiesUsuario from '../function/cookies'
//import DataTable from '../components/dataTable/DataTableListSurvey.vue'
import ServiceEncuestas from '../services/Survey'
import ServiceQuestion from '../services/Questions'
import ServiceAnswerOptions from '../services/AnswerOptions'
import Swal from "sweetalert2"
import ObtenerFecha from '../function/ObtenerFecha';
import Spinner from '../components/Spinner.vue'
import AuthService from "../services/AuthServices"
import validatePropertyAndValue from '../function/validateAndValue'
import ServiceResponse from '../services/Response'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import verifySurveyData from '@/composables/verifySurveyData';
import notify from '@/composables/notify';
import ServiceQuestionBranches from '@/services/QuestionBranches'
import { useRoute } from 'vue-router'
import Loader from '@/components/Loader.vue'
import Evaluations from '@/services/Evaluations'
import Multiselect from 'vue-multiselect'


const DataTable = defineAsyncComponent(() =>
    import('../components/dataTable/DataTableListSurvey.vue')
)

const service_question_branches = new ServiceQuestionBranches()

const service_response = new ServiceResponse()
const bd_service_response = service_response.getFuentesData()

const service_question = new ServiceQuestion()
const service_answer = new ServiceAnswerOptions()

const service = new ServiceEncuestas()
const Bd = service.getFuentesData()

const service_evaluations = new Evaluations()
const bd_service_evaluations = service_evaluations.getFuentesData()

const change = ref(false)
const changeData = computed(() => change.value)

const _columns = service.getFuentesColumn()

const service_user = new AuthService()
const bd_user = service_user.getFuentesData()

const route = useRoute()

const currentRouteId = ref(+route.params.id);

const type = computed(() => currentRouteId.value)

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

let loading = ref(true)

let nameSurvey = ref('')
let idCategory = ref('')
let inheadedSurvey = ref('')

let operation = ref()
let buttonClass = ref('');
//let isCategoryRequire = ref('');

const TYPE_OPERATION = [
    { index: 1, name: 'encuesta o formulario', clase: 'btn-primary' },
    { index: 2, name: 'evaluación', clase: 'btn-primary' }
]

const TYPE_EVALUATION = 'evaluacion'
const TYPE_SURVEY = 'encuesta-formulario'

const operationReset = ref('Cancelar')
const isNewSurvey = ref(true);
const company = ref('')
const department = ref('')
const BdEdit = ref(null)  //identifica el reg a actualizar
const numberOfCharacters = ref(50)
const numberOfCharactersHeaded = ref(250)
const ismovil = ref(false)
const myInput = ref(null);

onMounted(async () => {

    updateOperation(currentRouteId.value);

    try {

        await service_user.GetDataUser(userName)

        company.value = bd_user.value[0]?.IdCompany
        department.value = bd_user.value[0]?.IdDepartments

        surveyListInit()

        await service_evaluations.all(token)

    } catch (error) {

        console.error(error)

    }



})

const activeChange = () => change.value = !change.value;
const focusInput = () => myInput.value.focus();

watch(
    () => +route.params.id,
    (currentIdRoute) => {
        currentRouteId.value = currentIdRoute;
        surveyListInit()
        updateOperation(currentIdRoute);
    }, { deep: true });




watch(changeData, async () => {

    try {
        await surveyListInit();

    } catch (error) {
        console.error("Error initializing survey list:", error);
    }
}, { deep: true });



const updateOperation = (id) => {
    const result = TYPE_OPERATION.find(operation => operation.index === id);
    if (result) {
        operation.value = `Nueva ${result.name}`;
        buttonClass.value = result.clase;

    } else {
        operation.value = operation.value;
        buttonClass.value = 'btn-warning';

    }
};

async function surveyListInit() {

    try {
        const where = {
            IdCompany: company.value,
            IdDepartments: department.value,
            Type: type.value === 2 ? TYPE_EVALUATION : TYPE_SURVEY
        }

        company.value === 'all' ? delete where.IdCompany : null
        department.value === 'all' ? delete where.IdDepartments : null

        await service.unique({ params: where, token: token }) // obtengo las encuestas por filtro de empresa y departamento asociado al usuario

    } catch (error) {
        console.error(error)
    }

}
async function addSurvey() {

    try {

        isNewSurvey.value = !isNewSurvey.value;
        operation.value = currentRouteId.value === 1 ? 'Crear encuesta o formulario' : 'Crear evaluacion';
        updateOperation(0)

        if (isNewSurvey.value && nameSurvey) {


            if (BdEdit.value == null) {
                //    AQUI CODIGO DE GUARDAR EL NOMBRE DE LA ENCUESTA

                const data = {

                    Nombre: nameSurvey.value.toUpperCase(),
                    IdCompany: company.value,
                    IdDepartments: department.value,
                    Encabezado: inheadedSurvey.value,
                    IdCategory_evaluations: idCategory?.value.Id,
                    Estado: 0,
                    UsrCrea: userName.toUpperCase(),
                }

                currentRouteId.value === 2 ? data.Type = TYPE_EVALUATION : null

                data.Nombre ? await service.add({ data: data, token: token }) : updateOperation(currentRouteId.value) // Actualiza tabla nom_encuestas
                //  nameSurvey.value = ''
                //   inheadedSurvey.value = ''
                activeChange()
                clearFields()
            } else {

                Swal.fire({
                    title: '¿Quieres actualizar los cambios?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Actualizar',
                    denyButtonText: `No Actualizar`,
                }).then(async (result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {

                        const data = {
                            Id: BdEdit.value,
                            Nombre: nameSurvey.value.toUpperCase(),
                            Encabezado: inheadedSurvey.value,
                            IdCategory_evaluations: idCategory.value.Id,
                            UsrAct: userName.toUpperCase(),
                            FecAct: ObtenerFecha()
                        }

                        await service.Update({ data: data, token: token })  // Actualiza tabla nom_encuestas

                        toast.success("Datos actualizados!", {
                            position: toast.POSITION.BOTTOM_CENTER,
                            autoClose: 2000,
                            theme:'dark'
                            
                        });

                        activeChange()
                        clearFields()

                    }
                })

            }

            updateOperation(currentRouteId.value)

        }


    } catch (error) {
        console.error(error)
    }


}


function editData(id) {

    operation.value = 'Actualizar Datos'
    const foundData = Bd.value.filter(data => data.Id == id)
    const foundDataEvaluation = bd_service_evaluations.value.find(data => data.Id == foundData[0].IdCategory_evaluations)

    if (foundDataEvaluation) {
        idCategory.value = foundDataEvaluation
    }

    nameSurvey.value = foundData[0].Nombre
    inheadedSurvey.value = foundData[0].Encabezado
    BdEdit.value = id
    isNewSurvey.value = false

    focusInput()
}

async function deleteData(id) {

    try {

        const isResponse = await verifySurveyData(id)
        const message = 'No se puede eliminar la encuesta/formulario, ya esta siendo respondida'
        if (isResponse) {

            notify(message)

            return
        }


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

                const where = {
                    IdEncuesta: id
                }

                if (validatePropertyAndValue(where, 'IdEncuesta')) {
                    await service_question_branches.del({ params: where, token: token }) // ramas de la encuesta
                    await service_answer.del({ params: where, token: token }) // opciones de respuesta
                    await service_question.del({ params: where, token: token }) // preguntas de la encuesta
                    await service.del(id, token) //eliminamos la encuesta
                    activeChange()
                } else {

                    toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                        transition: toast.TRANSITIONS.SLIDE,
                        autoClose: 2000,
                        theme: 'dark',
                    });
                }
            }
        });

    } catch (error) {
        console.error(error)
    }


}

function clearFields() {

    isNewSurvey.value = true
    nameSurvey.value = ''
    inheadedSurvey.value = ''
    idCategory.value = ''
    BdEdit.value = null
    updateOperation(currentRouteId.value);
    operationReset.value = 'Cancelar'
    BdEdit.value = null
    focusInput()
}

// let navegador = navigator.userAgent;
//         if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
//            ismovil.value = true
//         } else {
//             ismovil.value = false
//         }
</script>

<template>
    <div>
        <form id="msform" v-on:submit.prevent="addSurvey" class="row g-3 mt-5">

            <div class="col-sm-6" :hidden="isNewSurvey">
                <input class="input-box" type="text" :maxlength="numberOfCharacters" v-model="nameSurvey"
                    id="nameSurvey" placeholder="Nombra tu encuesta o formulario" ref="myInput">
                <span class="underline"></span>
                <span>{{ nameSurvey.length }} / {{ numberOfCharacters }}</span>
            </div>

            <div class="col-sm-6" :hidden="isNewSurvey">
                <input class="input-box" type="text" :maxlength="numberOfCharactersHeaded" v-model="inheadedSurvey"
                    id="inheadedSurvey" placeholder="Detalla el encabezado de la encuesta">
                <span class="underline"></span>
                <span>{{ inheadedSurvey.length }} / {{ numberOfCharactersHeaded }}</span>
            </div>

            <!-- <div class="position-relative" :hidden="isNewSurvey">
                <select  v-model="idCategory">
                    <option value=''>Seleccione una categoria de evaluación</option>
                    <option v-for="option in bd_service_evaluations" :key="option.Id" :value="option.Id">
                        {{ option.Name }}</option>
                </select>
            </div> -->

            <div v-if="type === 2" class="position-relative" :hidden="isNewSurvey">
                <label class="typo__label">Seleccione una categoria de evaluación</label>
                <multiselect v-model="idCategory" deselect-label="Can't remove this value" track-by="Id" label="Name"
                    placeholder="Select one" :options="bd_service_evaluations" :searchable="false" :allow-empty="false">
                    <template slot="singleLabel" slot-scope="{ option }"><strong>{{ Name }}</strong> is written
                        in<strong>
                            {{ Name }}</strong></template>
                </multiselect>
                <!-- <pre class="language-json"><code>{{ idCategory.Id }}</code></pre> -->
            </div>


            <div class="col-auto">
                <button type="submit" :class="['btn', buttonClass]"><i class="fa-solid fa-plus"></i> {{ operation
                    }}</button>
            </div>

            <div class="col-auto">
                <input type="button" @click="clearFields" class="btn btn-danger" v-bind:value="operationReset" />
            </div>
        </form>


    </div>


    <div>
        <!-- AQUI LA LISTA DE ENCUESTAS CREADAS -->
        <Suspense>
            <DataTable :items="Bd" :columns="_columns" :ismovil=ismovil @sayUpdate="editData" @sayDelete="deleteData"
                @sayChange="activeChange" />
            <!-- loading state via #fallback slot -->
            <template #fallback>
                <Loader />
            </template>
        </Suspense>
    </div>
</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style scoped>
.input-wrapper {
    position: relative;
    width: 200px;
    margin: 50px auto;
}

.input-box {
    font-size: 16px;
    padding: 10px 0;
    border: none;
    border-bottom: 2px solid #198754;
    color: #212529;
    width: 100%;
    background-color: transparent;
    transition: border-color 0.3s ease-in-out;
}

.underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #08AEEA;
    transform: scaleX(0);
    transition: transform 0.3s ease-in-out;
}

.input-box:focus {
    border-color: #08AEEA;
    outline: none;
}

.input-box:focus+.underline {
    transform: scaleX(1);
}

select {
    display: block;
    width: 100%;
    height: calc(1.5em + .75rem + 2px);
    padding: .375rem .75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: none;
    border-bottom: 1px solid #ced4da;
    border-radius: 0;
    display: inline;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

select:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, .25);
}
</style>
