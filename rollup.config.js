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

const packagePlugins = targets => ([
  replace({
    exclude: 'node_modules/**',
    values: {
      'process.env.VUE_APP_VERSION': pkg.version,
      'process.env.VUE_APP_API_ENDPOINT': 'https://api.squarelink.com',
      'process.env.VUE_APP_APP_URL': 'https://app.squarelink.com',
      'process.env.VUE_APP_IFRAME_URL': 'https://squarelink.com/popup',
      'process.env.VUE_APP_NETWORK_LIST': 'https://api.squarelink.com/networks',
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
  output: {
    name: 'Squarelink',
    file: 'dist/index.js',
    format: 'esm'
  },
  external,
  plugins: packagePlugins({ node: '8' })
}]
