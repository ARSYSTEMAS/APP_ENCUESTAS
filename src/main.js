import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import Vue3Toasity from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/fontawesome/css/regular.css'
import './assets/fontawesome/css/solid.css'
import './assets/fontawesome/css/fontawesome.css'
import './assets/fontawesome/css/brands.css'
import './assets/css/styles.css'

const app = createApp(App)
app.use(router)
app.use(VueCookies, {
    expireTimes: "1d",
    // path: "/",
    // domain: "",
    // secure: true,
    // sameSite: "None"
});

app.use(Vue3Toasity, {
    autoClose: false,
    //multiple: false,
    // ...
  });

app.mount('#app')
