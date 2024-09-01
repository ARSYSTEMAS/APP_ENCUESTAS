<script setup>
import { ref, onMounted } from 'vue';
import ServiceLibraryQuestions from '../services/LibraryQuestions'
import ServiceLibraryAnswers from '../services/LibraryAnswers'
import obtenerCookiesUsuario from '../function/cookies'
import ServiceQuestion from '../services/Questions'
import generateUuid from 'generate-uuid';
import ServiceAnswerOptions from '../services/AnswerOptions'
import { toast } from 'vue3-toastify';

const service_library_question = new ServiceLibraryQuestions()
const bd_service_library_question = service_library_question.getFuentesData()

const service_question = new ServiceQuestion()

const service_answer = new ServiceAnswerOptions()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token
const department = obtenerCookiesUsuario().department

let loader = ref(true)

const props = defineProps({

    idSurvey: { // id encuesta
        type: Number,
        require: true,
    }

    // idQuestion: { // id de la pregunta
    //     type: String,
    //     require: true,
    // }

})

onMounted(async () => {

    try {
        const where = {
            IdDepartments: department
        }

        if (department === 'all') delete where.IdDepartments

        loader.value = true
        await service_library_question.unique({ params: where, token: token })

        loader.value = false
    } catch (error) {
        console.error(error)
    }

})


async function addQuestion(item) {

    const IdQuestion = generateUuid()
    let toastLoading = ''

    const data = {
        IdEncuesta: props?.idSurvey,
        IdQuestion: IdQuestion,
        TextoPregunta: item.TextoPregunta,
        IdTipreg: item.IdTipreg,
        IdQuestionInLibrary: item.IdQuestion,
        UsrCrea: userName.toUpperCase()
    }

    toastLoading = toast.loading("Guardando, Favor espere...", {
        position: toast.POSITION.BOTTOM_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
    });

    // GUARDO LA PREGUNTA
    await service_question.add({ data: data, token: token })

    // GUARDO LAS OPCIONES DE LAS PREGUNTAS
    const service_library_answer = new ServiceLibraryAnswers()
    const bd_service_answer_library = service_library_answer.getFuentesData()

    const where = {
        IdQuestion: item.IdQuestion
    }

    await service_library_answer.unique({ params: where, token: token })

    try {
        for (const element of bd_service_answer_library.value) {

            const dataAnswer = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: IdQuestion,
                TextoRespuesta: element.TextoRespuesta,
                UsrCrea: userName.toUpperCase(),
                IndexTarget: element.IndexTarget

            }

            await service_answer.add({ data: dataAnswer, token: token })

        };

        toast.remove(toastLoading)
        window.location.reload()

    } catch (error) {
        console.error("Error al agregar la pregunta a la biblioteca:", error);
        // Maneja el error según tus necesidades
    }
}
</script>

<template>

    <div class="cards me-2 ms-2">

        <div v-for="item, index in bd_service_library_question" :key="index" class="card green"
            @click="addQuestion(item)">
            <p class="tip"></p>
            <div class="tooltip-container">
                <span class="tooltip">Creado por: {{ item.UsrCrea.toLowerCase() }}</span>
                <p class="second-text" @click="addQuestion(item)">{{ item.TextoPregunta }}</p>
            </div>
        </div>
    </div>


</template>

<style scoped>
.tooltip-container {
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
}

.tooltip {
    --background-tooltip: #198754;
    /* Default background color for tooltip */
    position: absolute;
    top: -10px;
    /* Adjusted top position */
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5em;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
    background: var(--background-tooltip);
    color: white;
    /* Text color */
    border-radius: 5px;
    width: 410px;
    height: 25px;
    font-size: 10px;
    text-align: center;
}

.tooltip::before {
    position: absolute;
    content: "";
    height: 0.6em;
    width: 0.6em;
    bottom: -0.2em;
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    background: var(--background-tooltip);
    /* Use the same background color as the tooltip */
}

.tooltip-container:hover .tooltip {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}


.cards {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.cards .red {
    background-color: #f43f5e;
}

.cards .blue {
    background-color: #3b82f6;
}

.cards .green {
    background-color: #292F3E;
}

.cards .card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    height: 50px;
    width: auto;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: 400ms transform, 400ms box-shadow, 400ms background-color;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.cards .card p.tip {
    font-size: 0.7em;
    font-weight: 700;
}

.cards .card p.second-text {
    font-size: 1em;
}

.cards .card:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    background-color: rgba(255, 255, 255, 0.1);
    color: #333;
}

.cards:hover>.card:not(:hover) {
    filter: blur(10px);
    transform: scale(0.9);
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>