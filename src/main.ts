import Vue from 'vue';
import Toasted from 'vue-toasted';
import VueDraggableResizable from 'vue-draggable-resizable';

import App from './App.vue';

Vue.config.productionTip = false;

Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.use(Toasted, {
  position: 'bottom-center',
  theme: 'outline',
  duration: 9000,
});

new Vue({
  render: h => h(App),
}).$mount('#app');
