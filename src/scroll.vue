<template>
  <div class="happy-scroll" ref="happy-scroll">
    <div class="happy-scroll-container" ref="container" :style="[initSize]" @scroll.stop="onScroll">
      <!-- 视图元素 -->
      <slot></slot>
    </div>
    <!-- 竖向垂直滚动条, 如果 percentageY 比例等于1不显示该滚动条 -->
    <happy-scroll-strip
      v-show="!hideVertical && percentageY < 1"
      v-model="slideY"
      v-bind="$attrs"
      :throttle="throttle"
      :percentage="percentageY"
      :move="moveY">
    </happy-scroll-strip>
    <!-- 横向水平滚动条 -->
    <happy-scroll-strip
      v-show="!hideHorizontal && percentageX < 1"
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
//@FIXME 需要一个更优的解决方案
import ElementResizeDetectorMaker from "element-resize-detector"
import './scroll.css'
export default {
  name: 'happy-scroll',
  inheritAttrs: false,
  props: {
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
    },
    //是否开启监控视图大小发生变化
    resize: Boolean,
    //(当resize=true时生效)当视图宽高变小时(内容减少) 滚动条移动到 -> start(竖向时表示最上边，横向时表示最左边)、end、默认保持不变
    smallerMove: {
      type: String,
      default: ''
    },
    //(当resize=true时生效)当视图宽高变大时(内容增多)
    biggerMove: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      //视图元素的容器的宽高，此处设置为40，是为了获取到浏览器滚动条的大小，在mounted之后会计算该属性
      initSize: {
        width: '40px',
        height: '40px'
      },
      //横向滚动条百分比
      percentageX: 0,
      moveX: 0, //slot dom元素滚动的位置
      slideX: 0, //鼠标拖动滚动条的位置
      //竖向滚动条百分比
      percentageY: 0,
      moveY: +this.scrollTop,
      slideY: +this.scrollLeft,
      //监听scroll事件的节流函数
      scrollThrottle: generateThrottle(),
      //浏览器滚动条大小, 默认为15px
      browserHSize: 15,
      browserVSize: 15
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
    //监听 滑动到指定位置
    scrollTop () {
      this.moveY = +this.scrollTop
    },
    scrollLeft () {
      this.moveX = +this.scrollLeft
    }
  },
  methods: {
    //监听dom元素的滚动事件，通知strip，将bar移动到对应位置
    onScroll (e) {
      //节流
      if(!this.scrollThrottle(Date.now())) return
      this.moveY = this.$refs.container.scrollTop
      this.moveX = this.$refs.container.scrollLeft
    },
    //初始化，获取浏览器滚动条的大小
    initBrowserSize(){
      //获取当前浏览器滚动条的宽高,如果是0(0的情况可能是还没出现滚动条) 采用默认的大小
      this.browserHSize = (this.$refs.container.offsetWidth - this.$refs.container.clientWidth)
      //横向滚动的高度
      this.browserVSize = (this.$refs.container.offsetHeight - this.$refs.container.clientHeight)
    },
    //获取滚动条百分比
    getPercentage () {
      //竖向滚动条高度与容器高度百分比
      this.percentageY = this.$refs.container.clientHeight / this.$refs.container.scrollHeight
      //横向滚动条高度与容器高度百分比
      this.percentageX = this.$refs.container.clientWidth / this.$refs.container.scrollWidth
    },
    //slot视图大小变化时的监听
    resizeListener () {
      //没开启监听reszie方法
      if(!this.resize) return

      //监听slot视图元素resize
      let elementResizeDetector = ElementResizeDetectorMaker({
        strategy: "scroll",
        callOnAdd: false
      });

      //记录视图上次宽高的变化
      let lastHeight = 0, lastWidth = 0

      elementResizeDetector.listenTo(this.$slots.default[0]['elm'], (element) => {
        //初始化百分比
        this.getPercentage()
        this.initBrowserSize()
        //获取竖向滚动条变小或者变大的移动策略
        let moveTo
        if(element.clientHeight < lastHeight){
          moveTo = this.smallerMove.toLocaleLowerCase()
        }
        if(element.clientHeight > lastHeight){
          moveTo = this.biggerMove.toLocaleLowerCase()
        }

        if(moveTo === 'start'){
          //竖向滚动条移动到顶部
          this.slideY = this.moveY = 0
        }
        if(moveTo === 'end'){
          //竖向滚动条移动到底部
          this.slideY = this.moveY = element.clientHeight
        }

        lastHeight = element.clientHeight

        //获取横向向滚动条变小或者变大的移动策略
        moveTo = ''
        if(element.clientWidth < lastWidth){
          moveTo = this.smallerMove.toLocaleLowerCase()
        }
        if(element.clientWidth > lastWidth){
          moveTo = this.biggerMove.toLocaleLowerCase()
        }

        if(moveTo === 'start'){
          //竖向滚动条移动到顶部
          this.slideX = this.moveX = 0
        }
        if(moveTo === 'end'){
          //竖向滚动条移动到底部
          this.slideX = this.moveX = element.clientHeight
        }

        lastWidth = element.clientWidth
      });
    }
  },
  components: {
    HappyScrollStrip
  },
  mounted() {
    //获取当前浏览器滚动条的宽高,如果是0(0的情况可能是还没出现滚动条) 采用默认的大小
    this.initBrowserSize()
    //监听slot视图变化, 方法内部会判断是否设置了开启监听resize
    this.resizeListener()

    //根据最外层div，初始化内部容器的宽高，包含滚动条的宽高
    this.initSize = {
      width: this.$refs['happy-scroll'].clientWidth + (!this.hideHorizontal && this.percentageY < 1 ? this.browserHSize : 0) + 'px',
      height: this.$refs['happy-scroll'].clientHeight + (!this.hideVertical && this.percentageX < 1 ? this.browserVSize : 0) + 'px'
    }

    this.$nextTick(() => {
      //渲染完毕之后再计算滚动条的比例
      this.getPercentage()
    })
  }
}
</script>
