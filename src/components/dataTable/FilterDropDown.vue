<script setup>

import { computed, defineProps, ref } from 'vue';


const show = ref(false);

const props = defineProps({
    items: {
        type: Array,
        required: true
    },

})


const statusUses = computed(() => {

    return [...new Set(props.items.map(item => item.status))];

})

const emit = defineEmits('filter');

const filter = (e) => {

    emit('filter', e.target.value);


}

</script>

<template>

    <div class=" d-md-flex justify-content-md-end">



        <div class="dropdown">
            <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton1"
                data-bs-toggle="dropdown" aria-expanded="false">
                Listado de Status
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li v-for="(status, index) in statusUses">
                    <div class="form-check">
                    <input :id="`filter_option_${index}`" type="checkbox" :value=" status" @change="filter">
                    <label :for="`filter_option_${index}`"> {{ status }}</label>
                </div>

                </li>
            </ul>
        </div>

    </div>


</template>