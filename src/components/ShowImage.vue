<script setup>
import { defineProps } from 'vue';

const urlDefault = "/img/multiple_choice/";

const props = defineProps({
    
    ruta: String
})

</script>


<template>

<div v-if="ruta" class="position-relative">

    <img :src=urlDefault+props.ruta  alt="...">

</div>

</template>


<style scoped>


</style>