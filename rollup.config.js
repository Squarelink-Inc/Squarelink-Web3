import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonJS from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

// packages that should be treated as external dependencies, not bundled
const external = [
  'squarelink-provider-engine',
  'squarelink-provider-engine/subproviders/cache',
  'squarelink-provider-engine/subproviders/fixture',
  'squarelink-provider-engine/subproviders/filters',
  'squarelink-provider-engine/subproviders/vm',
  'squarelink-provider-engine/subproviders/hooked-wallet',
  'squarelink-provider-engine/subproviders/nonce-tracker',
  'squarelink-provider-engine/subproviders/rpc',
]

// list of plugins used during building process
const bundlePlugins = targets => ([
  replace({
    exclude: 'node_modules/**',
    values: {
      '<@ENVIRONMENT@>': 'production',
      '<@VERSION@>': pkg.version
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
    //include: 'node_modules/**'
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
      '<@VERSION@>': pkg.version
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

export default [{
  // source file / entrypoint
  input: 'src/index.js',
  // output configuration
  output: {
    // name visible for other scripts
    name: 'Squarelink',
    // output file location
    file: 'lib/squarelink.min.js',
    // format of generated JS file, also: esm, and others are available
    format: 'iife',
    // add sourcemaps
    sourcemap: false,
  },
  external,
  plugins: bundlePlugins({ node: '10' }),
}, {
  input: 'src/index.js',
  output: {
    name: 'Squarelink',
    file: 'dist/index.js',
    format: 'cjs'
  },
  external,
  plugins: packagePlugins({ node: '10' })
}]
