import './assets/main.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useGlobalStore } from './stores/global';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faPlay,
    faPause,
    faForwardStep,
    faBackwardStep,
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';

library.add(faPlay, faPause, faForwardStep, faBackwardStep, faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight);

const app = createApp(App);

app.use(createPinia());
app.component('font-awesome-icon', FontAwesomeIcon);

useGlobalStore()
    .initNocturne()
    .then(() => app.mount('#app'));
