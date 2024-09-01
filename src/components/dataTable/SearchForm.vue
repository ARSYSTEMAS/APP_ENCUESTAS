<script setup>

import { defineEmits } from 'vue';

const emit = defineEmits('search')

const search = (e) => {

    emit('search', e.target.value)

};

</script>


<template>

    <form class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
        <div class="input-group">
            <input class="form-control" type="text" @input="search" value="" placeholder="Buscar..." aria-label="Buscar..."
                aria-describedby="btnNavbarSearch" />
            <button class="btn btn-success" id="btnSearch" type="button"><i class="fa-brands fa-searchengin"></i></button>
        </div>
    </form>

    <!-- <form class="row g-3"> -->
    <!-- <div class="col-auto">
            <input type="text" @input="search" class="form-control" id="Search" placeholder="Buscar" value="">
        </div> -->
    <!-- </form> -->

</template>