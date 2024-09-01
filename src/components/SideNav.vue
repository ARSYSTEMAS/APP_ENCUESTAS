<script setup>
import LayoutSidenav from './LayoutSidenav.vue'
import Swal from "sweetalert2";
import obtenerCookiesUsuario from '../function/cookies'
import UuidService from "../services/GenerateUUID"
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router';

const objUser = obtenerCookiesUsuario().objUser
const userName = obtenerCookiesUsuario().userName
const uuid = obtenerCookiesUsuario().objUser?.uuid

const Uuid_Service = new UuidService()
const router = useRouter()
const handleLogout = () => {

Swal.fire({
  icon: 'question',
  title: 'Cerrar Sesión',
  text: '¿Estás seguro de que quieres cerrar sesión?',
  showCancelButton: true,
  confirmButtonText: 'Yes',
}).then(result => {
  if (result.value) {
    Swal.fire({
      timer: 1500,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {

        $cookies.remove(obtenerCookiesUsuario().nameCookies)

        //eliminamos la sessionActiva
        Uuid_Service.uuIdDelete({uuid:uuid, Usuario:userName})
       // router.push('/auth')
        window.location.reload()
      },
    });
  }
});
};


window.addEventListener('unload', async function (e) {
  // Ejecuta cuando el usuario cierra la pestaña o el navegador
 // Uuid_Service.uuIdDelete({uuid:uuid, Usuario:userName})
});

</script>


<template>

  <div class="sb-nav-fixed">

    <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
      <!-- Navbar Brand-->
      <a class="navbar-brand ps-3" href="index.html"> <i class="fa-solid fa-square-poll-horizontal"></i> E N C U E S T A S </a>
      <!-- Sidebar Toggle-->
      <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i
          class="fas fa-bars"></i></button>
      
      <!-- Navbar Search-->
      <form class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
        <div class="input-group">
          <input class="form-control" type="text" placeholder="Buscar..." aria-label="Buscar..."
            aria-describedby="btnNavbarSearch" />
          <button class="btn btn-primary" id="btnNavbarSearch" type="button"><i class="fas fa-search"></i></button>
        </div>
  
      </form>
      <!-- Navbar-->
    
      <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown"
            aria-expanded="false"><i class="fas fa-user fa-fw"></i></a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <!-- <li><a class="dropdown-item" href="#!">Mi cuenta</a></li> -->
            <router-link :to="{ name: 'profile' }" class="dropdown-item"><i class="bi bi-caret-right-fill"></i><i class="fa-solid fa-user" style="color: #12408E;"></i> Mi
              Cuenta</router-link>
            <li>
              <hr class="dropdown-divider" />
            </li>
           
            <li><a href="#" class="dropdown-item" @click="handleLogout"><i class="fa-solid fa-user-clock" style="color: #12408E;"></i> Cerrar sesión</a></li>
          </ul>
        </li>
      </ul>
    </nav>

    <LayoutSidenav />
  </div>



</template>



<style>

</style>