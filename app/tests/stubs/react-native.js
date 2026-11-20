// Test stand-in for react-native (only what services touch).
export const Platform = { OS: 'test' };
export const PermissionsAndroid = {};
export const Linking = { opened: [], async openURL(u) { this.opened.push(u); } };
export const AppState = { addEventListener: () => ({ remove() {} }) };
