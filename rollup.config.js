import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonJS from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

// list of plugins used during building process
const plugins = targets => ([
  // use Babel to transpile to ES5
  babel({
    // ignore node_modules/ in transpilation process
    exclude: 'node_modules/**',
    // ignore .babelrc (if defined) and use options defined here
    babelrc: false,
    // use recommended babel-preset-env without es modules enabled
    // and with possibility to set custom targets e.g. { node: '8' }
    presets: [['env', { modules: false, targets }]],
    // solve a problem with spread operator transpilation https://github.com/rollup/rollup/issues/281
    plugins: ['babel-plugin-transform-object-rest-spread'],
    // removes comments from output
    comments: false,
  }),
  resolve(),
  commonJS({
    include: 'node_modules/**'
  }),
  json(),
  terser()
])

// packages that should be treated as external dependencies, not bundled
const external = [] // e.g. ['axios']

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
