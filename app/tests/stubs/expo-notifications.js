// Test stand-in for expo-notifications: permission is "not granted", so nothing is ever scheduled.
export const AndroidImportance = { DEFAULT: 3, HIGH: 4 };
export const SchedulableTriggerInputTypes = { DATE: 'date', WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' };
export async function getPermissionsAsync() { return { status: 'denied', canAskAgain: false }; }
export async function requestPermissionsAsync() { return { status: 'denied', canAskAgain: false }; }
export async function setNotificationChannelAsync() {}
export async function scheduleNotificationAsync() {}
export async function cancelScheduledNotificationAsync() {}
export async function getAllScheduledNotificationsAsync() { return []; }
export function setNotificationHandler() {}
