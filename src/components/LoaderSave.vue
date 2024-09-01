<template>

<div class="loader-container">
  <div class="loader"></div>
  <div class="loader-text">Guardando Espere...</div>
</div>


</template>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loader {
  width: 70px;
  height: 70px;
  position: fixed;
}

.loader:before {
  content: "";
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 6px solid #007bff;
  position: fixed;
  top: 50%;
  left: 46%;
  animation: pulse 1s ease-in-out infinite;
}

.loader:after {
  content: "";
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 6px solid transparent;
  border-top-color: #007bff;
  position: fixed;
  top: 50%;
  left: 46%;
  animation: spin 2s linear infinite;
}

.loader-text {
  font-size: 24px;
  margin-top: 20px;
  color: #007bff;
  font-family: Arial, sans-serif;
  text-align: center;
  text-transform: uppercase;
  position: fixed;
  top: 40%;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(0.6);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.content {
  display: none;
}

.loaded .loader-container {
  display: none;
}

.loaded .content {
  display: block;
}


</style>