// Settings → Backup. Save everything to Google Drive, restore from a file, undo a restore.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { colors, space } from '../../core/theme';
import { on } from '../../core/bus';
import { validateBackup } from './backup.format';
import {
  exportData, restoreData, markBackedUp, getBackupStatus, currentSchemaVersion,
} from './backup.service';
import {
  shareBackup, pickBackupText, saveSafetyCopy, readSafetyCopy, hasSafetyCopy,
} from './backup.files';

export default function BackupSection() {
  const [status, setStatus] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus(await getBackupStatus());
    setCanUndo(await hasSafetyCopy().catch(() => false));
  }, []);

  useEffect(() => {
    load();
    const off1 = on('backup-changed', load);
    const off2 = on('restored', load);
    return () => { off1(); off2(); };
  }, [load]);

  const guard = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Something went wrong', String(e.message || e));
    } finally {
      setBusy(false);
      load();
    }
  };

  const backup = () => guard(async () => {
    const payload = await exportData();
    await shareBackup(payload);
    await markBackedUp();
  });

  // Shared by "Restore" and "Undo last restore".
  const restoreFromText = async (text, label) => {
    const check = validateBackup(text, await currentSchemaVersion());
    if (!check.ok) {
      Alert.alert('Cannot restore', check.error);
      return;
    }
    const s = check.summary;
    const when = s.exportedAt ? new Date(s.exportedAt).toLocaleString() : 'unknown date';
    Alert.alert(
      `${label}?`,
      `This REPLACES all Kesho data on this phone with the backup from ${when}:\n` +
        `${s.days} days · ${s.tasks} tasks · ${s.money} money entries.\n\n` +
        'A safety copy of your current data is kept, so you can undo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace my data',
          style: 'destructive',
          onPress: () => guard(async () => {
            await saveSafetyCopy(await exportData());
            await restoreData(check.payload);
            Alert.alert('Restored ✓', 'Your data is back.');
          }),
        },
      ]
    );
  };

  const restore = () => guard(async () => {
    const text = await pickBackupText();
    if (text) await restoreFromText(text, 'Restore this backup');
  });

  const undo = () => guard(async () => {
    const text = await readSafetyCopy();
    if (text) await restoreFromText(text, 'Undo the last restore');
  });

  if (!status) return null;

  const ageText = status.last
    ? status.ageDays === 0 ? 'today' : `${status.ageDays} day${status.ageDays === 1 ? '' : 's'} ago`
    : 'never';

  return (
    <Card title="💾 Backup" subtitle="If you lose this phone, a backup is the only way to get your data back.">
      <Text style={[styles.status, status.overdue && styles.overdue]}>
        Last backup: {ageText}{status.overdue ? ' — time for a new one' : ''}
      </Text>
      <Button label={busy ? 'Working…' : 'Back up to Google Drive'} onPress={backup} disabled={busy} style={styles.mt} />
      <Text style={styles.hint}>
        In the menu that opens, choose “Drive” → pick a folder (e.g. “Kesho backups”) → Save.
        Kesho can’t see Drive, so check the file is there the first time.
      </Text>

      <View style={styles.divider} />
      <Button label="Restore from a backup file" variant="ghost" onPress={restore} disabled={busy} />
      {canUndo && (
        <Button label="Undo the last restore" variant="ghost" onPress={undo} disabled={busy} style={styles.mtSm} />
      )}
      <Text style={styles.hint}>
        Backups hold your private life data. Keep them in YOUR Google Drive only — never on GitHub or WhatsApp.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  status: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  overdue: { color: colors.warn },
  hint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.sm, lineHeight: 18 },
  mt: { marginTop: space.md },
  mtSm: { marginTop: space.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.lg },
});
