// This month's latest money entries. ✕ soft-deletes an entry (it stops counting, history stays).

import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import { colors, space } from '../../../core/theme';
import { kes } from '../../../core/format';
import { keyToDate } from '../../../core/dates';
import { deleteTx } from '../money.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecentCard({ rows, onChanged }) {
  if (rows.length === 0) return null;

  const remove = (r) => {
    Alert.alert('Delete this entry?', `${label(r)} · ${kes(Math.abs(r.amount))}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTx(r.id); onChanged(); } },
    ]);
  };

  return (
    <Card title="Recent" subtitle="This month">
      {rows.map((r) => {
        const look = style(r);
        const d = keyToDate(r.date);
        return (
          <View key={r.id} style={styles.row}>
            <Text style={styles.date}>{DAYS[d.getDay()]} {d.getDate()}</Text>
            <View style={styles.mid}>
              <Text style={styles.label} numberOfLines={1}>{label(r)}</Text>
              {r.note ? <Text style={styles.note} numberOfLines={1}>{r.note}</Text> : null}
            </View>
            <Text style={[styles.amount, { color: look.color }]}>{look.sign}{kes(Math.abs(r.amount))}</Text>
            <Pressable onPress={() => remove(r)} hitSlop={10}>
              <Text style={styles.x}>✕</Text>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

function label(r) {
  if (r.type === 'in') return r.source_name || 'Income';
  if (r.type === 'out') return r.bucket_name || 'Spending';
  return r.amount < 0 ? `Out of ${r.bucket_name}` : `Into ${r.bucket_name}`;
}

function style(r) {
  if (r.type === 'in') return { sign: '+', color: colors.good };
  if (r.type === 'out') return { sign: '−', color: colors.text };
  return r.amount < 0 ? { sign: '⇠', color: colors.warn } : { sign: '⇢', color: colors.accent };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm },
  date: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, width: 48 },
  mid: { flex: 1 },
  label: { color: colors.text, backgroundColor: 'transparent', fontSize: 14 },
  note: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  amount: { backgroundColor: 'transparent', fontSize: 14, fontWeight: '700' },
  x: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, paddingHorizontal: space.xs },
});
