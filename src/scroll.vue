<template>
  <div class="happy-scroll" :style="{ width: width + 'px', height: height + 'px' }">
    <div class="happy-scroll-container" ref="container" :style="{ width: width + 15 + 'px', height: height + 15 + 'px' }" @scroll.stop="onScroll">
      <slot></slot>
    </div>
    <!-- 竖向垂直滚动条 -->
    <happy-scroll-strip v-model="slideY" :percentage="percentageY" :move="moveY" />
    <!-- 横向水平滚动条 -->
    <happy-scroll-strip v-model="slideX" horizontal :percentage="percentageX" :move="moveX" />
  </div>
</template>
<script>
import HappyScrollStrip from './strip.vue';
import './scroll.css';
export default {
  name: 'happy-scroll',
  props: {
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 280
    }
  },
  data() {
    return {
      percentageX: 0,
      moveX: 0,
      slideX: 0,
      percentageY: 0,
      moveY: 0,
      slideY: 0
    }
  },
  watch: {
    slideX() {
      this.$refs.container.scrollLeft = this.slideX / this.percentageX;
    },
    slideY() {
      this.$refs.container.scrollTop = this.slideY / this.percentageY;
    }
  },
  methods: {
    onScroll(e) {
      this.moveY = this.$refs.container.scrollTop;
      this.moveX = this.$refs.container.scrollLeft;
    }
  },
  components: {
    HappyScrollStrip
  },
  mounted() {
    this.percentageY = this.$refs.container.clientHeight / this.$refs.container.scrollHeight;
    this.percentageX = this.$refs.container.clientWidth / this.$refs.container.scrollWidth;
  }
}
</script>
