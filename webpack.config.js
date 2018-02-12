const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
module.exports = {
  entry: './app/js/home.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
         rules: [
           {
             test: /\.css$/,
             use: [
               'style-loader',
               'css-loader'
             ]
           }
         ]
       },
  devtool: 'inline-source-map',
  plugins: [
         new HtmlWebpackPlugin({
           title: 'Output Management'
         })
       ],
};

