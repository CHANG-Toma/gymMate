const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Expo SDK 57 + firebase@12 : pas besoin de resolveRequest custom
// (un override cassait la résolution web de @expo/metro-runtime).

module.exports = config;
