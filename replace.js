require('dotenv').config()
import replace from 'replace-in-file'
import pkg from './package.json'
import fs from 'fs'

let config = {}
Object.keys(process.env)
  .filter(k => k.includes('VUE_APP_'))
  .forEach(k => {
    config[`process.env.${k}`] = `"${process.env[k]}"`
  })

config['process.env.VUE_APP_AVAILABLE_NETWORKS'] = `'${fs.readFileSync('./networks.json')}'`
config['process.env.VUE_APP_VERSION'] = `"${pkg.version}"`

let promises = []

new Promise(async () => {
  for (let k in config) {
    try {
      await replace({
        files: ['es/config.js', 'dist/config.js'],
        from: k,
        to: config[k]
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
  process.exit()
})
