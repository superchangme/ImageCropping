/**
 * Created by tom.chang on 2015/4/28.
 */

var $ = require('jquery')
import Hammer from './hammer.min'
require('./myHammer')
var _ = {}
// browser support feature obj
_.support = {}
// css3 event
_.prefixEvent = function(t) {
  if (t) {
    var e = document.createElement('div'), n = { t: '', msT: 'MS', webkitT: 'webkit', mozT: 'moz', oT: 'o' }
    for (var i in n) {
      if (void 0 != e.style[i + 'ransitionProperty']) {
        if (i == 't') {
          return (t).toLowerCase()
        } else {
          return n[i] + String.fromCharCode(t[0].charCodeAt() - 32) + t.slice(1)
        }
      }
    }
  }
}

// css3 style浏览器兼容
_.prefixStyle = function(style) {
  return Hammer.prefixed(document.body.style, style)
}
var URL = window.URL && window.URL.createObjectURL ? window.URL
  : window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL
    : null
_.cropImage = function(opts) {
  var hastouch = 'ontouchstart' in window,
    tapstart = 'touchstart mousedown',
    tapmove = 'touchmove mousemove',
    tapend = 'touchend mouseup'
  opts = $.extend({
    enableRatio: true,
    cropWidth: 260,
    cropHeight: 260,
    container: document.body,
    canvas: document.createElement('canvas'),
    success: function(o) {
      // o.originSrc o.cropSrc
    },
    onChange: function(o) {
      // o.cropSrc
    },
    onLoad: function(o) {
      // o.originSrc
    }
  }, opts)
  opts.devicePixelRatio = opts.enableRatio ? (opts.devicePixelRatio || window.devicePixelRatio) : 1
  var IMG_FILE, G = { preview: null, moveX: 0, moveY: 0, scale: 1, rotate: 0, ratio: opts.devicePixelRatio }, transform = _.prefixStyle('transform'),
    canvas = opts.canvas, ctx = canvas.getContext('2d'), _x, _y, _scale, offset = $(canvas).offset(), $bindPreview = opts.bindPreview || $('<img/>'), canMove
  $(canvas).prop({ width: opts.cropWidth * opts.devicePixelRatio, height: opts.cropHeight * opts.devicePixelRatio }).css({
    width: opts.cropWidth, height: opts.cropHeight, opacity: 0
  })
  if (opts.bindFile) {
    if (typeof opts.bindFile === 'string') {
      opts.onChange()
      imgFileCb(opts.bindFile)
    } else if (opts.bindFile instanceof HTMLImageElement) {
      opts.bindFile.addEventListener('load', function() {
        opts.onChange()
        imgFileCb(this)
      })
    } else if (opts.bindFile instanceof Image) {
      opts.bindFile.addEventListener('load', function() {
        opts.onChange()
        imgFileCb(this)
      })
    } else if ($(opts.bindFile).is('input[type=file]')) {
      opts.bindFile.attr('cropid', ++_.cropImage.id)
      setCropStyle({ x: 0, y: 0, scale: 1 })
      $(document).on( 'change','[cropid=' + _.cropImage.id + ']', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        opts.bindFile.after(opts.bindFile = opts.bindFile.clone().val('')).remove()
        if (this.files && this.files.length) {
          if (opts.beforeCheck && !opts.beforeCheck(this.files[0])) {
            return
          }
          opts.onChange(this.files)
          // $bindPreview.prop("src",'');
          var temp, mega, preview = this.files[0], img = new Image()
          IMG_FILE = preview
          img.onerror = function(err) {
            opts.onError && opts.onError()
          }
          img.onload = function() {
            URL.revokeObjectURL(preview)
            imgFileCb(img)
          }
          setTimeout(function() {
            img.src = URL.createObjectURL(preview)
          }, 0)
        }
      })
    } else {
      G.preview = opts.bindFile
      getCropFile()
    }
  }
  function imgFileCb(imgOrSrc, noCache) {
    if (typeof imgOrSrc === 'string') {
      var img = new Image()
      img.onload = function() {
        runLoad()
      }
      img.src = imgOrSrc
      imgOrSrc = img
    } else {
      runLoad()
    }
    function runLoad() {
      G.preview = imgOrSrc
      var o = getCropInfo()
      $bindPreview.prop('style', '')
      opts.onLoad({
        originSrc: imgOrSrc.src, width: o.dWidth, height: o.dHeight, ratio: G.ratio,
        x: o.x, y: o.y, dWidth: o.dWidth, dHeight: o.dHeight, scale: o.scale })
    }
    // alert(+new Date-start)
  }
  function getCropInfo() {
    var iWidth = G.preview.naturalWidth, iHeight = G.preview.naturalHeight,
      dWidth, dHeight, x = 0, y = 0, scale
    var oWidth = opts.cropWidth * opts.devicePixelRatio
    var oHeight = opts.cropHeight * opts.devicePixelRatio
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if ((oWidth / oHeight) < (iWidth / iHeight)) {
      // console.log('填高')
      scale = oHeight / iHeight
      dHeight = oHeight
      dWidth = iWidth * scale
      x = -(iWidth * scale - oWidth) / 2
    } else {
      // console.log('填宽')
      scale = oWidth / iWidth
      dWidth = oWidth
      dHeight = iHeight * scale
      y = -(iHeight * scale - oHeight) / 2
    }
    return { x: x, y: y, dWidth: dWidth, dHeight: dHeight, scale: scale, iWidth: iWidth, iHeight: iHeight }
  }
  function getCropFile(option) {
    // console.log(option)
    // G.y*=opts.devicePixelRatio;
    // G.x*=opts.devicePixelRatio;
    var coordRad = Math.atan2(-G.y, G.x)
    // console.log(coordRad)
    var radius = Math.sqrt(G.y * G.y + G.x * G.x)
    var o = getCropInfo(),
      offsetX = Math.sin(Math.PI / 2 - coordRad - Math.PI * (G.rotate) / 180) * radius,
      offsetY = -Math.cos(Math.PI / 2 - coordRad - Math.PI * (G.rotate) / 180) * radius,
      x = -o.dWidth / 2 * G.scale + offsetX * opts.devicePixelRatio * 0 + 0,
      y = -o.dHeight / 2 * G.scale + offsetY * opts.devicePixelRatio * 0 + 0, result
    option = option || {}
    if (option.lowDpi && opts.enableRatio) {
      o.dHeight /= opts.devicePixelRatio
      o.dWidth /= opts.devicePixelRatio
      canvas.width /= opts.devicePixelRatio
      canvas.height /= opts.devicePixelRatio
    }
    ctx.save()
    if (option.background) {
      ctx.fillStyle = option.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI * G.rotate / 180)
    // if(G.rotate==90){
    //     x=-o.dWidth/2*G.scale+ G.y;
    //     y=-o.dHeight/2*G.scale- G.x;
    // }else if(G.rotate==180){
    //     x=-o.dWidth/2*G.scale-G.x;
    //     y=-o.dHeight/2*G.scale-G.y;
    // }else if(G.rotate==270){
    //     x=-o.dWidth/2*G.scale-G.y;
    //     y=-o.dHeight/2*G.scale+G.x;
    // }
    // console.log(G.preview,-o.dWidth/2*G.scale+ G.x,-o.dHeight/2*G.scale+ G.y, o.dWidth* G.scale, o.dHeight* G.scale)
    ctx.drawImage(G.preview, x + G.x * G.scale, y + G.y * G.scale, o.dWidth * G.scale, o.dHeight * G.scale)
    //, 0,0,G.preview.width*G.scale, G.preview.height*G.scale);//,0,0, G.preview.width*G.scale, G.preview.height*G.scale);
    ctx.restore()
    // console.log(offsetX, offsetY, x, y, o.dWidth, o.dHeight)
    if (opts.isCircle) {
      ctx.save()
      ctx.globalCompositeOperation="destination-in";
      ctx.arc(canvas.width/2,canvas.height/2,canvas.width/2,0,Math.PI*2)
      ctx.fill()
      ctx.restore()
    }
    result = canvas.toDataURL('image/' + (option.type ? option.type : opts.isCircle?'png':'jpeg'))

    if (option.lowDpi && opts.enableRatio) {
      canvas.width *= opts.devicePixelRatio
      canvas.height *= opts.devicePixelRatio
    }
    // 返回Blob文件
    var quality = null
    var step = 0.02
    function runToBlob() {
      canvas.toBlob(
        function(blob) {
          // Store the created blob at the position
          // of the original file in the files list:
          if (blob.size > opts.qualitySize * 1024) {
            quality = quality ? quality - step : 0.91
            runToBlob()
          } else {
            dfd.resolve(blob)
          }
        }
        , 'image/' + (option.type ? option.type : opts.isCircle?'png':'jpeg'), quality)
    }
    var that = this,
      dfd = $.Deferred()
    if (canvas.toBlob) {
      runToBlob()
    } else {
      dfd.resolve()
    }
    return { src: result, dfd: dfd.promise(), file: IMG_FILE, oWidth: o.iWidth, oHeight: o.iHeight, x: x, y: y, dWidth: o.dWidth, dHeight: o.dHeight }
  }
  if (!opts.useHammer) {
    $(document).on(tapend, function(e) {
      canMove = false
    })
    $(canvas).on(tapstart, function(e) {
      canMove = true
      e = e.originalEvent
      offset = $(canvas).offset()
      var left = hastouch ? e.targetTouches[0].clientX - offset.left : e.clientX - offset.left
      var top = hastouch ? e.targetTouches[0].clientY - offset.top : e.clientY - offset.top
      _x = left
      _y = top
    })
    $(canvas).on(tapmove, function(e) {
      if (!canMove) {
        return
      }
      e = e.originalEvent
      var left = hastouch ? e.targetTouches[0].clientX - offset.left : e.clientX - offset.left
      var top = hastouch ? e.targetTouches[0].clientY - offset.top : e.clientY - offset.top
      G.moveX += left - _x
      G.moveY += top - _y
      $bindPreview.css(transform, 'translate3d(' + G.moveX + 'px,' + G.moveY + 'px,0)')
      _x = left
      _y = top
    })
  }
  function setCropStyle(o) {
    $.extend(G, o)
  }
  return { getCropFile: getCropFile, getCropInfo: getCropInfo, setCropStyle: setCropStyle }
}
_.cropImage.id = 0
export default _

