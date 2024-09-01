<script setup>
import { defineAsyncComponent } from 'vue'
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import ToolBox from '../components/ToolBox.vue';
import ServiceSurvey from '../services/Survey'
import ServiceQuestion from '../services/Questions'
import obtenerCookiesUsuario from '../function/cookies'
import { toast } from 'vue3-toastify';
import Spinner from '../components/Spinner.vue'
import Entorno from '../function/entorno'
import { useClipboard, useDark, useToggle } from '@vueuse/core';


const QuestionChoice = defineAsyncComponent(() => 
import ('../components/multiple_choice/QuestionChoice.vue')
)

const EditQuestionChoice = defineAsyncComponent(() => 
import ('../components/multiple_choice/EditQuestionChoice.vue')
)

const LibraryQuestions = defineAsyncComponent(() => 
import ('../components/ListQuestionLibrary.vue')
)

const ToolSurvey = defineAsyncComponent(() => 
import ('@/components/ToolSurvey.vue')
)


const { RUTA_LINK } = Entorno();

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_survey = new ServiceSurvey()
const bdsurvey = service_survey.getFuentesData()

const urlDefault = "/img/multiple_choice/"

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const showAgain =  $cookies.get('co-nsa-DkE')
const notShow = showAgain?.show

const route = useRoute()
const router = useRouter()

const idSurvey = ref() // id de la encuesta creada
idSurvey.value = +route.params.id //con + convierto de string a number

const itemSelectOne = ref([])
const typeQuestion  = ref()

const url = ref('')

const isActivePanel = ref(false);
const modalButton = ref() 
const modalAddQuestionLibrary = ref()
let loading = ref(true)

const linkSurvey = ref(RUTA_LINK)



const indexQuestionOrder = ref(0)

onMounted(async () => {

    try {
        const where = {
        Id: idSurvey.value
    }

    const whereQuestion = {
        IdEncuesta: idSurvey.value
    }
 
    await service_survey.unique({ params: where, token: token }) // obtengo el nombre de la encuesta
    await service_question.unique({ params: whereQuestion, token: token }) // obtengo las preguntas de la encuesta
    
    bdsurvey.value[0].UrlSurvey ? linkSurvey.value = linkSurvey.value+bdsurvey.value[0].UrlSurvey : null

    const questionWord = bd_service_question.value.length > 1 ? 'items ' : 'item '
    const info = `Esta encuesta tiene ${bd_service_question.value.length} ${questionWord}`

    toast.info(info, {
    position: toast.POSITION.BOTTOM_CENTER,
    theme: 'dark',
    autoClose: 2000,
  });
  loading.value = false
    } catch (error) {
        console.error(error)
    }

 //   activePanel() //inicializamos el componente con la caja de herramienta abierta
    
   
})

const activePanel = () => isActivePanel.value = !isActivePanel.value;


const addQuestion = (namearchive, typequestion) => {

    if(namearchive === null && typequestion === 9){

        addQuestionLibrary()
        return 
    }

    typeQuestion.value = +typequestion

    url.value = namearchive

    !notShow ? ButtonModal() : null

    handleIndexQuestion()
    itemSelectOne.value.push({ show: true, typeQuestion: typeQuestion.value });

    activePanel()
}


function deleteQuestion(index) {

    itemSelectOne.value[index].show = false

}

function back() {

    router.go(-1)

}


function ButtonModal(){

const event = new MouseEvent('click', {
  view: window,
  bubbles: true,
  cancelable: true
})

modalButton.value.dispatchEvent(event)
}

function notShowAgain(){

       //////////cookies no volver a mostrar mensaje//////////
       $cookies.set('co-nsa-DkE', { show: true })
//       Refresh()
}

function Refresh(){

setTimeout(() => {
  window.location.reload()
}, "2000");


}

function copyToClipboard() {
    
    const {text, copy, copied, isSupported } = useClipboard();

    copy(linkSurvey.value)

    toast.info("Link de la ruta copiado al portapapeles", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                        transition: toast.TRANSITIONS.SLIDE,
                        autoClose: 2000,
                        theme: 'dark',
                    });

    const isDark = useDark() 

    console.log(isDark.value)

    }

const changeType = async  () => {

    
    var status 

    if(bdsurvey.value[0].TypeSurvey == 'H'){
        status = 'V'
    }

    if(bdsurvey.value[0].TypeSurvey == 'V'){
        status = 'H'
    }
    const data = {
        Id: bdsurvey.value[0].Id,
        TypeSurvey: status
    }
    await service_survey.Update({data:data, token:token})
    window.location.reload()
}

const changeShowResultsEnd = async () => {


var status

if (bdsurvey.value[0].ShowResultsEnd) {
    status = false
}

if (!bdsurvey.value[0].ShowResultsEnd) {
    status = true
}

const data = {
    Id: bdsurvey.value[0].Id,
    ShowResultsEnd: status
}
await service_survey.Update({ data: data, token: token })
window.location.reload()
}


function addQuestionLibrary(){

    activePanel()

    const event = new MouseEvent('click', {
  view: window,
  bubbles: true,
  cancelable: true
})

modalAddQuestionLibrary.value.dispatchEvent(event)
}

function viewLibrary(){

    router.push({ name: 'library', params: { id:idSurvey.value } });
}

function viewLibraryImages(){

    console.log('ver imagenes')
//router.push({ name: 'libraryImages', params: { id:idSurvey.value } });
}

function viewOrderQuestions(){

    router.push({ name: 'OrderQuestions', params: { id:idSurvey.value } });

}

async function handleIndexQuestion(){

    try {
        const where = {
        IdEncuesta: idSurvey.value
    }

    const service_question_length = new ServiceQuestion()

    await service_question_length.unique({ params: where, token: token })
    const bd_service_question = service_question_length.getFuentesData()
    const numQuestion = bd_service_question.value.length

    const maxOrderBy = bd_service_question.value.reduce((max, item) => item.OrderBy > max ? item?.OrderBy : max, bd_service_question.value[0]?.OrderBy);

    indexQuestionOrder.value = maxOrderBy > 0 ? maxOrderBy : numQuestion
    } catch (error) {
        console.error(error)
    }
   

}



</script>

<template>

        <ToolSurvey v-if="bdsurvey[0]?.TypeSurvey"
            :viewMode="bdsurvey[0]?.TypeSurvey"
            :showResultsEnd=Boolean(bdsurvey[0]?.ShowResultsEnd)
            :nameSurvey="bdsurvey[0]?.Nombre" 
            :nameHeader="bdsurvey[0]?.Encabezado"
            :isSurvey=true
            :istools=true
            :isAnalisis=true 
            @goBack="back"
            @reviewMode="changeType"
            @showResultsEnd="changeShowResultsEnd"
            @library="viewLibrary"
            @libraryImages="viewLibraryImages"
            @orderQuestions="viewOrderQuestions"
            @itemSelectOne=addQuestion
        />

<div id="container">

<div v-if="loading"> <Spinner /></div>

    <div class="wave-group mb-2 mt-3">
            <input class="input" type="text" :value=linkSurvey @click="copyToClipboard"/>
            <span class="bar"></span>
            <label class="label">
                <span class="label-char" >Link de la encuesta o formulario</span>
            </label>
    </div>

    <div>

  
            <!-- AQUI COMPONENTE PARA EDITAR LAS PREGUNTAS -->
            <div>
                <Suspense>
                    <EditQuestionChoice 
                    :idSurvey=idSurvey 
                    />
                    <!-- loading state via #fallback slot -->
                    <template #fallback>
                        Loading...
                    </template>
                </Suspense>
            </div>

                  <!-- AQUI LOS COMPONENTES PARA AGREGAR LAS PREGUNTAS -->
                  <div v-for="(question, index) in itemSelectOne" :key="index">
                <Suspense>
          
                    <QuestionChoice v-if="question.show"
                    :key=index
                    :index = index
                    :indexQuestion=indexQuestionOrder
                    :idSurvey=idSurvey
                    :typeQuestion=question.typeQuestion 
                    @deleteItem="deleteQuestion" />
                    <!-- loading state via #fallback slot -->
                    <template #fallback>
                    Loading...
                    </template>
                </Suspense>

                </div>

        <!-- FIN DE COMPONENTES DE TIPOS DE PREGUNTAS -->



        <!-- BOTON PARA ABRIR CAJA DE HERRAMIENTAS  -->
        <div :class="['fixed-plugin', isActivePanel ? 'fixed-plugin show' : null]">

            <a class="fixed-plugin-button text-dark position-fixed px-3 py-2" @click="activePanel">
                <i class="fa-solid fa-gear"></i>
            </a>


            <!-- CAJA DE HERRAMIENTA -->
            <ToolBox @isActivePanel=activePanel @itemSelectOne=addQuestion />


        </div>



    </div>


    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" ref="modalButton" hidden="true" data-bs-toggle="modal"
        data-bs-target="#exampleModal">
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <!-- IMAGEN REFENCIAL DE COMO DEBE SER LA PREGUNTA(AYUDA AL USUARIO) -->
                    <img :src=urlDefault+url alt="...">
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-primary btn-sm" @click="notShowAgain"
                        data-bs-dismiss="modal"><i class="fa-solid fa-eye-slash"></i> No volver a mostrar</button>  -->
                </div>
            </div>
        </div>
    </div>
    <!-- Modal -->


    <!-- Button AddQuestionLibrary modal -->
    <button type="button" class="btn btn-primary" ref="modalAddQuestionLibrary" hidden="true" data-bs-toggle="modal"
        data-bs-target="#ModalLibraryQuestion">
    </button>

    <div class="modal fade" id="ModalLibraryQuestion" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Listado de preguntas</h5>
                    <button type="button" @click="resetLogicQuestion" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body" style="overflow-y: auto; max-height: 400px;">

                    <!-- aqui componente donde se va mostrar las preguntas guardadas en la libreria -->
                    <LibraryQuestions 
                    :idSurvey=idSurvey 
                    />


                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="resetLogicQuestion"
                        data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>


<style scoped>

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.fixed-plugin .fixed-plugin-button {
    background: #fff;
    border-radius: 50%;
    bottom: 30px;
    right: 30px;
    font-size: 1.25rem;
    z-index: 990;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.16);
    cursor: pointer;
}

.fixed-plugin .fixed-plugin-button i {
    pointer-events: none;
}

.fixed-plugin .card {
    position: fixed !important;
    right: -360px;
    top: 0;
    height: 100%;
    left: auto !important;
    transform: unset !important;
    width: 360px;
    border-radius: 0;
    padding: 0 10px;
    transition: .2s ease;
    z-index: 1020;
}

.fixed-plugin .badge {
    border: 1px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    display: inline-block;
    height: 23px;
    margin-right: 5px;
    position: relative;
    width: 23px;
    transition: all 0.2s ease-in-out;
}

.fixed-plugin .badge:hover,
.fixed-plugin .badge.active {
    border-color: #344767;
}

.fixed-plugin .btn.bg-gradient-dark:not(:disabled):not(.disabled) {
    border: 1px solid transparent;
}

.fixed-plugin .btn.bg-gradient-dark:not(:disabled):not(.disabled):not(.active) {
    background-color: transparent;
    background-image: none;
    border: 1px solid #344767;
    color: #344767;
}

.fixed-plugin.show .card {
    right: 0;
}

.question-break-wrapper {
    width: 60%;
    display: inline-block;
    margin: 0 0 5px;
    position: relative;
    text-align: center;
    vertical-align: top
}

.wave-group {
  position: relative;
}

.wave-group .input {
  font-size: 16px;
  padding: 10px 10px 10px 5px;
  display: block;
  width: 100%;
  border: none;
  border-bottom: 1px solid #515151;
  background: transparent;
}

.wave-group .input:focus {
  outline: none;
}

.wave-group .label {
  color: #999;
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  display: flex;
}



.wave-group .input:focus ~ label .label-char,
.wave-group .input:valid ~ label .label-char {
  transform: translateY(-20px);
  font-size: 14px;
  color: #5264AE;
}


.wave-group .bar:before,.wave-group .bar:after {
  content: '';
  height: 2px;
  width: 0;
  bottom: 1px;
  position: absolute;
  background: #143E8F;
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;
}

.wave-group .bar:before {
  left: 50%;
}

.wave-group .bar:after {
  right: 50%;
}

.wave-group .input:focus ~ .bar:before,
.wave-group .input:focus ~ .bar:after {
  width: 50%;
}


</style>