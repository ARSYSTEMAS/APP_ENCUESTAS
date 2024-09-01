<script setup>
import { defineAsyncComponent } from 'vue'
import { onMounted, ref, computed } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceQuestion from '../../services/takeSurvey/Questions'
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import ServiceResponse from '../../services/Response'
import ServiceEncuestas from '../../services/takeSurvey/Survey'
import ServiceQuestionsBranches from '../../services/takeSurvey/QuestionBranches'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify';
//import HeaderSurvey from '../HeaderSurvey.vue';
import Loader from '../../components/Loader.vue'
import LoaderSave from '../../components/LoaderSave.vue'
//import InputFile from '../../components/InputTypeFile.vue'
import Entorno from '../../function/entorno'
import generateUuid from 'generate-uuid';
import axios from 'axios';
//import EmptySurvey from './EmptySurvey'
//import CardError from '@/components/CardError.vue'


const HeaderSurvey = defineAsyncComponent(() =>
    import('../HeaderSurvey.vue')
)

const CardError = defineAsyncComponent(() =>
  import('@/components/CardError.vue')
)

const EmptySurvey = defineAsyncComponent(() =>
  import('./EmptySurvey')
)

const InputFile = defineAsyncComponent(() =>
  import('../../components/InputTypeFile.vue')
)


const { RUTA } = Entorno();
const { RUTA_UPLOAD } = Entorno();
const { RUTA_DOWNLOAD } = Entorno();

const SURVEYNOTQUESTIONS = ref(false)

const TYPE_STRING = 'string'
const TYPE_NUMBER = 'number'
const TYPE_OBJECT = 'object'

const TITTLE = 'Error:'
const MSG = 'No se pudieron obtener los datos. Haga clic en el boton Anterior e intente nuevamente'

const router = useRouter();

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_response = new ServiceResponse()
const service_encuesta = new ServiceEncuestas()

const service_question_branches = new ServiceQuestionsBranches()
const bd_service_question_branches = service_question_branches.getFuentesData()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const currentQuestionIndex = ref(0)

let question = ref([])

let copiedQuestion = ref([])

const selectedOption = ref(null)

const selectListItem = ref('')

const textAnswer = ref('')

const textEmail = ref('')

const textDate = ref('')

const checkedNames = ref({}) //objeto para manejar múltiples checkboxes

const answers = ref({}) //almacenamiento de las respuesta por cada pregunta

let loader = ref(true)

let loaderSave = ref(false)

const file = ref('')

const buttonNext = ref('Siguiente')

const numberOfCharacters = ref(1000)

const IdQuestionJump = ref('')

const arrayQuestionsBranches = ref([])

const arrayQuestionsNotJump = ref([])

const errorAnswers = ref(false)

const ARRAYQUESTIONTYPE =[1, 2, 3, 4, 5, 11] // TODOS LOS TIPOS DE PREGUNTAS QUE EXISTEN 

const isError = ref(false)

const props = defineProps({

    idSurvey: {
        type: Number,
        require: true,
    },// el id de la encuesta 

    response: {
        type: Number,
        require: true,
    }// el id de la encuesta 
})


onMounted(async () => {

    try {
        const whereQuestion = {
            IdEncuesta: props?.idSurvey
        }

        await service_question.unique({ params: whereQuestion })

        question.value = [...bd_service_question.value]

        // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
        question.value.sort((a, b) => a.OrderBy - b.OrderBy);
        
        copiedQuestion.value = question.value.slice()

        const whereAnswer = {
            IdEncuesta: question.value[0]?.IdEncuesta,
            IdQuestion: question.value[0]?.IdQuestion
        }
        loader.value = true
        await service_answer.unique({ params: whereAnswer })
        loader.value = false

        bd_service_question.value.length <= 0 ? SURVEYNOTQUESTIONS.value = true : SURVEYNOTQUESTIONS.value

    } catch (error) {
        console.error(error)
    }
})

const currentQuestion = computed(() => question.value[currentQuestionIndex.value]);


function requiredQuestion(value) {

    if (value === 1) {

        if (Object.keys(checkedNames.value).length === 0) {

            toast.warning("Debe seleccionar al menos una opción", {
                theme: 'dark',
                autoClose: 2000,
            })
            currentQuestionIndex.value--;
        }

    }
}

async function handleBranches({ idEncuesta, idQuestionjump, moveIndex }) {

    try {
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestionJump: idQuestionjump
        }

        await service_question_branches.unique({ params: where })

        // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
        bd_service_question_branches.value.sort((a, b) => b.Id - a.Id);

        if (bd_service_question_branches.value.length > 0) {

            let index = moveIndex
            index++

            bd_service_question_branches.value.forEach(element => {


                const targetId = element.IdQuestion
                const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetId);

                //Si se encontró el objeto, se mueve a la posición del índice 

                if (targetIndex !== -1 && (index !== targetIndex)) {
                    const targetObject = question.value.splice(targetIndex, 1)[0];
                    question.value.splice(index, 0, targetObject);
                }
            });
        }
    } catch (error) {
        console.error(error)
    }

}


async function removeQuestionBranches({ idEncuesta, idQuestionjump, Questions }) {

    try {
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestionAnswer: Questions
        }

        const service_question_branches_remove = new ServiceQuestionsBranches()
        const bd_service_question_branches_remove = service_question_branches_remove.getFuentesData()


        await service_question_branches_remove.unique({ params: where })

        bd_service_question_branches_remove.value = bd_service_question_branches_remove.value.filter(item => item.IdQuestionJump !== idQuestionjump)

        bd_service_question_branches_remove.value.forEach(element => {

            arrayQuestionsBranches.value.push(element.IdQuestion)
            arrayQuestionsBranches.value.push(element.IdQuestionJump)

        });


        question.value = question.value.filter((questions) => !arrayQuestionsBranches.value.includes(questions.IdQuestion));
    } catch (error) {
        console.error(error)
    }

}

async function CheckQuestionBreak({ idEncuesta, idQuestionjump, questions }) {

    try {
        //VERIFICAMOS SI LA PREGUNTA TIENE UN SALTO IMCOMPLETED ITEM(todas las opciones no hacen saltos)
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestion: questions,
            Jump: 1
        }

        const service_questions_check = new ServiceQuestion()
        const bd_service_questions_check = service_questions_check.getFuentesData()

        await service_questions_check.unique({ params: where })

        //VERIFICAMOS SI LA PREGUNTA TIENE UN SALTO
        if (bd_service_questions_check.value.length > 0) {

            if (idQuestionjump == '' || idQuestionjump == null) {

                let arrayNotTheJump = []

                //CONSULTAMOS CUAL ES LA OPCION QUE REALIZA EL SALTO
                const where = {
                    IdEncuesta: idEncuesta,
                    IdQuestion: questions
                }


                const service_answer_questions = new ServiceAnswerOptions()
                const bd_service_answer_questions = service_answer_questions.getFuentesData()

                await service_answer_questions.unique({ params: where })

                const filteredQuestions = bd_service_answer_questions.value.filter((questions) => questions.IdQuestionJump !== null)

                filteredQuestions.forEach(element => {

                    // preguntas que no pertenecen al salto
                    arrayNotTheJump.push(element.IdQuestionJump)

                });

                question.value = question.value.filter((questions) => !arrayNotTheJump.includes(questions.IdQuestion));
            }

        }
    } catch (error) {
        console.error(error)
    }
}

async function removeQuestionNotJump({ idEncuesta, idQuestionjump, Questions }) {

    try {
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestion: Questions
        }


        const service_answer_not_jump = new ServiceAnswerOptions()
        const bd_service_answer_not_jump = service_answer_not_jump.getFuentesData()

        await service_answer_not_jump.unique({ params: where })

        bd_service_answer_not_jump.value = bd_service_answer_not_jump.value.filter(item => item.IdQuestionJump !== idQuestionjump)

        bd_service_answer_not_jump.value.forEach(element => {

            // preguntas que no pertenecen al salto
            arrayQuestionsNotJump.value.push(element.IdQuestionJump)

        });

        question.value = question.value.filter((questions) => !arrayQuestionsNotJump.value.includes(questions.IdQuestion));
    } catch (error) {
        console.error(error)
    }

}


async function orderQuestion(idQuestion, moveIndex) {


    moveIndex = moveIndex + 1

    const targetId = idQuestion
    const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetId);

    // Si se encontró el objeto, se mueve a la posición del índice 
    if (targetIndex !== -1 && moveIndex !== targetIndex) {
        const targetObject = question.value.splice(targetIndex, 1)[0];
        question.value.splice(moveIndex, 0, targetObject);
    }

    //VERIFICO SI EL SALTO DE PREGUNTA TIENE RAMIFICACIONES 
    handleBranches({ idEncuesta: question.value[0]?.IdEncuesta, idQuestionjump: idQuestion, moveIndex: moveIndex })

}


async function goToNextQuestion() {

    try {
        const current_index = currentQuestionIndex.value

        loader.value = true

        // Guarda la respuesta antes de verificar si es la última pregunta
        initializeObjects(currentQuestion.value.IdQuestion);

        // verifico si la pregunta tipo check es oblligatorio
        question.value[currentQuestionIndex.value].IdTipreg === 2 ? requiredQuestion(question.value[currentQuestionIndex.value].Required) : null

        // Comprueba si no es la última pregunta
        if (currentQuestionIndex.value < question.value.length - 1) {


            if (IdQuestionJump.value) { //SI HAY UN SALTO DE PREGUNTA

                orderQuestion(IdQuestionJump.value, current_index) //Ordeno las preguntas a partir del salto y verifico si tiene ramificacion

                await removeQuestionBranches({ idEncuesta: question.value[currentQuestionIndex.value].IdEncuesta, idQuestionjump: IdQuestionJump.value, Questions: question.value[current_index].IdQuestion })

                await removeQuestionNotJump({ idEncuesta: question.value[currentQuestionIndex.value].IdEncuesta, idQuestionjump: IdQuestionJump.value, Questions: question.value[current_index].IdQuestion })

            } else {

                await CheckQuestionBreak({ idEncuesta: question.value[currentQuestionIndex.value].IdEncuesta, idQuestionjump: IdQuestionJump.value, questions: question.value[current_index].IdQuestion })
            }

            currentQuestionIndex.value++;

            (currentQuestionIndex.value + 1) == question.value.length ? buttonNext.value = 'Enviar' : buttonNext.value = 'Siguiente'

            // Recargo las opciones de preguntas
            await loadAnswerOptions(question.value[currentQuestionIndex.value]?.IdEncuesta, question.value[currentQuestionIndex.value]?.IdQuestion);

            selectedOption.value = ''
            selectListItem.value = ''
            textAnswer.value = ''
            textEmail.value = ''
            textDate.value = null
            file.value = ''
            IdQuestionJump.value = ''
            checkedNames.value = {};
            loader.value = false
        } else {

            //FINALIZA LA ENCUESTA
            addAnswerSurvey()
        }
    } catch (error) {
        console.error(error)
    }
}

async function goToPreviousQuestion() {

    try {
        loader.value = true

        if (currentQuestionIndex.value > 0) {

            currentQuestionIndex.value--

            (currentQuestionIndex.value + 1) == question.value.length ? buttonNext.value = 'Enviar' : buttonNext.value = 'Siguiente'

            initializeObjects(currentQuestion.value.IdQuestion);


            if (question.value[currentQuestionIndex.value].Jump) { //La pregunta tiene salto

                const targetQuestion = question.value.find(obj => obj.IdQuestion === question.value[currentQuestionIndex.value].IdQuestion);
                const idQuestionJump = targetQuestion.Id

                // Iteramos sobre los objetos en 'copied'
                for (const copiedObj of copiedQuestion.value.filter(item => item.Id > idQuestionJump)) {
                    // Verificamos si el objeto ya existe en 'question'
                    const existingObj = question.value.find(q => q.IdQuestion === copiedObj.IdQuestion);
                    if (!existingObj) {
                        // Si no existe, lo agregamos a 'question'
                        question.value.push(copiedObj);
                    }
                }

                arrayQuestionsBranches.value = []
                arrayQuestionsNotJump.value = []
            }


            if (currentQuestionIndex.value === 1) {

                question.value = copiedQuestion.value
                arrayQuestionsBranches.value = []
                arrayQuestionsNotJump.value = []
                selectedOption.value = ''
                selectListItem.value = ''
                textAnswer.value = ''
                textEmail.value = ''
                textDate.value = null
                file.value = ''
                checkedNames.value = {};
            }

            await loadAnswerOptions(question.value[currentQuestionIndex.value].IdEncuesta, question.value[currentQuestionIndex.value].IdQuestion);
            loader.value = false
        }
    } catch (error) {
        console.error(error)
    }
}


async function loadAnswerOptions(idEncuesta, idQuestion) {

    const where = {
        IdEncuesta: idEncuesta,
        IdQuestion: idQuestion
    }

    try {
        await service_answer.unique({ params: where })
    } catch (error) {

        errorAnswers.value = true
        console.error('Error obteniendo respuestas:', error)
    }
}

function initializeObjects(idQuestion) {

    // OPCIONES TIPO RADIO
    selectedOption.value ? answers.value[idQuestion] = selectedOption.value : null

    //OPCIONES LISTA SELECT
    selectListItem.value ? answers.value[idQuestion] = selectListItem.value : null

    // OPCION TIPO CAJA DE TEXTO
    textAnswer.value ? answers.value[idQuestion] = textAnswer.value : null

    // OPCION TIPO EMAIL
    textEmail.value ? answers.value[idQuestion] = textEmail.value : null

    // OPCION TIPO FECHA
    textDate.value ? answers.value[idQuestion] = textDate.value : null

    // OPCIONES TIPO CHECKBOX
    Object.keys(checkedNames.value).length ? answers.value[idQuestion] = Object.keys(checkedNames.value).filter(key => checkedNames.value[key]) : null

    //OPCION TIPO FILE
    file.value ? answers.value[idQuestion] = file.value : null

    // Object.keys(checkedNames.value).length ? answers.value[idQuestion] = Object.keys(checkedNames.value).filter(key => checkedNames.value[key]).join(", ") : null

}

async function addAnswerSurvey() {

    try {
        let table = [];
        let numResponse = props?.response
        const idUserResponse = generateUuid();

        for (let key in answers.value) {

            // Obtener la pregunta y la respuesta
            let question = key;
            let answer = answers.value[key];

            // Si la respuesta es un array, recorrer el array y hacer un push a la tabla con la pregunta y las respuestas de ese array
            if (Array.isArray(answer)) {

                for (let i = 0; i < answer.length; i++) {

                    table.push({ question: question, answer: answer[i], isCheck: true });

                }
            } else {

                // Agregar la pregunta y la respuesta a la tabla
                table.push({ question: question, answer: answer, isCheck: false });


            }
        }

        for (const element of table) {


            const question = element.question

            let idAnswer = element.answer

            let isCheck = element.isCheck

            let typeAnswer = typeof (idAnswer)

            let textoRespuesta = null

            let score = null

            let sumScoreQuestion = null


            if (typeAnswer === TYPE_OBJECT) { //respuestas tipo archivo

                const num = generateUuid();

                const upload = await uploadArchive(num, idAnswer)

                if (upload.status === 200) {

                    const RUTA = RUTA_DOWNLOAD

                    //IdAnswer = RUTA+upload.data["file"].filename
                    idAnswer = null
                    textoRespuesta = RUTA + upload.data["file"].filename
                } else {

                    // IdAnswer = 'No se pudo guardar el archivo'
                    idAnswer = null
                    textoRespuesta = 'No se pudo guardar el archivo'
                }
            }

            if (typeAnswer === TYPE_STRING && !isCheck) {  //respuestas sin opciones

                textoRespuesta = idAnswer
                idAnswer = null
            }

            if (typeAnswer === TYPE_NUMBER || (typeAnswer === TYPE_STRING && isCheck)) { // respuestas con opciones


                const where = {
                    IdEncuesta: props?.idSurvey,
                    IdQuestion: question,
                    Id: idAnswer

                }
                //Busco la respuesta a la opcion elegida y su puntuacion en caso de tener
                await service_answer.unique({ params: where })
                textoRespuesta = bd_service_answer.value[0].TextoRespuesta
                score = bd_service_answer.value[0]?.Score


                //Busco el total de puntaje de la pregunta

                const whereScoreQuestion = {
                    IdEncuesta: props?.idSurvey,
                    IdQuestion: question
                }

                if (isCheck && typeAnswer !== TYPE_STRING) whereScoreQuestion.Id = +idAnswer

                //Busco el total de puntuacion 
                await service_answer.unique({ params: whereScoreQuestion })

                sumScoreQuestion = bd_service_answer.value.reduce((total, item) => {
                    return total + (item.Score || 0);
                }, 0);

            }

            const data = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: question,
                IdAnswer: idAnswer,
                TextoRespuesta: textoRespuesta,
                TipoRespuesta: typeAnswer,
                IdUserResponse: idUserResponse,
                ScoreQuestion: sumScoreQuestion
            }

            if (score) data.Score = score // si tiene puntuacion le asigno el objecto

            loaderSave.value = true
            await service_response.add(data)

        }

        numResponse++

        const dataEncuesta = {
            Id: props?.idSurvey,
            Respuestas: numResponse
        }
        await service_encuesta.Update({ data: dataEncuesta }) // actualizo encuestas respondida
        loaderSave.value = false

        selectedOption.value = ''
        selectListItem.value = ''
        textAnswer.value = ''
        textEmail.value = ''
        file.value = ''
        checkedNames.value = {};
        loader.value = false

        router.push({ name: 'endSurvey', params: { id: idUserResponse, idEncuesta: props?.idSurvey } });
    } catch (error) {
        console.error(error)
    }
}



function onInputFile(value) {//Recibe el archivo a subir
    file.value = value;
}

async function uploadArchive(num, file) {

    const formData = new FormData()
    let response = null
    formData.append('file', file)

    const url = `${RUTA}/Documentacion`

    await axios.post(url, formData).then(resp => {

        response = resp

    })

    return response

}

function jumpQuestion(id) {

    if (id) IdQuestionJump.value = id

}

function checkanswer(e) {

    const IdQuestion = e.IdQuestion
    const Id = e.Id

    if (answers.value.hasOwnProperty(IdQuestion)) {
        if (Array.isArray(answers.value[IdQuestion])) {
            return answers.value[IdQuestion].includes(Id.toString());
        } else {
            return answers.value[IdQuestion] === Id;
        }
    }
    return false;
}

const error= () => { isError.value = true}

</script>


<template>
    <div v-if="loaderSave">
        <LoaderSave />
    </div>

    <div v-if="!loaderSave && bd_service_question.length > 0">
        <!-- ENCABEZADO DE LA ENCUESTA -->
        <Suspense>
            <HeaderSurvey :idSurvey="props?.idSurvey" />
            <!-- loading state via #fallback slot -->
            <template #fallback>
                Loading...
            </template>
        </Suspense>
        <div v-if="loader">
            <Loader />
        </div>

        <!-- FORMULARIO DE ENCUESTA -->
        <form id="msform" v-on:submit.prevent="goToNextQuestion" v-if="!loader">

            <div v-if="[8].includes(currentQuestion?.IdTipreg)" class="card-section">
                <div class="card-section-wrapper">
                    <div class="card-section-icon">
                        <div class="icon-cart-box">
                            <svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z"
                                    fill="#ffffff"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="card-section-content">
                        <div class="card-section-title-wrapper">
                            <span class="card-section-title">Atención</span>
                            <span class="card-section-action">
                                <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 384 512">
                                    <path
                                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z">
                                    </path>
                                </svg>
                            </span>
                        </div>
                        <div class="card-section-text">
                            {{ question[currentQuestionIndex]?.TextoPregunta }}
                        </div>
                        <button type="submit" class="btn-accept">Haga click para continuar</button>
                    </div>
                </div>
            </div>


            <div v-else class="header">



                <span class="icon">
                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path clip-rule="evenodd"
                            d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                            fill-rule="evenodd"></path>
                    </svg>
                </span>

                <span class="question-text-span">
                    <span class="asterisk" v-if="question[currentQuestionIndex]?.Required">
                        *
                    </span> {{ question[currentQuestionIndex]?.TextoPregunta }}

                </span>

            </div>


            <article class="modal-container" v-if="question[currentQuestionIndex]?.TextoCanalizacion">
                <header class="modal-container-header">
                    <span class="modal-container-title"><i class="fa-solid fa-circle-info" style="color: blue;"></i>{{
                        question[currentQuestionIndex]?.TextoCanalizacion }}
                    </span>
                </header>
            </article>

            <CardError v-if="bd_service_answer.length <= 0 && ARRAYQUESTIONTYPE.includes(currentQuestion?.IdTipreg)"
            :tittle=TITTLE 
            :msg=MSG 
            @error="error"
            />



            <div v-if="errorAnswers" class="error">
                <div class="error__icon">
                    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z"
                            fill="#393a37"></path>
                    </svg>
                </div>
                <div class="error__title">Sucedio un error, haga clic en boton Anterior o refresque la pagina</div>
                <div class="error__close"><svg height="20" viewBox="0 0 20 20" width="20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"
                            fill="#393a37"></path>
                    </svg></div>
            </div>

            <!-- RESPUESTAS TIPO RADIO -->

            <div v-if="[1].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>


                <div v-for="option, index in bd_service_answer" :key="index" class="row g-2 mt-3">

                    <div v-if="!loader" class="row gap-2">

                        <div class="col-auto">

                            <div class="form-check">
                                <input class="form-check-input control-indicator" type="radio"
                                    :id="'option-' + currentQuestion?.IdQuestion + '-' + option.Id" :value="option.Id"
                                    :required="currentQuestion?.Required" v-model="selectedOption" name="option"
                                    @change="jumpQuestion(option.IdQuestionJump)" :checked="checkanswer(option)">
                                <label class="form-check-label "
                                    :for="'option-' + currentQuestion?.IdQuestion + '-' + option.Id">
                                    {{ option.TextoRespuesta }}
                                </label>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <!-- RESPUESTAS TIPO CHECKBOX -->
            <div v-if="[2].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>
                <div v-for="option, index in bd_service_answer" :key="index" class="row g-2 mt-3">

                    <div v-if="!loader" class="row gap-2">

                        <div class="col-auto">
                            <div class="form-check">
                                <input class="form-check-input control-indicator" type="checkbox"
                                    :id="'checkbox-' + currentQuestion?.IdQuestion + '-' + option.Id" :value="option.Id"
                                    v-model="checkedNames[option.Id]" @change="jumpQuestion(option.IdQuestionJump)"
                                    :checked="checkanswer(option)">
                                <label class="form-check-label"
                                    :for="'checkbox-' + currentQuestion?.IdQuestion + '-' + option.Id">
                                    {{ option.TextoRespuesta }}
                                </label>
                            </div>
                        </div>

                    </div>

                </div>
            </div>


            <!-- RESPUESTAS TIPO SELECT -->

            <div v-if="[3].includes(currentQuestion?.IdTipreg)" class="pt-4 ">
                <div v-if="loader">
                    <Loader />
                </div>
                <div v-if="!loader" class="position-relative">
                    <select :required="currentQuestion?.Required" v-model="selectListItem">
                        <option value=''>Seleccione una opción de la lista</option>
                        <option v-for="option, index in bd_service_answer" :key="option.Id" :value="option.Id">
                            {{ option.TextoRespuesta }}</option>
                    </select>
                </div>
            </div>


            <!-- RESPUESTA TIPO TEXTO -->
            <div v-if="[4].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>
                <div v-if="!loader" class="position-relative">
                    <input class="text-question" :maxlength="numberOfCharacters" type="text" placeholder=""
                        :required="currentQuestion?.Required" v-model="textAnswer">
                    <span>{{ textAnswer.length }} / {{ numberOfCharacters }}</span>
                </div>
            </div>

            <!-- RESPUESTA TIPO EMAIL -->
            <div v-if="[5].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>
                <div v-if="!loader" class="position-relative">
                    <input class="text-question" type="email" placeholder="" :required="currentQuestion?.Required"
                        v-model="textEmail">
                </div>

            </div>


             <!-- RESPUESTA TIPO FECHA -->
             <div v-if="[11].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>

                <div v-if="!loader" class="position-relative">
                    <input class="text-question" type="date" placeholder="" :required="currentQuestion?.Required"
                        v-model="textDate">
                </div>

            </div>

            <!-- RESPUESTA TIPO FILE -->
            <div v-if="[7].includes(currentQuestion?.IdTipreg)">
                <div v-if="loader">
                    <Loader />
                </div>
                <!-- componente subir archivo   -->
                <InputFile @input-file="onInputFile" :isRequired="Boolean(currentQuestion?.Required)"
                    :idFile="currentQuestion?.IdQuestion" />

            </div>

            <div class="actions">
                <!-- <a class="read"
                @click="goToNextQuestion()"
                style="cursor: pointer;" data-bs-toggle="tooltip" data-bs-placement="top" title="Proxima pregunta">
                {{buttonNext}}
            </a> -->


                <a v-if="currentQuestionIndex > 0 && ![8].includes(currentQuestion?.IdTipreg)" class="mark-as-read m-1"
                    @click="goToPreviousQuestion(question[currentQuestionIndex]?.IdEncuesta, question[currentQuestionIndex - 1]?.IdQuestion)"
                    style="cursor: pointer;" data-bs-toggle="tooltip" data-bs-placement="top" title="Pregunta anterior">
                    Anterior
                </a>

                
                <button v-if="![8].includes(currentQuestion?.IdTipreg) && !isError" type="submit" class="mark-as-read read"
                    title="Proxima pregunta">
                    {{ buttonNext }}
                </button>
            </div>

            <div>


                <p class="small mt-5 pt-lg-2 gebul">Powered by <a href="https://www.tiendasdaka.com/" id="link"
                        target="_blank">Tiendas Daka C.A</a></p>
            </div>

        </form>
    </div>
    <div v-if="SURVEYNOTQUESTIONS">
        <EmptySurvey />
    </div>
</template>


<style scoped>
.error {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: auto;
    padding: 12px;
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    background: #FCE8DB;
    border-radius: 8px;
    border: 1px solid #EF665B;
    box-shadow: 0px 0px 5px -3px #111;
}

.error__icon {
    width: 20px;
    height: 20px;
    transform: translateY(-2px);
    margin-right: 8px;
}

.error__icon path {
    fill: #EF665B;
}

.error__title {
    font-weight: 500;
    font-size: 14px;
    color: #71192F;
}

.error__close {
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-left: auto;
}

.error__close path {
    fill: #71192F;
}


.modal-container-title {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;
    font-weight: 700;
    font-size: 1.125;
}

.modal-container-title {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;
    font-weight: 700;
    font-size: 1.125;
}

@media (max-width: 600px) {
    .modal-container {
        width: 90%;
    }
}

.modal-container-header {
    padding: 16px 32px;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
}


.card-section {
    width: auto;
    height: auto;
    background: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1);
    margin: 20px;
    padding: 0 10px;
}

.card-section-wrapper {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
}

.card-section-icon {
    width: 20%;
}

.card-section-icon .icon-cart-box {
    background-color: #2196f3;
    width: 3em;
    height: 3em;
    border-radius: 50%;
    text-align: center;
    padding: 15px 0px;
    margin: 0 auto;
}

.card-section-content {
    width: 80%;
}

.card-section-title-wrapper {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: baseline;
    width: 100%;
}

.card-section-title {
    width: 95%;
    font-size: 1em;
    font-weight: 600;
    color: #333;
    padding: 20px 0 0 10px;
}

.card-section-action {
    width: 5%;
    text-align: right;
    padding: 0 20px;
}

.card-section-action svg {
    cursor: pointer;
    fill: rgba(0, 0, 0, 0.2);
    transition: 0.3s ease-in-out;
}

.card-section-action svg:hover {
    fill: rgba(0, 0, 0, 0.6);
}

.card-section-text {
    font-size: 1em;
    color: #757575;
    padding: 10px 0 10px 10px;
}

.product-price {
    font-size: 0.9em;
    font-weight: 600;
    color: #333;
    padding: 0 0 10px 10px;
}

.btn-accept {
    font-size: 0.7em;
    font-weight: 600;
    padding: 5px 10px;
    margin: 5px 10px 20px;
    color: #2196f3;
    border: 1px solid #e3f2fd;
    background-color: #e3f2fd;
    box-shadow: none;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.4s ease-in-out;
}

.btn-accept:hover,
.btn-accept:active,
.btn-accept:focus {
    color: #2196f3;
    background-color: #e3f2fd;
    border: 1px solid #2196f3;
}


.asterisk {

    color: #e91a1a;

}

.text-question {

    appearance: none;
    border: none;
    outline: none;
    width: 100%;
    border-bottom: 0.1em solid #0a86ea;
    background-color: #F0F2F5;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.1em 0.1em 0 0;
    padding: 0.4em;
    color: black;
}


input[type="text"]:hover {

    border-bottom: 0.1em solid #545E6B;
    ;

}

input[type="email"]:hover {

    border-bottom: 0.1em solid #545E6B;
    ;

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
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

select:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, .25);
}


#link {
    color: #0a86ea;
}


.control-indicator {

    border: 1px solid #0a86ea;
    width: 18px;
    height: 18px;
}

.gebul {

    font-size: 13px;
    font-weight: 300;
    position: relative;
}

.question-text-span {

    color: #050505;
    font-size: 20px;
    margin-bottom: 8px;
    font-weight: 400;
}

.header {
    display: flex;
    align-items: center;
    grid-gap: 1rem;
    gap: 1rem;
}

.icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(96, 165, 250, 1);
    padding: 0.5rem;
    color: rgba(255, 255, 255, 1);
}

.icon svg {
    height: 1rem;
    width: 1rem;
}

.question {
    font-weight: 600;
    font-size: 20px;
    color: rgba(107, 114, 128, 1);
}

.message {
    margin-top: 1rem;
    color: rgba(107, 114, 128, 1);
}

.actions {
    margin-top: 1.5rem;
}

.actions a {
    text-decoration: none;
}

.mark-as-read {

    display: inline-block;
    border: 1px solid #0a86ea;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 20px;
    line-height: 1.25rem;
    font-weight: 400;
    background-color: rgba(249, 250, 251, 1);


}


.read {
    display: inline-block;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 20px;
    line-height: 1.25rem;
    font-weight: 400;

}

.read {
    background-color: #0a86ea;
    color: #fff;
}
</style>