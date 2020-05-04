<template>
  <div>
    <img :src='cropYou'>
    <el-button @click='showCrop' class="crop-btn">showCrop</el-button>
    <ImageCrop :isBoundCheck='false' :dataShow='dataShow' :dataRotate='true'
    @onHide='dataShow=0' @onSuccess='onSuccess'></ImageCrop>
  </div>
</template>

<script>
import ImageCrop from './components/ImageCropping/index.vue'
export default {
  name: 'Main',
  data(){
    return {
      dataShow: 0,
      cropYou:null
    }
  },
  methods:{
    showCrop(){
      this.dataShow ++
    },
    onSuccess(data){
      this.dataShow =0 
      this.cropYou = data.base64
    }
  },
  components: {
    ImageCrop
  }
}
</script>

<style>

</style>
