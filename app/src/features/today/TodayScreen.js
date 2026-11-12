// The Today tab — the heart of Kesho.
// Top: the living sky (sun rises as you complete the day), your day number and Kesho's voice.
// Below: the four daily cards (morning check-in, important tasks, move, night check-in).

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, AppState } from 'react-native';
import Sky from '../../ui/Sky';
import { colors, space, radius, font, sky } from '../../core/theme';
import { on } from '../../core/bus';
import { getProfile } from '../../core/profile';
import { dateKey, prettyDate, greeting } from '../../core/dates';
import {
  getDay, getTasks, getCarryOverCandidates, getDayContext, movedDaysThisWeek,
  getTodayExtras, getTomorrowOne, toggleTask,
} from './today.service';
import { dayProgress } from './today.progress';
import { voiceLine } from './today.voice';
import MorningCard from './cards/MorningCard';
import TasksCard from './cards/TasksCard';
import MoveCard from './cards/MoveCard';
import NightCard from './cards/NightCard';

export default function TodayScreen() {
  const [date, setDate] = useState(dateKey());
  const [state, setState] = useState(null);

  const load = useCallback(async () => {
    const today = dateKey();
    setDate(today);
    const [day, tasks, carry, context, weekCount, extras, tomorrowOne, profile] = await Promise.all([
      getDay(today),
      getTasks(today),
      getCarryOverCandidates(today),
      getDayContext(today),
      movedDaysThisWeek(today),
      getTodayExtras(today),
      getTomorrowOne(today),
      getProfile(),
    ]);
    setState({ day, tasks, carry, context, weekCount, extras, tomorrowOne, profile });
  }, []);

  useEffect(() => {
    load();
    // Reload when you come back to the app (new day = fresh sky).
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    // A focus session ended: tick the task if you said it's finished, then refresh.
    const offFocus = on('focus-finished', async ({ taskId, taskDone }) => {
      if (taskId && taskDone) await toggleTask(taskId, true);
      load();
    });
    const offPause = on('pause-closed', load);
    const offProfile = on('profile-changed', load);
    return () => { sub.remove(); offFocus(); offPause(); offProfile(); };
  }, [load]);

  if (!state) return <View style={styles.screen} />;

  const { day, tasks, context, extras, profile } = state;
  const hour = new Date().getHours();
  const morningDone = !!(day && day.morning_done_at);
  const nightDone = !!(day && day.night_done_at);
  const one = tasks.find((t) => t.is_one) || null;
  const progress = dayProgress({
    morningDone,
    nightDone,
    moved: !!(day && day.moved),
    tasksPlanned: tasks.length,
    tasksDone: tasks.filter((t) => t.done).length,
    mood: day ? day.mood : null,
  });
  const voice = voiceLine({
    hour,
    kind: context.kind,
    gapDays: context.gapDays,
    progress,
    mood: day ? day.mood : null,
    morningDone,
    nightDone,
    oneThing: one ? { title: one.title, done: !!one.done } : null,
    tomorrowOne: state.tomorrowOne,
    why: profile.why,
    identity: profile.identity,
    seed: date,
  });

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Sky hour={hour} progress={progress} closed={nightDone} stars={context.dayNumber}>
          <Text style={styles.greet}>{greeting(hour)},</Text>
          <Text style={styles.name}>{profile.name || 'friend'}</Text>
          <Text style={styles.date}>{prettyDate(date)}</Text>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>DAY {context.dayNumber}</Text>
          </View>
        </Sky>

        <View style={styles.body}>
          <View style={styles.voice}>
            <Text style={styles.voiceText}>{voice}</Text>
            <Text style={styles.voiceMeta}>
              {Math.round(progress * 100)}% of today
              {extras.focusMin > 0 ? `  ·  ${extras.focusMin} min focused` : ''}
              {extras.urgesHeld > 0 ? `  ·  ${extras.urgesHeld} urge${extras.urgesHeld === 1 ? '' : 's'} held` : ''}
            </Text>
          </View>

          {/* key = date resets each card when the day changes */}
          <MorningCard key={`m-${date}-${day?.morning_done_at}`} date={date} day={day} onSaved={load} />
          <TasksCard date={date} tasks={tasks} carry={state.carry} onChanged={load} />
          <MoveCard key={`mv-${date}`} date={date} day={day} weekCount={state.weekCount} onChanged={load} />
          <NightCard
            key={`n-${date}-${day?.night_done_at}`}
            date={date}
            day={day}
            dayNumber={context.dayNumber}
            tomorrowOne={state.tomorrowOne}
            onSaved={load}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 80 },
  body: { paddingHorizontal: space.lg },
  greet: { color: sky.textSoft, backgroundColor: 'transparent', fontSize: font.md },
  name: { color: sky.text, backgroundColor: 'transparent', fontSize: font.xxl, fontWeight: '900' },
  date: { color: sky.textSoft, backgroundColor: 'transparent', fontSize: font.sm, marginTop: 2 },
  dayPill: {
    alignSelf: 'flex-start',
    marginTop: space.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.lg,
    paddingVertical: 5,
    paddingHorizontal: space.md,
  },
  dayPillText: { color: sky.text, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 1.5 },
  voice: { marginTop: -space.sm, marginBottom: space.lg },
  voiceText: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, fontWeight: '600', lineHeight: 25 },
  voiceMeta: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '700', marginTop: space.sm, letterSpacing: 0.5 },
});
