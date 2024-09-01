<script setup>
import { onMounted, ref, computed, defineAsyncComponent } from "vue"
import { useRoute, useRouter } from 'vue-router'
//import DataTable from '../components/dataTable/DataTableLibrary.vue'
import obtenerCookiesUsuario from '../function/cookies'
import ServiceQuestion from '../services/Questions'
import ServiceAnswerOptions from '../services/AnswerOptions'
import ServiceLibraryQuestions from '../services/LibraryQuestions'
import ServiceLibraryAnswers from '../services/LibraryAnswers'
import ObtenerFecha from '../function/ObtenerFecha';
import { toast } from 'vue3-toastify';
import verifySurveyQuestionAnswer from '@/composables/verifySurveyQuestionAnswer';
import notify from '@/composables/notify';
import ToolSurvey from '@/components/ToolSurvey.vue'
import Swal from "sweetalert2"

const DataTable = defineAsyncComponent(() =>
    import('../components/dataTable/DataTableLibrary.vue')
)

const service_question = new ServiceQuestion()
const service_answer = new ServiceAnswerOptions()

const service_library_question = new ServiceLibraryQuestions()
const bd_service_library_question = service_library_question.getFuentesData()

const service_library_answer = new ServiceLibraryAnswers()
const bd_service_library_answer = service_library_answer.getFuentesData()

const route = useRoute()
const router = useRouter()

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const token = obtenerCookiesUsuario().token
const department = obtenerCookiesUsuario().department

const service = new ServiceLibraryQuestions()
const Bd = service.getFuentesData()

const _columns = service.getFuentesColumn()

const bd_question = ref([])

//Aqui el id de la encuesta
const idSurvey = ref() // id de la encuesta creada
idSurvey.value = route.params.id

const twoDefault = ref([1, 2])
const oneDefault = ref([3, 4])
const _default = ref([1, 2, 3])

const answerOptionInsert = ref([])

const dataLibrary = computed(() => {
    return bd_question.value.length > 0 ? true : false
})

onMounted(async () => {

    try {
        const where = {
        IdDepartments: department
    }

    await service.all({ params: where, token: token })

    } catch (error) {
        console.error(error)
    }
    

})

function back() {

    router.go(-1)

}

async function editData(id) {

    try {
        const where = {
        IdQuestion: id
    }

    bd_question.value = [...Bd.value.filter(data => data.IdQuestion === id)]

    // BUSCO LAS OPCIONES DE ESA PREGUNTA
    await service_library_answer.unique({ params: where, token: token })

    } catch (error) {
        console.error(error)
    }
   

}

async function deleteData(id) {

    try {
        Swal.fire({
        icon: "warning",
        title: "Estas Seguro?",
        text: "Esta accion es irreversible!",
        showCancelButton: true,
        confirmButtonText: "Si, Eliminar!",
        cancelButtonText: "No, Cancelar!",
    }).then(async (result) => {
        if (result.value) {

            //Aqui Eliminamos en el Backend
            const where = {
                IdQuestion: id
            }

            await service_library_answer.del({ params: where, token: token })
            await service_library_question.del({ params: where, token: token })

            // ACTUALIZO EL ITEM PARA INDICAR QUE LA QUESTION NO ESTA EN LA LIBRERIA
            const whereQuestion_forLibrary = {
                IdQuestion: id
                //IdEncuesta: idSurvey.value
            }

            const data = {
                InLibrary: false,
                UsrAct: userName.toUpperCase(),
                FecAct: ObtenerFecha()
            }

            await service_question.update({ data: data, params: whereQuestion_forLibrary, token: token })

            const whereLibrary = {
                IdDepartments: department
            }

            await service.all({ params: whereLibrary, token: token })

            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: "El registro a sido eliminado",
                showConfirmButton: false,
                timer: 1500,
            });

            window.location.reload()
        }
    });

    } catch (error) {
        
        console.error(error)
    }
   


}

async function updateQuestion(e) {

    try {
        const isResponse = await verifySurveyQuestionAnswer(idSurvey.value, e.IdQuestion, e.Id)//verificar que no existan respuestas para esa pregunta
    const message = 'Esta opción de la pregunta, ya tiene respuestas por parte de usuarios con el texto que desea cambiar. No se puede actualizar'

    if (isResponse) {

        notify(message)

        return
    }

    const where = {
        IdQuestion: e.IdQuestion,
    }

    const data = {
        TextoPregunta: e.TextoPregunta,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    await service_library_question.update({ data: data, params: where, token: token })
    } catch (error) {
        console.error(error)
    }
   

}


async function addTextOption(e, i) {

    try {
        
    let toastLoading = ''

if (!answerOptionInsert?.value.includes(e.IndexTarget)) {

    toastLoading = toast.loading("Guardando, Favor espere...", {
        position: toast.POSITION.BOTTOM_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
    });

    const where = {
        IdQuestion: e.IdQuestion,
        IndexTarget: e.IndexTarget
    }

    const data = {
        TextoRespuesta: e.TextoRespuesta,
        UsrAct: userName.toUpperCase(),
        FecAct: ObtenerFecha()
    }

    await service_library_answer.update({ data: data, params: where, token: token })

    const _isQuestion = await isQuestion(i.IdQuestion)

    if (_isQuestion.value.length > 0) {

        for (const element of _isQuestion.value) {

            const whereAnswer = {
                IdQuestion: element.IdQuestion,
                IndexTarget: e.IndexTarget
            }

            const dataAnswer = {
                TextoRespuesta: e.TextoRespuesta,
                UsrAct: userName.toUpperCase(),
                FecAct: ObtenerFecha()
            }

            await service_answer.update({ data: dataAnswer, params: whereAnswer, token: token })

        }

        toast.remove(toastLoading)
        window.location.reload()
    }

} else {

    toastLoading = toast.loading("Guardando, Favor espere...", {
        position: toast.POSITION.BOTTOM_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
    });

    const data = {
        IdQuestion: i.IdQuestion,
        TextoRespuesta: e.TextoRespuesta,
        IndexTarget: e.IndexTarget,
        UsrCrea: userName.toUpperCase(),
        IndexTarget: e.IndexTarget

    }

    await service_library_answer.add({ data: data, token: token }) //BIBLIOTECA

    //  AQUI INGRESO TAMBIEN A LA QUESTION QUE ESTE RELACIONADA A LA PREGUNTA ALMACENADA EN BIBLIOTECA
    // primero verifico que existan registros o preguntas con IdQuestion

    const _isQuestion = await isQuestion(i.IdQuestion)

    if (_isQuestion.value.length > 0) {

        for (const element of _isQuestion.value) {
            const data = {
                IdEncuesta: element.IdEncuesta,
                IdQuestion: element.IdQuestion,
                TextoRespuesta: e.TextoRespuesta,
                UsrCrea: userName.toUpperCase(),
                IndexTarget: e.IndexTarget

            }

            await service_answer.add({ data: data, token: token }) // TABLA ANSWER

        };

        toast.remove(toastLoading)
    }

    // SI SE AGREGO HAY QUE ELIMINARLO DE LA LISTA PARA YA NO ESTE EN MODO INSERT
    answerOptionInsert.value = answerOptionInsert.value.filter(item => item !== e.IndexTarget)
    window.location.reload()

}
    } catch (error) {
        console.error(error)
    }

}

function addOptions() {

    //Obtengo el IndexTargetMayor de los datos

    let maxIndexTarget = bd_service_library_answer.value.reduce((max, obj) => max.IndexTarget > obj.IndexTarget ? max : obj, { IndexTarget: -1 })

    const index = maxIndexTarget.IndexTarget + 1

    //agrego este objecto como un answerOption nuevo por agregar
    answerOptionInsert.value.push(index)


    bd_service_library_answer.value.push(

        {
            "IndexTarget": index,
        }
    )


}


async function del(item) {


   try {
    const isResponse = await verifySurveyQuestionAnswer(idSurvey.value, item.IdQuestion, item.Id)//verificar que no existan respuestas para esa pregunta
    const message = 'Esta opción de la pregunta, ya tiene respuestas por parte de usuarios. No se puede eliminar'

    if (isResponse) {

        notify(message)

        return
    }

    toast.loading("Eliminando, Favor espere...", {
        position: toast.POSITION.BOTTOM_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
        theme: 'dark',
        closeOnClick: true,
    });

    let error_library = null
    let error_answer = null

    const where = {
        Id: item.Id
    }

    error_library = await service_library_answer.del({ params: where, token: token })

    await editData(item.IdQuestion)

    const _isQuestion = await isQuestion(item.IdQuestion)

    if (_isQuestion.value.length > 0) {

        for (const element of _isQuestion.value) {


            const where = {
                IndexTarget: item.IndexTarget,
                IdQuestion: element.IdQuestion
            }


            error_answer = await service_answer.del({ params: where, token: token })


        }

    }
    !error_library.response?.data.errors["error"] ? toast.clearAll() : null
    window.location.reload()
   } catch (error) {
        console.error(error)
   }

}

async function isQuestion(id) {

    try {
        const where = {
        IdQuestionInLibrary: id
    }
    // BUSCO LAS QUESTIONS RELACIONADAS
    await service_question.unique({ params: where, token: token })

    return service_question.getFuentesData()

    } catch (error) {
        console.error(error)
    }
   
}


// watch(Bd, async () => {

//     if (Bd.value?.length > 0) {

//         const where = {
//             IdDepartments: department
//         }

//         await service.all({ params: where, token: token })

//     }
// },


// )

</script>

<template>

    <ToolSurvey :isSurvey=false :istools=false :isAnalisis=true @goBack="back" />

    <div>
        <Suspense>
            <DataTable 
            :items="Bd" 
            :columns="_columns" 
            @sayUpdate="editData" 
            @sayDelete="deleteData"
            />
            <!-- loading state via #fallback slot -->
            <template #fallback>
            Loading...
            </template>
        </Suspense>
    </div>


    <!-- VISTA PARA MODIFICAR LA PREGUNTA EN CASO QUE LE DE CLIC EN ACTUALIZAR -->
    <div v-if="dataLibrary">

        <div v-for="item, index in bd_question" :key="index" class="card mt-2 div-question">

            <div class="card-body">

                <div class="position-relative">
                    <input class="text-question" id="question" @change="updateQuestion(item)" type="text"
                        v-model="item.TextoPregunta" />
                </div>

                <!-- AQUI EMPIEZA LAS OPCIONES DE PREGUNTAS -->
                <div v-for="option, index in bd_service_library_answer" :key="index" class="row g-2 mt-3">

                    <div v-if="item.IdTipreg === 2" class="col-auto">
                        <i class="fa-regular fa-square-full"></i>
                    </div>

                    <div v-if="item.IdTipreg === 1" class="col-auto">
                        <i class="fa-regular fa-circle"></i>
                    </div>


                    <div class="col-auto">
                        <input class="text-options" :id="option.Id" :name="option.Id" :key="option.Id" type="text"
                            v-model="option.TextoRespuesta" @change="addTextOption(option, item)" />
                    </div>


                    <div class="col-auto">
                        <i v-if="item.IdTipreg == 3" class="fa-solid fa-angle-down"></i>
                    </div>


                    <!-- AQUI MUESTRO EL ICONO DE ELIMINAR DEPENDIENDO DE LOS DEFAULT-->
                    <div v-if="twoDefault.includes(item?.IdTipreg)" class="col-auto">
                        <a style="cursor: pointer;" @click="del(option)">
                            <i v-if="index > 1" class="fa-solid fa-square-xmark" style="color: brown;"></i>
                        </a>
                    </div>


                    <div v-if="oneDefault.includes(item?.IdTipreg)" class="col-auto">
                        <a style="cursor: pointer;" @click="del(option)">
                            <i v-if="index > 0" class="fa-solid fa-square-xmark" style="color: brown;"></i>
                        </a>
                    </div>

                </div>


                <!-- button+ para agregar mas options-->
                <div v-if="_default.includes(item?.IdTipreg)"
                    class="d-grid gap-2 d-md-flex justify-content-md-start mt-1 p-1">

                    <a class="fixed-plugin-button " @click="addOptions()">
                        <i class="fa-solid fa-plus fa"></i>
                    </a>

                </div>

            </div>

        </div>

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