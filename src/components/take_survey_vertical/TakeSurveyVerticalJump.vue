<script setup>
import { onMounted, ref, defineAsyncComponent, computed } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceQuestion from '../../services/takeSurvey/Questions'
import ServiceResponse from '../../services/Response'
import ServiceEncuestas from '../../services/takeSurvey/Survey'
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import { useRouter } from 'vue-router'
import Loader from '../../components/Loader.vue'
import LoaderSave from '../../components/LoaderSave.vue'
import Entorno from '../../function/entorno'
import generateUuid from 'generate-uuid';
import axios from 'axios';

import ServiceQuestionsBranches from '../../services/takeSurvey/QuestionBranches'


const HeaderSurvey = defineAsyncComponent(() =>
    import('../HeaderSurvey.vue')
)

const LoadAnswerOptions = defineAsyncComponent(() =>
    import('./LoadAnswerOptions.vue')
)


const { RUTA } = Entorno();
const { RUTA_DOWNLOAD } = Entorno();

const SEND_SURVEY = ref(false)
const TYPE_STRING = 'string'
const TYPE_NUMBER = 'number'
const TYPE_OBJECT = 'object'
const TYPE_SESION = '*sesion*'

const VERTICALMODE = true //VISTA VERTICAL CON SALTOS'

const router = useRouter();

const buttonNext = ref('Siguiente')

let question = ref([])
const questionJump = ref()
const notQuestionsBranch = ref([])

let loader = ref(false)
let loaderSave = ref(false)

const answers = ref({}) //almacenamiento de las respuesta por cada pregunta

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
        const where = {
            IdEncuesta: props?.idSurvey
        }
        loader.value = true
        await service_question.unique({ params: where })
        question.value = [...bd_service_question.value]

        // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
        question.value.sort((a, b) => a.OrderBy - b.OrderBy);

        //recorro el objecto de las preguntas y le asigno una nueva propiedad llamada vista inicializada en true y respuesta false
        question.value.forEach(obj => {
            obj.view = true
            obj.answered = false
        });

        loader.value = false
    } catch (error) {
        console.error(error)
    }
})


const visibleQuestions = computed(() => {
    // Encuentra el índice de la primera pregunta con salto que no ha sido respondida y sea visible
    const index = question.value.findIndex(q => q.Jump && q.view);

    let questionView = []
    // Función para obtener las preguntas visibles
    const getVisibleQuestions = (index) => {
        if (index !== -1) {
            initializeJump(question.value.slice(0, index + 1));

            return question.value.slice(0, index + 1).sort((a, b) => a.OrderBy - b.OrderBy)

        } else {

            return question.value.sort((a, b) => a.OrderBy - b.OrderBy)
        }
    };

    questionView = getVisibleQuestions(index)

    questionView.forEach((obj) => {//contesto la pregunta tipo sesion de forma manual
        if (obj.IdTipreg === 8 && obj.view && !obj.answered) {
            answers.value[obj.IdQuestion] = TYPE_SESION
        }
    });

    return getVisibleQuestions(index);
});


async function initializeJump(data) {
    //Inicializamos con las en el array(data) con las preguntas haasta el del salto
    for (let element of data) {
        let jump = element.Jump;
        if (jump) {
            // changeJump.value = element.Id
            questionJump.value = element.IdQuestion // el IdQuestion de la pregunta que hace los saltos
            //break; // Detiene el bucle si jump es igual a true
        }
    }

}

async function nextQuestions() {

    try {

        loader.value = true
        //obtengo el id de la opcion de la pregunta seleccionada
        const idAnswer = answers.value[questionJump.value] //Id answer de la opcion de la pregunta que hace el salto

        const where = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: questionJump.value,
            Id: idAnswer
        }

        //Busco la respuesta a la opcion elegida y su puntuacion en caso de tener
        await service_answer.unique({ params: where })

        const targetIdQuestionJump = await bd_service_answer.value[0]?.IdQuestionJump // obtener el IdQuestion de la pregunta a saltar

        if (targetIdQuestionJump) {
            //ordeno la pregunta(salto en la siguiente posicion a mostrar)
            orderQuestion(targetIdQuestionJump, questionJump.value)

            //obtener el index actual donde se encuentra la pregunta en el array de la encuesta
            const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetIdQuestionJump);

            //cambio el valor de la propiedad view a true para mostrar la pregunta seleccionada del salto
            question.value[targetIndex].view = true

            //mostramos las ramas de la pregunta(si tiene)
            await handleBranches({ idEncuesta: props?.idSurvey, idQuestionjump: targetIdQuestionJump })

            //OCULTAMOS LAS PREGUNTAS QUE NO SON PARTE DE LA RAMIFICACION DE LA OPCION(PREGUNTA) SELECCIONADA
            await hideQuestionNotBranches({ idEncuesta: props?.idSurvey, idQuestionjump: targetIdQuestionJump, questions: bd_service_answer.value[0].IdQuestion })

            // quitamos las preguntas que no pertenecen al salto
            await removeQuestionNotJump({ idEncuesta: props?.idSurvey, idQuestionjump: targetIdQuestionJump, questions: bd_service_answer.value[0].IdQuestion })

        } else {

            await CheckQuestionBreak({ idEncuesta: props?.idSurvey, idQuestionjump: targetIdQuestionJump, questions: bd_service_answer.value[0]?.IdQuestion })

        }

        questionJump.value = ''
        //Ocultar las preguntas que ya han sido respondidas
        hideAnsweredQuestions()

        question.value = question.value.filter((questions) => !notQuestionsBranch.value.includes(questions.IdQuestion))

        if (question.value.length == Object.keys(answers.value).length) {
            loader.value = true
            await sendSurvey()
        }

        loader.value = false
        SEND_SURVEY.value = true

    } catch (error) {
        console.error(error)
    }
}



async function CheckQuestionBreak({ idEncuesta, idQuestionjump, questions }) {

    try {
        //VERIFICAMOS SI LA PREGUNTA TIENE UN SALTO IMCOMPLETED ITEM(todas las opciones no hacen saltos en la pregunta)
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
                    const targetId = element.IdQuestionJump
                    const targetIndex = question.value.findIndex(obj => obj.IdQuestion == targetId);

                    //eliminamos la pregunta del array
                    question.value.splice(targetIndex, 1)
                });


            }

        }
    } catch (error) {
        console.error(error)
    }

}


async function orderQuestion(idQuestionJump, idQuestion) {

    //BUSCAMOS EL INDICE DE LA PREGUNTA QUE HACE EL SALTO
    const targetIdQuestion = idQuestion
    const moveIndex = question.value.findIndex(obj => obj.IdQuestion === targetIdQuestion) + 1

    //BUSCAMOS EL INDICE DE LA PREGUNTA JUMP
    const targetIdJump = idQuestionJump
    const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetIdJump);

    // Si se encontró el objeto, se mueve a la posición del índice 
    if (targetIndex !== -1) {
        const targetObject = question.value.splice(targetIndex, 1)[0];
        question.value.splice(moveIndex, 0, targetObject);
    }

}

async function removeQuestionNotJump({ idEncuesta, idQuestionjump, questions }) {

    try {
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestion: questions
        }

        const service_answer_not_jump = new ServiceAnswerOptions()

        const bd_service_answer_not_jump = service_answer_not_jump.getFuentesData()

        await service_answer_not_jump.unique({ params: where })

        bd_service_answer_not_jump.value = bd_service_answer_not_jump.value.filter(item => (item.IdQuestionJump !== null && item.IdQuestionJump !== '') && item.IdQuestionJump !== idQuestionjump)

        if (bd_service_answer_not_jump.value.length > 0) {


            bd_service_answer_not_jump.value.forEach(element => {

                // preguntas que no pertenecen al salto
                const targetId = element.IdQuestionJump
                const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetId);

                question.value.splice(targetIndex, 1)

            });
        }
    } catch (error) {
        console.error(error)
    }

}


function hideAnsweredQuestions() {

    //ocultamos las preguntas que ya han sido respondidas
    for (const key in answers.value) {
        if (question.value.some(obj => obj.IdQuestion === key)) {
            question.value.find(obj => obj.IdQuestion === key).view = false;
            question.value.find(obj => obj.IdQuestion === key).answered = true;
        }
    }
}


async function handleBranches({ idEncuesta, idQuestionjump }) {

    try {
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestionJump: idQuestionjump
        }

        await service_question_branches.unique({ params: where })

        //ORDENO DE FORMA ASCENDENTE A TRAVES DEL ID
        bd_service_question_branches.value.sort((a, b) => b.Id - a.Id);

        if (bd_service_question_branches.value.length > 0) {

            bd_service_question_branches.value.forEach(element => {

                const targetId = element.IdQuestion
                const targetIndex = question.value.findIndex(obj => obj.IdQuestion === targetId);
                targetIndex >= 1 ? question.value[targetIndex].view = true : null

            });

        }
    } catch (error) {
        console.error(error)
    }

}

async function hideQuestionNotBranches({ idEncuesta, idQuestionjump, questions }) {

    try {
        //OCULTAMOS LAS PREGUNTAS QUE NO SON PARTE DE LA RAMIFICACION DE LA OPCION(PREGUNTA) SELECCIONADA
        const where = {
            IdEncuesta: idEncuesta,
            IdQuestionAnswer: questions
        }

        const service_question_branches_remove = new ServiceQuestionsBranches()
        const bd_service_question_branches_remove = service_question_branches_remove.getFuentesData()

        await service_question_branches_remove.unique({ params: where })

        bd_service_question_branches_remove.value = bd_service_question_branches_remove.value.filter(item => item.IdQuestionJump !== idQuestionjump)

        bd_service_question_branches_remove.value.forEach(element => {

            const targetIdQuestion = element.IdQuestion
            const targetIdQuestionJump = element.IdQuestionJump

            const targetIndexQuestion = question.value.findIndex(obj => obj.IdQuestion === targetIdQuestion);
            targetIndexQuestion >= 1 ? question.value[targetIndexQuestion].view = false : null
            targetIndexQuestion >= 1 ? question.value[targetIndexQuestion].list = 'branches' : null

            const targetIndexQuestionJump = question.value.findIndex(obj => obj.IdQuestion === targetIdQuestionJump);
            targetIndexQuestionJump >= 1 ? question.value[targetIndexQuestionJump].view = false : null
            targetIndexQuestionJump >= 1 ? question.value[targetIndexQuestionJump].list = 'branches' : null

            notQuestionsBranch.value.push(element.IdQuestion)
            notQuestionsBranch.value.push(element.IdQuestionJump)
            notQuestionsBranch.value = [... new Set(notQuestionsBranch.value)]
        });
    } catch (error) {
        console.error(error)
    }

}

async function sendSurvey() {

    loader.value = true
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
                textoRespuesta = bd_service_answer.value[0]?.TextoRespuesta

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

        
            data.TextoRespuesta !== TYPE_SESION ? await service_response.add(data) : null

        }

        numResponse++

        const dataEncuesta = {
            Id: props?.idSurvey,
            Respuestas: numResponse
        }
        await service_encuesta.Update({ data: dataEncuesta }) // actualizo encuestas respondida

        router.push({ name: 'endSurvey', params: { id: idUserResponse, idEncuesta: props?.idSurvey } });
    } catch (error) {
        console.error(error)
    }

}

function handleAnswerQuestion(data, idQuestion) {

    answers.value[idQuestion] = data
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

function backSurvey() {

    window.location.reload()
}

</script>

<template>

    <div v-if="loaderSave">
        <LoaderSave />
    </div>


    <div v-if="!loaderSave && !loader">
        <!-- ENCABEZADO DE LA ENCUESTA -->
        <HeaderSurvey :idSurvey="props?.idSurvey" />
        <!-- FORMULARIO DE ENCUESTA -->

        <form v-if="!loaderSave" id="msform" v-on:submit.prevent="nextQuestions">

            <div v-if="loader">
                <Loader />
            </div>

            <div v-for="item, idx in visibleQuestions" :key="idx">

                <div v-if="item.TextoCanalizacion && item.view" class="card RVEQke"> {{ item.TextoCanalizacion }} </div>
                <div v-if="item.view" :class="[item.TextoCanalizacion ? 'hN5qnf' : '', 'card mb-2']">
                    <div v-if="item?.IdTipreg != 8" class="card-body">

                        <div class="position-relative">

                            <div class="row g3">

                                <div class="col-auto">

                                    <span class="textoQuestion">

                                        <div v-if="loader">
                                            <Loader />
                                        </div>

                                        {{ item.TextoPregunta }}
                                        <span v-if="item?.Required" class="asterisk">*</span>
                                    </span>
                                </div>



                            </div>

                        </div>

                        <Suspense>
                            <LoadAnswerOptions v-if="item.view" :index=idx :idSurvey=props?.idSurvey
                                :idQuestion=item.IdQuestion :idTipreg=item.IdTipreg :tipeEvaluation=item.TypeEvaluation
                                :requiredQuestion="item?.Required === 0 ? false : true" @answers="handleAnswerQuestion"
                                :view="item.view" :vertical=VERTICALMODE />
                            <!-- loading state via #fallback slot -->
                            <template #fallback>
                                Cargando por favor espere...
                            </template>
                        </Suspense>
                    </div>

                    <div v-else class="text-white">
                        <div class="card-header bg-primary">Atención</div>
                        <div class="card-body">
                            <span class="text-header">{{ item.TextoPregunta }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!loader" class="actions">

                <div v-if="loader">
                    <Loader />
                </div>

                <button v-if="SEND_SURVEY" @click="backSurvey" type="button" class="mark-as-read read mb-2 m-2">
                    Atras
                </button>

                <button type="submit" class="mark-as-read read mb-2 m-2">
                    {{ buttonNext }}
                </button>


            </div>


            <div>

                <p class="small mt-5 pt-lg-2 gebul">Powered by <a href="https://www.tiendasdaka.com/" id="link"
                        target="_blank">Tiendas Daka C.A</a></p>
            </div>
        </form>

        <div v-if="loader">
            <Loader />
        </div>

    </div>
</template>

<style scoped>
.hN5qnf {

    border-top-left-radius: 0px;
    border-top-right-radius: 0px;

}

.RVEQke {

    background-color: rgb(203, 201, 151);
    color: rgba(0, 0, 0, 1);
    padding: 12px 24px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom: 0;
    min-width: 0;
    margin-bottom: 0;
    flex-grow: 1;
}

.fondo-encabezado {

    background-color: rgb(103, 58, 183);
    color: rgba(255, 255, 255, 1);
    font-size: 20px;
}

.text-color-green {

    color: green;
}

.text-color-red {

    color: red;
}

.iconColorRed {
    color: red;
    font-size: 25px;
}

.iconColorGreen {
    color: green;
    font-size: 25px;
}

.textoOption {
    font-size: 14px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #70757a;
}

.text-header {
    font-size: 16px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #202124;
}

.textoQuestion {

    font-size: 16px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
}

.asterisk {

    color: #e91a1a;
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
    width: 50%;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 20px;
    line-height: 1.25rem;
    font-weight: 400;
    background-color: rgba(249, 250, 251, 1);


}

.read {
    display: inline-block;
    width: 30%;
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