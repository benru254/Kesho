// Morning check-in: mood, hours slept, sleep quality. One tap each, ~30 seconds.

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ChoiceRow from '../../../ui/ChoiceRow';
import Button from '../../../ui/Button';
import { colors, space } from '../../../core/theme';
import { finishMorning } from '../today.service';

const MOODS = [
  { value: 1, label: '😞' },
  { value: 2, label: '😕' },
  { value: 3, label: '😐' },
  { value: 4, label: '🙂' },
  { value: 5, label: '😄' },
];
const SLEEP_HOURS = [4, 5, 6, 7, 8, 9].map((h) => ({ value: h, label: h === 9 ? '9+' : `${h}` }));
const SLEEP_QUALITY = [
  { value: 1, label: 'Bad' },
  { value: 2, label: 'Okay' },
  { value: 3, label: 'Good' },
];

export default function MorningCard({ date, day, onSaved }) {
  const done = !!(day && day.morning_done_at);
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState(day?.mood ?? null);
  const [hours, setHours] = useState(day?.sleep_hours ?? null);
  const [quality, setQuality] = useState(day?.sleep_quality ?? null);

  if (done && !editing) {
    const moodLabel = MOODS.find((m) => m.value === day.mood)?.label ?? '–';
    const q = SLEEP_QUALITY.find((s) => s.value === day.sleep_quality)?.label ?? '–';
    return (
      <Card title="Morning check-in" done>
        <Text style={styles.summary}>
          Mood {moodLabel}   ·   Slept {day.sleep_hours ?? '–'}h ({q})
        </Text>
        <Button label="Edit" variant="ghost" onPress={() => setEditing(true)} style={styles.editBtn} />
      </Card>
    );
  }

  const save = async () => {
    await finishMorning(date, { mood, sleep_hours: hours, sleep_quality: quality });
    setEditing(false);
    onSaved();
  };

  return (
    <Card title="Morning check-in" subtitle="30 seconds. Be honest — nobody sees this but you.">
      <ChoiceRow label="How do you feel?" options={MOODS} value={mood} onChange={setMood} />
      <ChoiceRow label="Hours slept" options={SLEEP_HOURS} value={hours} onChange={setHours} />
      <ChoiceRow label="Sleep quality" options={SLEEP_QUALITY} value={quality} onChange={setQuality} />
      <View>
        <Button label="Done" onPress={save} disabled={mood === null} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  editBtn: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
});
