<script setup>
import obtenerCookiesUsuario from './function/cookies'
const setIsAuthenticated = $cookies.get(obtenerCookiesUsuario().nameCookies)
import LOGIN from './views/authView.vue'

</script>

<template>

  <div v-if="!setIsAuthenticated">
    <router-view></router-view>
  </div>

  <div v-else>
    <LOGIN />
  </div>
</template>

