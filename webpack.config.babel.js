const path = require('path');

export default () => [
  {
    mode: 'production',
    entry: './es/index.js',
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
            path.resolve(__dirname, 'node_modules/squarelink-provider-engine'),
          ],
          use: 'babel-loader',
        },
      ],
    },
  },
];
