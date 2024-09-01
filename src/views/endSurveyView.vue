<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import ServiceQuestion from '../services/takeSurvey/Questions'
import obtenerCookiesUsuario from '../function/cookies'
import Loader from '../components/Loader.vue'

const route = useRoute()
const router = useRouter()

const idUserResponse = ref()
const idEncuesta = ref()

idUserResponse.value = route.params?.id
idEncuesta.value = route.params?.idEncuesta

let hasScore = ref(false)
let loader = ref()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()


onMounted(async () => {

  try {

    const where = {
      IdEncuesta: idEncuesta.value
    }

    loader.value = true
    await service_question.unique({ params: where })
    loader.value = false
    iterateDataSurvey()

  } catch (error) {
    console.error(error)
  }


})


function iterateDataSurvey() {

  for (const element of bd_service_question.value) {

    if (element.ShowResults) {
      hasScore.value = true;
      break;
    }
  }

}


function viewSurveyResuls() {

  router.push({ name: 'SurveyResult', params: { id: idEncuesta.value, idUser: idUserResponse.value } });
}

</script>

<template>
  <div v-if="loader">
    <Loader />
  </div>
  <section class="vh-100">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-12 col-xl-11 justify-content-center align-items-center">
          <div class="card text-center">
            <div class="card-header h3 text-white bg-primary">Encuesta Finalizada</div>
            <div class="card-body px-5">
              <p style="text-align: center;font-size: 28px;font-weight: 500;line-height: 42px; color:#0a86ea">
                Gracias por completar esta encuesta <i class="fa-solid fa-thumbs-up"></i>
              </p>
            </div>
          </div>
          <div>

            <div v-if="hasScore">
              <button class="btn-result mt-3" @click="viewSurveyResuls"><i class="animation"></i>VER
                PUNTUACIÓN<i class="animation"></i>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
.btn-result {
  outline: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background: #0D6EFD;
  min-width: 200px;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .1);
  box-sizing: border-box;
  padding: 16px 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
}

.btn-result:hover {
  opacity: .95;
}

.btn-result .animation {
  border-radius: 100%;
  animation: ripple 0.6s linear infinite;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 40px rgba(255, 255, 255, 0.1), 0 0 0 60px rgba(255, 255, 255, 0.1);
  }

  100% {
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 40px rgba(255, 255, 255, 0.1), 0 0 0 60px rgba(255, 255, 255, 0.1), 0 0 0 80px rgba(255, 255, 255, 0);
  }
}
</style>