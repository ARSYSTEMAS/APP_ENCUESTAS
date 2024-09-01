<script setup>
import { ref, onMounted, watch, defineProps, computed } from 'vue';
import ServiceQuestion from '../services/Questions'
import ServiceAnswerOptions from '../services/AnswerOptions'
import obtenerCookiesUsuario from '../function/cookies'
import ObtenerFecha from '../function/ObtenerFecha';
import Multiselect from 'vue-multiselect'
import ServiceQuestionBranches from '../services/QuestionBranches'
import validatePropertyAndValue from '../function/validateAndValue'
import { toast } from 'vue3-toastify';

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token

const checkedShowResult = ref(null)
const typeEvaluation = ref(null)

const service_question = new ServiceQuestion()
const bd_service_question = service_question.getFuentesData()

const service_answer = new ServiceAnswerOptions()
const bd_service_answer = service_answer.getFuentesData()

const questions_jump = new ServiceQuestion()
const bd_question_jump = questions_jump.getFuentesData()

const service_question_branches = new ServiceQuestionBranches()
const bd_question_branches = service_question_branches.getFuentesData()

const isLoading = ref(false);
const options = ref([])
const selectedQuestions = ref({})
const emits = defineEmits(['addQuestionsBranch']);

const MODE_INSERT = 'insert'
const MODE_UPDATE = 'update'


const props = defineProps({
    idQuestion: {
        type: String,
        required: true
    },

    idSurvey: {
        type: Number,
        require: true,
    },

    typeLogic: {
        type: String,
        require: true,
    },

    id: {
        type: Number,
        require: false,
    },

})


onMounted(async () => {

    try {
        const where = {
            IdEncuesta: props.idSurvey,
            idQuestion: props.idQuestion,
        }

        const whereBranch = {
            IdEncuesta: props.idSurvey,
            idQuestionAnswer: props.idQuestion,
        }

        await service_question.unique({ params: where, token: token }) // obtengo la pregunta

        await service_answer.unique({ params: where, token: token }) // obtengo las opciones de la pregunta

        await service_question_branches.unique({ params: whereBranch, token: token })  //obtengo las ramas del salto de pregunta


        checkedShowResult.value = bd_service_question.value[0].ShowResults === 0 ? false : true //Inicializo el valor
        typeEvaluation.value = bd_service_question.value[0].TypeEvaluation === 0 ? false : true //Inicializo el valor

        props.id ? handleListAllQuestions() : null

        allBranches()

    } catch (error) {
        console.error(error)
    }


})

function allBranches() {

    // Crear un nuevo array con la misma estructura que 'branch'
    const transformedObject = bd_question_branches.value.reduce((acc, item) => {
        const rowId = item.RowId.toString();
        if (!acc[rowId]) {
            acc[rowId] = [];
        }
        acc[rowId].push({
            IdEncuesta: item.IdEncuesta,
            TextoPregunta: item.TextoPregunta,
            IdQuestion: item.IdQuestion,
            IdQuestionJump: item.IdQuestionJump,
            mode: MODE_UPDATE,
            Id: item.Id
        });
        return acc;
    }, {});

    selectedQuestions.value = transformedObject
}

async function handleListAllQuestions() {

    try {
        const where = {
            IdEncuesta: props.idSurvey
        }

        isLoading.value = true;

        await questions_jump.unique({ params: where, token: token }) // obtengo las preguntas
        isLoading.value = false;
        bd_question_jump.value = bd_question_jump.value.filter(item => item.Id > props.id)

        handleListBranch()

    } catch (error) {
        console.error(error)
    }



}


async function handleListBranch() {

    // Creo una nueva copia con solo los campos deseados
    const simplifiedQuestion = bd_question_jump.value.map((item) => ({
        IdEncuesta: item.IdEncuesta,
        TextoPregunta: item.TextoPregunta,
        IdQuestion: item.IdQuestion
    }));


    //filtro solo las preguntas que no se seleccionaron para el salto de pregunta
    const filteredQuestions = simplifiedQuestion.filter(question => {
        const questionId = question.IdQuestion;
        return !bd_service_answer.value.some(ans => ans.IdQuestionJump === questionId);
    });

    //lista branch
    options.value = filteredQuestions
}

async function updateTextOption(e) {

    try {
        if (e.Score == '') { e.Score = 0 }

        const where = {
            IdQuestion: e.IdQuestion,
            IdEncuesta: e.IdEncuesta,
            IndexTarget: e.IndexTarget,
            Id: e.Id
        }

        const data = {
            Score: e.Score,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }


        await service_answer.update({ data: data, params: where, token: token })
    } catch (error) {
        console.error(error)
    }

}

async function updateShowResult() {

    try {

        const where = {
            IdQuestion: props.idQuestion,
            IdEncuesta: props.idSurvey
        }

        const data = {
            ShowResults: checkedShowResult.value,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }


        await service_question.update({ data: data, params: where, token: token })

    } catch (error) {
        console.error(error)
    }


}


async function updateTypeEvaluation(e) {

    try {
        const where = {
            IdQuestion: props.idQuestion,
            IdEncuesta: props.idSurvey
        }

        const data = {
            TypeEvaluation: typeEvaluation.value,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }


        await service_question.update({ data: data, params: where, token: token })
    } catch (error) {
        console.error(error)
    }


}


async function updateTextCanalizacion(e) {

    try {
        const where = {
            IdQuestion: e.IdQuestionJump,
            IdEncuesta: e.IdEncuesta
        }

        const data = {
            TextoCanalizacion: e.TextoCanalizacion,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }

        await service_question.update({ data: data, params: where, token: token })
    } catch (error) {
        console.error(error)
    }


}

async function updateJump(e) {

    try {
        handleListBranch()

        const where = {
            IdQuestion: e.IdQuestion,
            IdEncuesta: e.IdEncuesta,
            IndexTarget: e.IndexTarget,
            Id: e.Id
        }

        const data = {
            IdQuestionJump: e.IdQuestionJump === '' ? null : e.IdQuestionJump,
            TextoCanalizacion: e.TextoCanalizacion,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }


        await service_answer.update({ data: data, params: where, token: token })
        await updateTextCanalizacion(e)
        await updateQuestionJump(e)

    } catch (error) {
        console.error(error)
    }



}


function areAllIdQuestionJumpEmpty(arr) {
    //VERIFICAMOS QUE LA PREGUNTA TENGA TODOS LOS ITEM SIN SALTOS (TRUE si todas las propiedades IdQuestionJump están vacías)
    return arr.every(obj => !obj.IdQuestionJump);
}

async function updateQuestionJump(e) {

    try {
        const result = areAllIdQuestionJumpEmpty(bd_service_answer.value);

        let flag

        result ? flag = 0 : flag = 1

        const where = {
            IdQuestion: e.IdQuestion,
            IdEncuesta: e.IdEncuesta
        }

        const data = {
            Jump: flag,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }



        const whereRequired = {
            IdQuestion: e.IdQuestion,
            IdEncuesta: e.IdEncuesta
        }

        const dataRequired = {
            Required: flag,
            UsrAct: userName.toUpperCase(),
            FecAct: ObtenerFecha()
        }

        if (e.IdQuestion) {

            await service_question.update({ data: dataRequired, params: whereRequired, token: token })
        }

        await service_question.update({ data: data, params: where, token: token })
    } catch (error) {
        console.error(error)
    }


}

async function questionBranches(e) {

    //  agrego la propiedad IdQuestionJump a cada objeto dentro del array 
    if (selectedQuestions.value.hasOwnProperty(e.Id)) {
        const questions = selectedQuestions.value[e.Id];

        questions.forEach(question => {
            question.IdQuestionJump = e.IdQuestionJump;
            question.RowId = e.Id;
            question.IdQuestionAnswer = e.IdQuestion;
            question.mode = MODE_INSERT;
        });
    }

    emits("addQuestionsBranch", selectedQuestions.value)

}



async function removeQuestion(e, op) {

    try {
        const rowId = op.Id
        const idQuestionJump = e.IdQuestionJump
        const idQuestion = e.IdQuestion

        if (selectedQuestions.value.hasOwnProperty(rowId)) {

            const objectsAtIndex = selectedQuestions.value[rowId];
            const indexToRemove = objectsAtIndex.findIndex(obj => obj.IdQuestionJump === idQuestionJump && obj.IdQuestion === idQuestion);

            if (indexToRemove !== -1) {

                objectsAtIndex.splice(indexToRemove, 1);

                const where = {
                    Id: e?.Id
                }
                if (validatePropertyAndValue(where, 'Id')) {

                    await service_question_branches.del({ params: where, token: token })
                } else {

                    toast.error("Ocurrio un error. Actualize e intente nuevamente", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                        transition: toast.TRANSITIONS.SLIDE,
                        autoClose: 2000,
                        theme: 'dark',
                    });
                }

            } else {

                toast.error(`No se encontró un objeto con las propiedades especificadas en el índice ${rowId}`, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: toast.TRANSITIONS.SLIDE,
                    autoClose: 2000,
                    theme: 'dark',
                });
            }
        } else {

            toast.error(`El índice ${rowId} no existe en el objeto array`, {
                position: toast.POSITION.BOTTOM_RIGHT,
                transition: toast.TRANSITIONS.SLIDE,
                autoClose: 2000,
                theme: 'dark',
            });
        }

    } catch (error) {

        console.error(error)
    }




}

function stepDow(row) {

    row.Score = row.Score - 1

    updateTextOption(row)



}

function stepUp(row) {

    row.Score = row.Score + 1

    updateTextOption(row)

}
</script>

<template>

    <div v-if="bd_service_question.length <= 0" class="alert alert-warning" role="alert">
        Ocurrio un error, actualize la pagina y vuelva a intentarlo
    </div>

    <div class="card mb-3">
        <div class="card-body">
            Pregunta: <span class="fw-bolder">{{ bd_service_question[0]?.TextoPregunta }}
            </span>

        </div>
    </div>

    <section class="h-100 h-custom">
        <div class="container h-100 py-5">
            <div class="row d-flex justify-content-center align-items-center h-100">
                <div class="col">

                    <!-- <div class="table-responsive"> -->
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col" class="h5">Opciones</th>
                                <th v-if="props.typeLogic === 'score'" scope="col">Valor de puntuación</th>
                                <th v-if="props.typeLogic === 'jump'" scope="col">Si está seleccionado, salte a la
                                    pregunta</th>
                                <th v-if="props.typeLogic === 'jump'" scope="col">Ramificación</th>
                                <th v-if="props.typeLogic === 'jump'" scope="col">Texto de canalización</th>


                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for=" row in bd_service_answer" :key="row.Id">
                                <th scope="row">
                                    <div class="d-flex align-items-center">

                                        <div class="flex-column ms-4">
                                            <p class="mb-2">{{ row.TextoRespuesta }}</p>
                                        </div>
                                    </div>
                                </th>

                                <td v-if="props.typeLogic === 'score'" class="align-middle">
                                    <div class="d-flex flex-row">
                                        <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
                                            @click="stepDow(row)">
                                            <i class="fas fa-minus"></i>
                                        </button>

                                        <!-- <input id="form1" min="0" name="quantity" value="2" type="number"
                                                class="form-control form-control-sm" style="width: 50px;" /> -->

                                        <input min="0" name="score" type="number" @change="updateTextOption(row)"
                                            v-model="row.Score" class="form-control form-control-sm"
                                            style="width: 50px;">
                                        <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
                                            @click="stepUp(row)">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </td>

                                <td v-if="props.typeLogic === 'jump'" class="align-middle">

                                    <select v-model="row.IdQuestionJump" style="width: 300px;"
                                        class="list-question-jump form-select form-select-sm"
                                        aria-label="Default select example" @change="updateJump(row)">
                                        <option value="">Ninguna pregunta</option>
                                        <option v-for="option, index in bd_question_jump" :key="option.Id"
                                            :value="option.IdQuestion">
                                            {{ option.TextoPregunta }}</option>
                                    </select>

                                </td>

                                <td v-if="props.typeLogic === 'jump'">

                                    <multiselect style="width: 400px;" v-model="selectedQuestions[row.Id]"
                                        tag-placeholder="Add this as new tag" placeholder="Agregar Ramas de preguntas"
                                        label="TextoPregunta" track-by="IdQuestion" :options="options" :multiple="true"
                                        :taggable="true" @select="questionBranches(row)">
                                        <template #tag="{ option }"><span class="custom__tag"><span>{{
                                            option.TextoPregunta }}</span><span class="custom__remove"
                                                    style="cursor: pointer;"
                                                    @click="removeQuestion(option, row)">❌</span></span></template>
                                    </multiselect>
                                    <!-- <pre class="language-json"><code>rowId{{ row.Id}} {{ selectedQuestions[row.Id] }}</code></pre>  -->

                                </td>

                                <td v-if="props.typeLogic === 'jump'" class="align-middle">
                                    <p class="mb-0" style="font-weight: 500;">
                                        <input name="text-canalizacion" class="form-control"
                                            v-model="row.TextoCanalizacion" type="text" @change="updateJump(row)">
                                    </p>
                                </td>



                            </tr>



                        </tbody>
                    </table>

                    <div v-if="props.typeLogic === 'score'" class="form-check">
                        <input class="form-check-input" @change="updateTypeEvaluation" type="checkbox"
                            id="tipeEvaluation" v-model="typeEvaluation">
                        <label class="form-check-label" for="flexCheckDefault">
                            Esta pregunta es de tipo evaluacion
                        </label>
                    </div>

                    <div v-if="props.typeLogic === 'score'" class="form-check">
                        <input class="form-check-input" @change="updateShowResult" type="checkbox" id="showResult"
                            v-model="checkedShowResult">
                        <label class="form-check-label" for="flexCheckDefault">
                            Mostrar resultado al finalizar la encuesta
                        </label>
                    </div>

                    <!-- </div> -->
                </div>
            </div>
        </div>
    </section>
</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style scoped>
.list-question-jump {

    display: block;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    background-color: #fff;
    background-clip: padding-box;
    border-radius: 0;
}


.input-container {
    position: relative;
}

.input {
    padding: 10px;
    height: 30px;
    width: 50px;
    border: 2px solid #3FB884;
    border-top: none;
    border-bottom: none;
    font-size: 16px;
    background: transparent;
    outline: none;
    box-shadow: 4px 4px 0px 0px #78797A;
    transition: all 0.5s;
}

.input:focus {
    box-shadow: none;
    transition: all 0.5s;
}

/* .label {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #0B2447;
  transition: all 0.5s;
  transform: scale(0);
  z-index: -1;
} */

.input-container .topline {
    position: absolute;
    content: "";
    background-color: #198754;
    width: 0%;
    height: 2px;
    right: 0;
    top: 0;
    transition: all 0.5s;
}

.input-container input[type="text"]:focus~.topline {
    width: 35%;
    transition: all 0.5s;
}

.input-container .underline {
    position: absolute;
    content: "";
    background-color: #198754;
    width: 0%;
    height: 2px;
    right: 0;
    bottom: 0;
    transition: all 0.5s;
}

.input-container input[type="text"]:focus~.underline {
    width: 100%;
    transition: all 0.5s;
}

.input-container input[type="text"]:focus~.label {
    top: -10px;
    transform: scale(1);
    transition: all 0.5s;
}
</style>