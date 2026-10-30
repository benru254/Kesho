// The Money tab: quick In / Out / Aside buttons, M-Pesa sorting, goal, income, spending, pots, recent entries.
// Reads new M-Pesa SMS every time it opens (installed app only).

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { monthKey, monthName, monthStatus } from './money.goal';
import {
  getSources, getBuckets, getMonthSummary, getPots, getRecent, getGoal,
} from './money.service';
import EntrySheet from './EntrySheet';
import GoalCard from './cards/GoalCard';
import IncomeCard from './cards/IncomeCard';
import SpendCard from './cards/SpendCard';
import PotsCard from './cards/PotsCard';
import RecentCard from './cards/RecentCard';
import MpesaCard from './cards/MpesaCard';
import { syncFromPhone, getMpesaState } from './mpesa/mpesa.service';

const ACTIONS = [
  { mode: 'in', label: '+ In', color: colors.good },
  { mode: 'out', label: '− Out', color: colors.text },
  { mode: 'aside', label: '⇢ Aside', color: colors.accent },
];

export default function MoneyScreen() {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState(null);

  const [sync, setSync] = useState(null);

  const load = useCallback(async () => {
    const month = monthKey();
    const [sources, buckets, summary, pots, recent, goal, mpesa] = await Promise.all([
      getSources(), getBuckets(), getMonthSummary(month), getPots(), getRecent(month), getGoal(),
      getMpesaState(month),
    ]);
    const status = monthStatus(goal, month, summary.totalIn, new Date().getDate());
    setData({ month, sources, buckets, summary, pots, recent, goal, status, mpesa });
  }, []);

  // Read new M-Pesa SMS (installed app only), then refresh the screen.
  const syncAndLoad = useCallback(async () => {
    try {
      setSync(await syncFromPhone());
    } catch (e) {
      console.warn('[mpesa] sync failed', e);
    }
    await load();
  }, [load]);

  useEffect(() => {
    load();
    syncAndLoad();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') syncAndLoad(); });
    return () => sub.remove();
  }, [load, syncAndLoad]);

  if (!data) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Money</Text>
        <Text style={styles.sub}>{monthName(data.month)} · personal only</Text>

        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Pressable
              key={a.mode}
              onPress={() => setMode(a.mode)}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={[styles.actionText, { color: a.color }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <MpesaCard
          sync={sync}
          state={data.mpesa}
          buckets={data.buckets}
          sources={data.sources}
          onChanged={syncAndLoad}
        />
        <GoalCard goal={data.goal} status={data.status} totalInLast={data.summary.totalInLast} onChanged={load} />
        <IncomeCard summary={data.summary} />
        <SpendCard summary={data.summary} />
        <PotsCard pots={data.pots} onWithdraw={() => setMode('withdraw')} />
        <RecentCard rows={data.recent} onChanged={load} />
      </ScrollView>

      <EntrySheet
        mode={mode}
        visible={!!mode}
        onClose={() => setMode(null)}
        onSaved={load}
        sources={data.sources}
        buckets={data.buckets}
        summary={data.summary}
        pots={data.pots}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  h1: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  actions: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  action: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  actionText: { backgroundColor: 'transparent', fontSize: 17, fontWeight: '800' },
});
