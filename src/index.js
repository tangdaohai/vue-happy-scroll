import HappyScroll from './scroll.vue'
import { version } from '../package.json'

// 如果vue是全局变量,使用自动全局安装。
if (typeof window !== 'undefined' && window.Vue) {
  // eslint-disable-next-line
  Vue.component('happy-scroll', HappyScroll)
}

export default {
  install (Vue) {
    Vue.component('happy-scroll', HappyScroll)
  },
  version
}

export {
  HappyScroll,
  version
}
