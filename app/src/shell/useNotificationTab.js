// Tapping a Kesho notification opens the right tab.
// Notifications carry { tab: 'today' | 'money' | 'report' | 'settings' } in their data.

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function useNotificationTab(openTab) {
  useEffect(() => {
    const read = (response) => {
      const tab = response?.notification?.request?.content?.data?.tab;
      if (tab) openTab(tab);
    };
    // App was closed and opened by a tap:
    Notifications.getLastNotificationResponseAsync().then((r) => r && read(r)).catch(() => {});
    // App was open or in the background:
    const sub = Notifications.addNotificationResponseReceivedListener(read);
    return () => sub.remove();
  }, [openTab]);
}
