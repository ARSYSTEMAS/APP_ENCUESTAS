<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router';
import Footer from './Footer.vue';


const route = useRoute()
const sort = route.name;


</script>



<template>

    <div id="layoutSidenav_content">

        <div class="container-fluid px-4">

            <div v-if="sort === 'auth'">

                <div>
                    <img src="@/assets/img/HomePageEncuestas.jpg" alt="home" class="img-fluid"
                        style="border-radius: 1rem 0 0 1rem;" />
                </div>

            </div>
            
            <RouterView />
        </div>


      
        <Footer />
    </div>

</template>