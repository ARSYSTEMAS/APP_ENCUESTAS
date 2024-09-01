<script setup>

</script>

<template>

<span class="loader">Cargando espere...</span>

</template>

<style scoped>
.loader{
        display: inline-block;
        text-align: center;
        line-height: 16px;
        text-align: center;
        padding: 0 48px;
        font-size: 28px;
        font-family: Arial, Helvetica, sans-serif;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        }
        .loader:before, .loader:after {
          content: '';
          display: block;
          width: 15px;
          height: 15px;
          background: currentColor;
          position: absolute;
          animation: load .7s infinite alternate ease-in-out;
          top: 0;
        }
        .loader:after {
          top: auto;
          bottom: 0;
        }
      @keyframes load {
        0% {
          left: 0;
          height: 13px;
          width: 15px;
          transform: translateX(0)
        }
        50% {
          height: 10px;
          width: 20px
        }
        100% {
          left: 100%;
          height: 13px;
          width: 15px;
          transform: translateX(-100%)
        }
      }
</style>