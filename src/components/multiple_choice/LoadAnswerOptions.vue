<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import ServiceAnswerOptions from '../../services/AnswerOptions'
import obtenerCookiesUsuario from '../../function/cookies'
import ObtenerFecha from '../../function/ObtenerFecha';
import validatePropertyAndValue from '../../function/validateAndValue'
import { toast } from 'vue3-toastify';
import verifySurveyQuestionAnswer from '@/composables/verifySurveyQuestionAnswer';
import notify from '@/composables/notify';

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const answerOptionInsert = ref([])

const twoDefault = ref([1, 2])
const oneDefault = ref([3, 4])
const _default = ref([1, 2, 3])

const readonlyInput = ref(false)

const placeholder = ref('option ')

const props = defineProps({

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
    }

})


onMounted(async () => {

    try {
        const where = {
            IdEncuesta: props?.idSurvey,
            IdQuestion: props?.idQuestion
        }

        await service_answer.unique({ params: where, token: token })

        //console.log(bd_service_answer.value)
    } catch (error) {
        console.error(error)
    }

})


async function addTextOption(e) {

    try {
        if (!answerOptionInsert.value.includes(e.IndexTarget)) {


            const isResponse = await verifySurveyQuestionAnswer(props?.idSurvey, e.IdQuestion, e.Id)//verificar que no existan respuestas para esa pregunta
            const message = 'Esta opción de la pregunta, ya tiene respuestas por parte de usuarios con el texto que desea cambiar. No se puede actualizar'

            if (isResponse) {

                notify(message)

                return
            }


            const where = {
                IdQuestion: e.IdQuestion,
                IdEncuesta: e.IdEncuesta,
                IndexTarget: e.IndexTarget
            }

            const data = {
                TextoRespuesta: e.TextoRespuesta,
                UsrAct: userName.toUpperCase(),
                FecAct: ObtenerFecha()
            }


            await service_answer.update({ data: data, params: where, token: token })

        } else {

            const data = {
                IdEncuesta: props?.idSurvey,
                IdQuestion: props?.idQuestion,
                TextoRespuesta: e.TextoRespuesta,
                UsrCrea: userName.toUpperCase(),
                IndexTarget: e.IndexTarget

            }

            await service_answer.add({ data: data, token: token })

            // SI SE AGREGO HAY QUE ELIMINARLO DE LA LISTA PARA YA NO ESTE EN MODO INSERT
            //   answerOptionInsert.value = answerOptionInsert.value.filter(item => item !== e.IndexTarget)

        }
    } catch (error) {
        console.error(error)
    }


}


function addOptions() {

    //Obtengo el IndexTargetMayor de los datos

    let maxIndexTarget = bd_service_answer.value.reduce((max, obj) => max.IndexTarget > obj.IndexTarget ? max : obj, { IndexTarget: -1 })

    const index = maxIndexTarget.IndexTarget + 1

    //agrego este objecto como un answerOption nuevo por agregar
    answerOptionInsert.value.push(index)


    bd_service_answer.value.push(

        {
            "IndexTarget": index,
        }
    )


}

async function del(id, index) {

    try {
        if (!id) { //valido que el objecto se este creando en el DOM

            const whereIndex = {
                IdQuestion: props?.idQuestion,
                IdEncuesta: props?.idSurvey,
                IndexTarget: index
            }

            if (validatePropertyAndValue(whereIndex, 'IndexTarget')) {
                await service_answer.del({ params: whereIndex, token: token })
                bd_service_answer.value.splice(index, 1);
            } else {
                toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: toast.TRANSITIONS.SLIDE,
                    autoClose: 2000,
                    theme: 'dark',
                });
            }

        } else { //si el objecto ya viene de bases de datos

            const isResponse = await verifySurveyQuestionAnswer(props?.idSurvey, props?.idQuestion, id)//verificar que no existan respuestas para esa pregunta
            const message = 'Esta opción de la pregunta, ya tiene respuestas por parte de usuarios. No se puede eliminar'

            if (isResponse) {

                notify(message)

                return
            }

            const where = {
                Id: id
            }

            if (validatePropertyAndValue(where, 'Id')) {
                bd_service_answer.value = bd_service_answer.value.filter(item => item.Id !== id)
                await service_answer.del({ params: where, token: token })
            } else {
                toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: toast.TRANSITIONS.SLIDE,
                    autoClose: 2000,
                    theme: 'dark',
                });
            }

        }
    } catch (error) {
        console.error(error)
    }
}


const { idTipreg } = props;

if ([4, 5, 11].includes(idTipreg)) { //PREGUNTAS DE TIPO UNA SOLA FILA
    readonlyInput.value = true
    const placeholders = {
        4: 'Texto',
        11: 'Fecha',
        };

    placeholder.value = placeholders[idTipreg] || 'Email';
    
}




</script>

<template>

    <div v-for="option, index in bd_service_answer" :key="index" class="row g-2 mt-3">

        <div class="col-auto">
            <i v-if="props.idTipreg == 1" class="fa-regular fa-circle"></i>
            <i v-if="props.idTipreg == 2" class="fa-regular fa-square-full"></i>

        </div>




        <div class="col-auto">
            <input class="text-options" :id="option.Id" :name="option.Id" :key="option.Id" type="text"
                :placeholder="placeholder" v-model="option.TextoRespuesta" @change="addTextOption(option)"
                :disabled="readonlyInput" />
        </div>


        <div class="col-auto">
            <i v-if="props.idTipreg == 3" class="fa-solid fa-angle-down"></i>
        </div>


        <!-- AQUI MUESTRO EL ICONO DE ELIMINAR DEPENDIENDO DE LOS DEFAULT-->
        <div v-if="twoDefault.includes(props?.idTipreg)" class="col-auto">
            <a style="cursor: pointer;" @click="del(option.Id, index)">
                <i v-if="index > 1" class="fa-regular fa-trash-can" title="Eliminar" style="color: brown;"></i>

            </a>
        </div>


        <div v-if="oneDefault.includes(props?.idTipreg)" class="col-auto">
            <a style="cursor: pointer;" @click="del(option.Id)">
                <i v-if="index > 0" class="fa-regular fa-trash-can" title="Eliminar" style="color: brown;"></i>
            </a>
        </div>

        <div class="col-auto">
            <i v-if="option.IdQuestionJump" class="fa-solid fa-share-from-square" title="Salto de Pregunta"
                style="color:grey;"></i>
        </div>


    </div>




    <!-- button+ para agregar mas options-->
    <div v-if="_default.includes(props?.idTipreg)" class="d-grid gap-2 d-md-flex justify-content-md-start mt-1 p-1">

        <a class="fixed-plugin-button " @click="addOptions()">
            <i class="fa-solid fa-plus fa"></i>
        </a>

    </div>

</template>

<style scoped>
.text-question {
    appearance: none;
    border: none;
    outline: none;
    width: 100%;
    border-bottom: 0.2em solid #ececec;
    ;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.2em 0.2em 0 0;
    padding: 0.4em;
    color: black;
}


.text-options {
    appearance: none;
    border: none;
    outline: none;
    width: 100%;
    border-bottom: 0.2em solid #ececec;
    ;
    background: rgba(#e91e63, 0.2);
    border-radius: 0.2em 0.2em 0 0;
    padding: 0.4em;
    color: black;
}


input[type="text"]:hover {

    border-bottom: 0.2em solid #0D6EFD;
    ;

}



.fixed-plugin-button {
    border-radius: 50%;
    /* bottom: 30px; */
    right: 30px;
    color: #198754;
    font-size: 1.25rem;
    cursor: pointer;
}

.btn-w {
    height: 30px;
    width: 30px;
}
</style>