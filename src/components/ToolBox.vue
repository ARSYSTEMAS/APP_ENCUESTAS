<script setup>
import { defineEmits } from 'vue';

const showAgain = $cookies.get('co-nsa-DkE')
const notShow = showAgain?.show

const emit = defineEmits(['itemSelectOne', 'isActivePanel'])

const addGroup = (url, typequestion) => emit("itemSelectOne", url, typequestion)

const activePanel = () => emit("isActivePanel")

function show() {

    //////////cookies no volver a mostrar mensaje//////////
    $cookies.set('co-nsa-DkE', { show: false })
    window.location.reload()
}
</script>

<template>

    <div class="card shadow-lg mt-5">
        <div class="card-header  bg-color">
            <div class="float-start">
                <h5 class="mt-3 mb-0 text-white">Herramientas de encuestas</h5>
            </div>

            <div class="float-end mt-4">
                <button class="btn btn-link text-dark p-0 fixed-plugin-close-button" @click="activePanel">
                    <i class="fa-solid fa-xmark fa-sm centericon" style="color: white;"></i>
                </button>
            </div>
        </div>

        <hr class="horizontal dark my-1">

        <div class="card-body pt-sm-3 pt-0">
            <div class="list-group list-group-flush">

                <span class="list-group-item list-group-item-action clic" @click="addGroup('sectionHeading.png', 8)"
                    style=" cursor: pointer"><i class="fa-regular fa-file-lines"></i>
                    Encabezado de la sección</span>

                <span class="list-group-item list-group-item-action clic" @click="addGroup('selectOne.png', 1)"
                    style=" cursor: pointer"><i class="fa-regular fa-circle-dot"></i>
                    Seleccionar una</span>


                <span class="list-group-item list-group-item-action" @click="addGroup('selectMany.png', 2)"
                    style=" cursor: pointer"><i class="fa-regular fa-square-check"></i>
                    Seleccionar varias</span>

                <span class="list-group-item list-group-item-action" @click="addGroup('dropdownMenu.png', 3)"
                    style=" cursor: pointer"><i class="fa-solid fa-bars"></i>
                    Menu
                    desplegable </span>
                <span class="list-group-item list-group-item-action" @click="addGroup('textRow.png', 4)"
                    style=" cursor: pointer"><i class="fa-solid fa-text-width"></i>
                    Texto de una sola fila</span>

                <span class="list-group-item list-group-item-action" @click="addGroup('email.png', 5)"
                    style=" cursor: pointer"><i class="fa-solid fa-at"></i>
                    Email</span>

                <span class="list-group-item list-group-item-action" @click="addGroup('date.png', 11)"
                    style=" cursor: pointer"><i class="fa-regular fa-calendar-days"></i>
                    Fecha</span>


                <span :hidden="true" class="list-group-item list-group-item-action"
                    @click="addGroup('infoContact.png', 6)" style=" cursor: pointer"><i
                        class="fa-solid fa-address-card"></i>
                    Informacion de contacto</span>

                <span class="list-group-item list-group-item-action" @click="addGroup('selectorImage.png', 7)"
                    style=" cursor: pointer"><i class="fa-solid fa-cloud-arrow-up"></i>
                    Selector de archivos</span>

                    <!-- <span class="list-group-item list-group-item-action" disabled @click="addGroup('selectorImage2.png', 10)"
                    style=" cursor: pointer"><i class="fa-solid fa-image"></i>
                    Seleccionar una imagen</span> -->


                <span class="list-group-item list-group-item-action" @click="addGroup(null, 9)"
                    style=" cursor: pointer"><i class="fa-solid fa-book"></i>
                    Agregar de biblioteca</span>
 
                <span v-if="notShow" class="list-group-item list-group-item-action" style=" cursor: pointer">
                    <div class="form-check form-switch ps-0 ms-auto my-auto">
                        Mostrar Ayuda

                        <input class="form-check-input mt-1 ms-auto" type="checkbox" id="show" @change="show">
                    </div>

                </span>

            </div>

        </div>
    </div>

</template>

<style scoped>
.centericon{

    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

}

.bg-color {

    background-color: #12408E;
}

.colorIcon {

    color: #fff;
}
</style>