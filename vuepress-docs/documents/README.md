# 介绍

<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/dm/vue-happy-scroll.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/v/vue-happy-scroll.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/github/issues-raw/tangdaohai/vue-happy-scroll.svg" alt="open issues"></a>
<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/github/issues-closed-raw/tangdaohai/vue-happy-scroll.svg" alt="closed issues"></a>
<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/l/vue-happy-scroll.svg" alt="License"></a>
![欢迎PR](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

| Chrome | Firefox | Safari | Edge |               IE               |
| :----: | :-----: | :----: | :--: | :----------------------------: |
|   √    |    √    |   √    |  √   | `9`  √<br />`10` √<br />`11` √ |

::: warning 注意
当前版本不支持移动端(还未在移动端进行过测试)。The current version not support SP(I haven't tested it on the smartphone yet).
:::

`vue-happy-scroll`是一款基于vue2.0的滚动条插件。

此插件致力**解决原生滚动条在不同系统、不同浏览器中的丑陋表现**，在保证原生滚动条功能可用的基础上实现了更丰富的功能、保证在所支持的浏览器下展现出风格一致、交互体验一致的滚动条。

它可以让你无需关心滚动条的兼容性问题，无需关心`内容区域`的宽高，当设定`resize`属性后，可以根据内容大小`自动显示或隐藏滚动条`。
这里有对各种丰富的[额外功能](https://github.com/tangdaohai/vue-happy-scroll#%E5%B1%9E%E6%80%A7)进行说明。


## 如何使用

1. npm
  推荐使用`npm`，这样可以跟随你的`webpack`配置去选择怎样打包。

  ```
  npm i -D vue-happy-scroll
  ```

2. CDN

   当前是使用的[https://unpkg.com](https://unpkg.com)托管CDN，unpkg会自动与`npm`中版本保持同步。

   通过以下方式引入即可:

   ```html
   <html>
     <head>
       <!-- 引入css，该链接始终为最新版的资源 -->
       <link rel="stylesheet" href="https://unpkg.com/vue-happy-scroll/docs/happy-scroll.css">
     </head>
     <body>
     <!-- 引入vue -->
     <!-- 引入组件，该链接始终为最新版的资源 -->
     <script src="https://unpkg.com/vue-happy-scroll/docs/happy-scroll.min.js"></script>
     </body>
   </html>
   ```

   ::: tip 提示
   可以访问[https://unpkg.com/vue-happy-scroll/](https://unpkg.com/vue-happy-scroll/) 来选择不同版本
   :::

## 注册组件

1. 全局注册

   ```vue{11}
   <template>
     <happy-scroll>
       <!-- 你的内容 -->
     </happy-scroll>
   </template>
   <script>
     import Vue from 'vue'

     import HappyScroll from 'vue-happy-scroll'
     // 引入css
     import 'vue-happy-scroll/docs/happy-scroll.css'
     Vue.use(HappyScroll)

     //或者
     import { HappyScroll } from 'vue-happy-scroll'
     //自定义组件名
     Vue.component('happy-scroll', HappyScroll)
   </script>
   ```

2. 局部注册

   ```vue{9}
   <template>
     <happy-scroll>
       <!-- 你的内容 -->
     </happy-scroll>
   </template>
   <script>
     import { HappyScroll } from 'vue-happy-scroll'
     // 引入css，推荐将css放入main入口中引入一次即可。
     import 'vue-happy-scroll/docs/happy-scroll.css'
     export default {
         name: '',
         components: {HappyScroll} //在组件内注册
     }
   </script>
   ```

3. 当`vue`是全局变量时

   ```javascript
   //如果vue是全局变量,happyScroll自动全局安装。
   if (typeof window !== 'undefined' && window.Vue) {
     Vue.component('happy-scroll', HappyScroll)
   }
   ```

   ```html
   <html>
     <happy-scroll>
       <!-- 你的内容 -->
     </happy-scroll>
   </html>
   ```
