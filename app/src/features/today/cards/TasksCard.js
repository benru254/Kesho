// Today's 1–3 important tasks.
// One of them is THE ONE THING (gold): the task that makes the day count. Tap ☆ to choose another.
// ▶ Focus starts a focus timer on a task. Unfinished tasks from the last day can be brought over or let go.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Tappable from '../../../ui/Tappable';
import { colors, space, radius, font } from '../../../core/theme';
import { emit } from '../../../core/bus';
import { success } from '../../../core/haptics';
import { celebrate, oneOf } from '../../../core/celebrate';
import {
  MAX_TASKS, addTask, toggleTask, deleteTask, setOne, carryOver, dismissCarryOver,
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

  const toggle = async (t) => {
    const nowDone = !t.done;
    await toggleTask(t.id, nowDone);
    if (nowDone) {
      const finishesAll = doneCount + 1 === tasks.length;
      if (finishesAll && tasks.length > 1) {
        celebrate({ emoji: '🔥', title: 'All done.', text: 'Every important thing, finished. That is rare.' });
      } else if (t.is_one) {
        celebrate({ emoji: '⭐', title: 'The one thing is done.', text: oneOf(['The day is already won.', 'Everything else today is bonus.']) });
      } else {
        success();
      }
    }
    onChanged();
  };

  return (
    <Card
      title="Today's important things"
      subtitle={tasks.length ? `${doneCount} of ${tasks.length} done` : 'Pick 1–3. Not 10. Start with the ONE that makes today count.'}
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
        <View key={t.id} style={[styles.task, !!t.is_one && styles.taskOne]}>
          {!!t.is_one && <Text style={styles.oneLabel}>★ THE ONE THING</Text>}
          <View style={styles.taskRow}>
            <Tappable onPress={() => toggle(t)} haptic={false} style={[styles.check, !!t.done && styles.checkOn]}>
              <Text style={styles.checkMark}>{t.done ? '✓' : ''}</Text>
            </Tappable>
            <Text style={[styles.taskText, !!t.done && styles.taskDone]}>{t.title}</Text>
            {!t.is_one && !t.done && (
              <Pressable onPress={async () => { await setOne(t.id); onChanged(); }} hitSlop={10}>
                <Text style={styles.star}>☆</Text>
              </Pressable>
            )}
            <Pressable onPress={async () => { await deleteTask(t.id); onChanged(); }} hitSlop={10}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
          {!t.done && (
            <Tappable
              onPress={() => emit('focus-start', { taskId: t.id, title: t.title })}
              style={[styles.focusBtn, !!t.is_one && styles.focusBtnOne]}
            >
              <Text style={[styles.focusText, !!t.is_one && styles.focusTextOne]}>▶ Focus on this</Text>
            </Tappable>
          )}
        </View>
      ))}

      {!full ? (
        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={tasks.length === 0 ? 'What ONE thing makes today count?' : 'Another important thing (optional)'}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  carryBox: { backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: space.md, marginBottom: space.md },
  carryText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginBottom: space.sm },
  carryRow: { flexDirection: 'row', gap: space.sm },
  task: { paddingVertical: space.sm },
  taskOne: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: 'rgba(245, 184, 65, 0.06)',
  },
  oneLabel: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 1.2, marginBottom: space.sm },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  check: {
    width: 30, height: 30, borderRadius: 8,
    borderWidth: 2, borderColor: colors.muted,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.good, borderColor: colors.good },
  checkMark: { color: colors.bg, backgroundColor: 'transparent', fontWeight: '900', fontSize: 17 },
  taskText: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 16 },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  star: { color: colors.muted, backgroundColor: 'transparent', fontSize: 20, paddingHorizontal: space.xs },
  remove: { color: colors.muted, backgroundColor: 'transparent', fontSize: 16, paddingHorizontal: space.xs },
  focusBtn: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    marginLeft: 42,
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  focusBtnOne: { backgroundColor: colors.accent, borderColor: colors.accent },
  focusText: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm, fontWeight: '700' },
  focusTextOne: { color: colors.accentText },
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
});
