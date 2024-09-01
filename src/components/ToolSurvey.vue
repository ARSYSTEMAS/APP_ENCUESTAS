<script setup>
import { ref, defineEmits } from 'vue';

const props = defineProps({
    viewMode: {
        type: String,
        required: false
    },
    showResultsEnd: {
        type: Boolean,
        required: false
    },
    nameSurvey: {
        type: String,
        required: false
    },
    nameHeader: {
        type:String,
        required: false
    },
    isSurvey: {
        type:Boolean,
        required: true
    },
    istools: {
        type:Boolean,
        required: true
    },
    isAnalisis: {
        type:Boolean,
        required: true
    }

})



const emit = defineEmits(['goBack', 'reviewMode', 'library', 'orderQuestions','itemSelectOne', 'libraryImages', 'showResultsEnd'])

const activeGoBack = () => emit("goBack")

const activeReviewMode = () => emit("reviewMode")

const activeShowResultsEnd = () => emit("showResultsEnd")

const activeLibrary = () => emit("library")

const activeImages = () => emit("libraryImages")

const activeOrderQuestions = () => emit("orderQuestions")

const addGroup = (url, typequestion) => emit("itemSelectOne", url, typequestion)

</script>

<template>

<ul class="nav nav-tabs navFixed">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="pills-home-tab" @click="activeGoBack" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true"><i class="fa-solid fa-caret-left"></i> Regresar</button>
  </li>
  <li v-if="props?.isSurvey" class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"><i class="fa-solid fa-square-poll-vertical"></i> Encuesta</a>
    <ul class="dropdown-menu">

      <li ><a class="dropdown-item" href="#" @click="activeReviewMode"><i class="fa-solid fa-eye"></i> Review Mode ( {{ props?.viewMode === 'H' ? 'Vertical' : 'Horizontal' }} )</a></li>

      <li  :class="props?.showResultsEnd ? 'bg-danger' : 'bg-success'" ><a class="dropdown-item text-light" href="#" @click="activeShowResultsEnd"><i :class="props?.showResultsEnd ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i> {{ props?.showResultsEnd ? 'No mostrar resultados de evaluación' : 'Mostrar los resultados de evaluación' }} </a></li>

      <li><a class="dropdown-item" style=" cursor: pointer" @click="activeLibrary"><i class="fa-regular fa-bookmark"></i> Biblioteca de preguntas</a></li>

      <li><a class="dropdown-item disabled" style=" cursor: pointer" @click="activeImages"><i class="fa-solid fa-image"></i> Biblioteca de imagenes</a></li>

      <li><a class="dropdown-item" style=" cursor: pointer" @click="activeOrderQuestions"><i class="fa-solid fa-sort"></i> Ordenar preguntas</a></li>

      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item disabled" href="#">Descargar lista de preguntas</a></li>
    </ul>
  </li>
  <li v-if="props?.istools" class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"><i class="fa-solid fa-gear"></i> Herramientas</a>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" @click="addGroup('sectionHeading.png', 8)" ><i class="fa-regular fa-file-lines"></i> Encabezado de la seccion</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('selectOne.png', 1)" ><i class="fa-regular fa-circle-dot"></i> Seleccionar una</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('selectMany.png', 2)"><i class="fa-regular fa-square-check"></i> Seleccionar varias</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('dropdownMenu.png', 3)"><i class="fa-solid fa-bars"></i> Menu desplegable</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('textRow.png', 4)"><i class="fa-solid fa-text-width"></i> Texto de una sola fila</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('email.png', 5)"><i class="fa-solid fa-at"></i> Email</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup('selectorImage.png', 7)"><i class="fa-solid fa-cloud-arrow-up"></i> Selector de archivos</a></li>
      <li><a class="dropdown-item" href="#" @click="addGroup(null, 9)"><i class="fa-solid fa-book"></i> Agregar de biblioteca</a></li>
    </ul>
  </li>
  <li v-if="props?.isAnalisis" class="nav-item">
    <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true"><i class="fa-solid fa-chart-simple"></i> Análisis</a>
  </li>
</ul>

<div v-if="props?.nameSurvey" class="cardSurvey">
       
        <div class="contentSurvey">
            <span class="titleSurvey">{{ props?.nameSurvey}}</span>
            <div class="desc ">{{ props?.nameHeader}}</div> 

        </div>
       
</div>

</template>

<style>

 .navFixed {
  position: fixed;
  width: 100%;
  z-index: 1000;
  background-color: #F0F2F5; 
}

.cardSurvey {
  max-width: auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-radius: 0.5rem;
  background: #606c88;
  background: -webkit-linear-gradient(to right, #3f4c6b, #606c88);
  background: linear-gradient(to right top, #3f4c6b, #606c88);
  padding: 1rem;
  color: rgb(107, 114, 128);
  box-shadow: 0px 87px 78px -39px rgba(0,0,0,0.4);
  margin-top: 85px;
}

.contentSurvey {
  margin-left: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
}

.titleSurvey {
  margin-bottom: 0.25rem;
  font-size: 0.975rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: rgb(255, 255, 255);
}

.desc {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: rgb(202, 200, 200);
}
</style>