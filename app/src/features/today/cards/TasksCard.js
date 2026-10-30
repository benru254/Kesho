// Today's 1–3 important tasks. Unfinished tasks from the last day can be brought over or let go.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import {
  MAX_TASKS, addTask, toggleTask, deleteTask, carryOver, dismissCarryOver,
} from '../today.service';

export default function TasksCard({ date, tasks, carry, onChanged }) {
  const [text, setText] = useState('');
  const doneCount = tasks.filter((t) => t.done).length;
  const full = tasks.length >= MAX_TASKS;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const add = async () => {
    if (!text.trim()) return;
    await addTask(date, text);
    setText('');
    onChanged();
  };

  return (
    <Card
      title="Today's important things"
      subtitle={tasks.length ? `${doneCount} of ${tasks.length} done` : 'Pick 1–3. Not 10. Three is enough to change a life.'}
      done={allDone}
    >
      {carry.tasks.length > 0 && (
        <View style={styles.carryBox}>
          <Text style={styles.carryText}>
            {carry.tasks.length} unfinished from last time: {carry.tasks.map((t) => t.title).join(', ')}
          </Text>
          <View style={styles.carryRow}>
            <Button
              label="Bring to today"
              onPress={async () => { await carryOver(date, carry.tasks); onChanged(); }}
              style={styles.flex}
            />
            <Button
              label="Let go"
              variant="ghost"
              onPress={async () => { await dismissCarryOver(carry.tasks); onChanged(); }}
              style={styles.flex}
            />
          </View>
        </View>
      )}

      {tasks.map((t) => (
        <View key={t.id} style={styles.taskRow}>
          <Pressable
            onPress={async () => { await toggleTask(t.id, !t.done); onChanged(); }}
            style={[styles.check, t.done && styles.checkOn]}
          >
            <Text style={styles.checkMark}>{t.done ? '✓' : ''}</Text>
          </Pressable>
          <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
          <Pressable onPress={async () => { await deleteTask(t.id); onChanged(); }} hitSlop={10}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      {!full ? (
        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What matters most today?"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            onSubmitEditing={add}
            returnKeyType="done"
          />
          <Button label="Add" onPress={add} disabled={!text.trim()} />
        </View>
      ) : (
        !allDone && <Text style={styles.hint}>3 is the limit. Finish these before adding more.</Text>
      )}

      {allDone && <Text style={styles.win}>All done. That is a real win today. 🔥</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  carryBox: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  carryText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginBottom: space.sm },
  carryRow: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.md },
  check: {
    width: 28, height: 28, borderRadius: 6,
    borderWidth: 2, borderColor: colors.muted,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.good, borderColor: colors.good },
  checkMark: { color: colors.bg, backgroundColor: 'transparent', fontWeight: '900', fontSize: 16 },
  taskText: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 16 },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  remove: { color: colors.muted, backgroundColor: 'transparent', fontSize: 16, paddingHorizontal: space.xs },
  addRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, alignItems: 'center' },
  input: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 15,
  },
  hint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm },
  win: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700', marginTop: space.md },
});
