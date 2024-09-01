<script setup>
import { defineEmits } from 'vue';


const emit = defineEmits('filter')

const filter = (e) => {

    console.log(e.target.value);

    emit('filter', e.target.value);
}

</script>

<template>

    <div class="justify-content-center">
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="show" value="all" checked @change="filter">
            <label class="form-check-label" for="flexRadioDefault1">
                Show all
            </label>
        </div>

        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="show" value="today" @change="filter">
            <label class="form-check-label" for="flexRadioDefault1">
                Due Today
            </label>
        </div>

        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="show" value="past" @change="filter">
            <label class="form-check-label" for="flexRadioDefault1">
                Past Due
            </label>
        </div>
    </div>
</template>