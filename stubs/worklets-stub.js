/** Stub worklets pour Expo Go (évite SIGSEGV à l'init native). */
const noop = () => {};
const identity = (v) => v;

module.exports = {
  scheduleOnRN: (fn, ...args) => {
    if (typeof fn === 'function') return fn(...args);
  },
  runOnJS: identity,
  runOnUI: identity,
  createWorkletRuntime: noop,
  getUIRuntimeHolder: () => null,
};
