// A strip above every tab when a newer Kesho is on GitHub. "Get it" downloads the APK; "Later" hides it
// until an even newer version comes out.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { on } from '../../core/bus';
import { getUpdateState, download, dismiss } from './update.service';

export default function UpdateBanner() {
  const [state, setState] = useState(null);
  const load = useCallback(async () => setState(await getUpdateState().catch(() => null)), []);

  useEffect(() => {
    load();
    return on('update-changed', setState);
  }, [load]);

  if (!state || !state.showBanner) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.text} numberOfLines={2}>
        ✨ Kesho {state.release.version} is ready. Your data stays when you update.
      </Text>
      <Pressable onPress={() => download(state.release)} style={styles.btn}>
        <Text style={styles.btnText}>Get it</Text>
      </Pressable>
      <Pressable onPress={() => dismiss(state.release.build)} hitSlop={8}>
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
    borderLeftColor: colors.good,
    borderRadius: radius.md,
    marginHorizontal: space.lg,
    marginTop: space.sm,
    padding: space.sm,
  },
  text: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 13 },
  btn: { backgroundColor: colors.good, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: space.md },
  btnText: { color: colors.bg, backgroundColor: 'transparent', fontWeight: '800', fontSize: 13 },
  later: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13 },
});
