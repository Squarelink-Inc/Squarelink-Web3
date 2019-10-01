require('dotenv').config()
require('babel-polyfill')
import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import replace from 'replace-in-file'
import pkg from './package.json'
import fs from 'fs'

let config = {}
Object.keys(process.env)
  .filter(k => k.includes('VUE_APP_'))
  .forEach(k => {
    config[`process.env.${k}`] = `"${process.env[k]}"`
  })

config['${process.env.VUE_APP_AVAILABLE_NETWORKS}'] = fs.readFileSync('networks.json')
config['process.env.VUE_APP_VERSION'] = `"${pkg.version}"`

const options = {
  files: ['lib/index.js', 'es/index.js']
}

for (let k in config) {
  replace({
    files: ['lib/squarelink.min.js', 'es/index.js', 'dist/index.js'],
    from: k,
    to: config[k]
  })
}
