const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = async function (env = {}, argv = {}) {
  const mode = env.mode || 'production';
  env.mode = mode;
  argv.mode = mode;

  const config = await createExpoWebpackConfigAsync(env, argv);

  // Transpilar módulos de node_modules problemáticos
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/, 
    include: [
      /node_modules\/react-native-/,
      /node_modules\/\@react-navigation/,
      /node_modules\/react-navigation/,
      /node_modules\/\@expo/,
    ],
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
      },
    },
  });

  // Service Worker para PWA
  config.plugins.push(
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'https-calls',
            networkTimeoutSeconds: 15,
            expiration: {
              maxEntries: 150,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    })
  );

  // Permitir imports sin extensión explícita (.js)
  config.resolve = {
    ...config.resolve,
    extensions: ['.web.js', '.js', '.json'],
    fullySpecified: false,
  };

  // Corregir globalObject para navegador
  config.output = {
    ...config.output,
    globalObject: 'this',
  };

  return config;
};
