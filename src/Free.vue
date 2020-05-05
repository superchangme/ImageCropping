<template>
  <div>
    <img :src='cropYou' width=300>
    <el-button @click='showCrop' class="crop-btn">uploadImage</el-button>
    <ImageCrop :dataShow='dataShow' :dataEnableRatio='true' :dataRotate='true' :limitSize='20480*1000'
    @onHide='dataShow=false' @onSuccess='onSuccess' @onError='onError'></ImageCrop>
  </div>
</template>

<script>
import ImageCrop from './components/ImageCropping/index.vue'
export default {
  name: 'Main',
  data(){
    return {
      dataShow: false,
      cropYou:null
    }
  },
  methods:{
    showCrop(){
      this.dataShow=true
    },
    onSuccess(data){
      this.dataShow =false
      this.cropYou = data.base64
    },
    onError(err){
        console.log(err)
    }
  },
  components: {
    ImageCrop
  }
}
</script>

<style>

</style>
