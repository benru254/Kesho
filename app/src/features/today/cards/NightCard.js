// Night check-in: stress 1–5 and one thing that mattered. Closes the day.

import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ChoiceRow from '../../../ui/ChoiceRow';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import { finishNight } from '../today.service';

const STRESS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

export default function NightCard({ date, day, onSaved }) {
  const done = !!(day && day.night_done_at);
  const [editing, setEditing] = useState(false);
  const [stress, setStress] = useState(day?.stress ?? null);
  const [note, setNote] = useState(day?.win_note ?? '');

  if (done && !editing) {
    return (
      <Card title="Night check-in" done>
        <Text style={styles.summary}>Stress {day.stress}/5</Text>
        {day.win_note ? <Text style={styles.note}>“{day.win_note}”</Text> : null}
        <Button label="Edit" variant="ghost" onPress={() => setEditing(true)} style={styles.editBtn} />
      </Card>
    );
  }

  const save = async () => {
    await finishNight(date, { stress, win_note: note.trim() });
    setEditing(false);
    onSaved();
  };

  return (
    <Card title="Night check-in" subtitle="Before sleep. Close the day, then rest.">
      <ChoiceRow label="Stress today (1 = calm, 5 = heavy)" options={STRESS} value={stress} onChange={setStress} />
      <Text style={styles.label}>One thing that mattered today (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Finished the Gas Hub fix"
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        maxLength={140}
      />
      <Button label="Close the day" onPress={save} disabled={stress === null} />
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  note: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: space.xs, fontStyle: 'italic' },
  editBtn: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.sm },
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
});
