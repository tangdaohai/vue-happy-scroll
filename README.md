vue happy scroll
===

> 基于vue2的一款滚动条插件。当前版本不保证移动端可用。


<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/dm/vue-happy-scroll.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/v/vue-happy-scroll.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vue-happy-scroll"><img src="https://img.shields.io/npm/l/vue-happy-scroll.svg" alt="License"></a>
![欢迎PR](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

| Chrome | Firefox | Safari | Edge |               IE               |
| :----: | :-----: | :----: | :--: | :----------------------------: |
|   √    |    √    |   √    |  √   | `9`  √<br />`10` √<br />`11` √ |

## demo

https://happy-js.github.io/vue-happy-scroll/


## 安装

1. npm
  推荐使用`npm`，这样可以跟随你的`webpack`配置去选择怎样打包。

  ```
  npm i -D vue-happy-scroll
  ```

  由于当前版本的module模块使用的ES6语法，所以在使用时还需在webpack中增加配置(`resolve('node_modules/vue-happy-scroll')`)

  ```
  module: {
    rule: {
      //...
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/vue-happy-scroll')]
      }
    }
  }
  ```

  ​

  ​


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

   > 可以访问[https://unpkg.com/vue-happy-scroll/](https://unpkg.com/vue-happy-scroll) 来选择不同版本

## 注册组件

1. 全局注册

   ```vue
   <template>
     <happy-scroll>
       <!-- 你的内容 -->
     </happy-scroll>
   </template>
   <script>
     import Vue from 'vue'

     import HappyScroll from 'vue-happy-scroll'
     Vue.use(HappyScroll)

     //或者
     import { HappyScroll } from 'vue-happy-scroll'
     //自定义组件名
     Vue.component('happy-scroll', HappyScroll)
   </script>
   ```

2. 局部注册

   ```vue
   <template>
     <happy-scroll>
       <!-- 你的内容 -->
     </happy-scroll>
   </template>
   <script>
     import { HappyScroll } from 'vue-happy-scroll'
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

## 属性

### color

* 类型`String`

* 默认值`rgba(51,51,51,0.2)`

* 用法:

  ```html
  <happy-scroll color="rgba(51,51,51,0.2)">
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  设置滚动条的颜色

  > 建议使用`rgba`，这样可以为滚动条设置透明度，当然，如果你需要设置透明度的话。

### scroll-top

* 类型`Number|String`

* 默认值`0`

* 用法:

  ```html
  <happy-scroll scroll-top="20">
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  在组件`mounted`之后，设置`容器`距离顶部的距离。

  > 相当于`element.scrollTop` 一致。

  `scroll-top`的值会自动转换为数字，所以当值为固定的数字时(使用`+`转换的)，你无需增加`:(v-bind)`，直接写为`scroll-top="20"`即可。

### scroll-left

* 类型`Number|String`

* 默认值`0`

* 用法:

  ```html
  <happy-scroll scroll-left="20">
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  在组件`mounted`之后，设置`容器`距离左边的距离。

  > 相当于`element.scrollLeft` 一致。

### hide-vertical

* 类型 `Boolean`

* 默认值 `false`

* 用法:

  ```html
  <!-- 表示隐藏竖向滚动条 -->
  <happy-scroll hide-vertical>
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  隐藏`竖向`滚动条

### hide-horizontal

- 类型 `Boolean`

- 默认值 `false`

- 用法:

  ```html
  <!-- 表示隐藏横向滚动条 -->
  <happy-scroll hide-horizontal>
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  隐藏`横向`滚动条

### resize

* 类型`Boolean`

* 默认值`false`

* 用法:

  ```html
  <!-- 表示开启监听容器大小变化 -->
  <happy-scroll resize>
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  如果`你的容器`大小是变化的(`高度`或者`宽度`可能随时发生变化的情况)，可使用`resize`来开启对容器大小变化的监听，当`容器`的`宽高`大于你设定的`宽高`时，会自动出现滚动条，反正会自动隐藏滚动条。

  > 此功能当前版本依赖 [element-resize-detector](https://github.com/wnr/element-resize-detector)，目前正在寻找性能更高的办法，当然此插件的性能还是可以肯定的

### smaller-move-h、smaller-move-v

* 类型`String`

* 默认值`''`

* 可选值:

  1. `start`
  2. `end`
  3. 除`1、2`的值之外，其他所有值都认为是`默认值`

* 用法:

  ```html
  <happy-scroll smaller-move-v="start">
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  > 当`resize=true`时，此配置才有效。

  该属性表示当容器`变小`时，滚动条移动的方向。

  当设置为`start`时，表示变小之后，滚动条会移动到`头部`(对`竖向`滚动条来说是`最上边`，对`横向`滚动条来说是`最左边`)

  当设置为`end`时，表示变小之后，滚动条会移动到`尾部`(对`竖向`滚动条来说是`最下边`，对`横向`滚动条来说是`最右边`)

  当设置为`''`(默认值)时，表示在变小时，滚动条的位置不发生变化。


### bigger-move-h、bigger-move-v

* 类型`String`

* 默认值`''`

* 可选值:

  1. `start`
  2. `end`
  3. 除`1、2`的值之外，其他所有值都认为是`默认值`

* 用法:

  ```html
  <happy-scroll bigger-move-h="start">
    <!-- 你的内容 -->
  </happy-scroll>
  ```

  > 当`resize=true`时，此配置才有效。

  该属性表示当容器大小`变大`时，滚动条移动的方向。

  属性值与`smaller-move-h`原理一致。

### throttle

* 类型`Number`

* 默认值`14`

* 单位`毫秒`

* 说明:

  设置鼠标拖动滚动条的节流时间，如果没有特殊的要求不建议修改此值。

## PR
期待并欢迎您的PR。
但请您一定要遵守`[standard](https://github.com/standard/standard)`代码风格规范。
并且您只需要提交`src`目录下的源码即可，`无需`提交`build`之后的代码

## MIT

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, 唐道海
