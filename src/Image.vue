<template>
  <div>
    <img :src='cropYou'>
    <el-button @click='showCrop' class="crop-btn">showCrop</el-button>
    <ImageCrop :isBoundCheck='false' :dataShow='dataShow' dataTitle='裁剪照片'
    :dataFromUrl='true' :dataImgSrc='cropImage' 
    @onHide='dataShow=0' @onSuccess='onSuccess'></ImageCrop>
  </div>
</template>

<script>
import ImageCrop from './components/ImageCropping/index.vue'
import image from './assets/ldf.jpg'
export default {
  name: 'Main',
  data(){
    return {
      dataShow: 0,
      cropYou:null,
      cropImage:null,
      image
    }
  },
  methods:{
    showCrop(){
      this.dataShow ++
      this.cropImage = this.image
    },
    onSuccess(data){
      this.dataShow =0 
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
