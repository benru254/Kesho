// The income goal (e.g. 100k/month by Jan 2028): this month's target on the growth path,
// progress, honest verdict (hit / on track / behind) and an inline goal editor.

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import ProgressBar from '../../../ui/ProgressBar';
import { colors, space, radius } from '../../../core/theme';
import { kes, parseAmount } from '../../../core/format';
import { monthName, monthlyGrowthNeeded, monthsBetween, monthKey } from '../money.goal';
import { saveGoal } from '../money.service';

const VERDICT = {
  hit: { color: colors.good, text: 'Target hit this month. 🔥' },
  on_track: { color: colors.good, text: 'On track — if money keeps coming at this speed.' },
  behind: { color: colors.warn, text: 'Behind.' },
};

export default function GoalCard({ goal, status, totalInLast, onChanged }) {
  const [editing, setEditing] = useState(false);
  const growth = Math.round(monthlyGrowthNeeded(goal) * 1000) / 10;
  const v = VERDICT[status.verdict];
  const monthsLeft = monthsBetween(monthKey(), goal.goalMonth);

  if (editing) {
    return <GoalEdit goal={goal} onDone={() => { setEditing(false); onChanged(); }} />;
  }

  return (
    <Card
      title={`Goal: ${kes(goal.goalAmount)}/month by ${monthName(goal.goalMonth)}`}
      subtitle={`${monthsLeft} months left · needs +${growth}% income every month`}
    >
      <View style={styles.row}>
        <Text style={styles.earned}>{kes(status.earned)}</Text>
        <Text style={styles.of}>of {kes(status.target)} this month</Text>
      </View>
      <ProgressBar percent={status.percent} color={v.color} />
      <Text style={[styles.verdict, { color: v.color }]}>
        {v.text}
        {status.verdict === 'behind' ? ` Need ${kes(status.gap)} more in ${status.daysLeft} days.` : ''}
      </Text>
      <Text style={styles.small}>
        At this speed: ~{kes(status.pace)} this month · Last month: {kes(totalInLast)}
      </Text>
      <Button label="Edit goal" variant="ghost" onPress={() => setEditing(true)} style={styles.edit} />
    </Card>
  );
}

function GoalEdit({ goal, onDone }) {
  const [start, setStart] = useState(String(goal.startAmount));
  const [target, setTarget] = useState(String(goal.goalAmount));
  const [month, setMonth] = useState(goal.goalMonth);

  const save = async () => {
    const s = parseAmount(start);
    const t = parseAmount(target);
    if (!/^\d{4}-\d{2}$/.test(month) || monthsBetween(goal.startMonth, month) < 1) {
      Alert.alert('Check the date', 'Use the format YYYY-MM, after the start month.');
      return;
    }
    if (s <= 0 || t <= s) {
      Alert.alert('Check the amounts', 'The goal must be bigger than where you start.');
      return;
    }
    await saveGoal({ ...goal, startAmount: s, goalAmount: t, goalMonth: month });
    onDone();
  };

  return (
    <Card title="Edit goal" subtitle={`Path starts ${monthName(goal.startMonth)}`}>
      <Field label="Monthly income at start (KES)" value={start} onChange={setStart} numeric />
      <Field label="Monthly income goal (KES)" value={target} onChange={setTarget} numeric />
      <Field label="Reach it by (YYYY-MM)" value={month} onChange={setMonth} />
      <Button label="Save goal" onPress={save} style={styles.mt} />
      <Button label="Cancel" variant="ghost" onPress={onDone} style={styles.mtSm} />
    </Card>
  );
}

function Field({ label, value, onChange, numeric }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'number-pad' : 'default'}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginBottom: space.sm },
  earned: { color: colors.text, backgroundColor: 'transparent', fontSize: 26, fontWeight: '800' },
  of: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  verdict: { backgroundColor: 'transparent', fontSize: 14, fontWeight: '700', marginTop: space.sm },
  small: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs },
  edit: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  field: { marginBottom: space.md },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.xs },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 16,
  },
  mt: { marginTop: space.sm },
  mtSm: { marginTop: space.sm },
});
