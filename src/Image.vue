<template>
  <div>
    <img :src='cropYou'>
    <el-button @click='showCrop' class="crop-btn">showCrop</el-button>
    <ImageCrop :isBoundCheck='true' :dataShow='dataShow' dataTitle='裁剪照片'
    :dataFromUrl='true' :dataImgSrc='cropImage' dataBackground='#000'
    @onHide='dataShow=false' @onSuccess='onSuccess'></ImageCrop>
  </div>
</template>

<script>
import ImageCrop from './components/ImageCropping/index.vue'
import image from './assets/ldf.jpg'
export default {
  name: 'Main',
  data(){
    return {
      dataShow: false,
      cropYou:null,
      cropImage:null,
      image
    }
  },
  methods:{
    showCrop(){
      this.dataShow=true
      this.cropImage = this.image
    },
    onSuccess(data){
      this.dataShow =false
      this.cropYou = data.base64
      this.cropImage = null
    }
  },
  components: {
    ImageCrop
  }
}
</script>

<style>
</style>
