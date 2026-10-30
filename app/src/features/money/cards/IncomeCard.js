// Where your money comes from — and which source is growing.
// This card is the real 10x tool: put more time into the source that grows fastest.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ProgressBar from '../../../ui/ProgressBar';
import { colors, space } from '../../../core/theme';
import { kes } from '../../../core/format';

export default function IncomeCard({ summary }) {
  const { income, totalIn } = summary;

  if (income.length === 0) {
    return (
      <Card title="Income sources">
        <Text style={styles.empty}>No income logged yet. Tap “+ Money in” when money becomes yours.</Text>
      </Card>
    );
  }

  const fastest = findFastest(income);
  const top = income[0];
  const topShare = totalIn > 0 ? Math.round((top.total / totalIn) * 100) : 0;

  return (
    <Card title="Income sources" subtitle="This month vs last month">
      {income.map((s) => {
        const share = totalIn > 0 ? Math.round((s.total / totalIn) * 100) : 0;
        return (
          <View key={s.id} style={styles.item}>
            <View style={styles.row}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.amount}>{kes(s.total)}</Text>
            </View>
            <ProgressBar percent={share} color={colors.good} height={6} />
            <Text style={styles.change}>{changeText(s)}</Text>
          </View>
        );
      })}

      {fastest && (
        <Text style={styles.insight}>
          📈 Fastest growing: {fastest.name} ({fastest.label}). Feed it more of your time.
        </Text>
      )}
      {income.length >= 1 && topShare >= 80 && totalIn > 0 && (
        <Text style={styles.warn}>
          ⚠️ {topShare}% of your income comes from one source. If it has a bad month, so do you. Build a second one.
        </Text>
      )}
    </Card>
  );
}

function changeText(s) {
  if (s.last === 0 && s.total > 0) return 'New this month';
  if (s.last === 0) return '';
  const pct = Math.round(((s.total - s.last) / s.last) * 100);
  if (pct === 0) return `Same as last month (${kes(s.last)})`;
  return `${pct > 0 ? '+' : ''}${pct}% vs last month (${kes(s.last)})`;
}

function findFastest(income) {
  let best = null;
  for (const s of income) {
    if (s.last <= 0 || s.total <= s.last) continue;
    const growth = (s.total - s.last) / s.last;
    if (!best || growth > best.growth) {
      best = { name: s.name, growth, label: `+${Math.round(growth * 100)}%` };
    }
  }
  return best;
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  item: { marginBottom: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xs },
  name: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, flex: 1 },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  change: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: 2 },
  insight: { color: colors.good, backgroundColor: 'transparent', fontSize: 13, marginTop: space.xs, lineHeight: 19 },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
});
