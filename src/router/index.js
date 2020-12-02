import Vue from 'vue'
import Router from 'vue-router'
 
//组件模块
import Main from '../Main.vue'
import Image from '../Image.vue'
import Free from '../Free.vue'
Vue.use(Router)
 
export default new Router({
  routes: [
    { path: '/', name: 'home', component: Main },
    { path: '/free', name: 'Free', component: Free },
    { path: '/cropImage', name: 'Image', component: Image },
  ]
})