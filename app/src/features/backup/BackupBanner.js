// A thin banner shown above every tab when the backup is 7+ days old (or never made).
// "Later" hides it until tomorrow. Built for lazy days: one tap backs up.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { on } from '../../core/bus';
import { exportData, markBackedUp, getBackupStatus, snoozeBanner } from './backup.service';
import { shareBackup } from './backup.files';

export default function BackupBanner() {
  const [status, setStatus] = useState(null);

  const load = useCallback(async () => {
    setStatus(await getBackupStatus().catch(() => null));
  }, []);

  useEffect(() => {
    load();
    const off1 = on('backup-changed', load);
    const off2 = on('restored', load);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => { off1(); off2(); sub.remove(); };
  }, [load]);

  if (!status || !status.overdue || status.snoozed) return null;

  const backup = async () => {
    try {
      await shareBackup(await exportData());
      await markBackedUp();
    } catch (e) {
      Alert.alert('Backup failed', String(e.message || e));
    }
  };

  return (
    <View style={styles.bar}>
      <Text style={styles.text} numberOfLines={2}>
        💾 {status.last ? `Last backup ${status.ageDays} days ago.` : 'No backup yet.'} Lose the phone = lose everything.
      </Text>
      <Pressable onPress={backup} style={styles.btn}>
        <Text style={styles.btnText}>Back up</Text>
      </Pressable>
      <Pressable onPress={snoozeBanner} hitSlop={8}>
        <Text style={styles.later}>Later</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.warn,
    borderRadius: radius.md,
    marginHorizontal: space.lg,
    marginTop: space.sm,
    padding: space.sm,
  },
  text: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 13 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: space.md },
  btnText: { color: colors.accentText, backgroundColor: 'transparent', fontWeight: '800', fontSize: 13 },
  later: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13 },
});
