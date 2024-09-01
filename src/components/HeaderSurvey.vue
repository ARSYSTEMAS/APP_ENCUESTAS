<script setup>
import { ref, onMounted } from 'vue';
import ServiceSurvey from '../services/takeSurvey/Survey'
import obtenerCookiesUsuario from '../function/cookies'
import Loader from '../components/Loader.vue'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const service_survey = new ServiceSurvey()
const bdsurvey = service_survey.getFuentesData()

let loader = ref(true)

const props = defineProps({

  idSurvey: {
    type: Number,
    require: true,
  }// el id de la encuesta 
})

onMounted(async () => {
  try {
    const where = {
      Id: props?.idSurvey
    }

    await service_survey.unique({ params: where }) // obtengo el nombre de la encuesta
    loader.value = false
  } catch (error) {
    console.error(error)
  }

})

</script>


<template>

  <div class="row d-flex justify-content-center align-items-center pb-5 p-2">
    <img src="@/assets/img/logo-daka-encuesta.png" id="image" class="p-2" />
    <div class="card  " style="max-width: 32rem">
      <!-- News block -->
      <div>
        <div v-if="loader">
          <Loader />
        </div>
        <!-- Titulo de la Encuesta -->
        <div class="row mb-1">
          <div class="col-12 p-2">
            <h3>{{ bdsurvey[0]?.Nombre }}</h3>
          </div>
        </div>

        <!-- Encabezado de la Encuesta -->
        <p>
          {{ bdsurvey[0]?.Encabezado }}
        </p>

      </div>
    </div>

    <div class="required mt-3">* Indica que la pregunta es obligatoria</div>

  </div>


</template>

<style scoped>
.required {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.25rem;
  color: #DB3033;
}

#image {

  width: 150px;
  height: 150px;
}
</style>
