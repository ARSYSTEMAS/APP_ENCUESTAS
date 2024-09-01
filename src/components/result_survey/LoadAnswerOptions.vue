<script setup>
import { ref, onMounted } from 'vue';
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceResponse from '../../services/Response'
import Loader from '../../components/Loader.vue'
import ShowFile from './ShowFile.vue'
import formatearFecha from '@/function/FormatearFecha'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

let answer_with_Icons = ref([]);

const default_question_selection = ref([1, 2, 3]) // preguntas tipo seleccion

const default_question_textResponse = ref([4, 5, 11]) // preguntas tipo texto de una sola fila

const default_question_files = ref([7]) // preguntas tipo images archivos

const iscorrectQuestion = ref(false)

const textResponse = ref('')

let loader = ref(false)

let totalScore = ref(0)
let totalScoreResponse = ref(0)

const emit = defineEmits(['isCorrectQuestion', 'totalScore', 'totalScoreResponse'])

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const service_response = new ServiceResponse()
const bd_service_response = service_response.getFuentesData()



const props = defineProps({

    index: { // index unico
        type: Number,
        require: true,
    },

    idSurvey: { // id encuesta
        type: Number,
        require: true,
    },

    idQuestion: { // id de la pregunta
        type: String,
        require: true,
    },

    idTipreg: { // tipo de pregunta
        type: Number,
        require: true
    },

    idUserResponse: {
        type: String,
        require: true
    },

    tipeEvaluation: {
        type: Number,
        require: true
    },

    showAllOptions: {
        type: Boolean,
        require: true
    },
    showResultsEnd: {
        type: Boolean,
        require: false,
        default: true
    }

})


onMounted(async () => {

    try {
        const where = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: props?.idQuestion
        }
        loader.value = true
        await service_answer.unique({ params: where })

        const where_response = {
            IdEncuesta: props?.idSurvey,
            IdUserResponse: props?.idUserResponse,
            IdQuestion: props.idQuestion
        }

        await service_response.unique({ params: where_response })

        // LA RESPUESTA TEXTO DE UNA SOLA FILA
        textResponse.value = props.idTipreg === 11 ? formatearFecha(bd_service_response.value[0]?.TextoRespuesta) : bd_service_response.value[0]?.TextoRespuesta

        calculateIcons()
        loader.value = false
    } catch (error) {
        console.error(error)
    }
})


const calculateIcons = () => {

    bd_service_answer.value.forEach((option) => {

        const isSelected = bd_service_response.value.some(
            (respuesta) => respuesta?.IdAnswer == option?.Id
        );

        const isCorrect = bd_service_response.value.some(
            (respuesta) => respuesta?.Score == option?.Score && respuesta.IdEncuesta == option.IdEncuesta && respuesta.IdQuestion == option.IdQuestion && respuesta.IdAnswer == option.Id
        );

        if (isCorrect) iscorrectQuestion.value = true

        answer_with_Icons.value.push({
            "IdQuestion": option.IdQuestion,
            "TextoRespuesta": option.TextoRespuesta,
            "Icon": isSelected ? props.idTipreg === 1 ? 'fa-regular fa-circle-dot' : 'fa-solid fa-square-check' : props.idTipreg === 1 ? 'fa-regular fa-circle' : 'fa-regular fa-square',
            "isResponseCorrect": isCorrect ? true : false,
            "Selected": isSelected,
            "Score": option.Score,
            "typeEvaluation": props?.tipeEvaluation
        });



    });

    const obj = {
        "isCorrectQuestion": iscorrectQuestion.value,
        "index": props.index,
        "totalScore": bd_service_answer.value.reduce((total, option) => total + option.Score, 0),
        "totalScoreResponse": bd_service_response.value.reduce((total, option) => total + option.Score, 0)
    }

    emit("isCorrectQuestion", obj)

};

</script>

<template>

    <div v-if="loader">
        <Loader />
    </div>

    <div v-if="showAllOptions">
        <div v-for="option in answer_with_Icons" :key="option?.Id" class="row g-2 mt-3"
            :class="option.isResponseCorrect && props.tipeEvaluation  && props?.showResultsEnd ? 'correct' : !option.isResponseCorrect && option.Selected && props.tipeEvaluation && props?.showResultsEnd ? 'incorrect' : ''">


            <div class="col-auto">
                <i v-if="default_question_selection.includes(props.idTipreg)" :class="option?.Icon"></i>
            </div>

            <!-- AQUI RESPUESTA DE OPCIONES TIPO SELECCION -->
            <div v-if="default_question_selection.includes(props.idTipreg)" class="col">

                <div class="d-flex justify-content-between textoOption">
                    <span>{{ option?.TextoRespuesta }} </span><span>
                        <i
                            :class="option.isResponseCorrect && props.tipeEvaluation && props?.showResultsEnd ? 'fa-solid fa-check iconColorGreen' : !option.isResponseCorrect && option.Selected && props.tipeEvaluation && props?.showResultsEnd ? 'fa-solid fa-xmark iconColorRed' : ''">
                        </i>
                    </span>
                </div>
            </div>

            <!-- AQUI RESPUESTA DE UNA SOLA FILA -->
            <div v-if="default_question_textResponse.includes(props.idTipreg)" class="col-auto">

                <span class="textoOption"> {{ textResponse }} </span>

            </div>

        </div>
    </div>

    <div v-else>
        <span class="textoOption"> {{ textResponse }} </span>
    </div>

    <!-- AQUI LA IMAGEN CUANDO EL TIPO DE PREGUNTA SEA FILE -->
    <div v-if="default_question_files.includes(props.idTipreg)" class="col-auto">

        <ShowFile :textResponse="textResponse" />
    </div>

</template>

<style scoped>
.iconColorRed {
    color: red;
    font-size: 20px;
}

.iconColorGreen {
    color: green;
    font-size: 20px;
}

.correct {

    border: 0px solid green;
    background-color: rgb(230, 244, 234);

}

.incorrect {

    border: 0px solid red;
    background-color: rgb(252, 232, 230);

}

.textoOption {
    font-size: 14px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #70757a;
}

.textoQuestion {

    font-size: 16px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
}

.asterisk {

    color: #e91a1a;
}
</style>