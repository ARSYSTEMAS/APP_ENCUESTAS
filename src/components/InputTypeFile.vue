<script setup>
import { ref, defineEmits } from 'vue';
import Loader from '../components/Loader.vue'


const emit = defineEmits(['input-file','change'])

const fichero = ref(null)
const MyRefmessageFile = ref(null)
const messageError = ref("")
const typeFile = ref(null)
const imagebase64URL = ref("")
const nameArchive = ref('')
const isFile = ref(true)
let loader = ref(false)


const props = defineProps({

  index:{
    type:Number,
    require: false
  },

  isRequired: {
    type: Boolean,
    require: true,
  }// requerido
})

async function validarArchivo(event) {


  loader.value = true

  var file = event.target?.files[0];

  const nameFile = file["name"]

  if (nameFile) nameArchive.value = nameFile

  typeFile.value = file.type


  if (!validadPropertyImage(file)) {

    MyRefmessageFile.value.removeAttribute("hidden");
    fichero.value = null
    loader.value = false
  } else {

    MyRefmessageFile.value.setAttribute("hidden", true);

    const base64URL = await encodeFileAsBase64URL(file);
    // Anyado la ruta Base64 a la imagen
    imagebase64URL.value = base64URL;
    //image.setAttribute('src', base64URL);

    fichero.value = file;
    emit("input-file", fichero.value)
    emit("change", event)
    loader.value = false
    isFile.value = false

  }

}

function validadPropertyImage(file) {

  // const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/JPG", "image/JPEG", "image/PNG", "application/pdf", ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", "message/rfc822"," application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

  const allowedTypes = [
    // Imágenes
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/JPG",
    "image/JPEG",
    "image/PNG",

    // Documentos PDF
    "application/pdf",

    // Documentos de Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Archivos de Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Videos
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/3gpp",
    "video/x-msvideo",
    "video/quicktime"
  ];

  const allowedSize = 52428800;

  if (file?.size > allowedSize) {
    messageError.value = 'El peso del archivo no puede superar mas de 5Mb'
    return false
  }

  if (!allowedTypes.includes(file?.type)) {
    messageError.value = 'Solo se aceptan archivos con extensiones jpg - jpeg - png - pdf - word - excel y videos'
    emit("input-file", null)
    const fileInput = document.getElementById("file"+props?.index)
    fileInput.value = null
    return false
  }

  return true
}


async function encodeFileAsBase64URL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.readAsDataURL(file);
  });
};


function clearFile(event) {
  event.preventDefault()
  fichero.value = null;
  loader.value = false
  isFile.value = true
  nameArchive.value = ''
  emit("input-file", fichero.value)
  const fileInput = document.getElementById("file"+props?.index)
  fileInput.value = null
}
</script>

<template>

  <div class="mb-3 mt-3">
    <div class="messageBox">
      <div class="fileUploadWrapper">
        <label :for="'file'+index">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
            <circle stroke-width="20" stroke="#6c6c6c" fill="none" r="158.5" cy="168.5" cx="168.5"></circle>
            <path stroke-linecap="round" stroke-width="25" stroke="#6c6c6c" d="M167.759 79V259"></path>
            <path stroke-linecap="round" stroke-width="25" stroke="#6c6c6c" d="M79 167.138H259"></path>
          </svg>
          <span class="tooltip">Agregar archivo</span>
        </label>
        <div v-if="loader">
          <Loader />
        </div>
        <input type="file" :id="'file'+index" :name="'file'+index" @change="validarArchivo" :required="props?.isRequired" style="display: none;"/>
      </div>
      <input placeholder="Ningun archivo Seleccionado" disabled v-model="nameArchive" type="text" :id="'messageInput'+index" :name="'file'+index"/>
      <div>
        <button @click="clearFile" class="closeButton" :hidden="isFile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path
              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
          </svg>
        </button>
      </div>
    </div>
  </div>


  <div class="notifications-container" ref="MyRefmessageFile" hidden>
    <div class="error-alert">
      <div class="flex">
        <div class="flex-shrink-0">

          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
            class="error-svg">
            <path clip-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fill-rule="evenodd"></path>
          </svg>
        </div>
        <div class="error-prompt-container">
          <p class="error-prompt-heading">Tienes un error con la carga del archivo
          </p>
          <div class="error-prompt-wrap">
            <ul class="error-prompt-list" role="list">
              <li>{{ messageError }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>





</template>

<style scoped>
.closeButton {
  width: fit-content;
  height: 100%;
  background-color: transparent;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.closeButton svg {
  height: 18px;
  transition: all 0.3s;
}

.closeButton svg path {
  transition: all 0.3s;
}

.closeButton:hover svg path {
  fill: #3c3c3c;
  stroke: white;
}


.notifications-container {
  width: 320px;
  height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flex {
  display: flex;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.error-alert {
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: rgb(254 242 242);
}

.error-svg {
  color: #F87171;
  width: 1.25rem;
  height: 1.25rem;
}

.error-prompt-heading {
  color: #991B1B;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: bold;
}

.error-prompt-container {
  display: flex;
  flex-direction: column;
  margin-left: 1.25rem;
}

.error-prompt-wrap {
  margin-top: 0.5rem;
  color: #B91C1C;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.error-prompt-list {
  padding-left: 1.25rem;
  margin-top: 0.25rem;
  list-style-type: disc;
}


.messageBox {
  width: fit-content;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 0 15px;
  border-radius: 10px;
  border: 1px solid #93C5FD
}

.messageBox:focus-within {
  border: 1px solid rgb(110, 110, 110);
}

.fileUploadWrapper {
  width: fit-content;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;
}

#file {
  display: none;
}

.fileUploadWrapper label {
  cursor: pointer;
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fileUploadWrapper label svg {
  height: 18px;
}

.fileUploadWrapper label svg path {
  transition: all 0.3s;
}

.fileUploadWrapper label svg circle {
  transition: all 0.3s;
}

.fileUploadWrapper label:hover svg path {
  stroke: #fff;
}

.fileUploadWrapper label:hover svg circle {
  stroke: #fff;
  fill: #3c3c3c;
}

.fileUploadWrapper label:hover .tooltip {
  display: block;
  opacity: 1;
}

.tooltip {
  position: absolute;
  top: -40px;
  display: none;
  opacity: 0;
  color: white;
  font-size: 10px;
  text-wrap: nowrap;
  background-color: #000;
  padding: 6px 10px;
  border: 1px solid #3c3c3c;
  border-radius: 5px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.596);
  transition: all 0.3s;
}

#messageInput {
  width: 300px;
  height: 100%;
  background-color: transparent;
  outline: none;
  border: none;
  padding-left: 10px;
  color: black;

}

#messageInput:focus~#fileCloseButton svg path,
#messageInput:valid~#fileCloseButton svg path {
  fill: #3c3c3c;
  stroke: white;
}
</style>