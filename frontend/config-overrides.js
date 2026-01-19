// react-app-rewired config para polyfills do Webpack 5
const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    path: require.resolve('path-browserify'),
    stream: require.resolve('stream-browserify'),
  };
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Configuração para resolver erro do Watchpack no Windows
  config.watchOptions = {
    ignored: [
      '**/pagefile.sys',
      '**/swapfile.sys',
      '**/hiberfil.sys',
      '**/System Volume Information/**',
      '**/.git/**',
      '**/node_modules/**',
      '**/build/**',
      '**/.cache/**'
    ],
    aggregateTimeout: 300,
    poll: 1000
  };

  return config;
};
