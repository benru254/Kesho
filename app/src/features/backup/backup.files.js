// Phone side of backups: write the file, open the share menu (→ Google Drive), pick a file to restore.
//
// Packages: expo-file-system (legacy API), expo-sharing, expo-document-picker.
// Kesho cannot see whether Drive actually saved the file — the screen tells Reuben to check Drive.

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { backupFileName } from './backup.format';

const SAFETY_FILE = 'kesho-before-restore.json';

// Writes the backup to a temporary file and opens Android's share menu. Returns true if the menu opened.
export async function shareBackup(payload) {
  const uri = `${FileSystem.cacheDirectory}${backupFileName()}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload));
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this phone.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save Kesho backup to Google Drive',
  });
  return true;
}

// Lets Reuben pick a backup file (from Drive or Downloads). Returns the text, or null if he cancelled.
export async function pickBackupText() {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets || res.assets.length === 0) return null;
  return FileSystem.readAsStringAsync(res.assets[0].uri);
}

// A copy of the data as it was just before a restore — so a wrong restore can be undone.
export async function saveSafetyCopy(payload) {
  await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}${SAFETY_FILE}`, JSON.stringify(payload));
}

export async function readSafetyCopy() {
  const uri = `${FileSystem.documentDirectory}${SAFETY_FILE}`;
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return null;
  return FileSystem.readAsStringAsync(uri);
}

export async function hasSafetyCopy() {
  const info = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${SAFETY_FILE}`);
  return info.exists;
}
