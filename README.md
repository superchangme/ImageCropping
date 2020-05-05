# 图片裁剪

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 使用方法说明

基于[vue2](https://github.com/vuejs/vue)集上传图片和图片裁剪的插件，使用了[element-ui](https://github.com/ElemeFE/element/issues)的el-dialog。
the image crop plugin is based on vue,and use element-ui's el-dialog.
复制src/components/ImageCropping整个文件夹到你的项目即可使用


### 基本调用方式

1. 上传图片并裁剪 (upload image and crop) -参考文件src/Main.vue
```javascript
 <ImageCrop :isBoundCheck='true' :dataShow='dataShow' @onHide='dataShow=0' @onSuccess='onSuccess'></ImageCrop>
```
2. 裁剪已有图片 (crop your image) -参考文件src/Image.vue
```javascript
    <ImageCrop :isBoundCheck='true' :dataShow='dataShow' dataTitle='裁剪照片'
    :dataFromUrl='true' :dataImgSrc='cropImage' 
    @onHide='dataShow=0' @onSuccess='onSuccess'></ImageCrop>
```

3. 更多参数说明
```javascript
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
  uploadUrl：上传图片地址， --- 内置ajax上传图片 如参数不满足建议直接修改
  isBoundCheck：是否需要检测图片边缘 （放大，缩小，旋转 ，拖拽）
  onHide：关闭裁剪插件时调用的方法，
  onError：图片加载失败 （图片不符合要求时给的提示语）
  uploadSuccess:图片上传成功回调,
  outxy:图片露底边的距离，outx：左右可露的距离，outy：上下可露的距离，默认不露底边
  dataBackground:图片背景默认白色
  dataRotate:是否要支持自由旋转（仅支持移动端）
  dataEnableRatio:是否需要高清图片（启用后可适配设备的deviceRatio得到高清图）
```

4. 一些说明
 组件更适合移动端使用
 组件使用了element-ui的el-dialog作为弹窗，如果您的框架没有使用它，可以自己改造el-dialog或自己实现弹窗。
 组件使用了中心缩放算法，体验更佳。
 组件使用了几个icon用了iconfont，建议自己重新设计图表使用本地的。

5. 感谢
手势使用了hammerjs库，特别感谢[hammerjs](https://github.com/hammerjs/hammerjs.github.io)

6. 演示地址
[gh-pages](https://superchangme.github.io/ImageCropping/)

