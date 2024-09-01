<!-- EDITAR SELECCIONAR UNA  -->
<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ObtenerFecha from '../../function/ObtenerFecha';
import ServiceQuestion from '../../services/Questions'
import ServiceAnswerOptions from '../../services/AnswerOptions'
import generateUuid from 'generate-uuid';
import { toast } from 'vue3-toastify';
import LogicQuestion from '../LogicQuestion'
import validatePropertyAndValue from '../../function/validateAndValue'
import ServiceQuestionBranches from '../../services/QuestionBranches'
import updateSurveyAudit from '@/composables/updateSurvey';

const service_question_branches = new ServiceQuestionBranches()
const service_question = new ServiceQuestion()
const service_answer = new ServiceAnswerOptions()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token


//MODELOS DEL FORMULARIO
const question = ref('')

const emits = defineEmits(['deleteItem']);

const options = ref([])

const idQuestion = ref()

let modeQuestion = ref('insert')

const answerOptionInsert = ref([])

const addLogicQuestion = ref()

const addLogicJumpQuestion = ref()

const addLogicIdJumpQuestion = ref()

const twoDefault = ref([1, 2]) //PREGUNTAS CON OPCIONES MULTIPLES
const oneDefault = ref([4, 5, 11]) //PREGUNTAS DE TIPO UNA SOLO FILA
const _default = ref([1, 2, 3])
const _defaultLogic = ref([1, 2]) //PREGUNTAS QUE SOLO TIENE LA OPCION DE AGREGAR LOGICAS

const placeholder = ref('Texto de la pregunta')

const textDelete = ref('Eliminar pregunta')

const readonlyInput = ref(false)

const requiredQuestions = ref(false)


const myFocusInitial = ref(null);

const LISTQUESTIONBRANCH = ref([])

const props = defineProps({

    index: {
        type: Number,
        require: true,
    },

    indexQuestion: {
        type: Number,
        require: true,
    }, // el index de las preguntas
    idSurvey: {
        type: Number,
        require: true,
    },// el id de la pregunta en Table

    typeQuestion: {
        type: Number,
        require: true,
    }, // Tipo de pregunta

})

onMounted(() => {

    //INICIALIZAMOS LOS INPUT DEPENDIENDO DE EL TIPO DE PREGUNTA

    if (twoDefault.value.includes(props.typeQuestion)) {
        options.value.push('')
        options.value.push('')
    }

    if (oneDefault.value.includes(props.typeQuestion)) {

        const questionTypeValues = {
            4:  'Texto',
            5:  'Email',
            11: 'Fecha',
            default: ''
        };

        options.value.push(questionTypeValues[props.typeQuestion] || questionTypeValues.default);

        //PREGUNTAS DE TIPO SOLO TEXTO
        readonlyInput.value = props.typeQuestion === 4 || props.typeQuestion === 5 || props.typeQuestion === 11;
    }

    // CAMBIO EL TEXTO DEL INPUT PARA TIPO DE PREGUNTA SECCION
    if (props?.typeQuestion === 8) {

        placeholder.value = 'Encabezado de la Sección'
        textDelete.value = 'Eliminar Encabezado'

    }

    myFocusInput()
})

function addOptions() {


    options.value.push('');


}

async function addQuestion(indexQuestion) {


    try {
        const { typeQuestion } = props;

        if (question.value && modeQuestion.value === 'insert') { //aqui insertamos

            indexQuestion === 0 ? indexQuestion = 1 : indexQuestion++

            idQuestion.value = idQuestion.value ? idQuestion.value : generateUuid(); //Generamos un Id de pregunta

            const data = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: idQuestion.value,
                TextoPregunta: question.value,
                IdTipreg: props?.typeQuestion,
                OrderBy: indexQuestion,
                UsrCrea: userName.toUpperCase()

            }
            await service_question.add({ data: data, token: token })

            ////Actualiza la ultima modificacion que exista en la encuesta//////
            await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())

            if ([4, 5, 11].includes(typeQuestion)) { //PREGUNTAS TIPO TEXTO DE UNA SOLA FILA

                singleRowText();
            }
            modeQuestion.value = 'update'

        } else { //aqui actualizamos

            const where = {
                IdQuestion: idQuestion.value
            }

            const data = {
                TextoPregunta: question.value,
                UsrAct: userName.toUpperCase(),
                FecAct: ObtenerFecha()

            }

            await service_question.update({ data: data, params: where, token: token })
            await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
        }
    } catch (error) {
        console.error(error)
    }




}

async function addTextOption(e) {

    try {
        const element = e.target.id
        const lastNIndex = element.lastIndexOf('n');
        const index = element.substr(lastNIndex + 1)


        options.value[index] = e.target.value
        const textoRespuesta = options.value[index]


        const data = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: idQuestion.value,
            TextoRespuesta: textoRespuesta,
            UsrCrea: userName.toUpperCase(),
            IndexTarget: index

        }


        if (idQuestion.value && !answerOptionInsert.value.includes(data.IndexTarget)) {


            await service_answer.add({ data: data, token: token })
            await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
            answerOptionInsert.value.push(data.IndexTarget)

        } else {


            const where = {
                IdQuestion: idQuestion.value,
                IdEncuesta: props?.idSurvey,
                IndexTarget: index
            }

            const data = {
                TextoRespuesta: textoRespuesta,
                UsrAct: userName.toUpperCase(),
                FecAct: ObtenerFecha()
            }

            await service_answer.update({ data: data, params: where, token: token })

            updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token)

        }
    } catch (error) {
        console.error(error)
    }


}

async function del(index) {

    try {
        options.value.splice(index, 1);

        //Aqui Eliminamos en el Backend
        const where = {
            IdQuestion: idQuestion.value,
            IdEncuesta: props?.idSurvey,
            IndexTarget: index
        }

        if (validatePropertyAndValue(where, 'IndexTarget')) {
            await service_answer.del({ params: where, token: token }) //eliminamos las opciones de respuestas
            await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
        } else {

            toast.error("Ocurrio un error. Actualize e intente nuevamente", {
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

async function deleteQuestion(index) {

    try {
        emits("deleteItem", index)
        //Aqui Eliminamos en el Backend
        const where = {
            IdQuestion: idQuestion.value
        }

        if (idQuestion.value) {

            if (validatePropertyAndValue(where, 'IdQuestion')) {

                await service_answer.del({ params: where, token: token }) //eliminamos las opciones de respuestas
                await service_question.del({ params: where, token: token }) //eliminamos la pregunta
                await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
            } else {

                toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: toast.TRANSITIONS.SLIDE,
                    autoClose: 2000,
                    theme: 'dark',
                });
            }
        }
    } catch (error) {
        console.error(error)
    }
}

async function singleRowText() {

    try {
        const data = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: idQuestion.value,
            TextoRespuesta: null,
            UsrCrea: userName.toUpperCase(),
            IndexTarget: 0

        }

        await service_answer.add({ data: data, token: token })
        await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
    } catch (error) {
        console.error(error)
    }
}

async function requiredQuestion() {

    try {
        requiredQuestions.value = !requiredQuestions.value

        const where = {
            IdQuestion: idQuestion.value,
            IdEncuesta: props?.idSurvey
        }

        const data = {
            Required: requiredQuestions.value,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }

        if (idQuestion.value) {
            await service_question.update({ data: data, params: where, token: token })
            await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
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

async function addJumpLogic() {

    try {
        let bd_service_question = []

        const where = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: idQuestion.value
        }

        await service_question.unique({ params: where, token: token })
        bd_service_question = service_question.getFuentesData()

        addLogicJumpQuestion.value = idQuestion.value
        addLogicIdJumpQuestion.value = bd_service_question.value[0].Id
    } catch (error) {
        console.error(error)
    }
}


function addLogic() {

    addLogicQuestion.value = idQuestion.value
}

function resetLogicQuestion() {

    addLogicQuestion.value = null
}


async function resetLogicJumpQuestion() {

    try {
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

        await updateSurveyAudit(props?.idSurvey, userName.toUpperCase(), token, ObtenerFecha())
    } catch (error) {
        console.error(error)
    }
}


function QuestionBranch(value) {

    LISTQUESTIONBRANCH.value = value

}



const myFocusInput = () => {
    myFocusInitial.value.focus();
};
</script>


<template>

    <div class="card div-question mt-2" :class="props.typeQuestion === 8 ? 'fondo-encabezado' : null">
        <div class="d-grid gap-2 d-md-flex justify-content-md-end">

            <nav class="navbar navbar-expand-lg">
                <div class="container-fluid">
                    <ul class="navbar-nav d-flex flex-row">

                        <!-- <li class="dropdown dropstart">  -->
                        <li class="nav-item me-3 me-lg-0 dropdown dropstart" data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <div class=" cursorHtml" :id="'dropdownMenuButton' + indexQuestion" style="color: #12408E;">
                                <i class="fa-solid fa-list"></i>
                            </div>

                            <ul class="dropdown-menu" :aria-labelledby="'dropdownMenuButton' + indexQuestion">
                                <li>
                                    <!-- BUTTON QUE ELIMINA LA PREGUNTA -->
                                    <a class="dropdown-item cursorHtml" @click="deleteQuestion(props.index)">
                                        <i class="fa-regular fa-trash-can" style="color: brown;"></i>
                                        {{ textDelete }}</a>
                                </li>

                                <!-- BUTTON QUE COLOCA REQUERIR A LA PREGUNTA  --->
                                <li v-if="idQuestion && props?.typeQuestion != 8">
                                    <a class="dropdown-item cursorHtml" @click="requiredQuestion()">
                                        <i class="fa-solid fa-circle-exclamation" style="color: chocolate;"></i>
                                        {{ requiredQuestions ? 'No requerir' : 'Requerir pregunta' }}</a>
                                </li>

                                <!-- BUTTON QUE PERMITE COLOCAR PUNTUACIONES  --->
                                <li v-if="idQuestion && _default.includes(props.typeQuestion)">
                                    <!-- BUTTON DE PUNTUACIONES -->
                                    <a class="dropdown-item cursorHtml" data-bs-toggle="modal"
                                        :data-bs-target="'#ModalLogicQuestion' + props.indexQuestion"
                                        @click="addLogic()">
                                        <i class="fa-solid fa-star" style="color: #FFD43B;"></i>
                                        Asignar
                                        puntaje</a>
                                </li>
                                <!-- BUTTON QUE PERMITE COLOCAR LOGICAS  --->
                                <li v-if="idQuestion && _defaultLogic.includes(props.typeQuestion)">
                                    <a class="dropdown-item cursorHtml" data-bs-toggle="modal"
                                        :data-bs-target="'#ModalLogicQuestionJump' + props.indexQuestion"
                                        @click="addJumpLogic()">
                                        <i class="fa-solid fa-right-to-bracket" style="color: #0b59f4;"></i>
                                        Lógica de salto
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>

        </div>



        <div class="card-body">


            <div class="position-relative">
                <div v-if="requiredQuestions" class="asterisk position-absolute top-0 start-0">*</div>
                <input class="text-question" ref="myFocusInitial" id="question" @change="addQuestion(indexQuestion)"
                    type="text" :placeholder="placeholder" v-model="question" />

            </div>

            <div v-for="option, index in options" :key="index" class="row g-2 mt-3">

                <div class="col-auto">
                    <i v-if="props?.typeQuestion === 1" class="fa-regular fa-circle"></i>
                    <i v-if="props?.typeQuestion === 2" class="fa-regular fa-square-full"></i>
                </div>


                <div class="row gap-2">

                    <div class="col-auto">
                        <input class="text-options" :id="'text-option' + index" :name="'text-option' + index"
                            type="text" :placeholder="'option '" @change="addTextOption" :value=option
                            :disabled="readonlyInput" />

                    </div>


                    <div class="col-auto">
                        <i v-if="props?.typeQuestion === 3" class="fa-solid fa-angle-down"></i>
                    </div>

                    <!-- AQUI MUESTRO EL ICONO DE ELIMINAR DEPENDIENDO DE LOS DEFAULT-->
                    <div v-if="twoDefault.includes(props?.typeQuestion)" class="col-auto">
                        <a style="cursor: pointer;" @click="del(index)">
                            <i v-if="index > 1" class="fa-regular fa-trash-can" title="Eliminar"
                                style="color: brown;"></i>
                        </a>
                    </div>


                    <div v-if="oneDefault.includes(props?.typeQuestion)" class="col-auto">
                        <a style="cursor: pointer;" @click="del(index)">
                            <i v-if="index > 0" class="fa-regular fa-trash-can" title="Eliminar"
                                style="color: brown;"></i>
                        </a>
                    </div>

                </div>


            </div>

            <!-- button+ para agregar mas options-->
            <div v-if="_default.includes(props?.typeQuestion)"
                class="d-grid gap-2 d-md-flex justify-content-md-start mt-1 p-1">

                <a class="fixed-plugin-button " @click="addOptions()">
                    <i class="fa-solid fa-plus fa"></i>
                </a>

            </div>
        </div>
    </div>


    <!-- Modal Logica Question Scores  -->
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
                    <LogicQuestion :key=props.index :idQuestion=addLogicQuestion :idSurvey=props.idSurvey
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
    width: 200px;
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
    left: -5px;
    top: 30%;
}
</style>