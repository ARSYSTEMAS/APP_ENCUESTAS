<script setup>
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import obtenerCookiesUsuario from '../../function/cookies'
import ServiceQuestion from '../../services/takeSurvey/Questions'
import ServiceResponse from '../../services/Response'
import ServiceEncuestas from '../../services/takeSurvey/Survey'
import ServiceAnswerOptions from '../../services/takeSurvey/AnswerOptions'
import { useRouter } from 'vue-router'
//import HeaderSurvey from '../HeaderSurvey.vue';
import Loader from '../../components/Loader.vue'
import LoaderSave from '../../components/LoaderSave.vue'
import Entorno from '../../function/entorno'
import generateUuid from 'generate-uuid';
import axios from 'axios';
//import LoadAnswerOptions from './LoadAnswerOptions.vue'

const HeaderSurvey = defineAsyncComponent(() =>
  import('../HeaderSurvey.vue')
)

const LoadAnswerOptions = defineAsyncComponent(() =>
  import('./LoadAnswerOptions.vue')
)

const { RUTA } = Entorno();
const { RUTA_UPLOAD } = Entorno();
const { RUTA_DOWNLOAD } = Entorno();

const router = useRouter();

let question = ref([])

const answers = ref({}) //almacenamiento de las respuesta por cada pregunta

const TYPE_STRING = 'string'
const TYPE_NUMBER = 'number'
const TYPE_OBJECT = 'object'

const VERTICALMODE = false //VISTA VERTICAL CON SALTOS'

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_response = new ServiceResponse()
const service_encuesta = new ServiceEncuestas()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName

let loaderSave = ref(false)

const props = defineProps({

    idSurvey: {
        type: Number,
        require: true,
    },// el id de la encuesta 

    response: {
        type: Number,
        require: true,
    }// el id de la encuesta 
})


onMounted(async () => {

   try {
    const where = {
        IdEncuesta: props?.idSurvey
    }

    await service_question.unique({ params: where })
    question.value = [...bd_service_question.value]

    // ORDENO DE FORMA ASCENDENTE A TRAVES DEL ORDERBY 
    question.value.sort((a, b) => a.OrderBy - b.OrderBy);
   } catch (error) {
        console.error(error)
   }

})

async function sendSurvey() {

try {
    let table = [];
    let numResponse = props?.response
    const idUserResponse = generateUuid();

    for (let key in answers.value) {

        // Obtener la pregunta y la respuesta
        let question = key;
        let answer = answers.value[key];

        // Si la respuesta es un array, recorrer el array y hacer un push a la tabla con la pregunta y las respuestas de ese array
        if (Array.isArray(answer)) {

            for (let i = 0; i < answer.length; i++) {

                table.push({ question: question, answer: answer[i], isCheck: true });

            }
        } else {

            // Agregar la pregunta y la respuesta a la tabla
            table.push({ question: question, answer: answer, isCheck: false });


        }
    }


    for (const element of table) {


        const question = element.question

        let idAnswer = element.answer

        let isCheck = element.isCheck

        let typeAnswer = typeof (idAnswer)

        let textoRespuesta = null

        let score = null

        let sumScoreQuestion = null


        if (typeAnswer === TYPE_OBJECT) { //respuestas tipo archivo

            const num = generateUuid();

            const upload = await uploadArchive(num, idAnswer)

            if (upload.status === 200) {

                const RUTA = RUTA_DOWNLOAD

                //IdAnswer = RUTA+upload.data["file"].filename
                idAnswer = null
                textoRespuesta = RUTA + upload.data["file"].filename
            } else {

                // IdAnswer = 'No se pudo guardar el archivo'
                idAnswer = null
                textoRespuesta = 'No se pudo guardar el archivo'
            }
        }

        if (typeAnswer === TYPE_STRING && !isCheck) {  //respuestas sin opciones

            textoRespuesta = idAnswer
            idAnswer = null
        }

        if (typeAnswer === TYPE_NUMBER || (typeAnswer === TYPE_STRING && isCheck)) { // respuestas con opciones

            const where = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: question,
                Id: idAnswer
            }


            //Busco la respuesta a la opcion elegida y su puntuacion en caso de tener
            await service_answer.unique({ params: where })
            textoRespuesta = bd_service_answer.value[0].TextoRespuesta
            score = bd_service_answer.value[0]?.Score


            //Busco el total de puntaje de la pregunta

            const whereScoreQuestion = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: question
            }

            if (isCheck && typeAnswer !== TYPE_STRING) whereScoreQuestion.Id = +idAnswer


            //Busco el total de puntuacion 
            await service_answer.unique({ params: whereScoreQuestion })


            sumScoreQuestion = bd_service_answer.value.reduce((total, item) => {
                return total + (item.Score || 0);
            }, 0);

        }

        const data = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: question,
            IdAnswer: idAnswer,
            TextoRespuesta: textoRespuesta,
            TipoRespuesta: typeAnswer,
            IdUserResponse: idUserResponse,
            ScoreQuestion: sumScoreQuestion
        }

        if (score) data.Score = score // si tiene puntuacion le asigno el objecto

        loaderSave.value = true
        await service_response.add(data)

    }

    numResponse++

    const dataEncuesta = {
        Id: props?.idSurvey,
        Respuestas: numResponse
    }
    await service_encuesta.Update({ data: dataEncuesta }) // actualizo encuestas respondida
    loaderSave.value = false
    router.push({ name: 'endSurvey', params: { id: idUserResponse, idEncuesta: props?.idSurvey } });
} catch (error) {
    console.error(error)
}

}

function handleAnswerQuestion(data, idQuestion) {

    answers.value[idQuestion] = data

}

async function uploadArchive(num, file) {

    const formData = new FormData()
    let response = null
    formData.append('file', file)

    const url = `${RUTA}/Documentacion`

    await axios.post(url, formData).then(resp => {

        response = resp

    })

    return response

}
</script>

<template>

    <div v-if="loaderSave">
        <LoaderSave />
    </div>
    <div v-if="!loaderSave">
        <!-- ENCABEZADO DE LA ENCUESTA -->
        <HeaderSurvey :idSurvey="props?.idSurvey" />
        <!-- FORMULARIO DE ENCUESTA -->
        <form id="msform" v-on:submit.prevent="sendSurvey">
            <div v-for="item, idx in question" :key="idx" class="card mt-3">


                <div v-if="item?.IdTipreg != 8" class="card-body">

                    <div class="position-relative">

                        <div class="row g3">

                            <div class="col-auto">

                                <span class="textoQuestion">
                                    {{ item.TextoPregunta }}
                                    <span v-if="item?.Required" class="asterisk">*</span>
                                </span>
                            </div>

                        </div>

                    </div>

                    <Suspense>
                        <!-- CARGA LAS OPCIONES DE LA PREGUNTA -->
                        <LoadAnswerOptions 
                        :index=idx 
                        :idSurvey=props?.idSurvey 
                        :idQuestion=item.IdQuestion
                        :idTipreg=item.IdTipreg 
                        :tipeEvaluation=item.TypeEvaluation
                        :requiredQuestion="item?.Required === 0 ? false : true" 
                        @answers="handleAnswerQuestion" 
                        :vertical=VERTICALMODE
                        />
                        <!-- loading state via #fallback slot -->
                        <template #fallback>
                         Cargando por favor espere...
                        </template>
                    </Suspense>

                </div>

                <div v-else class="text-white">
                    <div class="card-header bg-primary">Atención</div>
                    <div class="card-body">
                        <span class="text-header">{{ item.TextoPregunta }}</span>
                    </div>
                </div>

            </div>

            <div class="actions">

                <button type="submit" class="mark-as-read read mb-2">
                    Enviar
                </button>

            </div>


            <div>

                <p class="small mt-5 pt-lg-2 gebul">Powered by <a href="https://www.tiendasdaka.com/" id="link"
                        target="_blank">Tiendas Daka C.A</a></p>
            </div>
        </form>
    </div>
</template>

<style scoped>
.fondo-encabezado {

    background-color: rgb(103, 58, 183);
    color: rgba(255, 255, 255, 1);
    font-size: 20px;
}

.text-color-green {

    color: green;
}

.text-color-red {

    color: red;
}

.iconColorRed {
    color: red;
    font-size: 25px;
}

.iconColorGreen {
    color: green;
    font-size: 25px;
}

.textoOption {
    font-size: 14px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #70757a;
}

.text-header {
    font-size: 16px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
    letter-spacing: 0;
    color: #202124;
}

.textoQuestion {

    font-size: 16px;
    font-family: 'docs-Roboto', Helvetica, Arial, sans-serif;
}

.asterisk {

    color: #e91a1a;
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
    width: 50%;
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