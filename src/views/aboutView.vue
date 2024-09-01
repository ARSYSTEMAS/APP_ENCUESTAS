<script setup>
import { ref } from 'vue';
import navegadorAgent from '../function/navigator';


const { ismovil } = navegadorAgent();

</script>

<template>
    <!-- Section: Design Block -->

     <section v-if="!ismovil">
        <div id="padre">
            <img src="@/assets/img/HomePageEncuestas.jpg" alt="login form" class="img-fluid"
                style="border-radius: 1rem 0 0 1rem;" />
        </div>
    </section> 

     <div v-if="ismovil" class="img-fluid pt-6">
        <img src="@/assets/img/LogoDakaAuth.png" alt="login form" class="img-fluid"
            style="border-radius: 1rem 0 0 1rem;" />
    </div> 

</template>

<style scoped>
#padre {
    position: relative;
}
</style>