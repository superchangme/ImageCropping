import Vue from 'vue'
import Router from 'vue-router'
 
//组件模块
import Main from '../Main.vue'
import Image from '../Image.vue'
Vue.use(Router)
 
export default new Router({
  routes: [
    { path: '/', name: 'home', component: Main },
    { path: '/cropImage', name: 'Image', component: Image },
  ]
})