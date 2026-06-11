const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Note: Used to ensure all theme images are copied to public/images

module.exports = {
  ...defaultConfig,
  plugins: [
    ...defaultConfig.plugins,
    new RemoveEmptyScriptsPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'resources/images', to: 'images', noErrorOnMissing: true }
      ]
    })
  ]
};