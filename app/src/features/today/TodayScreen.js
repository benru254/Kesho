// The Today tab: greeting, no-guilt welcome banner, energy note, and the four daily cards
// (morning check-in, important tasks, move, night check-in). Reloads when you come back to the app.

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { dateKey, prettyDate, greeting, isMonday, isFirstOfMonth } from '../../core/dates';
import {
  getDay, getTasks, getCarryOverCandidates, getWelcome, movedDaysThisWeek, energyNote,
} from './today.service';
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
    const [day, tasks, carry, welcome, weekCount] = await Promise.all([
      getDay(today),
      getTasks(today),
      getCarryOverCandidates(today),
      getWelcome(today),
      movedDaysThisWeek(today),
    ]);
    setState({ day, tasks, carry, welcome, weekCount });
  }, []);

  useEffect(() => {
    load();
    // Reload when you come back to the app (new day = fresh screen).
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

  if (!state) return <View style={styles.screen} />;

  const freshStart = isFirstOfMonth(date)
    ? 'New month. Clean slate.'
    : isMonday(date) ? 'New week. Clean slate.' : null;

  const energy = energyNote(state.day ? state.day.mood : null);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.greet}>{greeting()}, Reuben</Text>
        <Text style={styles.date}>{prettyDate(date)}</Text>

        <View style={[styles.banner, state.welcome.kind === 'nudge' && styles.bannerNudge]}>
          <Text style={styles.bannerText}>{freshStart ? `${freshStart} ` : ''}{state.welcome.text}</Text>
        </View>

        {energy && (
          <View style={[styles.banner, energy.kind === 'low' ? styles.bannerLow : styles.bannerHigh]}>
            <Text style={styles.bannerText}>{energy.text}</Text>
          </View>
        )}

        {/* key={date} resets each card when the day changes */}
        <MorningCard key={`m-${date}-${state.day?.morning_done_at}`} date={date} day={state.day} onSaved={load} />
        <TasksCard date={date} tasks={state.tasks} carry={state.carry} onChanged={load} />
        <MoveCard key={`mv-${date}`} date={date} day={state.day} weekCount={state.weekCount} onChanged={load} />
        <NightCard key={`n-${date}-${state.day?.night_done_at}`} date={date} day={state.day} onSaved={load} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  greet: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  date: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  banner: {
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  bannerNudge: { borderLeftColor: colors.warn },
  bannerLow: { borderLeftColor: colors.muted },
  bannerHigh: { borderLeftColor: colors.good },
  bannerText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14 },
});
