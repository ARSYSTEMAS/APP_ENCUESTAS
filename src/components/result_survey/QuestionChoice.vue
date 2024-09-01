<script setup>
import { ref, onMounted } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceQuestion from '../../services/takeSurvey/Questions'
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import LoadAnswerOptions from './LoadAnswerOptions.vue'
import ServiceSurvey from '../../services/takeSurvey/Survey'
import CorrectAnswer from './CorrectAnswer.vue'
import ResultSummary from './ResultSummary.vue'
import Loader from '../../components/Loader.vue'
import { generatePdf } from '@/composables/generatePdf';
import buttonGeneratePdf from './buttonGeneratePdf.vue';

const requiredQuestions = ref([])

const showResultsEnd = ref()

const ArrayCorrectQuestion = ref([])

const default_question_selection = ref([1, 2, 3]) // preguntas tipo seleccion

let loader = ref(false)

let question = ref([])

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const service_survey = new ServiceSurvey()
const bdsurvey = service_survey.getFuentesData()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName



const props = defineProps({

    idSurvey: {
        type: Number,
        require: true,
    },// el id de la encuesta 

    idUserResponse: {
        type: String,
        require: true,
    }// el id del usuario que respondio la encuesta 
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


        await getShowResultsEnd()
        requiredQuestions.value = bd_service_question.value[0]?.Required
        loader.value = false
    } catch (error) {
        console.error(error)
    }
})


async function getShowResultsEnd() {

    try {
        const where = {
            Id: props?.idSurvey
        }

        await service_survey.unique({ params: where }) // obtengo los datos de la encuesta

        if (bdsurvey.value.length > 0) {
            showResultsEnd.value = bdsurvey.value[0].ShowResultsEnd
        }

    } catch (error) {
        console.error(error)
    }

}

function validQuestion(value) {

    ArrayCorrectQuestion.value?.push(value)
}


const getSpanClass = (isCorrect, item) => {

    if (isCorrect && default_question_selection.value.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd.value) {
        return 'text-color-green';
    } else if (!isCorrect && default_question_selection.value.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd.value) {
        return 'text-color-red';
    }
    return '';
};


function isCorrectQuestion(index) {

    const obj = ArrayCorrectQuestion.value.find(item => item.index === index)
    const CorrectQuestion = obj ? obj.isCorrectQuestion : null

    return CorrectQuestion
}

function totalScore(index) {

    const obj = ArrayCorrectQuestion.value.find(item => item.index === index)
    const total = obj ? obj.totalScore : null

    return total
}

function totalScoreResponse(index) {

    const obj = ArrayCorrectQuestion.value.find(item => item.index === index)
    const total = obj ? obj.totalScoreResponse : null

    return total
}

function generatePdfHtml() {

    generatePdf('PagePdf');
}
</script>


<template>

    <div class="mb-3 position-absolute top-1 start-50 translate-middle">
        <buttonGeneratePdf @generatePdfHtml="generatePdfHtml" />
    </div>


    <div id="PagePdf">
        <ResultSummary :idSurvey=props.idSurvey :idUserResponse=props.idUserResponse />

        <div v-if="loader">
            <Loader />
        </div>

        <div v-for="item, idx in question" :key="idx" class="card mt-3">

            <div v-if="item.IdTipreg != 8">
                <div v-if="default_question_selection.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd"
                    class="d-grid gap-2 d-md-flex justify-content-md-end p-2">

                    <span>{{ totalScoreResponse(idx) }}/{{ totalScore(idx) }}</span>
                </div>

                <div class="card-body">

                    <div class="position-relative">

                        <div class="row g3">

                            <div v-if="isCorrectQuestion(idx) && default_question_selection.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd"
                                showResultsEndclass="col-auto"> <i class="fa-solid fa-check iconColorGreen"> </i> </div>

                            <div v-if="!isCorrectQuestion(idx) && default_question_selection.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd"
                                class="col-auto"> <i class="fa-solid fa-xmark iconColorRed"> </i> </div>

                            <div class="col-auto">
                                <span :class="getSpanClass(isCorrectQuestion(idx), item)" class="textoQuestion">
                                    {{ item.TextoPregunta }}
                                    <span v-if="item.Required" class="asterisk">*</span>
                                </span>
                            </div>

                        </div>

                    </div>

                    <!-- CARGA LAS OPCIONES DE LA PREGUNTA -->
                    <LoadAnswerOptions :index=idx :idSurvey=props?.idSurvey :idQuestion=item.IdQuestion
                        :idTipreg=item.IdTipreg :idUserResponse=props.idUserResponse :tipeEvaluation=item.TypeEvaluation
                        @isCorrectQuestion="validQuestion" :showAllOptions=Boolean(item.ShowAllOptions)
                        :showResultsEnd=Boolean(showResultsEnd) />

                </div>


                <!-- AQUI VALIDO QUE MUESTRE LA OPCION CORRECTA EN CASO DE FALLAR LA RESPUESTA -->
                <div
                    v-if="!isCorrectQuestion(idx) && default_question_selection.includes(item.IdTipreg) && item.TypeEvaluation && showResultsEnd">
                    <CorrectAnswer :idQuestion=item.IdQuestion :idTipreg=item.IdTipreg :idSurvey=props?.idSurvey />
                </div>

            </div>



            <div v-else class="text-white">
                <div class="card-header bg-primary">Atención</div>
                <div class="card-body">
                    <span class="text-header">{{ item.TextoPregunta }}</span>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
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
</style>