import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

export default {
  entry: 'server.js',
  dest: 'server_production.js',
  plugins: [
    babel(babelrc())
  ]
};
