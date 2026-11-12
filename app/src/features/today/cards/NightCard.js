// Night check-in: stress 1–5, one thing that mattered, and TOMORROW'S ONE THING.
// "Tomorrow starts tonight": deciding now means the morning needs no willpower.

import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ChoiceRow from '../../../ui/ChoiceRow';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import { celebrate } from '../../../core/celebrate';
import { finishNight, setTomorrowOne } from '../today.service';

const STRESS = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}` }));

export default function NightCard({ date, day, dayNumber, tomorrowOne, onSaved }) {
  const done = !!(day && day.night_done_at);
  const [editing, setEditing] = useState(false);
  const [stress, setStress] = useState(day?.stress ?? null);
  const [note, setNote] = useState(day?.win_note ?? '');
  const [tomorrow, setTomorrow] = useState(tomorrowOne ?? '');

  if (done && !editing) {
    return (
      <Card title="Night check-in" done>
        <Text style={styles.summary}>Stress {day.stress}/5</Text>
        {day.win_note ? <Text style={styles.note}>“{day.win_note}”</Text> : null}
        {tomorrowOne ? <Text style={styles.tomorrow}>Tomorrow’s one thing: {tomorrowOne}</Text> : null}
        <Button label="Edit" variant="ghost" onPress={() => setEditing(true)} style={styles.editBtn} />
      </Card>
    );
  }

  const save = async () => {
    const first = !done;
    await finishNight(date, { stress, win_note: note.trim() });
    await setTomorrowOne(date, tomorrow);
    setEditing(false);
    if (first) {
      celebrate({
        emoji: '🌙',
        title: `Day ${dayNumber} closed.`,
        text: tomorrow.trim() ? 'Tomorrow is already planned. Phone down, rest.' : 'One more star in your sky. Rest.',
      });
    }
    onSaved();
  };

  return (
    <Card title="Night check-in" subtitle="Close the day, plan one thing, then rest.">
      <ChoiceRow label="Stress today (1 = calm, 5 = heavy)" options={STRESS} value={stress} onChange={setStress} />
      <Text style={styles.label}>One thing that mattered today (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="A win, however small"
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        maxLength={140}
      />
      <Text style={styles.labelGold}>★ Tomorrow’s ONE thing</Text>
      <TextInput
        value={tomorrow}
        onChangeText={setTomorrow}
        placeholder="If only one thing gets done tomorrow, it is…"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, styles.inputGold]}
        maxLength={80}
      />
      <Button label="Close the day" onPress={save} disabled={stress === null} />
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  note: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: space.xs, fontStyle: 'italic' },
  tomorrow: { color: colors.accent, backgroundColor: 'transparent', fontSize: 14, marginTop: space.sm, fontWeight: '700' },
  editBtn: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.sm },
  labelGold: { color: colors.accent, backgroundColor: 'transparent', fontSize: 13, fontWeight: '800', marginBottom: space.sm },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 15,
    marginBottom: space.md,
  },
  inputGold: { borderColor: colors.accent },
});
