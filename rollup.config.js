import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonJS from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import builtins from 'rollup-plugin-node-builtins'

// list of plugins used during building process
const bundlePlugins = targets => ([
  replace({
    exclude: 'node_modules/**',
    values: {
      '<@ENVIRONMENT@>': 'production',
      '<@VERSION@>': '0.1.3'
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

const packagePlugins = targets => ([
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
  })
])

// packages that should be treated as external dependencies, not bundled
const external = [
  'fetch-ponyfill',
  'squarelink-provider-engine',
  'squarelink-provider-engine/subproviders/cache',
  'squarelink-provider-engine/subproviders/fixture',
  'squarelink-provider-engine/subproviders/filters',
  'squarelink-provider-engine/subproviders/vm',
  'squarelink-provider-engine/subproviders/hooked-wallet',
  'squarelink-provider-engine/subproviders/nonce-tracker',
  'squarelink-provider-engine/subproviders/rpc',
] // e.g. ['axios']

export default [{
  // source file / entrypoint
  input: 'src/index.js',
  // output configuration
  output: {
    // name visible for other scripts
    name: 'squarelink',
    // output file location
    file: 'lib/squarelink.min.js',
    // format of generated JS file, also: esm, and others are available
    format: 'iife',
    // add sourcemaps
    sourcemap: true,
  },
  external,
  plugins: bundlePlugins({ node: '8' }),
}, {
  input: 'src/index.js',
  output: {
    name: 'squarelink',
    file: 'dist/index.js',
    format: 'cjs'
  },
  external,
  plugins: packagePlugins({ node: '8' })
}]
