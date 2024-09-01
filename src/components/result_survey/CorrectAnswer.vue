<script setup>
import { ref, onMounted } from 'vue';
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import obtenerCookiesUsuario from '../../function/cookies'

const default_question_selection = ref([1, 2, 3]) // preguntas tipo seleccion
const correctAnswer = ref([])
const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()


const props = defineProps({

    idSurvey: { // id encuesta
        type: Number,
        require: true,
    },

    idQuestion: { // id de la pregunta
        type: String,
        require: true,
    },

    idTipreg: {
        type: Number,
        require: true
    },
})

onMounted(async () => {

    try {
        const where = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: props?.idQuestion
        }

        await service_answer.unique({ params: where })

        correctAnswer.value = bd_service_answer.value.filter(data => data.Score > 0)
    } catch (error) {
        console.error(error)
    }

})



</script>

<template>

    <div v-if="default_question_selection.includes(props.idTipreg)" class="row g-2 mt-3 ps-3 mb-3">


        <div class="col-auto">
            <span class="answerCorrect"> Respuesta correcta </span>
        </div>


        <div v-for="option, index in correctAnswer" :key="index" class="row g-2 mt-3">

            <div class="col-auto">
                <i class="fa-regular fa-circle"></i>
                <!-- <i  class="fa-regular fa-square-full"></i> -->
            </div>


            <div class="col-auto ">
                <span class="textoOption"> {{ option.TextoRespuesta }}</span>

            </div>

        </div>



    </div>

</template>


<style scoped>
.answerCorrect {

    font-family: "Google Sans", Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: .25px;
    line-height: 20px;
    color: #70757a;
    margin-bottom: 8px;
}

.textoOption {
    font-size: 14px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #70757a;
}
</style>