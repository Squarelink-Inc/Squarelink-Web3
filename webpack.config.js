var webpack = require('webpack')
const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: ['./dist/index.js'],
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
          loader: 'string-replace-loader',
          options: {
            search: 'module.exports = Squarelink',
            replace: 'exports.default = Squarelink',
          }
        }, {
          test: /\.(js)$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/squarelink-provider-engine')
          ],
          use: 'babel-loader',
        },
      ],
    },
  },
];
