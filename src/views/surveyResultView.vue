<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import QuestionChoice from '../components/result_survey/QuestionChoice.vue'
import obtenerCookiesUsuario from '../function/cookies'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const route = useRoute()
const router = useRouter()

const idSurvey = ref() // id de la encuesta a consultar
const idUserResponse = ref()

idSurvey.value = +route.params.id //id Encuesta
idUserResponse.value = route.params.idUser //id User Response

</script>

<template>

  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-8">
        <QuestionChoice 
        :idSurvey=idSurvey 
        :idUserResponse=idUserResponse
        />
      </div>
    </div>
  </div>

</template>


<style scoped></style>
