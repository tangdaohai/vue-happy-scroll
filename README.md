vue happy scroll
===

### 安装

1. npm
  推荐使用`npm`，这样可以跟随你的`webpack`配置去选择怎样打包。

  ```
  npm i -D vue-happy-scroll
  ```

  由于当前版本的module模块使用的ES6语法，所以在使用时还需在webpack中增加配置(`resolve('node_modules/vue-happy-scroll')`)

  ```javascript
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

### 快速使用

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

   ​