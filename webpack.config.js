'use strict';

var webpack = require('webpack');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs')

var DEBUG = !argv.release;

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './app.js',
  target: 'node',
  output: {
    filename: 'app.bundle.js',
    publicPath: './',
    sourcePrefix: '  ',
    libraryTarget: "commonjs2"
  },

  cache: DEBUG,
  debug: DEBUG,
  devtool: DEBUG ? '#inline-source-map' : false,

  stats: {
    colors: true,
    reasons: DEBUG
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ],

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js']
  },
  externals: nodeModules,

  module: {
    /*
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],
    */
    loaders: [
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel?stage=0'
      }
    ]
  }
};
