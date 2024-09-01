<script setup>
import { ref, onMounted } from 'vue';
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import obtenerCookiesUsuario from '../../function/cookies'
import Loader from '../../components/Loader.vue'
import InputFile from '../../components/InputTypeFile.vue'

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

const emits = defineEmits(['answers']);

let loader = ref(true)

const selectedOption = ref(null)

const selectListItem = ref('')

const textAnswer = ref('')

const textEmail = ref('')

const textDate = ref('')

const file = ref('')

const checkedNames = ref({}) //objeto para manejar múltiples checkboxes

const numberOfCharacters = ref(1000)

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const props = defineProps({

    index: { // index unico
        type: Number,
        require: true,
    },

    idSurvey: { // id encuesta
        type: Number,
        require: true,
    },

    idQuestion: { // id de la pregunta
        type: String,
        require: true,
    },

    idTipreg: {
        type: Number,
        require: true
    },

    tipeEvaluation: {
        type: Number,
        require: true
    },

    requiredQuestion: {
        type: Boolean,
        require: true
    },

    view: {
        type: Boolean,
        require: false
    },

    vertical:{
        type: Boolean,
        require: true

    },

})

const requiredObjCheck = ref(props.requiredQuestion)

onMounted(async () => {

    const whereAnswer = {
        IdEncuesta: props?.idSurvey,
        IdQuestion: props?.idQuestion
    }
    loader.value = true
    await service_answer.unique({ params: whereAnswer })
    loader.value = false

})

function onInputFile(value) {//Recibe el archivo a subir
    file.value = value;
}


function send({ obj }) {

    if (props.idTipreg === 2 && props.requiredQuestion) {

        if (obj.target.checked) {

            if (Object.keys(checkedNames.value).length >= 1) {

                requiredObjCheck.value = false
            }

        }

        if (!obj.target.checked) {


            const countObj = Object.entries(checkedNames.value).filter(([key, value]) => value === true).length;

            if(countObj <= 0) requiredObjCheck.value = true

        }


    }


    initializeObjects()
}

function initializeObjects() {

    // OPCIONES TIPO RADIO
    selectedOption.value ? emits("answers", selectedOption.value, props?.idQuestion) : null

    //OPCIONES LISTA SELECT
    selectListItem.value ? emits("answers", selectListItem.value, props?.idQuestion) : null

    // OPCION TIPO CAJA DE TEXTO
    textAnswer.value ? emits("answers", textAnswer.value, props?.idQuestion) : null

    // OPCION TIPO EMAIL
    textEmail.value ? emits("answers", textEmail.value, props?.idQuestion) : null

     // OPCION TIPO FECHA
     textDate.value ? emits("answers", textDate.value, props?.idQuestion) : null

    // OPCIONES TIPO CHECKBOX
    Object.keys(checkedNames.value).length ? emits("answers", Object.keys(checkedNames.value).filter(key => checkedNames.value[key]), props?.idQuestion) : null

    //OPCION TIPO FILE
    file.value ? emits("answers", file.value, props?.idQuestion) : null


}

</script>

<template>

    <!-- RESPUESTAS TIPO RADIO -->

    <div v-if="[1].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-for="option, index in bd_service_answer" :key="index" class="row g-2 mt-3">

            <div v-if="!loader" class="row gap-2">
               
                <div class="col-auto">

                    <div class="form-check">
                        <input class="form-check-input control-indicator" type="radio"
                            :id="'option-' + option?.IdQuestion + '-' + option.Id" :value="option.Id"
                            :required="props?.vertical ? props?.view ? props?.requiredQuestion : false : props?.requiredQuestion " @change="send" v-model="selectedOption"
                            :name="'option-' + option?.IdQuestion">
                        <label class="form-check-label " :for="'option-' + option?.IdQuestion + '-' + option.Id">
                            {{ option.TextoRespuesta }} 
                        </label>
                    </div>
                </div>

            </div>

        </div>
    </div>



    <!-- RESPUESTAS TIPO CHECKBOX -->
    <div v-if="[2].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-for="option, index in bd_service_answer" :key="index" class="row g-2 mt-3">

            <div v-if="!loader" class="row gap-2">

                <div class="form-check">
                    <input class="form-check-input control-indicator" type="checkbox"
                        :id="'checkbox-' + option?.IdQuestion + '-' + option.Id" :value="option.Id"
                        @change="send({ obj: $event })" :required="requiredObjCheck"
                        :name="'checkbox-' + option?.IdQuestion" v-model="checkedNames[option.Id]">
                    <label class="form-check-label" :for="'checkbox-' + option?.IdQuestion + '-' + option.Id">
                        {{ option.TextoRespuesta }}
                    </label>
                </div>

            </div>

        </div>
    </div>



    <!-- RESPUESTAS TIPO SELECT -->

    <div v-if="[3].includes(props.idTipreg)" class="pt-4 ">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-if="!loader" class="position-relative">
            <select :required="props?.requiredQuestion" @change="send" v-model="selectListItem">
                <option value=''>Seleccione una opción de la lista</option>
                <option v-for="option, index in bd_service_answer" :key="option.Id" :value="option.Id">
                    {{ option.TextoRespuesta }}</option>
            </select>
        </div>
    </div>


    <!-- RESPUESTA TIPO TEXTO -->
    <div v-if="[4].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-if="!loader" class="position-relative">
            <input class="text-question" type="text" :maxlength="numberOfCharacters" placeholder="" @change="send" :required="props?.requiredQuestion"
                v-model="textAnswer">
                <div>
                <span>{{textAnswer.length }} / {{numberOfCharacters}}</span>
            </div>
        </div>
    </div>


            

    <!-- RESPUESTA TIPO EMAIL -->
    <div v-if="[5].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-if="!loader" class="position-relative">
            <input class="text-question" type="email" placeholder="" @change="send" :required="props?.requiredQuestion"
                v-model="textEmail">
        </div>

    </div>


    
    <!-- RESPUESTA TIPO FECHA -->
    <div v-if="[11].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <div v-if="!loader" class="position-relative">
            <input class="text-question" type="date" placeholder="" @change="send" :required="props?.requiredQuestion"
                v-model="textDate">
        </div>

    </div>

    <!-- RESPUESTA TIPO FILE -->
    <div v-if="[7].includes(props.idTipreg)">
        <div v-if="loader">
            <Loader />
        </div>
        <!-- componente subir archivo   -->
        <InputFile
        :index=index  
        @input-file="onInputFile" 
        @change="send" 
        :isRequired="props?.requiredQuestion" 
        />

    </div>



</template>

<style scoped>
.card-section {
    width: auto;
    height: auto;
    background: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1);
    margin: 20px;
    padding: 0 10px;
}

.card-section-wrapper {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
}

.card-section-icon {
    width: 20%;
}

.card-section-icon .icon-cart-box {
    background-color: #2196f3;
    width: 3em;
    height: 3em;
    border-radius: 50%;
    text-align: center;
    padding: 15px 0px;
    margin: 0 auto;
}

.card-section-content {
    width: 80%;
}

.card-section-title-wrapper {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: baseline;
    width: 100%;
}

.card-section-title {
    width: 95%;
    font-size: 1em;
    font-weight: 600;
    color: #333;
    padding: 20px 0 0 10px;
}

.card-section-action {
    width: 5%;
    text-align: right;
    padding: 0 20px;
}

.card-section-action svg {
    cursor: pointer;
    fill: rgba(0, 0, 0, 0.2);
    transition: 0.3s ease-in-out;
}

.card-section-action svg:hover {
    fill: rgba(0, 0, 0, 0.6);
}

.card-section-text {
    font-size: 1em;
    color: #757575;
    padding: 10px 0 10px 10px;
}

.product-price {
    font-size: 0.9em;
    font-weight: 600;
    color: #333;
    padding: 0 0 10px 10px;
}

.btn-accept {
    font-size: 0.7em;
    font-weight: 600;
    padding: 5px 10px;
    margin: 5px 10px 20px;
    color: #2196f3;
    border: 1px solid #e3f2fd;
    background-color: #e3f2fd;
    box-shadow: none;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.4s ease-in-out;
}

.btn-accept:hover,
.btn-accept:active,
.btn-accept:focus {
    color: #2196f3;
    background-color: #e3f2fd;
    border: 1px solid #2196f3;
}


.asterisk {

    color: #e91a1a;

}

.text-question {

    appearance: none;
    border: none;
    outline: none;
    width: 50%;
    border-bottom: 0.1em solid #545E6B;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.1em 0.1em 0 0;
    padding: 0.4em;
    color: black;
}


input[type="text"]:hover {

    border-bottom: 0.1em solid #545E6B;
    ;

}

input[type="email"]:hover {

    border-bottom: 0.1em solid #545E6B;
    ;

}

select {
    display: block;
    width: 100%;
    height: calc(1.5em + .75rem + 2px);
    padding: .375rem .75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: none;
    border-bottom: 0.1em solid #545E6B;
    border-radius: 0;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

select:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, .25);
}


#link {
    color: #0a86ea;
}


.control-indicator {

    border: 1px solid #0a86ea;
    width: 18px;
    height: 18px;
}

.gebul {

    font-size: 13px;
    font-weight: 300;
    position: relative;
}

.question-text-span {

    color: #050505;
    font-size: 20px;
    margin-bottom: 8px;
    font-weight: 400;
}

.header {
    display: flex;
    align-items: center;
    grid-gap: 1rem;
    gap: 1rem;
}

.icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(96, 165, 250, 1);
    padding: 0.5rem;
    color: rgba(255, 255, 255, 1);
}

.icon svg {
    height: 1rem;
    width: 1rem;
}

.question {
    font-weight: 600;
    font-size: 20px;
    color: rgba(107, 114, 128, 1);
}

.message {
    margin-top: 1rem;
    color: rgba(107, 114, 128, 1);
}

.actions {
    margin-top: 1.5rem;
}

.actions a {
    text-decoration: none;
}

.mark-as-read {

    display: inline-block;
    border: 1px solid #0a86ea;
    width: 30%;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 20px;
    line-height: 1.25rem;
    font-weight: 400;
    background-color: rgba(249, 250, 251, 1);


}


.read {
    display: inline-block;
    width: 30%;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 20px;
    line-height: 1.25rem;
    font-weight: 400;

}

.read {
    background-color: #0a86ea;
    color: #fff;
}
</style>