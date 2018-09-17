<template>
  <div ref="stripContainer"
       class="happy-scroll-strip"
       :style="[initLocation]"
       :class="[horizontal ? 'happy-scroll-strip--horizontal' : 'happy-scroll-strip--vertical']"
       @wheel.capture.stop="handlerWheel">

    <div ref="strip"
      class="happy-scroll-bar"
      :style="[translate, {[config.sizeAttr]: length + 'px'}, initSize, {background: color}, {opacity: isOpacity}]"
      @mousedown.stop="handlerMouseDown">
    </div>
  </div>
</template>
<script>
import { on, off, generateThrottle } from './util'
export default {
  name: 'happy-scroll-strip',
  props: {
    // 是否作为横向
    horizontal: Boolean,
    // 使竖向滚动条在居左
    left: Boolean,
    // 使横向滚动条居右
    top: Boolean,
    move: {
      type: Number,
      default: 0
    },
    // 滚动条的宽(对于横向时为高度)
    size: {
      type: [Number, String],
      default: 4
    },
    // 竖向的 滚动条的最小长度，当滚动条长度随元素比例缩小到一定程度时不再缩小。
    minLengthV: {
      type: Number,
      default: 40
    },
    // 横向的 滚动条的最小长度，当滚动条长度随元素比例缩小到一定程度时不再缩小。
    minLengthH: {
      type: Number,
      default: 40
    },
    // 滚动条的背景色
    color: {
      type: String,
      default: 'rgba(51,51,51,0.2)'
    },
    // 鼠标移动的节流函数时间, 表示该时间内鼠标移动的回调保障在该时间内只执行一次
    throttle: {
      type: Number,
      default: 14 // 默认14毫秒
    }
  },
  data () {
    return {
      config: {},
      // 标记鼠标按下后开始移动的状态. 鼠标按下为true 抬起为 false
      startMove: false,
      // 为document绑定事件, 此状态值为了避免重复绑定
      binded: false,
      // 滚动条的宽或者高
      length: 0,
      // 滚动条空白区域 与 (用户内容元素的高度 - 视图区域的高度) 的比例
      percentage: 0,
      // 滚动条最大的偏移量。这个值等于滚动条容器 减去 滚动条 的空白区域
      maxOffset: 0,
      // 记录当前的偏移量，用于触发 滚动到头部和尾部的事件
      currentOffset: 0,
      // 鼠标移动的节流函数
      moveThrottle: generateThrottle(this.throttle)
    }
  },
  watch: {
    currentOffset (newVal) {
      if (newVal === 0) {
        // 触发事件
        this.emitLocationEvent('start', 0)
      } else if (newVal === this.maxOffset) {
        this.emitLocationEvent('end', newVal / this.percentage)
      }
    }
  },
  computed: {
    // 初始化滚动条的大小 (横向时为高度，竖向时为宽度)
    initSize () {
      return {
        [this.horizontal ? 'height' : 'width']: this.size + 'px'
      }
    },
    // 当 percentage 大于等于 1 时，说明不需要显示滚动条
    isOpacity () {
      return this.percentage < 1 ? 1 : 0
    },
    /**
     * 变化滚动条的位置，scroll主体内容，滚动时，滚动条跟着联动
     */
    translate () {
      let offset = this.move * this.percentage

      if (!this.$refs.stripContainer) return

      if (offset < 0) {
        offset = 0
      }
      if (offset > this.maxOffset) {
        offset = this.maxOffset
      }
      this.currentOffset = offset
      return {
        transform: `${this.config.translate}(${offset}px)`
      }
    },
    // 初始化滚动条位置
    initLocation () {
      if (this.horizontal) {
        return this.top ? { top: 0, bottom: 'auto' } : ''
      }
      return this.left ? { left: 0, right: 'auto' } : ''
    }
  },
  methods: {
    // 触发滚动条滚动到顶部或底部的事件
    emitLocationEvent (type, outsideOffset) {
      const direction = this.horizontal ? 'horizontal' : 'vertical'
      this.$emit(`${direction}-${type}`, outsideOffset)
    },
    /**
     * scrollSize 如果是竖向滚动条，则为 用户内容元素的 scrollHeight, 横向的则作为 用户内容元素的 scrollWidth
     * clientSize 可视区域的 clientHeight clientWidth. 横竖的原理同scrollSize
     */
    computeStrip (scrollSize, clientSize) {
      // const container = this.$refs.stripContainer // 滚动条的容器
      const currentSize = this.$refs.stripContainer[this.config.client]
      /**
       * 滚动条长度。
       *
       * clientSize / scrollSize 是表示视图范围与用户内容元素的比例
       * 用此比例来决定 滚动条的长度 滚动条容器 * 比例 = 滚动条长度
       * 但是当用户内容元素无限大的时候，可能会导致滚动条无限小，所以会设置最小长度
       */
      this.length = currentSize * (clientSize / scrollSize)
      let minLength = this.horizontal ? this.minLengthH : this.minLengthV
      if (minLength < 1) {
        // 按百分比处理
        minLength = currentSize * minLength
      }
      // 判断是否滚动条长度是否已经小于了设置的最小长度
      this.length = this.length < minLength ? minLength : this.length
      // 滚动条容器 - 滚动条长度 = 剩余的空间
      const space = this.maxOffset = currentSize - this.length
      /**
       * 这里计算一个比例
       * 已高度举例子:
       * 使用 剩余空间 除以 (用户内容元素的高度 - 视图区域的高度)
       * 可以把 视图区域的高度 比作 滚动条的长度 用户内容元素的高度 比作 滚动条容器的高度
       * 所以使用两者剩余空间的比例，来计算 当滚动条滑动1px的时候 用户内容元素应该滑动多少 px，当用户内容元素移动时 来计算 滚动条应该移动多少px
       */
      this.percentage = space / (scrollSize - clientSize)
    },
    bindEvents () {
      // 已绑定过了 不再重复绑定
      if (this.binded) return
      on(document, 'mouseup', this.handlerMouseUp)
      on(document, 'mousemove', this.handlerMove)
      this.binded = true
    },
    // 鼠标按下事件
    handlerMouseDown (event) {
      // 只有鼠标左键可以拖动
      if (event.button !== 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      // 标记开始拖拽滚动条
      this.startMove = true
      // 记录鼠标起始的位置
      this.axis = event[this.config.clientAxis]

      // 给document绑定 mouseup与mousemove
      this.bindEvents()

      return false
    },
    handlerMouseUp () {
      // 鼠标抬起, 结束拖拽状态
      this.startMove = false
    },
    handlerMove (event) {
      // 如果不是在鼠标按下的状态 || 节流控制，在指定时间内只执行一次
      if (!this.startMove || !this.moveThrottle(Date.now())) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const parentRect = this.$refs.stripContainer.getBoundingClientRect()
      const rect = this.$refs.strip.getBoundingClientRect()
      // 相对于滚动条容器的offset
      const contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction]
      /**
       * offset = 鼠标移动的偏移量 + 滚动条当前的偏移量
       * offset为滚动条需要移动到的位置
       * event[this.config.clientAxis] - this.axis = 鼠标移动后与移动前的偏移量
       */
      const offset = event[this.config.clientAxis] - this.axis + contrastParentOffset
      // 更新鼠标偏移量的值
      this.axis = event[this.config.clientAxis]

      this.changeOffset(offset)
    },
    // 鼠标滚轮滚动事件
    handlerWheel (event) {
      const parentRect = this.$refs.stripContainer.getBoundingClientRect()
      const rect = this.$refs.strip.getBoundingClientRect()
      // 滚动条相对于容器的offset
      const contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction]
      // 滚动条最终要设置的偏移量    event[this.config.wheelDelta] => 获取鼠标滚轮的滚动值
      const offset = contrastParentOffset + event[this.config.wheelDelta]

      this.changeOffset(offset, event)
    },
    changeOffset (offset, event) {
      // 防止滚动条越界
      if (offset < 0) {
        offset = 0
      }

      // 防止滚动条越界
      if (offset > this.maxOffset) {
        offset = this.maxOffset
      }

      if (event && offset > 0 && offset < this.maxOffset) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
      this.currentOffset = offset
      // 偏移
      this.$refs.strip.style.transform = `${this.config.translate}(${offset}px)`

      // 告诉scroll.vue 滚动条移动的偏移量
      this.$emit('change', offset / this.percentage)
    }
  },
  created () {
    const configs = {
      // 水平的属性配置
      h: {
        sizeAttr: 'width',
        client: 'clientWidth',
        clientAxis: 'clientX',
        translate: 'translateX',
        direction: 'left',
        wheelDelta: 'deltaX'
      },
      // 垂直的属性配置
      v: {
        sizeAttr: 'height', // 滚动条的高度
        client: 'clientHeight', // 滚动条容器的可视高度
        clientAxis: 'clientY', // 拖动滚动条时，鼠标移动的Y轴坐标值
        translate: 'translateY', // 上下移动滚动条的位置
        direction: 'top', // 滚动条容器的top值, 会与 clientY 发生计算
        wheelDelta: 'deltaY' // 在滚动条容器中滚动 鼠标滚轮 时， 滚动量的值
      }
    }

    // 根据方向初始化对应的属性配置
    this.config = this.horizontal ? configs['h'] : configs['v']
  },
  destroyed () {
    off(document, 'mouseup', this.handlerClickUp)
    off(document, 'mousemove', this.handlerMove)
  }
}
</script>
