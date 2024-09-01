<script setup>
import { defineEmits, ref, computed } from 'vue';

const password = ref()
const MypasswordField = ref(null)
let IconoPass = ref("fa-solid fa-eye")



const emit = defineEmits(['input-value'])

function sowHiddenPassword() {
    const type = MypasswordField.value.type

    if (type == 'password') {
        MypasswordField.value.type = "text"
        IconoPass.value = "fa-solid fa-eye"
    } else {
        MypasswordField.value.type = "password"
        IconoPass.value = "fa-solid fa-eye-slash"
    }
}






function sendValuePassword(value) {

    emit("input-value", value)

}
</script>

<template>
    <div class="input-group">
        <input type="password" ref="MypasswordField" @change="sendValuePassword(password)" id="password"
            v-model="password" placeholder="Escribe tu password" class="form-control form-control"
            aria-describedby="btnGroupAddon">
        <div class="input-group-text" id="btnGroupAddon" @click="sowHiddenPassword"> <i :class="IconoPass"
                style="cursor: pointer;"></i></div>
    </div>
    <label class="form-label" for="password">Password </label>
</template>



<style scoped></style>