<script setup>
import { defineAsyncComponent } from 'vue'
import MenuNavegacion from '../components/SideNav.vue';
//import LoginForm from '@/views/authView.vue'
import obtenerCookiesUsuario from '../function/cookies'

const setIsAuthenticated = $cookies.get(obtenerCookiesUsuario().nameCookies)

const LoginForm = defineAsyncComponent(() => 
import ('@/views/authView.vue')
)

</script>

<template>


<div v-if="!setIsAuthenticated">
<router-view></router-view>
</div>
  <!-- <div v-if="setIsAuthenticated"> -->
    <!-- <MenuNavegacion /> 
   </div>-->

  <div v-else>
    <LoginForm />
  </div> 

</template>
