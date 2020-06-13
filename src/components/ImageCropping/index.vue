<template>
  <div class="components-uploadPage-app"  ref="uploadPage" v-show='showCropBody'>
    <input
      class="upload-file"
      ref="inputFile"
      type="file"
      v-show="false"
      accept="image/*;capture=camera"
    />

    <el-dialog
      :custom-class="customClass +' ' + (dataCircle?'circleModel':'')"
      :width="(dataWidth+40)+'px'"
      :title="dataTitle"
      :append-to-body="true"
      :modal="false"
      ref="uploadDialog"
      :visible.sync="showDialog"
      @open="initCropBody"
      @close="$emit('onHide')"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <img id="previewResult" v-show="false" />
      <img id="needCropImg" v-show="false" :src="imgSrc" />
      <div v-loading="isLoading" element-loading-text="加载中...">
        <div :class="{ isOpacity: isLoading }">
          <div class="upload-loading">
            <span class="centerXY"
              ><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i
            ></span>
          </div>
          <div class="upload-main">
            
            <div class="preview-wrapper" id="preview-wrapper">
              <div class="upload-mask">
              <div class="crop_line_x1"></div>
              <div class="crop_line_x2"></div>
              <div class="crop_line_y1 crop_liney"></div>
              <div class="crop_line_y2 crop_liney"></div>
            </div>
              <div class="inner">
                <div class="preview-box">
                  <div class="preview-view"><img id="preview" v-show="previewSrc"/></div>
                </div>
              </div>
              <canvas class="photo-canvas"> </canvas>
            </div>
            
          </div>
          <div class="crop-tool clearfix">
            <a class="fl upload-again" @click="reupload" v-if='!dataFromUrl'>重新上传</a>
            <div class="fr">
              <div>
                <i
                  class="tomiconfont icon_zoomin_light"
                  @click="scaleAdd"
                  title="放大"
                ></i>
              </div>
              <div>
                <i
                  class="tomiconfont icon_zoomout_light"
                  @click="scaleReduce"
                  title="缩小"
                ></i>
              </div>
              <div>
                <i
                  class="tomiconfont icon_rotate"
                  @click="rotateImg"
                  title="旋转"
                ></i>
              </div>
              <div>
                 <i
                  class="tomiconfont icon_chexiao"
                  @click="resetImg"
                  title="撤销"
                ></i>
              </div>
            </div>
          </div>
          <div class="crop-btns" slot="footer">
            <el-button
              :disabled="!onceOnload"
              @click="getFile"
              type="primary"
              :loading="hasSaved"
              >保存</el-button
            >
            <el-button @click="$emit('onHide')">取消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/*
  //  图片裁剪插件调用方法
  <image-cropping  :dataWidth="640" :dataHeight="480" :dataShow="dataShow" 
  :limitSize='4096000' limitType='png,jpeg,bmp' :uploadUrl="uploadUrl" 
  @onHide='hideFn' @onError='imageCropError' @uploadSuccess="handleAvatarSuccess" 
  :isBoundCheck="isBoundCheck" :outXy="outxy"> </image-cropping>
  -----------------提供给外边传入的参数----------------------
  dataWidth:需要裁剪图片的宽度，
  dataHeight：需要裁剪图片的高度，
  dataShow:是否显示插件,
  limitSize:选择图片大小限制，
  limitType：支持的图片格式，
  uploadUrl：上传图片地址，
  isBoundCheck：是否需要检测图片边缘 （放大，缩小，旋转 ，拖拽）
  onHide：关闭裁剪插件时调用的方法，
  onError：图片加载失败 （图片不符合要求时给的提示语）
  uploadSuccess:图片上传成功回调,
  outxy:图片露底边的距离，outx：左右可露的距离，outy：上下可露的距离，默认不露底边
  dataBackground:图片背景默认白色
  dataRotate:是否要支持自由旋转（仅支持移动端）
  dataCircle:是否裁剪为圆
 */
import _$ from 'jquery'
import T from './index.js'
export default {
  props: {
    dataCircle:{
      default: false,
      type: Boolean
    },
    dataEnableRatio:{
      default: false,
      type: Boolean
    },
    dataRotate:{
      default: false,
      type: Boolean
    },
    dataBackground:{
      default: '#fff',
      type: String
    },
    dataTitle:{
      default: '图片上传裁剪',
      type: String
    },
    dataShow: {
      type: Boolean,
      default: false
    },
    dataWidth: {
      type: Number,
      default: 300
    },
    dataHeight: {
      type: Number,
      default: 300
    },
    dataImgSrc: {
      type: String,
      default: null
    },
    dataFromUrl: {
      type: Boolean,
      default: false
    },
    uploadUrl: {
      type: String,
      default: null
    },
    limitType: {
      type: String,
      default: 'png,jpeg,gif,bmp,webp'
    },
    limitSize: {
      type: Number,
      default: 8192000
    },
    isBoundCheck: {
      type: Boolean,
      default: false
    },
    outXy: {
      type: Object,
      default: () => {
        return {
          outx: 0,
          outy: 0
        }
      }
    },
    qualitySize: {
      type: Number,
      default:128
    }
  },
  data() {
    return {
      uploadPage: null,
      token: '',
      show: true,
      showDialog: false,
      customClass: 'cropping-dialog',
      isInit: false,
      showCropBody: false,
      inputFile: false,
      // lineX,
      isLoading: false,
      onceOnload: false,
      reduceDisabled: false,
      addDisabled: false,
      hasSaved: false,
      previewStyle: { x: 0, y: 0, scale: 1, rotate: 0, ratio: 1 },
      cropInstance: null,
      previewSrc: '',
      imgSrc: ''
      // imgErr: false
    }
  },
  // computed: {
  //   acceptType() {
  //     const limitTypeArr = this.limitType.split(',')
  //     console.log(limitTypeArr
  //       .map(item => {
  //         return 'image/' + item
  //       })
  //       .join(','))
  //     return limitTypeArr
  //       .map(item => {
  //         return 'image/' + item
  //       })
  //       .join(',')
  //   }
  // },
  watch: {
    dataImgSrc: function(nval,oval){
      setTimeout(()=>{
        this.isLoading = true
        this.imgSrc = nval
      },50)
    },
    dataShow: function(nval) {
      if (nval) {
        this.showDialog = true
        _$(this.$refs.uploadDialog.$el).addClass('hide-element')
        if (this.dataFromUrl) {
          this.initCropBody()
        } else {
          this.openChooseFile()
        }
        this.previewSrc = ''
        return
      } else {
        this.showCropBody = false
        this.hasSaved = false
        this.onceOnload = false
        this.showDialog = false
      }
    },
    showCropBody(nv) {
      if (nv) {
        _$(this.$refs.uploadDialog.$el).removeClass('hide-element')
        // this.customClass = 'cropping-dialog cropping-dialog-show'
      }
    }
  },
  methods: {
    resetImg(){},
    openChooseFile() {
      if (this.isInit) {
        this.clickChooseFile()
      } else {
        setTimeout(() => {
          this.clickChooseFile()
        }, 100)
      }
    },
    scaleAdd() {
      // 如果不是图片格式或者已经满足minscale直接退出
      if (!this.onceOnload || this.addDisabled) {
        return
      }
      this.photoCanvas.hammer('setScale', {
        souce: 'userClick',
        step: 0.1
      })
    },
    scaleReduce() {
      // 如果不是 图片格式  直接退出
      if (!this.onceOnload || this.reduceDisabled) {
        return
      }
      this.photoCanvas.hammer('setScale', {
        souce: 'userClick',
        step: -0.1
      })
    },
    rotateImg() {
      const self = this
      // 如果不是 图片格式  直接退出
      if (!self.onceOnload) {
        return
      }
      self.previewStyle.rotate += 90
      if (self.previewStyle.rotate >= 360) {
        self.previewStyle.rotate -= 360
      }
      self.photoCanvas.hammer('setRotate', self.previewStyle.rotate)
      self.boundCheckFn(self.previewStyle, true)
      self.cropInstance.setCropStyle(self.previewStyle)
      self.previewView.css(self.transform, 'rotate(' + self.previewStyle.rotate + 'deg) scale(' + (self.previewStyle.scale / self.previewStyle.ratio) + ')  translate3d(0,0,0)')
      self.preview.css(self.transform, 'translate3d(' + (self.previewStyle.x + self.previewStyle.offSetX) + 'px,' + (self.previewStyle.y + self.previewStyle.offSetY) + 'px,0)')
    },
    // 获取图片并关闭弹窗返回到表单界面
    getFile() {
      const self = this
      self.hasSaved = true
      var cropInfo
      self.cropInstance.setCropStyle(self.previewStyle)
      // 自定义getCropFile({type:"png",background:"red",lowDpi:true})
      cropInfo = self.cropInstance.getCropFile({ background: this.dataBackground })
      // console.log(self.previewStyle, cropInfo)
      // $previewResult.attr("src",cropInfo.src).show();

      self.$emit('onSuccess', { dfd: cropInfo.dfd, base64: cropInfo.src })
      // var img =new Image
      // img.src=cropInfo.src
      // document.body.appendChild(img)
      // 可选传base64或者file对象
      // cropInfo.src cropInfo.dfd
      if (!self.uploadUrl) {
        self.$emit('onHide')
      }
      self.uploadUrl &&
        cropInfo.dfd.done(function(blob) {
          if (blob) {
            var formData = new FormData()
            blob.name = 'imgFile.jpeg'
            // var file = new window.File([blob], blob.name, {type: blob.type})
            formData.append('file', blob, blob.name)
            formData.append('uploadType', 'imgFile')
            _$.ajax({
              url: self.uploadUrl,
              // url:'./upload.php',
              type: 'post',
              data: formData,
              processData: false,
              contentType: false,
              dataType: 'json',
              beforeSend: function(request) {
                request.setRequestHeader('AuthToken', self.token)
              },
              success: function(data) {
                self.$emit('uploadSuccess', {
                  res: data,
                  base64: cropInfo.src
                })
              },
              complete: function(data) {
                self.$emit('onHide')
              }
            })
          }
        })
    },
    clickChooseFile() {
      var $file = _$(this.$el)
        .find('input[type=file]')
        .click()
    },
    reupload: function() {
      this.openChooseFile()
    },
    stopScroll: function(e) {
      e.preventDefault()
    },
    resetUserOpts: function() {},
    initCropBody() {
      // debugger
      if (this.isInit) {
        return
      }
      this.isInit = true
      setTimeout(() => {
        _$(this.$refs.uploadDialog.$el).attr('dialogmask', 1)
        this.init()
      }, 50)
    },
    init: function() {
      let self = this
      let root = _$(this.$refs.uploadDialog.$el)
      let $ = (function($) {
        return function(selector) {
          return root.find(selector)
        }
      })(_$)
      let jQuery = _$

      // 初始化图片大小300*300
      var opts = {
          cropWidth: this.dataWidth,
          cropHeight: this.dataHeight,
          top: false,
          qualitySize: this.qualitySize
        },
        $file = jQuery(this.$refs.uploadPage).find('[type=file]'),
        transform = T.prefixStyle('transform'),
        transition = T.prefixStyle('transition'),
        transitionend = T.prefixEvent('transitionEnd'),
        $previewResult = $('#previewResult'),
        $previewBox = $('.preview-box'),
        $previewWrap = $('.preview-wrapper'),
        $rotateBtn = $('#rotateBtn'),
        $preview = $('#preview'),
        $uploadPage = jQuery(this.$refs.uploadPage),
        $mask = $('.upload-mask'),
        $loading = $('.upload-loading'),
        $eldialogwrapper = root,
        // maskCtx = $mask[0].getContext('2d'),
        $needCropImg = $('#needCropImg'),
        $previewView = $('.preview-view'),
        $photoCanvas = $('.photo-canvas'),
        $document= jQuery(document),
        myCropInfo,
        backX,
        backY,
        maxOffset = 40
      self.photoCanvas = $photoCanvas
      self.preview = $preview
      self.transform = transform
      self.previewView = $previewView
      self.document = $document
      self.eldialogwrapper = $eldialogwrapper
      $previewWrap.css({ width: opts.cropWidth, height: opts.cropHeight })
      self.mousemoveFn = function(e) {
        e.preventDefault()
      }
      self.mousedownFn = function() {
        if (self.previewSrc =='') {
          return
        }
        self.photoCanvas.addClass('handclose')
      }
      self.mouseupFn = function() {
        self.photoCanvas.removeClass('handclose')
      }
      self.photoCanvas.on('mousedown', self.mousedownFn)
      self.document.on('mouseup', self.mouseupFn)
      self.eldialogwrapper.on('mousemove mousedown', self.mousemoveFn)
      var bindFile = this.dataFromUrl ? $needCropImg[0] : $file
      // 这是插件调用主体
      var myCrop = T.cropImage({
        bindFile: bindFile, // 绑定Input file
        //            bindFile:$needCropImg[0],// 绑定一个图片
        
        enableRatio: self.dataEnableRatio, // 是否启用高清,高清得到的图片会比较大
        isCircle: self.dataCircle, // 是否裁剪为圆形
        canvas: $photoCanvas[0], // 放一个canvas对象
        cropWidth: opts.cropWidth, // 剪切大小
        cropHeight: opts.cropHeight,
        qualitySize: opts.qualitySize,
        background: 'white',
        bindPreview: $preview, // 绑定一个预览的img标签
        useHammer: true, // 是否使用hammer手势，否的话将不支持缩放
        quality: 0.7,
        type: 'jpeg',
        beforeCheck: function(file) {
          // size // type 'png,jpeg.bmp' image/png
          const sizeOver = file.size > self.limitSize
          const typeNoMatch =
            self.limitType.indexOf(file.type.replace(/image\//, '')) == -1
          const notImage = !file.type.match(/image\/*/)
          if (sizeOver || typeNoMatch || notImage) {
            self.$emit('onError', { sizeOver, typeNoMatch, notImage })
            if (!self.showCropBody) {
              self.$emit('onHide')
            }
            return false
          }
          return true
        },
        oninit: function() {},
        onChange: function(file) {
          if (!self.showCropBody) {
            resetUserOpts()
          }
          self.isLoading = true
          self.showCropBody = true
        },
        onError: function() {
          // 非图片格式或者图片格式有问题导致无法使用error传给外部
          self.$emit('onError', {
            sizeOver: false,
            typeNoMatch: false,
            notImage: true
          })
          if (!self.showCropBody) {
            self.$emit('onHide')
          }
          self.isLoading = false
        },
        onLoad: function(data) {
          self.onceOnload = true
          
          resetUserOpts()
          // 用户每次选择图片后执行回调
          self.previewStyle.ratio = data.ratio
          self.previewStyle.offSetX = data.x
          self.previewStyle.offSetY = data.y
          var xOffSet = 0,
            yOffset = 0
          if (opts.top == true) {
            yOffset = -data.y
            self.previewStyle.y = yOffset
          }
          $previewView
            .css({
              width: opts.cropWidth * data.ratio,
              height: opts.cropHeight * data.ratio
            })
            .css(transform, 'scale(' + 1 / self.previewStyle.ratio + ')')
          self.previewSrc = data.originSrc
          $preview
            .attr('src', data.originSrc)
            .css({ width: data.width, height: data.height })
            .css(transform, 'translate(' + data.x + 'px,' + (self.previewStyle.y + data.y) + 'px)')
          self.photoCanvas.hammer('setLastPos', {
            x: self.previewStyle.x,
            y: self.previewStyle.y
          })
          var snapStyle = Object.assign({},self.previewStyle)
          self.resetImg = function(){
            self.previewStyle = Object.assign({},snapStyle)
            $preview
            .css({ width: data.width, height: data.height })
            .css(transform, 'translate(' + data.x + 'px,' + (snapStyle.y + data.y) + 'px)')
            $previewView
            .css(transform, 'scale(' + 1 / snapStyle.ratio + ')')
            $photoCanvas.hammer('reset').hammer('setLastPos', {
              x: snapStyle.x,
              y: snapStyle.y
            })
          }
          myCrop.setCropStyle(self.previewStyle)
          myCropInfo = myCrop.getCropInfo()
          self.isLoading = false
        }
      })
      self.cropInstance = myCrop
      function resetUserOpts() {
        $photoCanvas.hammer('reset')
        self.previewStyle = {
          scale: 1,
          x: 0,
          y: 0,
          rotate: 0,
          ratio: self.previewStyle.ratio
        }
        $previewResult.attr('src', '').hide()
        $preview.attr('src', '')
      }
      this.resetUserOpts = resetUserOpts
      this.uploadPage = $uploadPage
      function boundCheck(G, fromScale) {
        // debugger
        if (!self.isBoundCheck) {
          return
        }
        if (self.previewSrc =='') {
          return
        }
        // console.log(G)
        var oldScale = G.scale
        // lx<0 myCropInfo.x*G.scale+G.x<0
        // rx>0 -myCropInfo.x*G.scale+G.x>0
        // ty -myCropInfo.y*G.scale-G.y>0
        // by myCropInfo.y*G.scale+G.y<0
        backX = backY = null
        var cwidth = opts.cropWidth - self.outXy.outx * 2
        var cheight = opts.cropHeight - self.outXy.outy * 2
        if (G.rotate % 180 != 0) {
          cwidth = [cheight, (cheight = cwidth)][0]
        }
        // G.rotate=0;//不旋转了
        var dWidth = myCropInfo.dWidth
        var dHeight = myCropInfo.dHeight
        var sx =
          (((dWidth / G.ratio) * G.scale - cwidth) / 2) * G.ratio
        var sy =
          (((dHeight / G.ratio) * G.scale - cheight) / 2) * G.ratio
        // 用户点击放大缩小到边缘时需要计算scale
        var scale = G.scale
        if (fromScale) {
          // 到达最大边缘则在最大基础上再扩展maxOffset距离,后面动画弹回
          if (-sy + G.y * scale > 0) {
            // console.log('scale to top y')
            scale = Math.max(
              scale,
              (cheight * G.ratio) / 2 / (dHeight / 2 - G.y)
            )
          }
          if (sy + G.y * scale < 0) {
            // console.log('scale to bottom y')
            scale = Math.max(
              scale,
              (cheight * G.ratio) / 2 / (dHeight / 2 + G.y)
            )
          }
          if (-sx + G.x * scale > 0) {
            // console.log('scale to left x')
            scale = Math.max(
              scale,
              (cwidth * G.ratio) / 2 / (dWidth / 2 - G.x)
            )
          }
          if (sx + G.x * scale < 0) {
            // console.log('scale to right x')
            scale = Math.max(
              scale,
              (cwidth * G.ratio) / 2 / (dWidth / 2 + G.x)
            )
          }
          G.scale = scale
        } else {
          // 到达最大边缘则在最大基础上再扩展maxOffset距离,后面动画弹回
          if (-sy + G.y * scale > 0) {
            // console.log('to top y')
            // G.y = sy / scale
            backY = sy / scale
            if (-sy + G.y * scale > maxOffset) {
              G.y = (sy + maxOffset) / scale
            }
          }
          if (sy + G.y * scale < 0) {
            // console.log('to bottom y')
            // G.y = -sy / scale
            backY = -sy / scale
            if (sy + G.y * scale < -maxOffset) {
              G.y = (-sy - maxOffset) / scale
            }
          }
          if (-sx + G.x * scale > 0) {
            // console.log('to left x')
            // G.x = sx / scale
            backX = sx / scale
            if (-sx + G.x * scale > maxOffset) {
              G.x = (sx + maxOffset) / scale
            }
          }
          if (sx + G.x * scale < 0) {
            // G.x = -sx / scale
            // console.log('to right x')
            backX = -sx / scale
            if (sx + G.x * scale < -maxOffset) {
              G.x = (-sx - maxOffset) / scale
            }
          }
        }
        if (oldScale != G.scale) {
          $photoCanvas.hammer('setScale', {
            source: 'boundFix',
            scale: G.scale
          })
        }
      }
      self.boundCheckFn = boundCheck
      $photoCanvas.hammer({
        minScale: self.dataRotate?0.5:1,
        minscaleDisabled: false,
        maxScale: 3,
        enableRatio: self.dataEnableRatio,
        enableRotate:self.dataRotate,
        enableMouseWheel: true,
        element: $photoCanvas[0],
        checkScale: function(scale) {
          // self.reduceDisabled = scale <= 1 ? true : false
          // self.addDisabled = scale >= 8 ? true : false
          // if (scale >= 8) {
          //   self.addDisabled = true
          // }
          // console.log('scale change---',scale)
        },
        dragendCb: function() {
          var transformStr = $preview.css(transform).replace(/\s/g, '')
          // 获取matrix矩阵后两位 x y替换掉
          if (transformStr.indexOf('3d') > -1) {
            var transformArr
            transformArr = transformStr.split(',')
            transformArr[12] = backX != null ? backX : transformArr[12]
            transformArr[13] = backY != null ? backY : transformArr[13]
            transformStr = transformArr.join(',')
          } else {
            // 获取matrix矩阵后两位 x y替换掉
            transformStr = transformStr.replace(
              /((-?\d+)?(\.\d+)?),((-?\d+)?(\.\d+)?)\)$/,
              (backX != null ? backX : '$1') +
                ',' +
                (backY != null ? backY : '$4') +
                ')'
            )
          }
          if (backX != null) {
            self.previewStyle.x = backX
          }
          if (backY != null) {
            self.previewStyle.y = backY
          }
          $('.photo-canvas').hammer('setLastPos', {
            x: self.previewStyle.x,
            y: self.previewStyle.y
          })
          $preview.one(transitionend, function() {
            $preview.css('transition', '')
          })
          $preview.css({
            transition: 'all 0.2s',
            transform:
              'translate3d(' +
              (self.previewStyle.x + self.previewStyle.offSetX) +
              'px,' +
              (self.previewStyle.y + self.previewStyle.offSetY) +
              'px,0)'
          })
          $previewView.css({
            transform:
              'rotate(' +
              self.previewStyle.rotate +
              'deg) scale(' +
              self.previewStyle.scale / self.previewStyle.ratio +
              ') translate3d(0,0,0)'
          })
        },
        gestureCb: function(o, fromScale) {
          // 每次缩放拖拽的回调
          var G = Object.assign({}, o, {
            ratio: self.previewStyle.ratio,
            offSetY: self.previewStyle.offSetY,
            offSetX: self.previewStyle.offSetX
          })
          boundCheck(G, fromScale)
          self.previewStyle.scale = G.scale
          $preview.css(
            transform,
            'translate3d(' +
              (G.x + G.offSetX) +
              'px,' +
              (G.y + G.offSetY) +
              'px,0)'
          )
          $previewView.css(
            transform,
            'rotate(' + G.rotate + 'deg) scale(' + G.scale / G.ratio + ') translate3d(0,0,0)'
          )
          Object.assign(self.previewStyle, G)
        }
      })
    }
  },
  beforeDestroy() {
    if (this.photoCanvas) {
      this.photoCanvas.hammer('destroy')
      this.photoCanvas.off('mousedown', this.mousedownFn)
    }
    this.document && this.document.off('mouseup', this.mouseupFn)
    this.eldialogwrapper && this.eldialogwrapper.off('mousemove mousedown', this.mousemoveFn)
  },
  mounted() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.clearfix:after {
    content: ' ';
    visibility: hidden;
    display: block;
    font-size: 0;
    clear: both;
    height: 0
}
.fr{
 float: right;
}
.fl{
  float: left;
}
@font-face {
  font-family: 'tomiconfont';  /* project id 1797026 */
  src: url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.eot');
  src: url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.eot?#iefix') format('embedded-opentype'),
  url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.woff2') format('woff2'),
  url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.woff') format('woff'),
  url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.ttf') format('truetype'),
  url('//at.alicdn.com/t/font_1797026_u8wcbrbphs8.svg#tomiconfont') format('svg');
}
.tomiconfont {
  font-family: "tomiconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.icon_zoomout_light:before {
  content: "\e616";
}

.icon_rotate:before {
  content: "\e615";
}

.icon_zoomin_light:before {
  content: "\e617";
}
.icon_chexiao:before {
  content: "\e618";
}


.hide-element {
  display: none !important;
}
.el-dialog__wrapper[dialogmask='1']:before {
  content: '';
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1998;
  background-color: rgba(0, 0, 0, 0.5);
}
.cropping-dialog {
  // display: none!important;
  animation: none !important;
  user-select: none;
  z-index: 1998;
  // &.cropping-dialog-show{
  //   display: inline-block!important;
  //   z-index: 1998;
  // }
  .preview-wrapper{
    border: 4px solid #0094f5;
    box-sizing: content-box;
  }
  &.circleModel .preview-wrapper{
    border-radius: 50%;
    overflow: hidden;
  }
  .upload-main {
    position: relative;

    .photo-canvas {
      position: absolute;
      left: 0px;
      top: 0px;
      touch-action: none;
      -ms-touch-action:none;
      z-index: 3;
    }
    .photo-canvas:hover{
      cursor: url(https://webapi.amap.com/theme/v1.3/openhand.cur),default;
    }
    .photo-canvas.handclose:hover{
      cursor: url(https://webapi.amap.com/theme/v1.3/closedhand.cur),default;
    }
    .preview-wrapper{
      position: relative;
      margin:0 auto;
    }
    // .preview-wrapper:before {
    //   content: '';
    //   position: absolute;
    //   left: -4px;
    //   right: -4px;
    //   top: -4px;
    //   bottom: -4px;
    //   border: 4px solid rgb(0, 148, 245);
    //   border-radius: 4px;
    //   background: white;
    // }
    #preview {
      display: block;
      background: white;
      z-index: 1;
    }
    .upload-loading {
      display: none;
      background: rgba(0, 0, 0, 0.2);
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      color: greenyellow;
      z-index: 3;
    }
    .preview-box {
      position: absolute;
      top: 50%;
      left: 50%;
      -webkit-transform: translate3d(-50%, -50%, 0);
      transform: translate3d(-50%, -50%, 0);
    }
    .upload-mask {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 3;
      // div {
      //   height: 2px;
      //   width: 100%;
      //   background-image: url(../../assets/security_images/line-x.png);
      //   background-repeat: repeat-x;
      // }
      // .crop_liney {
      //   width: 2px;
      //   height: 100%;
      //   left: 0px;
      //   top: 1px;
      //   background-image: url(../../assets/security_images/line-y.png);
      //   background-repeat: repeat-y;
      // }
      .crop_line_x1 {
        position: absolute;
        top: 33%;
      }
      .crop_line_x2 {
        position: absolute;
        top: 66%;
      }
      .crop_line_y1 {
        position: absolute;
        left: 33%;
      }
      .crop_line_y2 {
        position: absolute;
        left: 66%;
      }
    }
    .preview-wrapper {
      .inner {
        overflow: hidden;
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 2;
      }
    }
    .upload-loading {
      display: none;
      background: rgba(0, 0, 0, 0.2);
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      color: greenyellow;
      z-index: 3;
    }
    .upload-file {
      opacity: 0;
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    #previewResult {
      background: #fff;
      max-width: 260px;
      border: 1px solid black;
    }
  }
  .crop-tool {
    margin: 12px 0px 12px -4px;
    .upload-again {
      font-size: 14px;
      line-height: 30px;
      color: #1374f2;
    }
    .fr {
      i {
        color: #93969d;
        font-size: 30px;
        line-height: 30px;
      }
      div {
        width: 30px;
        cursor: pointer;
        height: 30px;
        float: left;
        margin-right: 8px;
        text-align: center;
      }
      div:hover {
        background: #d0e7fd;
      }
      i:hover {
        color: #1374f2;
      }
      img {
        display: inline !important;
      }
    }
  }
  .el-loading-mask {
    border: none !important;
  }
  .crop-btns {
    text-align: center;
  }
  .isOpacity {
    opacity: 0;
  }
  .el-dialog__body {
    padding: 20px 20px 7px 20px;
  }
}
</style>
