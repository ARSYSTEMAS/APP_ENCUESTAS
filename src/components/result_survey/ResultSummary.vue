<script setup>
import { ref, onMounted } from 'vue';
import ServiceResponse from '../../services/Response'
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceQuestion from '../../services/takeSurvey/Questions'
import Loader from '../../components/Loader.vue'

const service_response = new ServiceResponse()
const bd_service_response = service_response.getFuentesData()

const default_question_selection = ref([1, 2, 3]) // preguntas tipo seleccion
let loader = ref(false)

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()


const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const points_correct = ref(0)
const points_wrong = ref(0)
const tot_question = ref(0)
const tot_points = ref(0)
const points_earned = ref(0)

const message_summary = ref()
const message_summary_detail = ref()



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
    const whereQuestion = {
      IdEncuesta: props?.idSurvey

    }
    loader.value = true
    await service_question.unique({ params: whereQuestion })

    const where = {
      IdEncuesta: props?.idSurvey,
      IdUserResponse: props?.idUserResponse
    }

    await service_response.unique({ params: where })

    correctAnswers()
    totalQuestion()
    wrongAnswers()
    totalScoreQuestion()
    totalScoreResponse()
    finalSummary()

    loader.value = false
  } catch (error) {
    console.error(error)
  }
})


function totalScoreResponse() { //Suma del total de puntos de las respuestas obtenidas

  let sum = bd_service_response.value.reduce((total, item) => {
    return total + (item.Score || 0);
  }, 0);

  points_earned.value = sum

}


function totalScoreQuestion() { //Suma del total de puntos del puntaje de la encuesta

  const sumarScoreUnico = (arr) => {
    const seenQuestions = new Set();
    return arr.reduce((total, item) => {
      if (!seenQuestions.has(item.IdQuestion)) {
        seenQuestions.add(item.IdQuestion);
        return total + item.ScoreQuestion;
      }
      return total;
    }, 0);
  };

  const totalScore = sumarScoreUnico(bd_service_response.value);
  tot_points.value = totalScore

}


function correctAnswers() { // respuestas correctas

  const questions = bd_service_response.value.filter(item => item.Score != null && item.ScoreQuestion != null && item.Score == item.ScoreQuestion || (item.ScoreQuestion / item.Score) % 2 === 0)

  const uniqueQuestions = new Set();
  questions.forEach(item => {
    uniqueQuestions.add(item.IdQuestion);
  });

  const uniqueCount = uniqueQuestions.size;
  points_correct.value = uniqueCount


}


function wrongAnswers() { //respuestas incorrectas

  points_wrong.value = bd_service_response.value.filter(item => item.Score == null && item.ScoreQuestion > 0).length
}


function totalQuestion() { //Numero de preguntas en la encuesta

  const validTipregs = [1, 2, 3];
  tot_question.value = bd_service_question.value.filter(item =>
    validTipregs.includes(item.IdTipreg) && item.TypeEvaluation === 1
  ).length;


}

function finalSummary() {

  const totalPuntos = tot_points.value

  if (points_earned.value < (totalPuntos / 2)) {

    message_summary.value = 'Reprobado'
    message_summary_detail.value = `Obtuviste una puntuación inferior al 50% del total de puntos de la encuesta.`

    document.querySelectorAll('.confetti-piece').forEach(function (el) {
      el.remove();
    });
  }

  if (points_earned.value > (totalPuntos / 2)) {

    message_summary.value = 'Excelente'
    message_summary_detail.value = `Obtuviste una puntuación superior al 50% del total de puntos de la encuesta.`

  }

}

</script>


<template>


  <div class="results-summary-container mt-5">
    <div class="confetti">
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
    </div>
    <div class="results-summary-container__result">
      <div class="heading-tertiary">Tus resultados</div>
      <div class="result-box">
        <div class="heading-primary">{{ points_earned }}</div>
        <p class="result">de {{ tot_points }}</p>
      </div>
      <div class="result-text-box">
        <div class="heading-secondary" :class="message_summary === 'Reprobado' ? 'text-reprobado' : null">
          {{ message_summary }}</div>
        <p class="paragraph">
          {{ message_summary_detail }}
        </p>
      </div>
    </div>
    <div class="results-summary-container__options">
      <div class="heading-secondary heading-secondary--blue">Resumen</div>
      <div class="summary-result-options">
        <div class="result-option result-option-reaction">
          <div class="icon-box">
            <svg viewBox="0 0 20 20" fill="none" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.833 8.333V2.5l-6.666 9.167h5V17.5l6.666-9.167h-5Z" stroke-width="1.25"
                stroke-linejoin="round" stroke-linecap="round" stroke="#F55"></path>
            </svg>
            <span class="memory-icon-text">Correctas</span>
          </div>
          <div class="result-box"><span>{{ points_correct }}</span> / {{ tot_question }}</div>
        </div>
        <div class="result-option result-option-memory">
          <div class="icon-box">
            <svg viewBox="0 0 20 20" fill="none" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.833 11.667a2.5 2.5 0 1 0 .834 4.858" stroke-width="1.25" stroke-linejoin="round"
                stroke-linecap="round" stroke="#FFB21E"></path>
              <path
                d="M3.553 13.004a3.333 3.333 0 0 1-.728-5.53m.025-.067a2.083 2.083 0 0 1 2.983-2.824m.199.054A2.083 2.083 0 1 1 10 3.75v12.917a1.667 1.667 0 0 1-3.333 0M10 5.833a2.5 2.5 0 0 0 2.5 2.5m1.667 3.334a2.5 2.5 0 1 1-.834 4.858"
                stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round" stroke="#FFB21E"></path>
              <path
                d="M16.447 13.004a3.334 3.334 0 0 0 .728-5.53m-.025-.067a2.083 2.083 0 0 0-2.983-2.824M10 3.75a2.085 2.085 0 0 1 2.538-2.033 2.084 2.084 0 0 1 1.43 2.92m-.635 12.03a1.667 1.667 0 0 1-3.333 0"
                stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round" stroke="#FFB21E"></path>
            </svg>
            <span class="reaction-icon-text">Incorrectas</span>
          </div>
          <div class="result-box"><span> {{ points_wrong }}</span> / {{ tot_question }}</div>
        </div>
        <div class="result-option result-option-verbal">
          <div class="icon-box">
            <i class="fa-solid fa-file-powerpoint"></i>
            <span class="verbal-icon-text"> Total de Puntos</span>
          </div>
          <div class="result-box"><span>{{ tot_points }}</span></div>
        </div>
        <div class="result-option result-option-Visual">
          <div class="icon-box">
            <svg viewBox="0 0 20 20" fill="none" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 11.667a1.667 1.667 0 1 0 0-3.334 1.667 1.667 0 0 0 0 3.334Z" stroke-width="1.25"
                stroke-linejoin="round" stroke-linecap="round" stroke="#1125D6"></path>
              <path
                d="M17.5 10c-1.574 2.492-4.402 5-7.5 5s-5.926-2.508-7.5-5C4.416 7.632 6.66 5 10 5s5.584 2.632 7.5 5Z"
                stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round" stroke="#1125D6"></path>
            </svg>
            <span class="visual-icon-text">Puntos Obtenidos</span>
          </div>
          <div class="result-box"><span>{{ points_earned }}</span></div>
        </div>

      </div>
    </div>
  </div>

  <div v-if="loader">
    <Loader />
  </div>

</template>

<style scoped>
.text-reprobado {

  color: red;
  background-color: #dd2476;
}

.results-summary-container {
  font-family: "Hanken Grotesk", sans-serif;
  display: flex;
  width: auto;
  gap: 10px;
  border-radius: 30px;
  box-shadow: 10px 10px 30px rgba(120, 87, 255, 0.3);
  backface-visibility: hidden;
}

.heading-primary,
.heading-secondary,
.heading-tertiary {
  color: #ffffff;
  text-transform: capitalize;
  margin-bottom: 15px;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.heading-primary {
  font-size: 46px;
  font-weight: 700;
  background-image: linear-gradient(to right, #f7bb97, #dd5e89);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: scale(1.4);
}

.heading-secondary {
  font-size: 24px;
  font-weight: 700;
  margin-top: 20px;
  letter-spacing: 1px;
}

.heading-secondary--blue {
  color: hsl(224, 30%, 27%);
}

.heading-tertiary {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
  color: hsl(221, 100%, 96%);
}

.paragraph {
  font-size: 17px;
  line-height: 1.6;
  color: hsl(221, 100%, 96%);
  margin-bottom: 15px;
}

.paragraph-text-box {
  width: 100%;
}

.text-center {
  text-align: center;
}

.margin-1 {
  margin-bottom: 10px;
}

.results-summary-container__result {
  width: 50%;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 10px 5px;
  border-radius: 30px 10px;
  background-image: linear-gradient(to bottom, #12408E, #4581E7);
  animation: gradient 10s linear infinite;

  .result-box {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-position: 100% 50%;
    background-image: linear-gradient(to bottom, #12408E, #4581E7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: gradient 10s linear infinite;
  }

  .result {
    margin-top: -18px;
    font-size: 14px;
    font-weight: 400;
    color: hsl(241, 100%, 89%);
  }
}

.results-summary-container__options {
  padding: 10px;
}

.summary-result-options {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.result-option {
  width: 210px;
  height: 36px;
  background-color: hsl(147, 88%, 36%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-radius: 3px;
  cursor: pointer;
}

.result-option-memory {
  background-color: #FCE8E6;
}

.result-option-verbal {
  background-color: hsl(166, 100%, 95%);
}

.result-option-Visual {
  background-color: hsl(234, 85%, 95%);
}

.icon-box {
  display: flex;
  font-size: 14px;
  align-items: center;
  gap: 1px;
}

.reaction-icon-text {
  color: hsl(0, 100%, 67%);
}

.memory-icon-text {
  color: hsl(0, 8%, 95%);
}

.verbal-icon-text {
  color: hsl(166, 100%, 37%);
}

.visual-icon-text {
  color: hsl(234, 85%, 45%);
}

.result-box {
  font-size: 14px;
  color: hsl(241, 100%, 89%);
  font-weight: 700;
}

.result-box span {
  font-size: 14px;
  color: hsl(224, 30%, 27%);
}

.btn {
  width: 100%;
  padding: 10px;
  color: #ffffff;
  background-image: linear-gradient(to right, #12408E, #4581E7);
  border: none;
  border-radius: 5px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  animation: background 10s linear infinite;
}

.btn:hover {
  transform: translateY(5px);
  background-image: linear-gradient(to left, #12408E, #4581E7);
}

.icon {
  cursor: pointer;
  filter: grayscale(1);
  transition: 0.3s linear;
}

.icon:hover {
  filter: grayscale(0);
}

@keyframes background {
  0% {
    background-image: linear-gradient(to right, #12408E, #4581E7);
  }

  50% {
    background-image: linear-gradient(to right, #12408E, #4581E7);
  }

  100% {
    background-image: linear-gradient(to right, #12408E, #4581E7);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
    background-image: linear-gradient(-45deg, #12408E, #4581E7);
  }

  50% {
    background-position: 100% 50%;
    background-image: linear-gradient(to bottom, #12408E, #4581E7);
  }

  100% {
    background-position: 0% 50%;
    background-image: linear-gradient(to top, #12408E, #4581E7);
  }
}

.confetti {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 240px;
  height: 100%;
  overflow: hidden;
  z-index: 1000;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 20px;
  background-color: hsl(39, 100%, 56%);
  top: 0;
  opacity: 0;
  animation: makeItRain 3000ms infinite linear;
}

.confetti-piece:nth-child(1) {
  left: 7%;
  transform: rotate(-10deg);
  animation-delay: 182ms;
  animation-duration: 2000ms;
}

.confetti-piece:nth-child(2) {
  left: 14%;
  transform: rotate(20deg);
  animation-delay: 161ms;
  animation-duration: 2076ms;
}

.confetti-piece:nth-child(3) {
  left: 21%;
  transform: rotate(-51deg);
  animation-delay: 481ms;
  animation-duration: 2103ms;
}

.confetti-piece:nth-child(4) {
  left: 28%;
  transform: rotate(61deg);
  animation-delay: 334ms;
  animation-duration: 1008ms;
}

.confetti-piece:nth-child(5) {
  left: 35%;
  transform: rotate(-52deg);
  animation-delay: 302ms;
  animation-duration: 1776ms;
}

.confetti-piece:nth-child(6) {
  left: 42%;
  transform: rotate(38deg);
  animation-delay: 180ms;
  animation-duration: 1168ms;
}

.confetti-piece:nth-child(7) {
  left: 49%;
  transform: rotate(11deg);
  animation-delay: 395ms;
  animation-duration: 1200ms;
}

.confetti-piece:nth-child(8) {
  left: 56%;
  transform: rotate(49deg);
  animation-delay: 14ms;
  animation-duration: 1887ms;
}

.confetti-piece:nth-child(9) {
  left: 63%;
  transform: rotate(-72deg);
  animation-delay: 149ms;
  animation-duration: 1805ms;
}

.confetti-piece:nth-child(10) {
  left: 70%;
  transform: rotate(10deg);
  animation-delay: 351ms;
  animation-duration: 2059ms;
}

.confetti-piece:nth-child(11) {
  left: 77%;
  transform: rotate(4deg);
  animation-delay: 307ms;
  animation-duration: 1132ms;
}

.confetti-piece:nth-child(12) {
  left: 84%;
  transform: rotate(42deg);
  animation-delay: 464ms;
  animation-duration: 1776ms;
}

.confetti-piece:nth-child(13) {
  left: 91%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 1818ms;
}

.confetti-piece:nth-child(14) {
  left: 94%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 818ms;
}

.confetti-piece:nth-child(15) {
  left: 96%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 2818ms;
}

.confetti-piece:nth-child(16) {
  left: 98%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 2818ms;
}

.confetti-piece:nth-child(17) {
  left: 50%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 2818ms;
}

.confetti-piece:nth-child(18) {
  left: 60%;
  transform: rotate(-72deg);
  animation-delay: 429ms;
  animation-duration: 1818ms;
}

.confetti-piece:nth-child(odd) {
  background-color: hsl(0, 100%, 67%);
}

.confetti-piece:nth-child(even) {
  z-index: 1;
}

.confetti-piece:nth-child(4n) {
  width: 6px;
  height: 14px;
  animation-duration: 4000ms;
  background-color: #c33764;
}

.confetti-piece:nth-child(5n) {
  width: 3px;
  height: 10px;
  animation-duration: 4000ms;
  background-color: #b06ab3;
}

.confetti-piece:nth-child(3n) {
  width: 4px;
  height: 12px;
  animation-duration: 2500ms;
  animation-delay: 3000ms;
  background-color: #dd2476;
}

.confetti-piece:nth-child(3n-7) {
  background-color: hsl(166, 100%, 37%);
}

@keyframes makeItRain {
  from {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  to {
    transform: translateY(250px);
  }
}

/* Estilos específicos para dispositivos móviles */
@media screen and (max-width: 768px) {

  /* Estilos para dispositivos móviles */
  .results-summary-container {
    font-family: "Hanken Grotesk", sans-serif;
    display: flex;
    flex-wrap: wrap;
    /* Añadido para que los elementos se ajusten correctamente */
    gap: 10px;
    border-radius: 30px;
    box-shadow: 10px 10px 30px rgba(120, 87, 255, 0.3);
    backface-visibility: hidden;
  }

  .results-summary-container__result {
    width: 100%;
    /* Cambiado al 100% para ocupar todo el ancho */
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    padding: 10px 5px;
    border-radius: 30px 10px;
    background-image: linear-gradient(to bottom, #12408E, #4581E7);
    animation: gradient 10s linear infinite;
  }



  .result {
    margin-top: 10px;
    /* Cambiado a un valor positivo para separar del borde superior */
    font-size: 14px;
    font-weight: 400;
    color: hsl(241, 100%, 89%);
  }


  .results-summary-container__options {
    padding: 10px;
  }

  .summary-result-options {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .result-option {
    width: 100%;
    /* Cambio el ancho para que se ajuste automáticamente */
    height: 36px;
    background-color: hsl(147, 88%, 36%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    border-radius: 3px;
    cursor: pointer;
  }


}
</style>