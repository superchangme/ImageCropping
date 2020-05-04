<template>
  <div id='app'>
  <router-link to="/">普通上传裁剪</router-link>
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
a{
  display: inline-block;
  margin: 0 30px 30px 0;
}
.crop-btn{
    display: block;
    margin: 0 auto;
}
</style>