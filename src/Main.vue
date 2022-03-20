<template>
  <div>
    <fieldset>
      <legend>修改照片参数</legend>
      <div style="text-align: left">
        宽度(像素):<input v-model="bWidth" />px
        <br />
        高度(像素):<input v-model="bHeight" />px
        <br />
        证件照尺寸：<select v-model="photoSize" @change="choosePhotoSize">
          <option :value="index" v-for="(size,index) in photoSizeList" :key="size.name">{{size.name}}</option>
        </select>
        <br/>
        自动消除背景: <input type='checkbox' v-model="bFaceDetect"/>
        <br />
        <div v-if='bFaceDetect'>
          背景色：<input type="color"  v-model="faceBackground" />
        </div>
        图片质量:<input type="range" min="50" max="100" v-model="quality" />
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
    <img  @click="adjustAgain" v-if="cropYou" :src="cropYou" width="300" ref="myImg" class="myImg" />
    <ImageCrop
      :key="cropKey"
      :data-width="width"
      :data-height="height"
      :isBoundCheck="true"
      :dataCircle="isCircle"
      dataTitle="制作证件照"
      :dataFullScreen="true"
      :dataEnableRatio="true"
      :dataOriginSize="originSize"
      :dataFaceDetect="faceDetect"
      :dataBackground="faceBackground"
      :dataShow="dataShow"
      :limitSize="20480 * 1000"
      customClass="myphoto-crop"
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
      bBigSize: false,
      quality: 92,
      downloadName: '',
      bFaceDetect: true,
      faceDetect: true,
      faceBackground: '#ffffff',
      photoSizeList:[
        {
          name:'一寸',
          width:295,
          height:413
        },
        {
          name:'二寸',
          width:413,
          height:579
        },
        {
          name:'大一寸',
          width:389,
          height:567
        },
        {
          name:'小二寸',
          width:413,
          height:531
        },
        {
          name:'社保证',
          width:358,
          height:441
        },
        {
          name:'港澳通行证',
          width:390,
          height:567
        },
        {
          name:'保险资格从业',
          width:210,
          height:370
        }
      ],
      photoSize:null,
      originSize:null
    };
  },
  methods: {
    showCrop() {
      this.dataShow++;
      this.useOption();
    },
    onSuccess(data) {
      this.dataShow = false;
      this.cropYou = data.base64;
      this.downloadName =
        'ImageCrop-' + this.formatDate(new Date(), 'yyyy-MM-dd_HH_mm_ss');
    },
    onError(err) {
      console.error(err)
    },
    choosePhotoSize(e){
      let v = this.photoSizeList[this.photoSize]
      this.bWidth = v.width
      this.bHeight = v.height
      let maxWidth = Math.floor(window.innerWidth - 40)
      this._oWidth = Math.min(v.width,maxWidth)
      this._oHeight = v.height*(this._oWidth/v.width)
      this.originSize = {
        width: this.bWidth,
        height: this.bHeight
      }
    },
    useOption(){
      document.body.style.setProperty('--crop-background',this.faceBackground)
      let oldW= this.width
      let oldH = this.height
      let oldFaceDetect = this.faceDetect
      let oldCircle = this.isCircle
      this.width = this._oWidth ? this._oWidth : +this.bWidth;
      this.height = this._oHeight ? this._oHeight : +this.bHeight;
      this.isCircle = this.bCircle;
      this.faceDetect = this.bFaceDetect
      if(oldCircle != this.isCircle || oldW != this.width || oldH != this.height || oldFaceDetect != this.faceDetect) {
        this.cropKey++;
      }
    },
    changeSize() {
      this.useOption()
      // reRender plugin
      this.$message({
        showClose: true,
        message: '已调整参数，请点击上传或重新下载图片~',
        type: 'success'
      });
      if(this.$refs.imageCrop.cropInstance) {
        this.$refs.imageCrop.getFile({
          originSize: this.originSize,
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
    adjustAgain() {
       if(this.cropYou) {
         this.$refs.imageCrop.adjustAgain()
       }
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
  activated(){
    document.body.classList.add('myphoto-crop-page')
  },
  destroyed(){
    document.body.classList.remove('myphoto-crop-page')
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
body.myphoto-crop-page{
  --crop-background:white;
}
body.myphoto-crop-page .preview-wrapper .inner{
background: var(--crop-background);
}
</style>
