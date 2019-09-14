require('dotenv').config()
require('babel-polyfill')
import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'
import fs from 'fs'

// packages that should be treated as external dependencies, not bundled
const external = [
  'squarelink-provider-engine',
  'squarelink-provider-engine/subproviders/cache',
  'squarelink-provider-engine/subproviders/fixture',
  'squarelink-provider-engine/subproviders/filters',
  'squarelink-provider-engine/subproviders/hooked-wallet',
  'squarelink-provider-engine/subproviders/nonce-tracker',
  'squarelink-provider-engine/subproviders/rpc',
  'squarelink-provider-engine/subproviders/websocket',
  'squarelink-provider-engine/subproviders/subscriptions',
  'squarelink-provider-engine/subproviders/gasprice',
  'babel-runtime/helpers/extends',
  'babel-runtime/regenerator',
  'babel-runtime/core-js/promise',
  'babel-runtime/helpers/asyncToGenerator',
  'babel-runtime/helpers/classCallCheck',
  'babel-runtime/helpers/createClass',
  'babel-runtime/helpers/typeof',
  'babel-runtime/core-js/json/stringify',
  'babel-runtime/helpers/objectWithoutProperties',
  'babel-runtime/helpers/toConsumableArray',
  'babel-runtime/core-js/object/keys',
  'babel-runtime/core-js/object/get-prototype-of',
  'babel-runtime/helpers/possibleConstructorReturn',
  'babel-runtime/helpers/inherits',
  'bignumber.js',
]
let config = {}
Object.keys(process.env)
  .filter(k => k.includes('VUE_APP_'))
  .forEach(k => {
    config[`process.env.${k}`] = `"${process.env[k]}"`
  })

const packagePlugins = targets => ([
  replace({
    exclude: 'node_modules/**',
    values: {
      'process.env.VUE_APP_VERSION': `"${pkg.version}"`,
      '${process.env.VUE_APP_AVAILABLE_NETWORKS}': fs.readFileSync('networks.json'),
      ...config,
    },
    delimiters: ['', '']
  }),
  babel({
    ...babelrc(),
    runtimeHelpers: true,
  }),
])

export default [{
  input: 'src/index.js',
  output: [{
    file: pkg.module,
    format: 'esm',
  }, {
    file: pkg.main,
    format: 'cjs',
  }],
  external,
  plugins: packagePlugins({ node: '8' })
}]
