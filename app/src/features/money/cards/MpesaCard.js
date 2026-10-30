// M-Pesa auto-read: shows payments waiting to be sorted. One tap each.

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import { kes } from '../../../core/format';
import { keyToDate } from '../../../core/dates';
import { requestPermission } from '../mpesa/mpesa.native';
import { sortItem, skipItem, sortAllSuggested } from '../mpesa/mpesa.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOW_MAX = 8;

export default function MpesaCard({ sync, state, buckets, sources, onChanged }) {
  const [busy, setBusy] = useState(false);

  if (!sync) return null;

  if (!sync.available) {
    return (
      <Card title="📩 M-Pesa auto-read">
        <Text style={styles.muted}>Works in the installed Kesho app (APK), not in Expo Go.</Text>
      </Card>
    );
  }

  if (!sync.permission) {
    return (
      <Card title="📩 Read M-Pesa automatically?" subtitle="No more typing every payment">
        <Text style={styles.body}>
          Kesho reads only messages from MPESA, on this phone. Nothing is uploaded.{'\n'}
          Shop till payments are kept separate — they are business, not your income.
        </Text>
        <Button
          label="Allow reading M-Pesa SMS"
          onPress={async () => { await requestPermission(); onChanged(); }}
          style={styles.mt}
        />
      </Card>
    );
  }

  if (!state) return null;

  const need = buckets.find((b) => b.key === 'needs');
  const want = buckets.find((b) => b.key === 'wants');
  const suggested = state.pending.filter((p) => p.suggestion).length;
  const shown = state.pending.slice(0, SHOW_MAX);

  const act = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      await onChanged();
    } catch (e) {
      Alert.alert('Not saved', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="📩 M-Pesa"
      subtitle={state.balance ? `Balance ${kes(state.balance.amount)} · from SMS ${state.balance.date} ${state.balance.time}` : 'Reading your M-Pesa messages'}
      done={state.pending.length === 0}
    >
      {state.pending.length === 0 ? (
        <Text style={styles.good}>All M-Pesa payments sorted ✓</Text>
      ) : (
        <Text style={styles.body}>{state.pending.length} to sort. Tap what each one was.</Text>
      )}

      {suggested > 0 && (
        <Button
          label={`Sort ${suggested} like last time`}
          onPress={() => act(sortAllSuggested)}
          disabled={busy}
          style={styles.mt}
        />
      )}

      {shown.map((item) => {
        const d = item.date ? keyToDate(item.date) : null;
        const s = item.suggestion || {};
        const isOut = item.direction === 'out';
        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.row}>
              <Text style={[styles.amount, { color: isOut ? colors.text : colors.good }]}>
                {isOut ? '−' : '+'}{kes(item.amount)}
              </Text>
              <Text style={styles.when}>{d ? `${DAYS[d.getDay()]} ${d.getDate()}` : ''} {item.time || ''}</Text>
            </View>
            <Text style={styles.party} numberOfLines={1}>
              {item.counterparty || item.kind}{item.fee > 0 ? `  ·  fee ${kes(item.fee)}` : ''}
            </Text>
            <View style={styles.chips}>
              {isOut ? (
                <>
                  {need && <Chip label="Need" hint={s.bucketId === need.id} onPress={() => act(() => sortItem(item.id, { bucketId: need.id }))} />}
                  {want && <Chip label="Want" hint={s.bucketId === want.id} onPress={() => act(() => sortItem(item.id, { bucketId: want.id }))} />}
                  <Chip label="Not spending" hint={!!s.skip} onPress={() => act(() => skipItem(item.id))} />
                </>
              ) : (
                <>
                  {sources.map((src) => (
                    <Chip
                      key={src.id}
                      label={src.name}
                      hint={s.sourceId === src.id}
                      onPress={() => act(() => sortItem(item.id, { sourceId: src.id }))}
                    />
                  ))}
                  <Chip label="Not income" hint={!!s.skip} onPress={() => act(() => skipItem(item.id))} />
                </>
              )}
            </View>
          </View>
        );
      })}
      {state.pending.length > SHOW_MAX && (
        <Text style={styles.muted}>+{state.pending.length - SHOW_MAX} more below these</Text>
      )}

      <View style={styles.footer}>
        {state.business.count > 0 && (
          <Text style={styles.muted}>
            🏪 Shop till this month: {kes(state.business.total)} ({state.business.count} payments) — business, not counted as your income.
          </Text>
        )}
        {state.feesThisMonth > 0 && (
          <Text style={styles.muted}>M-Pesa fees this month: {kes(state.feesThisMonth)}</Text>
        )}
        {state.unknown.count > 0 && (
          <Text style={styles.warn}>
            {state.unknown.count} M-Pesa message(s) Kesho couldn’t read yet. Send one to Claude: “{(state.unknown.samples[0] || '').slice(0, 90)}…”
          </Text>
        )}
      </View>
    </Card>
  );
}

function Chip({ label, hint, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, hint && styles.chipHint, pressed && styles.pressed]}>
      <Text style={[styles.chipText, hint && styles.chipTextHint]}>{hint ? `★ ${label}` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs, lineHeight: 18 },
  good: { color: colors.good, backgroundColor: 'transparent', fontSize: 14, fontWeight: '700' },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs, lineHeight: 18 },
  mt: { marginTop: space.md },
  item: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: space.md, paddingTop: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  amount: { backgroundColor: 'transparent', fontSize: 17, fontWeight: '800' },
  when: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  party: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipHint: { borderColor: colors.accent },
  chipText: { color: colors.text, backgroundColor: 'transparent', fontSize: 13 },
  chipTextHint: { color: colors.accent, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  footer: { marginTop: space.md },
});
