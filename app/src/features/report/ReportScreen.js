// The Report tab: one week at a time (Monday → Sunday), with ‹ › to move between weeks.

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { addDays, shortDate, dateKey } from '../../core/dates';
import { on } from '../../core/bus';
import { getWeekReport, defaultWeek } from './report.service';
import HabitsCard from './cards/HabitsCard';
import MindCard from './cards/MindCard';
import MoneyWeekCard from './cards/MoneyWeekCard';
import PatternsCard from './cards/PatternsCard';
import FocusCard from './cards/FocusCard';

export default function ReportScreen() {
  const [monday, setMonday] = useState(defaultWeek());
  const [report, setReport] = useState(null);

  const load = useCallback(async () => {
    setReport(await getWeekReport(monday));
  }, [monday]);

  useEffect(() => {
    load();
    const off = on('event', load);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => { off(); sub.remove(); };
  }, [load]);

  const canGoForward = addDays(monday, 7) <= dateKey();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Weekly report</Text>

      <View style={styles.nav}>
        <NavBtn label="‹" onPress={() => setMonday(addDays(monday, -7))} />
        <Text style={styles.week}>
          {shortDate(monday)} – {shortDate(addDays(monday, 6))}
          {report && report.isCurrentWeek ? '  (this week)' : ''}
        </Text>
        <NavBtn label="›" onPress={() => setMonday(addDays(monday, 7))} disabled={!canGoForward} />
      </View>

      {report && report.isCurrentWeek && (
        <Text style={styles.sub}>Week in progress: {report.cur.daysCounted} of 7 days so far. Full report on Sunday 19:00.</Text>
      )}

      {report && (
        <>
          <FocusCard focus={report.focus} />
          <HabitsCard cur={report.cur} diff={report.diff} />
          <MindCard cur={report.cur} diff={report.diff} />
          <MoneyWeekCard cur={report.cur} diff={report.diff} />
          <PatternsCard patterns={report.patterns} />
          <Text style={styles.small}>▲▼ = change vs the week before. Green = better, orange = worse.</Text>
        </>
      )}
    </ScrollView>
  );
}

function NavBtn({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.navBtn, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  h1: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.md },
  nav: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, marginBottom: space.md, gap: space.md },
  week: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  navBtn: {
    width: 44,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: { color: colors.text, backgroundColor: 'transparent', fontSize: 22, fontWeight: '800' },
  disabled: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
  small: { color: colors.placeholder, backgroundColor: 'transparent', fontSize: 11, marginTop: space.sm, textAlign: 'center' },
});
