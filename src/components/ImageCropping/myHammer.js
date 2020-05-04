var $ = require('jquery')
import Hammer from './hammer.min'
$.fn.hammer = Plugin
$.fn.hammer.Constructor = Myhammer
$.fn.hammer.noConflict = function() {
  $.fn.hammer = old
  return this
}
var old = $.fn.hammer
function Plugin(opt, params) {
  return this.each(function() {
    var $this = $(this)
    // if($this.is("canvas")){
    var data = $this.data('tom.hammer')
    var opts = $.extend({}, Myhammer.DEFAULTS, $this.data(), typeof opt === 'object' && opt)
    if (!data) $this.data('tom.hammer', (data = new Myhammer(this, opts)))
    // 2016-01-08 update fix opts to opt
    if (typeof opt === 'string') data[opt](params)
    /*  }else{
       console.log("need a  canvas element")
       }*/
  })
}
Myhammer.DEFAULTS = {
  transform_always_block: true,
  transform_min_scale: 1,
  drag_block_horizontal: true,
  drag_block_vertical: true,
  drag_min_distance: 0,
  gestureCb: function() {
    console.log('手势回调')
  }
}

function Myhammer(canvas, opts) {
  this.rotation = 0
  this.lastPosX = 0
  this.lastPosY = 0
  this.option = opts
  this.scale = 1
  this.hammertime = ''
  this.hammerFn = hammerFn
  var posX = 0, posY = 0,
    bufferX = 0, bufferY = 0,
    last_scale = 1, last_rotation, dragReady = 0, self = this
  var mc = new Hammer(canvas, opts)
  var hammertime = mc
  mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }))
  // mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'))
  // mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'))
  // mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')])
  hammertime.on('panstart panmove panend', hammerFn)
  this.hammertime = hammertime
  function hammerFn(ev) {
    if (!self.isStop) {
      manageMultitouch(ev)
    }
  }
  if (opts.enableMouseWheel) {
    self.setScaleBind = self.setScale.bind(self)
    opts.element.addEventListener('mousewheel', self.setScaleBind, { passive: false })
  }
  function manageMultitouch(ev) {
    switch (ev.type) {
      case 'panstart':
        last_scale = self.scale
        last_rotation = self.rotation
        break
      case 'panmove':
        var x = ev.deltaX / self.scale
        var y = ev.deltaY / self.scale
        if (self.rotation % 180 != 0) {
          x = [y, (y = x)][0]
        }
        if (self.rotation == 90 || self.rotation == 180) {
          y = -y
        }
        if (self.rotation == 180 || self.rotation == 270) {
          x = -x
        }
        posX = x + self.lastPosX
        posY = y + self.lastPosY
        opts.gestureCb.call(self, { x: posX, y: posY, scale: last_scale, rotate: last_rotation })
        break
      case 'rotatemove':
        self.rotation = last_rotation + ev.rotation
        // self.rotation = last_rotation ;
        self.scale = Math.max(opts.minScale || 0, Math.min(last_scale * ev.scale, 10))
        opts.gestureCb.call(self, { x: self.lastPosX, y: self.lastPosY, scale: self.scale, rotate: self.rotation })
        break
      case 'panend':
        self.lastPosX = posX
        self.lastPosY = posY
        if (opts.dragendCb) {
          opts.dragendCb.call(self)
        }
        break
    }
  }
  this.reset = function() {
    posX = 0; posY = 0
    this.lastPosX = 0; this.lastPosY = 0
    bufferX = 0; bufferY = 0
    this.scale = 1; last_scale = 1; this.rotation = 0; last_rotation = 0
  }
}
Myhammer.prototype.stop = function() {
  this.isStop = true
}
Myhammer.prototype.start = function() {
  this.isStop = false
}
Myhammer.prototype.setRotate = function(rotation) {
  this.rotation = rotation
}
Myhammer.prototype.setLastPos = function(pos) {
  this.lastPosX = pos.x
  this.lastPosY = pos.y
}
Myhammer.prototype.setScale = function(option) {
  var self = this
  var e = option
  var opts = self.option
  var step = 0.1
  if (option.source == 'boundFix') {
    self.scale = option.scale
  } else {
    if (option.souce != 'userClick') {
      if (self.isStop) { return }
      e.preventDefault()
      if (e.wheelDelta < 0) {
        step *= -1
      }
    } else {
      step = option.step
    }
    self.scale += step
  }
  if (self.scale < opts.minScale) {
    opts.minscaleDisabled = true
  }
  self.scale = Math.max(opts.minScale || 0, Math.min(self.scale, opts.maxScale || 10))
  if (option.source != 'boundFix') {
    opts.gestureCb.call(self, { x: self.lastPosX, y: self.lastPosY, scale: self.scale, rotate: self.rotation }, option.souce != 'boundFix')
  }
  opts.checkScale(self.scale)
}

Myhammer.prototype.destroy = function() {
  this.hammertime.off('panstart panmove panend', this.hammerFn)
  this.option.element.removeEventListener('mousewheel', this.setScaleBind, { passive: false })
}

export default Myhammer
