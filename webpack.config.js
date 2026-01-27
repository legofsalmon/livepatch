const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "process": false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Live Patch - Collaborative Spreadsheet'
    }),
    new webpack.EnvironmentPlugin({
      REACT_APP_FIREBASE_API_KEY: null,
      REACT_APP_FIREBASE_AUTH_DOMAIN: null,
      REACT_APP_FIREBASE_DATABASE_URL: null,
      REACT_APP_FIREBASE_PROJECT_ID: null,
      REACT_APP_FIREBASE_STORAGE_BUCKET: null,
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: null,
      REACT_APP_FIREBASE_APP_ID: null
    })
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true
  }
};
