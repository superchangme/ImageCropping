// import './set-public-path';
import Vue from 'vue';
import singleSpaVue from 'single-spa-vue';
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import i18n from './i18n'
import router from './router'
console.log(process)
// Vue.config.productionTip = false
Vue.use(Element, {
  size: 'small', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
// Vue.prototype.$t = i18n.t

new Vue({
  el: '#app',
  i18n,
  router,
  render: h => h(App)
});
Vue.config.productionTip = false;

// const vueLifecycles = singleSpaVue({
//   Vue,
//   appOptions: {
//     render: (h) => h(App),
//   },
// });

// export const bootstrap = vueLifecycles.bootstrap;
// export const mount = vueLifecycles.mount;
// export const unmount = vueLifecycles.unmount;
