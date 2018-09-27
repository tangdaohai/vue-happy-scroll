// const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
console.log(path.resolve(__dirname, '../../node_modules'))
console.log('----------------')
module.exports = {
  title: 'vue-happy-scroll',
  description: '基于 vue@2.0 使用的简单、多功能的滚动条组件',
  dest: './docs-demo',
  serviceWorker: true,
  markdown: {
    lineNumbers: true
  },
  scss: {
    includePaths: ['./node_modules']
  },
  themeConfig: {
    lastUpdated: 'Last Updated',
    serviceWorker: {
      updatePopup: {
        message: '发现新内容可用',
        buttonText: '刷新'
      }
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: '文档', link: '/documents/' },
      { text: 'GitHub', link: 'https://github.com/tangdaohai/vue-happy-scroll' }
    ],
    sidebar: {
      '/documents/': [
        {
          title: '文档说明',
          collapsable: false,
          children: [
            '',
            'attribute',
            'event'
          ]
        }
      ]
    },
    displayAllHeaders: true
  },
  // configureWebpack: (config, isServer) => {
  //   if (!isServer) {
  //     // 修改客户端的 webpack 配置
  //       // rules
  //   }
  // }
}
