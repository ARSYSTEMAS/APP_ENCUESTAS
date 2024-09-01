<script setup>
import { ref, onMounted } from 'vue';
import Swal from "sweetalert2"
import { toast } from 'vue3-toastify';

const IMAGES_SHOW = ref(['jpg', 'jpeg', 'png'])

const baseurl = '/api/encuestas/DownloadArchive'

const extension = ref()

const props = defineProps({

    textResponse: {
        type: String,
        require: true,
    },// el id de la encuesta

})




function isImageShow(text) {

    extension.value = text.split(".").pop().toLowerCase() //tipo de archivo

    if (!IMAGES_SHOW.value.includes(extension.value)) {

        return false
    }

    return true
}


 function downLoadArchive(e) {

  try {
    Swal.fire({
      title: "<strong>DESCARGAR ARCHIVO</strong>",
      icon: "info",
      html: `Haga clic aqui para, <a href="${e}" target="_blank">descargar archivo</a>`,
      showCloseButton: false,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: `<i class="fa fa-thumbs-up"></i> Listo!`,
      cancelButtonText: `<i class="fa fa-thumbs-down"></i>`,
      cancelButtonAriaLabel: "Thumbs down"
    });
  } catch (error) {

    toast.warn(`Error: No se pudo descargar el archivo`, {
      delay: 1000,
      position: toast.POSITION.BOTTOM_CENTER,
      transition: toast.TRANSITIONS.ZOOM,
      theme: 'info',
      autoClose: 3000
    });

  }
}
</script>

<template>

    
        <div class="tooltiptext" >Clic para descargar!</div>
        <div v-if="isImageShow(props.textResponse)" style="cursor:pointer;">
            <img :src=props?.textResponse alt="foto" class="image" @click="downLoadArchive(props?.textResponse)">
        </div>

        <div v-else style="cursor:pointer;"> 
            <img src="@/assets/img/Generic_File.png" @click="downLoadArchive(props?.textResponse)" alt="foto" class="image">
        </div>
  
</template>

<style scoped>

.tooltip:hover .tooltiptext {

    opacity: 1;
}

.tooltiptext {
    width: 160px;
    background-color: #E6F4EA;
    color: #070707;
    text-align: center;
    border-radius: 8px;
    padding: 5px;
    position: relative;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -80px;
}

.tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #0a0a0a transparent transparent transparent;
}


.image {

    margin-top: 24px;
    width: 400px;
    height: 400px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
</style>