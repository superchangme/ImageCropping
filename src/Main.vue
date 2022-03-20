<template>
  <div>
    <fieldset>
      <legend>修改裁剪参数</legend>
      <div style="text-align: left">
        宽度(像素):<input v-model="bWidth" />px
        <br />
        高度(像素):<input v-model="bHeight" />px
        <br />
        图片质量:<input type="range" min="50" max="100" v-model="quality" />
        <br />
        是否圆形:<input type="checkbox" v-model="bCircle" />
        <br />
        <el-button type="second" @click="changeSize">确定修改</el-button>
      </div>
    </fieldset>
    <img :src="cropYou" width="300" ref="myImg" />
    <el-button @click="showCrop" type="primary" class="crop-btn"
      >上传照片</el-button
    >
    <ImageCrop
      :key="cropKey"
      :data-width="width"
      :data-height="height"
      :isBoundCheck="true"
      :dataCircle="isCircle"
      :dataEnableRatio="true"
      :dataShow="dataShow"
      :limitSize="20480 * 1000"
      @onHide="dataShow = false"
      @onSuccess="onSuccess"
      @onError="onError"
    ></ImageCrop>
    <el-button @click="downLoad" type="success" style="margin-top: 10px"
      >下载照片</el-button
    >
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
      quality: 92
    };
  },
  methods: {
    showCrop() {
      this.dataShow++;
    },
    onSuccess(data) {
      this.dataShow = false;
      this.cropYou = data.base64;
    },
    onError(err) {},
    changeSize() {
      // reRender plugin
      this.width = +this.bWidth;
      this.height = +this.bHeight;
      this.isCircle = this.bCircle;
      this.cropKey++;
      alert('可以点击upload 按钮上传图片了~');
    },
    downLoad() {
      var canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      canvas.width = this.width;
      canvas.height = this.height;
      document.body.appendChild(canvas);
      canvas
        .getContext('2d')
        .drawImage(
          this.$refs.myImg,
          0,
          0,
          this.$refs.myImg.naturalWidth,
          this.$refs.myImg.naturalHeight
        );
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', this.quality / 100);
      a.download = 'ImageCrop-' + this.formatDate(new Date(), 'yyyy-MM-dd_HH_mm_ss');
      a.click();
    },
    formatDate(date,fmt) {
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

<style></style>
