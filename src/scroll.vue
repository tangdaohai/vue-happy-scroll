<template>
  <div class="happy-scroll" :style="{ width: width + 'px', height: height + 'px' }">
    <div class="happy-scroll-container" ref="container" :style="{ width: width + 15 + 'px', height: height + 15 + 'px' }" @scroll.stop="onScroll">
      <slot></slot>
    </div>
    <!-- 竖向垂直滚动条, 如果 percentageY 比例等于1不显示该滚动条 -->
    <happy-scroll-strip
      v-if="!hideVertical && percentageY < 1"
      v-model="slideY"
      v-bind="$attrs"
      :throttle="throttle"
      :percentage="percentageY"
      :move="moveY">
    </happy-scroll-strip>
    <!-- 横向水平滚动条 -->
    <happy-scroll-strip
      v-if="!hideHorizontal && percentageX < 1"
      horizontal
      v-model="slideX"
      v-bind="$attrs"
      :throttle="throttle"
      :percentage="percentageX"
      :move="moveX">
    </happy-scroll-strip>
  </div>
</template>
<script>
import { generateThrottle } from './util'
import HappyScrollStrip from './strip.vue'
import './scroll.css'
export default {
  name: 'happy-scroll',
  inheritAttrs: false,
  props: {
    //容器宽度
    width: {
      type: Number,
      default: 300
    },
    //容器高度
    height: {
      type: Number,
      default: 280
    },
    //设置竖向滚动条的位置
    scrollTop: {
      type: [Number, String],
      default: 0
    },
    //设置横向滚动条的位置
    scrollLeft: {
      type: [Number, String],
      default: 0
    },
    //是否隐藏竖向滚动条
    hideVertical: Boolean,
    //是否隐藏横向滚动条
    hideHorizontal: Boolean,
    //鼠标移动的节流函数时间, 表示该时间内鼠标移动的回调保障在该时间内只执行一次
    throttle: {
      type: Number,
      default: 14 //默认14毫秒
    }
  },
  data() {
    return {
      //横向滚动条百分比
      percentageX: 0,
      moveX: 0, //slot dom元素滚动的位置
      slideX: 0, //鼠标拖动滚动条的位置
      //竖向滚动条百分比
      percentageY: 0,
      moveY: +this.scrollTop,
      slideY: +this.scrollLeft,
      //监听scroll事件的节流函数
      scrollThrottle: generateThrottle()
    }
  },
  watch: {
    //鼠标拖动滚动条时，移动slot元素到对应位置
    slideX() {
      this.$refs.container.scrollLeft = this.slideX / this.percentageX
    },
    slideY() {
      this.$refs.container.scrollTop = this.slideY / this.percentageY
    },
    scrollTop () {
      this.moveY = +this.scrollTop
    },
    scrollLeft () {
      this.moveX = +this.scrollLeft
    }
  },
  methods: {
    //监听dom元素的滚动事件，通知strip，将bar移动到对应位置
    onScroll(e) {
      //节流
      if(!this.scrollThrottle(Date.now())) return
      this.moveY = this.$refs.container.scrollTop
      this.moveX = this.$refs.container.scrollLeft
    }
  },
  components: {
    HappyScrollStrip
  },
  mounted() {
    //竖向滚动条高度与容器高度百分比
    this.percentageY = (this.$refs.container.clientHeight) / this.$refs.container.scrollHeight
    //横向滚动条高度与容器高度百分比
    this.percentageX = this.$refs.container.clientWidth / this.$refs.container.scrollWidth
  }
}
</script>
