<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  closeToast: Function,
  toastProps: Object,
  idEncuesta: Number,
  message:String
});

</script>

<template>
  <div>
    <p>¡ALERTA DE CONFIRMACIÓN!</p>
    <p>{{props?.message}}</p>
      <button @click="props.closeToast">
      OK
    </button>
  </div>
</template>