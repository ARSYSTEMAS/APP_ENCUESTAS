<script setup>
import HeadingEmptySurvey from './HeadingEmptySurvey.vue';
</script>
<template>
<div class="row d-flex justify-content-center align-items-center pb-0 p-2">
<HeadingEmptySurvey />
</div>
<div class="py-5 d-flex justify-content-center align-items-center">
    <div class="obj">
        <div class="objchild">
          
            <span class="inn2"></span>
            <span class="inn3"></span>
            <span class="inn4"></span>
            <span class="inn5"></span>
            <span class="inn6"></span>
        </div>
    </div>
</div>
</template>

<style scoped>

.obj {
  position: relative;
  width: 200px;
  height: 200px;
    /* background-color: rgb(96, 96, 232); */
  transform-style: preserve-3d;
  transition: 0.5s all;
  transform: rotateX(-25deg) rotateY(20deg);
}

.objchild {
  animation: rotate 4s infinite linear;
  transform-style: preserve-3d;
  position: absolute;
  width: 100%;
  height: 100%;
    /* background:linear-gradient( to top,rgb(11, 11, 102),rgb(96, 96, 232) ) ; */
}

.objchild::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
    /* background: rgb(37, 101, 230); */
    /* background: radial-gradient(center center, farthest-side , #9993, transparent); */
  filter: blur(20px);
  box-shadow: 0 0 200px 15px white;
  transform: rotateX(90deg) scale(1.1) translateZ(-120px);
}


.inn2 {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateZ(100px);
  background: linear-gradient( to top,#143E8F,#FFDD00 );
}

.inn3 {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(-100px) rotateY(90deg);
  background: linear-gradient( to top,#143E8F,#FFDD00 );
}

.inn4 {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(100px) rotateY(90deg);
  background: linear-gradient( to top,#143E8F,#FFDD00 );
}

.inn5 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgb(10, 10, 79);
  transform: rotateX(90deg) translateZ(-100px);
}

.inn6 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgb(46, 46, 46);
  transform: rotateX(90deg) translateZ(100px);
}

@keyframes rotate {
  0% {
    transform: rotate3d(0,1,0,0deg);
  }

  100% {
    transform: rotate3d(0,1,0,360deg);
  }
}
</style>