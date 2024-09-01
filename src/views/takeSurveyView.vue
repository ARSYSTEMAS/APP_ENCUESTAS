<script setup>
import { defineAsyncComponent } from 'vue'
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
//import TakeSurvey from '../components/take_survey/TakeSurvey.vue'
//import TakeSurveyVertical from '../components/take_survey_vertical/TakeSurveyVertical.vue'
//import TakeSurveyVerticalJump from '../components/take_survey_vertical/TakeSurveyVerticalJump.vue'
import ServiceSurvey from '../services/takeSurvey/Survey'
import { toast } from 'vue3-toastify';
//import Spinner from '../components/Spinner.vue'
//import CardError from '../components/CardError.vue'
import obtenerCookiesUsuario from '../function/cookies'
import ServiceQuestion from '../services/takeSurvey/Questions'



const TakeSurvey = defineAsyncComponent(() =>
  import('../components/take_survey/TakeSurvey.vue')
)

const TakeSurveyVertical = defineAsyncComponent(() =>
  import('../components/take_survey_vertical/TakeSurveyVertical.vue')
)

const TakeSurveyVerticalJump = defineAsyncComponent(() =>
  import('../components/take_survey_vertical/TakeSurveyVerticalJump.vue')
)


const Spinner = defineAsyncComponent(() =>
  import('../components/Spinner.vue')
)

const CardError = defineAsyncComponent(() =>
  import('../components/CardError.vue')
)


const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const route = useRoute()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const service_survey = new ServiceSurvey()
const bdsurvey = service_survey.getFuentesData()

//Aqui el link url de la encuesta
const idSurvey = ref() // id de la encuesta creada
idSurvey.value = route.params.id

const idEncuesta = ref(null)
const numResponse = ref(null)
const typeSurvey = ref()
let loading = ref(true)

const tittle = 'Error 404: Información no disponible.'
const msg = 'La búsqueda no produjo resultados.'

const SURVEYNOTACTIVE = ref(false)
const SURVEYJUMP = ref(false)

onMounted(async () => {

  try {

    const where = {
      UrlSurvey: idSurvey.value,
      Estado: 1
    }

    await service_survey.unique({ params: where }) // obtengo los datos de la encuesta

    loading.value = false

    if (bdsurvey.value.length > 0) {

      idEncuesta.value = bdsurvey.value[0].Id
      numResponse.value = bdsurvey.value[0].Respuestas
      typeSurvey.value = bdsurvey.value[0].TypeSurvey

      handleHasBranches()

    } else {

      SURVEYNOTACTIVE.value = true

      toast.error('Lo siento, la encuesta ya no se encuentra activa o fue respondida', {
        position: toast.POSITION.BOTTOM_CENTER,
        theme: 'light',
      });
    }

  } catch (error) {

    console.error(error)
  }


})

async function handleHasBranches() {

  try {

    //verificamos si la encuesta tiene saltos y ramas
    const where = {
      IdEncuesta: idEncuesta.value,
      Jump: 1
    }

    await service_question.unique({ params: where }) // obtengo los datos de la encuesta
    bd_service_question.value.length > 0 ? SURVEYJUMP.value = true : SURVEYJUMP.value

  } catch (error) {

    console.error(error)
  }


}

</script>

<template>

  <div class="progress-bar-inner tooltipstered" data-qptooltip="tooltip" data-qptitle="100%" style="width:100%"
    bis_skin_checked="1"></div>

  <div class="container  h-100">

    <div v-if="loading">
      <Spinner />
    </div>

    <div class="d-flex justify-content-end pt-2" style="cursor: pointer;"><a href="https://www.tiendasdaka.com/"><i
          class="fa-solid fa-right-from-bracket survey-exit"></i></a></div>

    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-lg-12 col-xl-11">
        <div class="card-body p-md-5">
          <div class="row justify-content-center">
            <div v-if="idEncuesta" class="col-md-10 col-lg-12 col-xl-10 order-2 order-lg-1">

              <!-- Formato encuesta horizontal -->
              <div v-if="typeSurvey === 'H'">
                <Suspense>
                  <TakeSurvey :idSurvey=idEncuesta :response=numResponse />
                  <!-- Fin formato encuesta -->
                  <!-- loading state via #fallback slot -->
                  <template #fallback>
                    Cargando por favor espere...
                  </template>
                </Suspense>
              </div>

              <div v-else>

                <div>
                  <Suspense>
                  <!-- <TakeSurveyVertical :idSurvey=idEncuesta :response=numResponse /> -->
                  <TakeSurveyVerticalJump :idSurvey=idEncuesta :response=numResponse />
                   <!-- loading state via #fallback slot -->
                   <template #fallback>
                    Cargando por favor espere...
                  </template>
                </Suspense>
                </div>
                <!-- <div v-else>
                  <Suspense>
                  <TakeSurveyVerticalJump :idSurvey=idEncuesta :response=numResponse />
                   <template #fallback>
                    Cargando por favor espere...
                  </template>
                </Suspense>
                </div> -->
                <!-- Fin formato encuesta -->
              </div>

            </div>

            <div v-if="SURVEYNOTACTIVE">

              <CardError :tittle=tittle :msg=msg />

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.progress-bar-inner {

  background: #0a86ea;
  height: 10px;
  bottom: 0;
  left: 0;
  position: absolute;
  top: 0;

}

.survey-exit {

  color: #0a86ea;
  line-height: calc(30px + 8px);
}
</style>