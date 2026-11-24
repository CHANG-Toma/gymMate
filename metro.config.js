const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const emptyModule = path.resolve(__dirname, 'stubs/empty-module.js');
const workletsStub = path.resolve(__dirname, 'stubs/worklets-stub.js');

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Crash connu Expo Go SDK 57 : init worklets / @expo/ui (SIGSEGV).
  if (
    moduleName === 'react-native-worklets' ||
    moduleName.startsWith('react-native-worklets/')
  ) {
    return { type: 'sourceFile', filePath: workletsStub };
  }
  if (moduleName === '@expo/ui' || moduleName.startsWith('@expo/ui/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
