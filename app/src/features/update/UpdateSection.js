// Me tab → Updates: which version is installed, "Check for updates", and how updating works.

import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { colors, space, font } from '../../core/theme';
import { on } from '../../core/bus';
import { getUpdateState, checkForUpdate, download } from './update.service';

export default function UpdateSection() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => setState(await getUpdateState()), []);
  useEffect(() => {
    load();
    return on('update-changed', setState);
  }, [load]);

  const check = async () => {
    setBusy(true);
    setMessage('');
    const res = await checkForUpdate(true);
    setState(res);
    if (!res.ok) setMessage(res.error);
    else if (!res.release) setMessage('No version published on GitHub yet.');
    else if (!res.available) setMessage('You have the newest Kesho. ✓');
    setBusy(false);
  };

  if (!state) return null;
  const me = state.installed;
  const when = state.lastCheck ? new Date(state.lastCheck).toLocaleString() : 'never';

  return (
    <Card title="⬆️ Updates" subtitle="New versions come from GitHub. Your data stays when you update.">
      <Text style={styles.line}>
        Installed: {me.isKesho ? `Kesho ${me.version}` : 'test app (Expo Go) — updates only work in the installed Kesho'}
      </Text>
      <Text style={styles.small}>Last checked: {when}</Text>

      {state.available ? (
        <>
          <Text style={styles.good}>Kesho {state.release.version} is ready.</Text>
          <Button label={`Download ${state.release.version}`} onPress={() => download(state.release)} style={styles.mt} />
          <Text style={styles.small}>
            The file downloads in your browser. Open it and tap Install — it replaces the old Kesho and keeps everything.
          </Text>
        </>
      ) : (
        <Button label={busy ? 'Checking…' : 'Check for updates'} variant="ghost" onPress={check} disabled={busy} style={styles.mt} />
      )}
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  line: { color: colors.text, backgroundColor: 'transparent', fontSize: font.md },
  small: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.xs, marginTop: space.xs, lineHeight: 17 },
  good: { color: colors.good, backgroundColor: 'transparent', fontSize: font.md, fontWeight: '800', marginTop: space.md },
  msg: { color: colors.text, backgroundColor: 'transparent', fontSize: font.sm, marginTop: space.sm },
  mt: { marginTop: space.md },
});
