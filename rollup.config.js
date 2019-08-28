require('dotenv').config()
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
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
      ...config,
    },
    delimiters: ['', '']
  }),
  babel({
    exclude: ['node_modules/**'],
    presets: [['env', { modules: false }]],
    plugins: [
      'external-helpers',
      'babel-plugin-transform-object-rest-spread',
      ["transform-runtime", {
        "helpers": false, // defaults to true
        "polyfill": false, // defaults to true
        "regenerator": true, // defaults to true
        "moduleName": "babel-runtime" // defaults to "babel-runtime"
      }]
    ],
    babelrc: false,
    comments: false,
  }),
])

export default [{
  input: 'src/index.js',
  exports: 'named',
  output: {
    name: 'Squarelink',
    file: 'dist/index.js',
    format: 'esm',
    outputs: 'default',
  },

  external,
  plugins: packagePlugins({ node: '8' })
}]
