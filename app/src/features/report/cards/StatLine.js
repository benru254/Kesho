// One line of the report: label · value · change vs last week (green = better, orange = worse).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space } from '../../../core/theme';

// better: 'up' if a bigger number is good (sleep), 'down' if smaller is good (stress, wants).
export default function StatLine({ label, value, delta, better = 'up', unit = '' }) {
  let deltaText = null;
  let deltaColor = colors.muted;
  if (delta != null && delta !== 0) {
    const good = better === 'up' ? delta > 0 : delta < 0;
    deltaColor = good ? colors.good : colors.warn;
    deltaText = `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}${unit}`;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.delta, { color: deltaColor }]}>{deltaText || ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: space.xs },
  label: { flex: 1, color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  value: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  delta: { width: 64, textAlign: 'right', backgroundColor: 'transparent', fontSize: 12 },
});
