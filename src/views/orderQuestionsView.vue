<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import ServiceQuestion from '../services/Questions';
import obtenerCookiesUsuario from '../function/cookies';
import ObtenerFecha from '../function/ObtenerFecha';
import { toast } from 'vue3-toastify';
import ToolSurvey from '@/components/ToolSurvey.vue'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const service_question = new ServiceQuestion();
const BD_SERVICE_QUESTION = service_question.getFuentesData()

const draggedItem = ref(null)

const route = useRoute()
const router = useRouter()

//Aqui el id de la encuesta
const idSurvey = ref() // id de la encuesta creada
idSurvey.value = route.params.id

onMounted(async () => {

  try {
    const where = {
      IdEncuesta: idSurvey.value
    }
    await service_question.unique({ params: where, token: token })

    // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
    BD_SERVICE_QUESTION.value.sort((a, b) => a.OrderBy - b.OrderBy);
  } catch (error) {

    console.error(error)
  }


})

// SE EJECUTA AL INICIO DE ARRASTRE EL ELEMENTO
const handleDragStart = (index) => {
  // almaceno el index actual en la variable reactiva
  draggedItem.value = index
}

// EJECUTA UN preventDefault
const handleDragOver = (event) => {
  event.preventDefault();
}

// EJECUTO EL ORDEN DE LA LISTA
const handleDrop = async (inTheIndex) => {

  let toastLoading = ''
  const customId = 'custom-id';
  const custom = 'custom';

  //RECUPERAMOS EL ELEMENTO QUE ESTAMOS ARRASTRANDO con el index raggedItem.value
  const droppedItem = BD_SERVICE_QUESTION.value.splice(draggedItem.value, 1)[0]

  //COLOCO EL OBJECTO EL EN INDEX QUE QUIERO A TRAVES DE inTheIndex
  BD_SERVICE_QUESTION.value.splice(inTheIndex, 0, droppedItem)

  //limpio la variable
  draggedItem.value = null

  let numOrder = 1

  toastLoading = toast.loading("Guardando, Favor espere...", {
    position: toast.POSITION.BOTTOM_CENTER,
    transition: toast.TRANSITIONS.SLIDE,
    toastId: customId,
    theme: 'dark',
  });

  for (const element of BD_SERVICE_QUESTION.value) {

    try {
      const where = {
        IdQuestion: element.IdQuestion,
        IdEncuesta: idSurvey.value

      }

      const data = {
        OrderBy: numOrder,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()

      }

      await service_question.updateOrderBy({ data: data, params: where, token: token })
      numOrder++
    } catch (error) {
      console.error(error)
    }


  };

  toast.remove(toastLoading)
  toast.info("Se ha ordenado las preguntas sastifactoriamente", {
    position: toast.POSITION.BOTTOM_RIGHT,
    transition: toast.TRANSITIONS.SLIDE,
    autoClose: 1000,
    toastId: custom,
    theme: 'dark',
  });
}

// CUANDO FINALIZAR EL ARRASTRAR Y SOLTAR LIMPIE LA VARIABLE
const handleDragEnd = () => {
  draggedItem.value = null
}
function back() {
  router.go(-1)
}
</script>

<!-- EVENTOS DRAP AND DROP VUE3 -->
<!-- DRAGGABLE: indica si un elemento es arrastable
 ONDRAGSTART: se ejecuta al inicio de arrastrar un ELEMENTO
 ONDRAG: se ejecuta constantemente mientras se arrastra el ELEMENTO
 ONDRAGEND: se ejecuta al terminar de arrastrar un ELEMENTO

 ONDRAGENTER: cuando el elemento arrastrado entra en un area de destino
 ONDRAGOVER: cuando el elemento esta sobre un area de destino
 ONDRAGLEAVE: cuando el elemento sale de la zona de destino -->

<template>

  <ToolSurvey :isSurvey=false :istools=false :isAnalisis=true @goBack="back" />

  <div class="alert alert-primary mt-5" role="alert">
    <i class="fa-solid fa-triangle-exclamation"></i> Arrastre y suelte la pregunta que desea ordenar a una posicion
    especifica
  </div>

  <div v-if="BD_SERVICE_QUESTION.length > 0" class="sortable-list">
    <div v-for="(question, index) in BD_SERVICE_QUESTION" :key="index" :draggable="true"
      @dragstart="handleDragStart(index)" @dragover="handleDragOver" @drop="handleDrop(index)" @dragend="handleDragEnd"
      class="page">
      <div class="margin"></div>
      <p>{{ question.TextoPregunta }}</p>
    </div>
  </div>
  <div v-else>
    Cargando preguntas...
  </div>
</template>

<style scoped>
.sortable-list div.dragged {
  background-color: beige;
}

.page {
  position: relative;
  box-sizing: border-box;
  /* max-width: 300px; */
  font-family: cursive;
  font-size: 20px;
  border-radius: 10px;
  background: #fff;
  background-image: linear-gradient(#f5f5f0 1.1rem, #ccc 1.2rem);
  background-size: 100% 1.2rem;
  line-height: 1.2rem;
  padding: 1.4rem 0.5rem 0.3rem 4.5rem;

}

.page::before,
.page::after {
  position: absolute;
  content: "";
  bottom: 10px;
  width: 40%;
  height: 10px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.7);
  z-index: -1;
  transition: all 0.3s ease;
}

.page::before {
  left: 15px;
  transform: skew(-5deg) rotate(-5deg);
}

.page::after {
  right: 15px;
  transform: skew(5deg) rotate(5deg);
}

.page:hover::before,
.page:hover::after {
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.4);
}

.margin {
  position: absolute;
  border-left: 1px solid #d88;
  height: 100%;
  left: 3.3rem;
  top: 0;

}

.page p {
  margin: 0;
  text-indent: 1rem;
  padding-bottom: 1.2rem;
  color: black;
  line-height: 20px;
  cursor: move;
}
</style>