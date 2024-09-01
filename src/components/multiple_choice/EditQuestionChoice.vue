<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ObtenerFecha from '../../function/ObtenerFecha';
import LoadAnswerOptions from '../../components/multiple_choice/LoadAnswerOptions'
import ServiceQuestion from '../../services/Questions'
import ServiceAnswerOptions from '../../services/AnswerOptions'
import ServiceLibraryQuestions from '../../services/LibraryQuestions'
import ServiceLibraryAnswers from '../../services/LibraryAnswers'
import Swal from "sweetalert2"
import LogicQuestion from '../LogicQuestion'
import { toast } from 'vue3-toastify';
import validatePropertyAndValue from '../../function/validateAndValue'
import ServiceQuestionBranches from '../../services/QuestionBranches'
import verifySurveyQuestion from '@/composables/verifySurveyQuestion';
import notify from '@/composables/notify';
import updateSurveyAudit from '@/composables/updateSurvey';
import Loading from '@/components/Loading.vue'
 
const service_question_branches = new ServiceQuestionBranches()

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const service_library_question = new ServiceLibraryQuestions()
const bd_service_library_question = service_library_question.getFuentesData()

const service_library_answer = new ServiceLibraryAnswers()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token
const department = obtenerCookiesUsuario().department

const numQuestion = ref(0)

const requiredQuestions = ref()

const addLogicQuestion = ref()

const addLogicJumpQuestion = ref()

const addLogicIdJumpQuestion = ref()

const showNav = ref(false)

const defaultScore = ref([1, 2, 3])

const defaultScoreLogica = ref([1, 2])

const isLibrary = ref()

let loader = ref(false)

let loading = ref(false)

const msgNotification = ref(false)

const LISTQUESTIONS = ref([])

const LISTQUESTIONBRANCH = ref([])
//const emits = defineEmits(['indexQuestion']);

const props = defineProps({

    idSurvey: {
        type: Number,
        require: true,
    }// el id de la encuesta 
})


onMounted(async () => {

    try {
        const where = {
        IdEncuesta: props?.idSurvey
    }

    await service_question.unique({ params: where, token: token })

    numQuestion.value = bd_service_question.value.length

    //if(numQuestion.value > 0 ) emits("indexQuestion", numQuestion.value) //Mandamos el index al componente padre

    requiredQuestions.value = bd_service_question.value[0]?.Required

    // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
    LISTQUESTIONS.value = bd_service_question.value.sort((a, b) => a.OrderBy - b.OrderBy);
    } catch (error) {
        console.error(error)
    }
   


})

async function deleteQuestion(id) {
    loading.value = true
    const isResponse = await verifySurveyQuestion(props?.idSurvey,id)//verificar que no existan respuestas para esa pregunta
    const message = 'Esta pregunta, ya tiene respuestas de usuarios. No se puede eliminar'

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
                IdQuestion: id
            }

            if (validatePropertyAndValue(where, 'IdQuestion')) {
                await service_answer.del({ params: where, token: token }) //eliminamos las opciones de respuestas
                await service_question_branches.del({ params: where, token: token }) //eliminamos las ramificaciones
                await service_question.del({ params: where, token: token }) //eliminamos la pregunta
                   ////Actualiza la ultima modificacion que exista en la encuesta//////
                await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
            } else {

                toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: toast.TRANSITIONS.SLIDE,
                    autoClose: 2000,
                    theme: 'dark',
                });
            }
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: "El registro a sido eliminado",
                showConfirmButton: false,
                timer: 1500,
            });

            Refresh()
        }
    });

}

function Refresh() {

    setTimeout(() => {
        window.location.reload()
    }, "1000");


}

async function updateQuestion(e) {

    try {
        const where = {
        IdQuestion: e.IdQuestion,
        IdEncuesta: e.IdEncuesta,
        Id: e.Id
    }

    const data = {
        TextoPregunta: e.TextoPregunta,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    await service_question.update({ data: data, params: where, token: token })

    await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
    } catch (error) {
        console.error(error)
    }
    
}


async function requiredQuestion(e) {

    try {
        loading.value = true
    requiredQuestions.value = !e.Required

    const where = {
        IdQuestion: e.IdQuestion,
        IdEncuesta: e.IdEncuesta
    }

    const data = {
        Required: requiredQuestions.value,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    if (e.IdQuestion) {

        msgNotification.value = true
        msgNotificationDelay()
        await service_question.update({ data: data, params: where, token: token })
        await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
        window.location.reload()
    } else {

        toast.error("Error. Debes crear primero la pregunta", {
            position: toast.POSITION.BOTTOM_RIGHT,
            transition: toast.TRANSITIONS.SLIDE,
            autoClose: 2000,
            theme: 'dark',
        });

    }
    } catch (error) {
        console.error(error)
    }
    


}

function addJumpLogic(idQuestion, id) {

    addLogicJumpQuestion.value = idQuestion
    addLogicIdJumpQuestion.value = id
}

function addLogic(idQuestion) {

    addLogicQuestion.value = idQuestion
}

function resetLogicQuestion() {

    addLogicQuestion.value = null


}

async function resetLogicJumpQuestion() {

    try {
        loading.value = true
    addLogicJumpQuestion.value = null

    for (let key in LISTQUESTIONBRANCH.value) {

        // Obtener las ramas
        let questionJump = LISTQUESTIONBRANCH.value[key];

        for (const element of questionJump) {

            const data = {
                IdEncuesta: element.IdEncuesta,
                RowId: element.RowId,
                IdQuestionJump: element.IdQuestionJump,
                IdQuestion: element.IdQuestion,
                TextoPregunta: element.TextoPregunta,
                IdQuestionAnswer: element.IdQuestionAnswer,
                UsrCrea: userName.toUpperCase()

            }

            element.RowId && element.mode === 'insert' ? await service_question_branches.add({ data: data, token: token }) : null
        };
    }
    await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
    window.location.reload()
    } catch (error) {
        console.error(error)
    }
    
}

async function delQuestionLibrary(e) {

    try {
        loading.value = true
    const where = {
        IdQuestion: e
    }

    if (validatePropertyAndValue(where, 'IdQuestion')) {
        await service_library_answer.del({ params: where, token: token })
        await service_library_question.del({ params: where, token: token })
    } else {

        return toast.error("Ocurrio un error. Actualize e intente nuevamente", {
            position: toast.POSITION.BOTTOM_RIGHT,
            transition: toast.TRANSITIONS.SLIDE,
            autoClose: 2000,
            theme: 'dark',
        });


    }
    // ACTUALIZO EL ITEM PARA INDICAR QUE LA QUESTION NO ESTA EN LA LIBRERIA
    const whereQuestion_forLibrary = {
        IdQuestion: e,
        IdEncuesta: props.idSurvey
    }

    const data = {
        InLibrary: false,
        IdQuestionInLibrary: null,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    msgNotification.value = true
    msgNotificationDelay()
    await service_question.update({ data: data, params: whereQuestion_forLibrary, token: token })
    await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
    window.location.reload()
    } catch (error) {
        console.error(error)
    }
   
}

async function addLibrary(e, inlibrary) {

    loading.value = true
    if (inlibrary) {
        delQuestionLibrary(e)
        return
    }



    const service_question_library = new ServiceQuestion()
    const bd_service_question_library = service_question_library.getFuentesData()

    const service_answer_library = new ServiceAnswerOptions()
    const bd_service_answer_library = service_answer_library.getFuentesData()

    const whereQuestion = {
        IdEncuesta: props?.idSurvey,
        IdQuestion: e
    }

    // BUSCO LA PREGUNTA
    await service_question_library.unique({ params: whereQuestion, token: token })


    const whereAnswers = {
        IdEncuesta: props?.idSurvey,
        IdQuestion: e
    }
    // BUSCO LAS OPCIONES DE ESA PREGUNTA
    await service_answer_library.unique({ params: whereAnswers, token: token })


    // ALMACENO EN UN OBJECTO LOS DATOS QUE NECESITO DE QUESTION

    const dataLibraryQuestion = {
        IdQuestion: e,
        TextoPregunta: bd_service_question_library.value[0].TextoPregunta,
        IdTipreg: bd_service_question_library.value[0].IdTipreg,
        IdDepartments: department,
        UsrCrea: userName.toUpperCase()
    }

    toast.loading("Guardando, por favor espere...", {
        position: toast.POSITION.BOTTOM_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
    });

    // REALIZO LA INSERCION DE QUESTION A LA TABLA LIBRARY
    const response_questionLibrary = await service_library_question.add({ data: dataLibraryQuestion, token: token })

    // ALMACENO EN UN OBJECTO LOS DATOS QUE NECESITO DE ANSWER
    try {

        for (const item of bd_service_answer_library.value) {

            const dataLibraryAnswer = {
                IdQuestion: item.IdQuestion,
                TextoRespuesta: item.TextoRespuesta,
                IndexTarget: item.IndexTarget,
                UsrCrea: userName.toUpperCase()
            }

            const response_answerLibrary = await service_library_answer.add({ data: dataLibraryAnswer, token: token })
        }

        // ACTUALIZO EL ITEM PARA INDICAR QUE LA QUESTION ESTA EN LA LIBRERIA
        const whereQuestion_forLibrary = {
            IdQuestion: e,
            IdEncuesta: props.idSurvey
        }

        const data = {
            InLibrary: true,
            IdQuestionInLibrary: e,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }

        const response_question = await service_question.update({ data: data, params: whereQuestion_forLibrary, token: token })

        toast.clearAll();
        window.location.reload()

    } catch (error) {
        console.error("Error al agregar la pregunta a la biblioteca:", error);
        // Maneja el error según tus necesidades
    }
}

function msgNotificationDelay() {
    if (msgNotification.value) {
        toast.loading("Guardando, por favor espere...", {
            position: toast.POSITION.BOTTOM_CENTER,
            transition: toast.TRANSITIONS.SLIDE,
            theme: 'dark',
        });
    }
}

function QuestionBranch(value) {

    LISTQUESTIONBRANCH.value = value

}

async function showAllOptions(e) {

    try {
        loading.value = true
        const showAllOptions = ! e.ShowAllOptions

        const where = {
            IdQuestion: e.IdQuestion,
            IdEncuesta: e.IdEncuesta
        }

        const data = {
            ShowAllOptions: showAllOptions,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }

        msgNotification.value = true
        msgNotificationDelay()
        await service_question.update({ data: data, params: where, token: token })
        await updateSurveyAudit(props?.idSurvey,userName.toUpperCase(), token , ObtenerFecha())
        window.location.reload()
    } catch (error) {
        console.error(error)
    }

}

</script>


<template>


    <div v-for="item, index in LISTQUESTIONS" :key="index" class="card mt-2 div-question"
        :class="item.IdTipreg === 8 ? 'fondo-encabezado' : null">
        
        <Loading v-if="loading"
        
        />
        <div class="d-grid gap-2 d-md-flex justify-content-md-end">

            <nav class="navbar navbar-expand-lg navbar-light bg-body-tertiary">
                <div class="container-fluid">
                    <ul class="navbar-nav d-flex flex-row">

                        <!-- <li class="dropdown dropstart">  -->
                        <li class="nav-item me-3 me-lg-0 dropdown dropstart" data-bs-toggle="dropdown"
                            aria-expanded="false">

                            <div class=" cursorHtml" :id="'dropdownMenuButton' + item.IdQuestion" style="color: #12408E;">
                                <i class="fa-solid fa-list"></i>
                            </div>


                            <ul class="dropdown-menu" :aria-labelledby="'dropdownMenuButton' + item.IdQuestion">
                                <li>
                                    <!-- BUTTON QUE ELIMINA LA PREGUNTA  --->
                                    <a class="dropdown-item cursorHtml" @click="deleteQuestion(item.IdQuestion)">
                                        <i class="fa-regular fa-trash-can" style="color: brown;"></i>
                                        {{item.IdTipreg === 8 ? 'Eliminar encabezado' : 'Eliminar pregunta' }}</a>
                                </li>

                                <!-- BUTTON QUE COLOCA REQUERIR A LA PREGUNTA  --->
                                <li v-if="item.IdQuestion && item?.IdTipreg != 8">
                                    <a class="dropdown-item cursorHtml" @click="requiredQuestion(item)">
                                        <i class="fa-solid fa-circle-exclamation" style="color: chocolate;"></i>
                                        {{item.Required ? 'No requerir' : 'Requerir pregunta' }}</a>
                                </li>

                                <!-- BUTTON QUE PERMITE COLOCAR PUNTUACIONES  --->
                                <li v-if="defaultScore.includes(item.IdTipreg)">
                                    <!-- BUTTON DE PUNTUACIONES -->
                                    <a class="dropdown-item cursorHtml" :key="props.indexQuestion"
                                        data-bs-toggle="modal"
                                        :data-bs-target="'#ModalLogicQuestion' + props.indexQuestion"
                                        @click="addLogic(item.IdQuestion)">
                                        <i class="fa-solid fa-star" style="color: #FFD43B;"></i>
                                        Asignar
                                        puntaje</a>
                                </li>

                                <!-- BUTTON QUE PERMITE COLOCAR LOGICAS  --->
                                <li v-if="defaultScoreLogica.includes(item.IdTipreg)">
                                    <!-- BUTTON DE LOGICA -->
                                    <a class="dropdown-item cursorHtml" :key="props.indexQuestion"
                                        data-bs-toggle="modal"
                                        :data-bs-target="'#ModalLogicQuestionJump' + props.indexQuestion"
                                        @click="addJumpLogic(item.IdQuestion, item.Id)">
                                        <i class="fa-solid fa-right-to-bracket" style="color: #0b59f4;"></i>
                                        Lógica de salto
                                    </a>
                                </li>
                                
                                  <!-- BUTTON QUE GUARDA EN BIBLIOTECA -->
                                <li v-if="defaultScore.includes(item.IdTipreg)">
                                  
                                    <a class="dropdown-item cursorHtml"
                                        @click="addLibrary(item.IdQuestion, item.InLibrary)">
                                        <i class="fa-regular fa-bookmark" style="color: #5637c8;"></i>
                                        {{  !item.InLibrary ? 'Guardar en biblioteca' : 'Eliminar de biblioteca' }}</a>
                                </li>


                                <li v-if="defaultScore.includes(item.IdTipreg)">
                                    <!-- BUTTON QUE DEFINE EL SHOW DE OPCIONES  --->
                                    <a class="dropdown-item cursorHtml" @click="showAllOptions(item)">
                                        <i v-if="item.ShowAllOptions" class="fa-solid fa-ellipsis" style="color: #ff0000;"></i>
                                        <i v-else class="fa-solid fa-list-ul" style="color: #37ff00;"></i>
                                        {{item.ShowAllOptions ? 'Mostrar solo la respuesta' : 'Mostrar todas las opciones' }}
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>

        </div>
        <i v-if="item.TypeEvaluation" class="fa-solid fa-star text-center" style="color: #FFD43B;" title="Esta pregunta tiene puntaje"></i>
        <div class="card-body">
           
            <div class="position-relative">
               
                <div v-if="item.Required" class="asterisk position-absolute top-0 start-0">*</div>

                <input class="text-question" id="question" @change="updateQuestion(item)" type="text"
                    v-model="item.TextoPregunta" />


            </div>

            <i v-if="item.InLibrary" class="fa-solid fa-bookmark" style="color: #63E6BE;"
                title="Guardada en biblioteca"></i>

            <i v-if="item.IdQuestionInLibrary && !item.InLibrary" class="fa-solid fa-book fa-beat-fade"
                style="color: #f01414;" title="Pregunta de biblioteca"></i>


            <LoadAnswerOptions :idSurvey=props?.idSurvey :idQuestion=item.IdQuestion :idTipreg=item.IdTipreg />

        </div>

    </div>



    <!-- Modal Logica Question -->
    <div class="modal fade modal-xl" :id="'ModalLogicQuestion' + props.indexQuestion" data-bs-backdrop="static"
        data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Puntuaciones</h5>
                    <button type="button" @click="resetLogicQuestion" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div v-if="addLogicQuestion" class="modal-body">

                    <!-- aqui componente donde carga las respuesta de la pregunta -->
                    <LogicQuestion :key=props.index :idQuestion=addLogicQuestion :idSurvey=idSurvey
                        :typeLogic="'score'" />


                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="resetLogicQuestion"
                        data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>



    <!-- Modal Logica Question Jump  -->
    <div class="modal fade modal-xl" :id="'ModalLogicQuestionJump' + props.indexQuestion" data-bs-backdrop="static"
        data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tittleJump">Logica de Salto</h5>
                    <button type="button" @click="resetLogicJumpQuestion" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div v-if="addLogicJumpQuestion" class="modal-body">

                    <!-- aqui componente donde carga las respuesta de la pregunta -->
                    <LogicQuestion :key=props.index :idQuestion=addLogicJumpQuestion :idSurvey=props.idSurvey
                        :typeLogic="'jump'" :id=addLogicIdJumpQuestion @addQuestionsBranch=QuestionBranch />


                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="resetLogicJumpQuestion"
                        data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

</template>


<style scoped>
.fondo-encabezado {

    background-color: #7FD4F9
}


.textarea-expandible {
    width: 200px;
    min-height: 10px;
    resize: none;
    overflow: hidden;
}

.text-question {
    appearance: none;
    border: none;
    outline: none;
    width: 100%;
    border-bottom: 0.2em solid #ececec;
    ;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.2em 0.2em 0 0;
    padding: 0.4em;
    color: black;

}


.text-options {
    appearance: none;
    border: none;
    outline: none;
    width: 100%;
    border-bottom: 0.2em solid #ececec;
    ;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.2em 0.2em 0 0;
    padding: 0.4em;
    color: black;
}


input[type="text"]:hover {

    border-bottom: 0.2em solid #0D6EFD;
    ;

}



.fixed-plugin-button {
    border-radius: 50%;
    /* bottom: 30px; */
    right: 30px;
    color: #198754;
    font-size: 1.25rem;
    cursor: pointer;
}

.btn-w {
    height: 30px;
    width: 30px;
}

/* Cambia el color del borde cuando el puntero está encima */
.div-question {
    border: 1px solid #ccc;
    /* Establece un borde inicial */
    transition: border-color 0.3s ease;
    /* Agrega una transición suave */
}

.div-question:hover {
    border-color: #007bff;
    /* Cambia el color del borde cuando el puntero está encima */
}


.cursorHtml {
    cursor: pointer;
}

.asterisk {

    color: #e91a1a;

}
</style>