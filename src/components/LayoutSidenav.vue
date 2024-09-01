<script setup>
import SideNavContent from './SideNavContent.vue';
import obtenerCookiesUsuario from '../function/cookies'

const userName = obtenerCookiesUsuario().userName
const rolUser = obtenerCookiesUsuario().rol

</script>


<template>
    <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
            <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">

                <div style="width: 100%;">
                    <router-link :to="{ name: '/' }"><img src="@/assets/img/logo_daka.png"
                            class="img-fluid img-thumbnail mx-auto d-block" lt="Logo Daka"
                            style="width: 150px; height: 150px; cursor: pointer;"></router-link>
                </div>
                <div class="sb-sidenav-menu">
                    <div class="nav">

                        <div class="sb-sidenav-menu-heading">Surveys - Form</div>
                        <a class="nav-link collapsed" href="#" data-bs-toggle="collapse"
                            data-bs-target="#collapseLayouts" aria-expanded="false" aria-controls="collapseLayouts">
                            <div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
                            Crear
                            <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>
                        </a>
                        <div class="collapse" id="collapseLayouts" aria-labelledby="headingOne"
                            data-bs-parent="#sidenavAccordion">
                            <nav class="sb-sidenav-menu-nested nav">
                                <router-link to="/mysurveys/1" class="nav-link">Encuestas y Formularios</router-link>
                            </nav>
                            <nav class="sb-sidenav-menu-nested nav">
                                <router-link to="/mysurveys/2" class="nav-link">Evaluaciones</router-link>
                            </nav>
                        </div>
                        
                        <div v-if="rolUser" class="sb-sidenav-menu-heading">Administración</div>

                        <router-link v-if="rolUser" to="/createUsers" class="nav-link">
                            <div class="sb-nav-link-icon"><i class="fa-solid fa-user-plus"></i></div>Usuarios
                        </router-link>

                        <router-link v-if="rolUser" to="/evaluations" class="nav-link">
                            <div class="sb-nav-link-icon"><i class="fa-solid fa-table"></i></div>Evaluaciones
                        </router-link>

                    </div>
                </div>
                
                <div class="sb-sidenav-footer">
                    <div class="small">Logged in as:</div>
                    <div class="small text-lowercase"><i class="fa-solid fa-user-check" style="color: greenyellow;"></i> {{ userName }} </div>
                   
                </div>
            </nav>

       
        </div>


             <!-- LayoutSidenav -->
             <SideNavContent />

    </div>

</template>