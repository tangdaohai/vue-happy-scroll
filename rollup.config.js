import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import eslint from 'rollup-plugin-eslint'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import { name, author, homepage, version } from './package.json'

const isMin = process.env.compile_type === 'min'
export default {
  input: 'src/index.js',
  output: {
    file: `./docs/happy-scroll${isMin ? '.min' : ''}.js`,
    format: 'umd'
  },
  name: 'happy-scroll',
  sourcemap: true,
  external: ['vue'],
  banner: `/*!
    name: ${name}
    version: ${version}
    author: ${author}
    github: ${homepage}
  */`,
  plugins: [
    replace({
      'process.env.NODE_ENV': '"production"'
    }),
    resolve(),
    json(),
    css({
      output: './docs/happy-scroll.css'
    }),
    eslint(),
    commonjs(),
    vue(),
    babel({
      exclude: 'node_modules/**'
    }),
    isMin ? uglify({}, minify) : ''
  ]
}
