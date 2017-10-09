const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module : {
   loaders : [
     {
       test : /\.jsx?/,
       include : path.resolve(__dirname, 'src'),
       loader : 'babel-loader'
     }
   ]
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
}
