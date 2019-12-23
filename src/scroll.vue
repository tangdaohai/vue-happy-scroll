<template>
  <!-- 此元素负责覆盖原生的滚动条 -->
  <div class="happy-scroll" ref="happy-scroll">
    <!-- 出现滚动条的元素 -->
    <div class="happy-scroll-container" ref="container" :style="[initSize]" @scroll.stop="onScroll">
      <!-- 视图元素 此元素 >= 内容元素的宽高 -->
      <div class="happy-scroll-content"
        ref="content"
        :style="[contentBorderStyle]">
        <!-- 用户的内容元素 -->
        <slot></slot>
      </div>
    </div>
    <!-- 竖向垂直滚动条 -->
    <happy-scroll-strip
      ref="stripY"
      v-if="!hideVertical"
      v-bind="$attrs"
      v-on="$listeners"
      :throttle="throttle"
      :move="moveY"
      @change="slideYChange">
    </happy-scroll-strip>
    <!-- 横向水平滚动条 -->
    <happy-scroll-strip
      ref="stripX"
      v-if="!hideHorizontal"
      horizontal
      v-bind="$attrs"
      v-on="$listeners"
      :throttle="throttle"
      :move="moveX"
      @change="slideXChange">
    </happy-scroll-strip>
  </div>
</template>
<script>
import Vue$ from 'vue'
import { generateThrottle, debounce } from './util'
import HappyScrollStrip from './strip.vue'
// @FIXME 需要一个更优的解决方案
import ElementResizeDetectorMaker from 'element-resize-detector'
import './scroll.css'
let Vue = Vue$
if (typeof window !== 'undefined' && window.Vue) {
  Vue = window.Vue
}
export default {
  name: 'happy-scroll',
  inheritAttrs: false,
  components: {
    HappyScrollStrip
  },
  props: {
    // 设置竖向滚动条的位置
    scrollTop: {
      type: [Number, String],
      default: 0
    },
    // 设置横向滚动条的位置
    scrollLeft: {
      type: [Number, String],
      default: 0
    },
    // 是否隐藏竖向滚动条
    hideVertical: Boolean,
    // 是否隐藏横向滚动条
    hideHorizontal: Boolean,
    // 鼠标移动的节流函数时间, 表示该时间内鼠标移动的回调保障在该时间内只执行一次
    throttle: {
      type: Number,
      default: 14 // 默认14毫秒
    },
    // 是否开启监控视图大小发生变化
    resize: Boolean,
    // (当resize=true时生效)当视图宽高变小时(内容减少) 滚动条移动到 -> start(竖向时表示最上边，横向时表示最左边)、end、默认保持不变
    smallerMoveH: {
      type: String,
      default: ''
    },
    smallerMoveV: {
      type: String,
      default: ''
    },
    // (当resize=true时生效)当视图宽高变大时(内容增多)
    biggerMoveH: {
      type: String,
      default: ''
    },
    biggerMoveV: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 视图元素的容器的宽高，在mounted之后会计算该属性
      initSize: {
      },
      // 横向的
      moveX: +this.scrollLeft, // slot dom元素滚动的位置
      // 竖向的
      moveY: +this.scrollTop,
      // 监听scroll事件的节流函数
      scrollThrottle: generateThrottle(this.throttle),
      // 浏览器滚动条所占空间的大小, 默认为15px
      browserHSize: 0,
      browserVSize: 0,
      // 滚动条的模式，表示占用宽度还是悬浮在元素上(macOS系统可以设置滚动条悬浮在元素上，不会占用元素的空间)
      isScrollNotUseSpace: undefined
    }
  },
  watch: {
    // 监听（鼠标滑轮或者触摸板滑动） 滑动到指定位置
    scrollTop (newVal) {
      this.$refs.container.scrollTop = this.moveY = +newVal
    },
    scrollLeft (newVal) {
      this.$refs.container.scrollLeft = this.moveX = +newVal
    },
    // 监听动态开启或关闭对应的滚动条
    hideVertical (newVal) {
      if (!newVal) {
        // 如果将禁用修改为启用，等子组件渲染后 再计算比例
        this.$nextTick(this.computeStripY)
      }
    },
    hideHorizontal (newVal) {
      if (!newVal) {
        // 如果将禁用修改为启用，等子组件渲染后 再计算比例
        this.$nextTick(this.computeStripX)
      }
    }
  },
  computed: {
    // content 元素的border样式
    contentBorderStyle () {
      if (this.isScrollNotUseSpace === undefined) {
        return {}
      }

      return {
        'border-right': `${20 - this.browserHSize}px solid transparent`,
        'border-bottom': `${20 - this.browserVSize}px solid transparent`
      }
    }
  },
  methods: {
    // 模拟的滚动条位置发生了变动，修改 dom 对应的位置
    slideYChange (newVal) {
      this.$refs.container.scrollTop = newVal
      // this.$refs.container.scrollTop 会在渲染之后被自动调整，所以这里重新取值
      this.$emit('update:scrollTop', this.$refs.container.scrollTop)
    },
    slideXChange (newVal) {
      this.$refs.container.scrollLeft = newVal
      this.$emit('update:scrollLeft', this.$refs.container.scrollLeft)
    },
    // 监听dom元素的滚动事件，通知strip，将bar移动到对应位置
    onScroll (e) {
      // 节流
      if (!this.scrollThrottle(Date.now())) return false
      this.moveY = e.target.scrollTop
      this.moveX = e.target.scrollLeft
      this.updateSyncScroll()
    },
    // 初始化，获取浏览器滚动条的大小
    initBrowserSize () {
      if (this.isScrollNotUseSpace === undefined) {
        return
      }

      if (this.isScrollNotUseSpace === true) {
        this.browserHSize = 0
        this.browserVSize = 0
      } else {
        // 获取当前浏览器滚动条的宽高
        this.browserHSize = (this.$refs.container.offsetWidth - this.$refs.container.clientWidth)
        // 横向滚动的高度
        this.browserVSize = (this.$refs.container.offsetHeight - this.$refs.container.clientHeight)
      }
    },
    // 计算横向滚动条宽度度与元素宽度百分比
    computeStripX () {
      if (this.hideHorizontal) {
        // 没有开启横向滚动条
        return
      }
      const clientEle = this.$refs['happy-scroll']
      const slotEle = this.$slots.default[0]['elm']
      this.$refs.stripX.computeStrip(slotEle.scrollWidth, clientEle.clientWidth)
    },
    // 计算横向滚动条高度与元素高度百分比
    computeStripY () {
      if (this.hideVertical) {
        // 没有开启竖向滚动条
        return
      }
      const clientEle = this.$refs['happy-scroll']
      const slotEle = this.$slots.default[0]['elm']
      // 竖向滚动条高度与元素高度百分比
      this.$refs.stripY.computeStrip(slotEle.scrollHeight, clientEle.clientHeight)
    },
    // slot视图大小变化时的监听
    resizeListener () {
      // 没开启监听reszie方法
      if (!this.resize) return

      // 监听slot视图元素resize
      let elementResizeDetector = ElementResizeDetectorMaker({
        strategy: 'scroll',
        callOnAdd: false
      })

      // 记录视图上次宽高的变化
      const ele = this.$slots.default[0]['elm']
      let lastHeight = ele.clientHeight
      let lastWidth = ele.clientWidth
      elementResizeDetector.listenTo(ele, (element) => {
        // 初始化百分比
        this.computeStripX()
        this.computeStripY()
        this.initBrowserSize()
        // 获取竖向滚动条变小或者变大的移动策略
        let moveTo
        if (element.clientHeight < lastHeight) {
          // 高度变小
          moveTo = this.smallerMoveH.toLocaleLowerCase()
        }
        if (element.clientHeight > lastHeight) {
          // 高度变大
          moveTo = this.biggerMoveH.toLocaleLowerCase()
        }

        if (moveTo === 'start') {
          // 竖向滚动条移动到顶部
          this.moveY = 0
          this.slideYChange(this.moveY)
        }
        if (moveTo === 'end') {
          // 竖向滚动条移动到底部
          this.moveY = element.clientHeight
          this.slideYChange(this.moveY)
        }

        // 记录此次的高度，用于下次变化后的比较
        lastHeight = element.clientHeight

        // 获取横向向滚动条变小或者变大的移动策略
        moveTo = ''
        if (element.clientWidth < lastWidth) {
          // 宽度变小
          moveTo = this.smallerMoveV.toLocaleLowerCase()
        }
        if (element.clientWidth > lastWidth) {
          // 宽度变大
          moveTo = this.biggerMoveV.toLocaleLowerCase()
        }
        if (moveTo === 'start') {
          // 横向滚动条移动到最左边
          this.moveX = 0
          this.slideXChange(this.moveX)
        }
        if (moveTo === 'end') {
          // 竖向滚动条移动到最右边
          this.moveX = element.clientWidth
          this.slideXChange(this.moveX)
        }

        // 记录此次的宽度，用于下次变化后的比较
        lastWidth = element.clientWidth
      })
    },
    // 设置滚动条元素的宽度
    setContainerSize () {
      // 根据最外层div，初始化内部容器的宽高，包含滚动条的宽高
      this.initSize = {
        width: this.$refs['happy-scroll'].clientWidth + 20 + 'px',
        height: this.$refs['happy-scroll'].clientHeight + 20 + 'px'
      }
    },
    // 判断浏览器滚动条的模式
    checkScrollMode () {
      // eslint-disable-next-line
      if (Vue._happyJS._isScrollNotUseSpace !== undefined) {
        // 如果不是undefined，说明已经判断过了
        return
      }

      const ele = this.$slots.default[0]['elm']
      const container = this.$refs.container
      // 如果视图元素的实际高度(宽度)大于可视高度(宽度)，则可以肯定会出现滚动条了，否则还没有出现，不做判断
      if (ele.offsetHeight > container.clientHeight || ele.offsetWidth > container.clientWidth) {
        // 可以肯定出现滚动条了，可以判断滚动条的模式
        if (container.offsetWidth > container.clientWidth || container.offsetHeight > container.clientHeight) {
          // 滚动条一直存在的模式
          // eslint-disable-next-line
          Vue._happyJS._isScrollNotUseSpace = false
        } else {
          // eslint-disable-next-line
          Vue._happyJS._isScrollNotUseSpace = true
        }
        // eslint-disable-next-line
        this.isScrollNotUseSpace = Vue._happyJS._isScrollNotUseSpace
      }
    }
  },
  beforeCreate () {
    // eslint-disable-next-line
    const happyJS = Vue._happyJS = Vue._happyJS || {}
    /**
     * 判断当前浏览器滚动条存在的方式
     * true. 滚动时滚动条才会出现，悬浮在元素之上，不占用宽度(默认为此模式，但可以通过css隐藏滚动条，也属于不占用空间的模式，不过Firefox除外)
     * false. 系统滚动条始终存在，所以会占用宽度 (占用视图宽度的模式，windows下默认为此方式)
     */
    this.isScrollNotUseSpace = happyJS._isScrollNotUseSpace
  },
  created () {
    // @FIXME 更新滚动事件，因为需要使用 this.throttle 变量，所以声明在 created 中
    this.updateSyncScroll = debounce(function () {
      this.$emit('update:scrollTop', this.moveY)
      this.$emit('update:scrollLeft', this.moveX)
    }, this.throttle)
  },
  mounted () {
    // 计算最外层宽高，设置滚动条元素的宽高
    this.setContainerSize()
    this.$nextTick(() => {
      // 使滚动条进行计算比例
      this.computeStripX()
      this.computeStripY()
      // 判断当前浏览器滚动条的模式，依据slot元素高度，如果高度大于视图高度，则出现滚动条了，此时再判断滚动条的模式
      this.checkScrollMode()
      // 获取当前浏览器滚动条的宽高
      this.initBrowserSize()

      this.$nextTick(() => {
        // 因为 initBrowserSize 会有增加 20px border 的操作，所以需要等待这20px渲染完成后再进行操作
        // 将视图dom移动到设定的位置
        this.scrollTop && (this.$refs.container.scrollTop = +this.scrollTop)
        this.scrollLeft && (this.$refs.container.scrollLeft = +this.scrollLeft)
      })
    })

    // 监听slot视图变化, 方法内部会判断是否设置了开启监听resize
    this.resizeListener()

    // 监听滚动条宽度变化，有滚动条 -> 无滚动条, 在mounted中监听是为了确保$refs可调用
    this.$watch('browserHSize', this.setContainerSize)
    this.$watch('browserVSize', this.setContainerSize)
  }
}
</script>
