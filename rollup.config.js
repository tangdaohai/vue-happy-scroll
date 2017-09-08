import replace from 'rollup-plugin-replace'
import vue from 'rollup-plugin-vue'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  entry: 'src/index.js',
  dest: './docs/happy-scroll.min.js',
  format: 'umd',
  moduleName: 'happyScroll',
  sourceMap: true,
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( '' )
    }),
    vue(),
    uglify({}, minify)
  ]
}
