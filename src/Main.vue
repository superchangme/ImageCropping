<template>
  <div>
    <fieldset>
      <legend>修改裁剪参数</legend>
      <div style="text-align: left">
        宽度(像素):<input v-model="bWidth" />px
        <br />
        高度(像素):<input v-model="bHeight" />px
        <br />
        启用证件照模式: <input type="checkbox" v-model="bFaceDetect" />
        <br />
        背景色：<input type="color"  v-model="faceBackground" />
        <br />
        图片质量:<input type="range" min="50" max="100" v-model="quality" />
        <br />
        启用大图: <input type="checkbox" v-model="bBigSize" />
        <br />
        是否圆形:<input type="checkbox" v-model="bCircle" />
        <br />
        <el-button type="second" @click="changeSize">确定修改</el-button>
      </div>
    </fieldset>
    <div class="button-group">
    <el-button @click="showCrop" type="primary" class="crop-btn"
      >上传照片</el-button
    >
     <a :href="cropYou" :download="downloadName" class="mydownload">
      <el-button @click="downLoad" type="success"
        >下载照片</el-button
      >
    </a>
    </div>
        <img v-if="cropYou" :src="cropYou" width="300" ref="myImg" class="myImg" />
    <ImageCrop
      :key="cropKey"
      :data-width="width"
      :data-height="height"
      :isBoundCheck="true"
      :dataCircle="isCircle"
      :dataEnableRatio="true"
      :dataFaceDetect="faceDetect"
      :dataBackground="faceBackground"
      :dataOriginSize="isOrigin"
      :dataShow="dataShow"
      :limitSize="20480 * 1000"
      ref='imageCrop'
      @onHide="dataShow = false"
      @onSuccess="onSuccess"
      @onError="onError"
    ></ImageCrop>
   
  </div>
</template>

<script>
import ImageCrop from './components/ImageCropping/index.vue';
export default {
  name: 'Main',
  data() {
    return {
      width: 300,
      height: 300,
      bWidth: 300,
      bHeight: 300,
      dataShow: false,
      cropYou: null,
      cropKey: 0,
      bCircle: false,
      isCircle: false,
      isOrigin: true,
      bBigSize: false,
      quality: 92,
      downloadName: '',
      bFaceDetect: true,
      faceDetect: true,
      faceBackground: '#ffffff'
    };
  },
  methods: {
    showCrop() {
      this.dataShow++;
    },
    onSuccess(data) {
      this.dataShow = false;
      this.cropYou = data.base64;
      this.downloadName =
        'ImageCrop-' + this.formatDate(new Date(), 'yyyy-MM-dd_HH_mm_ss');
    },
    onError(err) {},
    changeSize() {
      // reRender plugin
      let oldW= this.width
      let oldH = this.height
      let oldFaceDetect = this.faceDetect
      this.width = +this.bWidth;
      this.height = +this.bHeight;
      this.isCircle = this.bCircle;
      this.isOrigin = !this.bBigSize;
      this.faceDetect = this.bFaceDetect
      if(oldW != this.width || oldH != this.height || oldFaceDetect != this.faceDetect) {
        this.cropKey++;
      }
      this.$message({
        showClose: true,
        message: '已调整参数，请点击上传或重新下载图片~',
        type: 'success'
      });
      if(this.$refs.imageCrop.cropInstance) {
        this.$refs.imageCrop.getFile({
          lowDpi: this.isOrigin,
          isCircle: this.isCircle,
          background: this.faceBackground
        })
      }
    },
    downLoad() {
      this.$message({
        showClose: true,
        message: '如果下载失败，请长按图片保存~',
        type: 'info'
      });
    },
    formatDate(date, fmt) {
      var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'H+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          );
        }
      }
      return fmt;
    }
  },
  components: {
    ImageCrop
  }
};
</script>

<style>
.mydownload {
  display: block;
  margin:0 auto;
}
.button-group{
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}
.myImg {
  margin-top: 10px;
  border:1px solid #67C23A;
}
</style>
