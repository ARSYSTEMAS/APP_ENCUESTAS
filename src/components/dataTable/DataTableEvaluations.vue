<script setup>

import { computed, defineProps, ref } from 'vue';
import SearchForm from './SearchForm.vue';
//import FilterRadios from './FilterRadios.vue';
//import FilterDropDown from './FilterDropDown.vue';

const searchFilter = ref('')
const radioFilter = ref('')
const statusFilter = ref([])

const props = defineProps({
    items: {
        type: Array,
        required: true
    },

    columns: {
        type: Array,
        required: true
    },

})

function handleSearch(search) {

    searchFilter.value = search

}

function handleFilterRadios(filter) {

    radioFilter.value = filter

}

function handleFilterStatus(status) {

    if (statusFilter.value.includes(status)) {


        return statusFilter.value.splice(statusFilter.value.indexOf(status), 1);
    }

    return statusFilter.value.push(status)
}

const filteredItems = computed(() => {

    let items = props.items;

    switch (radioFilter.value) {

        case "today":

            items = items.filter(item => new Date(item.updated_at).getDate() === new Date().getDate());

            break;


        case "past":

            items = items.filter(item => new Date(item.updated_at).getDate() < new Date().getDate());

            break;
    }


    if (statusFilter.value.length) {

        items = items.filter(item => statusFilter.value.includes(item.status));
    }

    if (searchFilter.value != '') {


        items = items.filter(item =>
            item.Id == searchFilter.value ||
            item.Name.toUpperCase().includes(searchFilter.value.toUpperCase())
        );
    }

    return items;

})

const emit = defineEmits(['sayDelete', 'sayUpdate'])

function buttonDelete(dataField) {
    emit("sayDelete", dataField)

}

function buttonUpdate(dataField) {
    emit("sayUpdate", dataField)

}


</script>


<template>
    <div v-if="items.length > 0" class="card my-4 p-3">
        <div class="container">

            <div class="row">

                <div class="d-grid gap-2 d-md-flex justify-content-md-end">

                    <SearchForm @search="handleSearch" />
                </div>

            </div>

        </div>  
        <div class="table-responsive">
            <table id="myTable" class="table align-middle table-striped  mt-1">
                <thead>
                    <tr>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                            v-for="column in columns" :key="column">{{ column }}</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder text-center opacity-7">
                            <span>Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in filteredItems" :key="index">
                        <td class="text-uppercase text-xs" v-for="column in columns" :key="column">{{ row[column] }}
                        </td>

                        <td class="d-grid gap-2 d-md-flex justify-content-md-end">

                            <button class='btn btn-danger btn-circle' @click="buttonDelete(row?.Id)">
                                <i class="fa-solid fa-trash" style="font-size:15px;"></i>
                            </button>

                            <button class='btn btn-primary btn-circle' @click="buttonUpdate(row?.Id)">
                                <i class="fa-solid fa-pen-to-square" style="font-size:15px;"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>

</template>

<style scoped>
.text-xxs {
    font-size: 14px;
}

.text-xs {
    font-size: 12px;
}
</style>
