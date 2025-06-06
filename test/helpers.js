export function createLocalStorageMock() {
  let store = {};
  return {
    setItem(key, value) { store[key] = String(value); },
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; },
    get store() { return store; }
  };
}
