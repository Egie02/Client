// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add security configuration for production builds
if (process.env.NODE_ENV === 'production') {
  // Enable minification and obfuscation for production builds
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      // Enable code obfuscation in production
      mangle: true,
      compress: true,
      output: {
        comments: false,
        beautify: false,
      },
    },
  };

  // Additional serializer options for production
  config.serializer = {
    ...config.serializer,
    createModuleIdFactory: () => (path) => {
      // Generate shorter, obfuscated module IDs in production
      const crypto = require('crypto');
      return crypto.createHash('md5').update(path).digest('hex').substr(0, 8);
    },
  };
}

module.exports = config;
