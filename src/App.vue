<template>
  <div id='app'>
  <router-link to="/">上传头像裁剪</router-link>
  <router-link to="/free">自由旋转裁剪</router-link>
  <router-link to="/cropImage">已有图片裁剪</router-link>
  <keep-alive><router-view/></keep-alive>
  </div>
</template>

<script>
export default {

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a[class*=router-link-]{
  display: inline-block;
  margin: 0 15px 15px 0;
}
.router-link-exact-active{
  color: orange;
}
.crop-btn{
    display: block;
    margin: 0 auto;
}
</style>