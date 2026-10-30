// This month's flow: In / Out / Put aside, spending per bucket, and honest warnings
// (spent more than earned, wants too high).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import { colors, space, radius } from '../../../core/theme';
import { kes } from '../../../core/format';

export default function SpendCard({ summary }) {
  const { spend, totalIn, totalOut, totalAside, left } = summary;
  const wants = spend.find((s) => s.key === 'wants');
  const wantsShare = totalOut > 0 && wants ? Math.round((wants.total / totalOut) * 100) : 0;

  return (
    <Card title="This month's flow">
      <View style={styles.grid}>
        <Box label="In" value={kes(totalIn)} color={colors.good} />
        <Box label="Out" value={kes(totalOut)} color={colors.text} />
        <Box label="Put aside" value={kes(totalAside)} color={colors.accent} />
      </View>

      {spend.map((s) => (
        <View key={s.id} style={styles.row}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.amount}>{kes(s.total)}</Text>
        </View>
      ))}

      <View style={[styles.row, styles.leftRow]}>
        <Text style={styles.leftLabel}>Left (In − Out − Aside)</Text>
        <Text style={[styles.leftValue, left < 0 && styles.neg]}>{kes(left)}</Text>
      </View>
      <Text style={styles.small}>This is this month’s flow, not your M-Pesa balance.</Text>

      {left < 0 && totalIn > 0 && (
        <Text style={styles.warn}>
          ⚠️ You used {kes(-left)} more than you earned this month. It came from old money or debt.
        </Text>
      )}
      {wantsShare >= 30 && (
        <Text style={styles.warn}>
          ⚠️ Wants are {wantsShare}% of your spending. Under 20% is where savings start to grow.
        </Text>
      )}
    </Card>
  );
}

function Box({ label, value, color }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={[styles.boxValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  box: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: space.sm },
  boxLabel: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  boxValue: { backgroundColor: 'transparent', fontSize: 15, fontWeight: '800', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.xs },
  name: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  leftRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: space.sm, paddingTop: space.sm },
  leftLabel: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  leftValue: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '800' },
  neg: { color: colors.warn },
  small: { color: colors.placeholder, backgroundColor: 'transparent', fontSize: 11, marginTop: 2 },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
});
