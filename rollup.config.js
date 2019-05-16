import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonJS from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import builtins from 'rollup-plugin-node-builtins'

// list of plugins used during building process
const plugins = targets => ([
  replace({
    exclude: 'node_modules/**',
    values: {
      '<@ENVIRONMENT@>': 'production',
      '<@VERSION@>': '0.1.1'
    },
    delimiters: ['', '']
  }),
  babel({
    exclude: ['node_modules/**'],
    presets: [['env', { modules: false }]],
    plugins: ['external-helpers', 'babel-plugin-transform-object-rest-spread'],
    comments: false,
  }),
  resolve(),
  commonJS({
    include: 'node_modules/**'
  }),
  json(),
  terser(),
  builtins()
])

// packages that should be treated as external dependencies, not bundled
const external = ['fetch-ponyfill', 'squarelink-provider-engine'] // e.g. ['axios']

export default [{
  // source file / entrypoint
  input: 'src/index.js',
  // output configuration
  output: {
    // name visible for other scripts
    name: 'npmLibPackageExample',
    // output file location
    file: 'lib/bundle.min.js',
    // format of generated JS file, also: esm, and others are available
    format: 'iife',
    // add sourcemaps
    sourcemap: true,
  },
  external,
  // build es modules for node 8
  plugins: plugins({ node: '10' }),
}]
