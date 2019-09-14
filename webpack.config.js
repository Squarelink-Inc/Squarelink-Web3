var webpack = require('webpack')
const path = require('path')

var external = [
  //'babel-runtime',
  'squarelink-provider-engine',
  'bignumber.js',
]

var include = []
for (i in external) {
  include.push(path.resolve(__dirname, `node_modules/${external[i]}`))
}

module.exports = [
  {
    mode: 'production',
    entry: ['./es/index.js'],
    node: {
      fs: 'empty',
    },
    output: {
      path: path.resolve(__dirname, './lib'),
      filename: 'squarelink.min.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: 'Squarelink',
      libraryExport: 'default',
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          include: [
            path.resolve(__dirname, 'src'),
            ...include,
          ],
          use: 'babel-loader',
        },
      ],
    },
  },
];
