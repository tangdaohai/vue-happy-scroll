import replace from 'rollup-plugin-replace'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only';
import json from 'rollup-plugin-json';
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  entry: 'src/index.js',
  dest: './docs/happy-scroll.min.js',
  format: 'umd',
  moduleName: 'happy-scroll',
  sourceMap: true,
  external: ['vue'],
  plugins: [
    replace({
      'process.env.NODE_ENV': "''"
    }),
    vue(),
    css({
      output: './docs/happy-scroll.css'
    }),
    json(),
    // uglify({}, minify)
  ]
}
