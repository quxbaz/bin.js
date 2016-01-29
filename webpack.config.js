require('es6-promise').polyfill();
var path = require('path');
var resolve = path.resolve;

var config = {

  cache: true,
  devtool: 'eval',
  entry: 'test/test.js',

  output: {
    filename: 'bundle.js',
    publicPath: '/assets/'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/, /bower_components/],
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  resolve: {
    root: resolve(__dirname),
    extensions: ['', '.js'],
    alias: {
      'bin': resolve(__dirname)
    }
  }

};

module.exports = config;
