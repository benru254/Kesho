// Bridge to the phone's SMS inbox (Android only, installed Kesho app only).
// In Expo Go the native part does not exist — isAvailable() returns false and nothing crashes.

import { Platform, PermissionsAndroid, Linking } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

const Native = Platform.OS === 'android' ? requireOptionalNativeModule('KeshoSms') : null;

export function isAvailable() {
  return !!Native;
}

export async function hasPermission() {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
}

// Returns true if allowed. If Android says "never ask again", opens the app settings page.
export async function requestPermission() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
    title: 'Let Kesho read M-Pesa messages',
    message: 'Kesho reads only messages from MPESA, to record your money automatically. Nothing leaves your phone.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    await Linking.openSettings();
    return false;
  }
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

// [{ id, address, body, date(ms) }], oldest first
export async function readMpesaInbox(sinceMs, limit = 3000) {
  if (!Native) return [];
  return Native.readMpesaInbox(sinceMs, limit);
}
