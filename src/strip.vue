<template>
  <div class="happy-scroll-strip" ref="stripContainer" :class="[horizontal ? 'happy-scroll-strip--horizontal' : 'happy-scroll-strip--vertical']" @wheel.capture.stop="handlerWheel">
    <div ref="strip" class="scrollBar" :style="[translate, initStrip]" @mousedown.stop="handlerMouseDown"></div>
  </div>
</template>
<script>
import { on, off } from './util';
export default {
  name: 'happy-scroll-strip',
  props: {
    horizontal: Boolean,
    percentage: {
      type: Number,
      required: true
    },
    move: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      config: {},
      //标记鼠标按下后开始移动的状态. 鼠标按下为true 抬起为 false
      startMove: false,
      //为document绑定事件, 此状态值为了避免重复绑定
      binded: false,
      //滚动条的宽或者高
      size: 0
    }
  },
  computed: {
    /**
     * 初始化滚动条的高度或者宽度, 这个方法会被执行两次。
     */
    initStrip() {
      const container = this.$refs.stripContainer, //滚动条的容器
        strip = this.$refs.strip;   //滚动条本身

      if (!this.percentage && !container) {
        return;
      }
      //滚动条的高度或宽度 = 滚动条容器(100%高) * 百分比(外层内容与容器的比例)
      const number = container[this.config.client] * this.percentage;
      this.size = number;
      //根据 水平还是垂直方向 决定初始化滚动条的 宽还是高
      return {
        [this.config.sizeAttr]: `${number}px`
      }
    },
    /**
     * 变化滚动条的位置，scroll主体内容，滚动时，滚动条跟着联动
     */
    translate() {
      return {
        transform: `${this.config.translate}(${this.move * this.percentage}px)`
      }
    }
  },
  methods: {
    //鼠标按下事件
    handlerMouseDown(event) {
      //标记开始拖拽滚动条
      this.startMove = true;
      //记录鼠标起始的位置
      this.axis = event[this.config.clientAxis];
      //给document绑定 mouseup与mousemove
      this.bindEvents();
    },
    bindEvents() {
      //已绑定过了 不再重复绑定
      if (this.binded) return;

      on(document, 'mouseup', this.handlerMouseUp);
      on(document, 'mousemove', this.handlerMove);
      this.binded = true;
    },
    handlerMouseUp() {
      //鼠标抬起, 结束拖拽状态
      this.startMove = false;
    },
    handlerMove(event) {
      //如果不是在鼠标按下的状态
      if (!this.startMove) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const parentRect = this.$refs.stripContainer.getBoundingClientRect(),
        rect = this.$refs.strip.getBoundingClientRect();
      //相对于滚动条容器的offset
      const contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction];
      /**
       * offset = 鼠标移动的偏移量 + 滚动条当前的偏移量
       * offset为滚动条需要移动到的位置
       * event[this.config.clientAxis] - this.axis = 鼠标移动后与移动前的偏移量
       */
      const offset = event[this.config.clientAxis] - this.axis + contrastParentOffset;
      //更新鼠标偏移量的值
      this.axis = event[this.config.clientAxis];

      this.changeOffset(offset);
    },
    //鼠标滚轮滚动事件
    handlerWheel(event) {
      const parentRect = this.$refs.stripContainer.getBoundingClientRect(),
        rect = this.$refs.strip.getBoundingClientRect();
      //滚动条相对于容器的offset
      const contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction];
      //滚动条最终要设置的偏移量    event[this.config.wheelDelta] => 获取鼠标滚轮的滚动值
      const offset = contrastParentOffset + event[this.config.wheelDelta];

      this.changeOffset(offset, event);
    },
    changeOffset(offset, event) {

      const rect = this.$refs.stripContainer.getBoundingClientRect(),
        maxOffset = rect[this.config.sizeAttr] - this.size;

      //防止滚动条越界
      if (offset < 0) {
        offset = 0;
      }

      //防止滚动条越界
      if (offset > maxOffset) {
        offset = maxOffset;
      }

      if (event && 0 < offset && offset < maxOffset) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      //偏移
      this.$refs.strip.style.transform = `${this.config.translate}(${offset}px)`;

      //告诉scroll.vue 滚动条移动的偏移量
      this.$emit('input', offset);
    }
  },
  created() {
    const configs = {
      //水平的属性配置
      h: {
        sizeAttr: 'width',
        client: 'clientWidth',
        clientAxis: "clientX",
        translate: 'translateX',
        direction: 'left',
        wheelDelta: 'deltaX'
      },
      //垂直的属性配置
      v: {
        sizeAttr: 'height',         //滚动条的高度
        client: 'clientHeight',     //滚动条容器的可视高度
        clientAxis: "clientY",      //拖动滚动条时，鼠标移动的Y轴坐标值
        translate: 'translateY',    //上下移动滚动条的位置
        direction: 'top',           //滚动条容器的top值, 会与 clientY 发生计算
        wheelDelta: 'deltaY'        //在滚动条容器中滚动 鼠标滚轮 时， 滚动量的值
      }
    }

    //根据方向初始化对应的属性配置
    this.config = this.horizontal ? configs['h'] : configs['v'];

  },
  destroyed() {
    off(document, 'mouseup', this.handlerClickUp);
    off(document, 'mousemove', this.handlerMove);
  }
}
</script>
