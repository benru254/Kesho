// Settings → Reminders. Turn each daily reminder on/off, move its time, send a test.
// Shown inside the Settings tab (see shell/SettingsScreen.js).

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, StyleSheet, AppState } from 'react-native';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { colors, space, radius } from '../../core/theme';
import { dateKey, addDays, prettyDate } from '../../core/dates';
import { SLOTS, fmtTime, shiftTime } from './reminders.plan';
import {
  getPermission, requestPermission, getTimes, saveTimes, syncReminders, sendTest,
} from './reminders.service';

export default function RemindersSection() {
  const [perm, setPerm] = useState(null);
  const [times, setTimes] = useState(null);
  const [sync, setSync] = useState(null);
  const [testSent, setTestSent] = useState(false);

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([getPermission(), getTimes()]);
    setPerm(p);
    setTimes(t);
    setSync(await syncReminders());
  }, []);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

  const update = async (slot, change) => {
    const next = { ...times, [slot]: { ...times[slot], ...change } };
    setTimes(next);
    setSync(await saveTimes(next));
  };

  const allow = async () => {
    await requestPermission();
    await load();
  };

  const test = async () => {
    await sendTest();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 8000);
  };

  if (!perm || !times) return null;

  return (
    <View>
      <Text style={styles.h2}>🔔 Reminders</Text>
      <Text style={styles.sub}>Max 3 a day (+ the Sunday report). Fewer if you’re away — Kesho never spams you.</Text>

      {!perm.granted && (
        <Card title="⚠️ Notifications are off">
          <Text style={styles.body}>
            Without them, Kesho only works on days you remember it. Those are not the days you need it.
          </Text>
          <Button label="Allow notifications" onPress={allow} style={styles.mt} />
        </Card>
      )}

      {perm.granted && sync && (
        <View style={styles.nextBox}>
          <Text style={styles.nextLabel}>Next reminder</Text>
          <Text style={styles.nextText}>
            {sync.next ? `${whenLabel(sync.next.at)} · ${sync.next.body}` : 'Nothing left to remind you of. 👌'}
          </Text>
          <Text style={styles.nextCount}>{sync.count} planned over the next 30 days</Text>
        </View>
      )}

      {SLOTS.map((s) => {
        const t = times[s.key];
        return (
          <Card key={s.key}>
            <View style={styles.rowTop}>
              <View style={styles.flex}>
                <Text style={styles.slotTitle}>{s.label}</Text>
                <Text style={styles.slotHint}>{s.hint}</Text>
              </View>
              <Switch
                value={t.on}
                onValueChange={(v) => update(s.key, { on: v })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={t.on ? colors.text : colors.muted}
              />
            </View>
            {t.on && (
              <View style={styles.timeRow}>
                <StepBtn label="−15" onPress={() => update(s.key, shiftTime(t, -15))} />
                <Text style={styles.time}>{fmtTime(t.h, t.m)}</Text>
                <StepBtn label="+15" onPress={() => update(s.key, shiftTime(t, 15))} />
              </View>
            )}
          </Card>
        );
      })}

      {perm.granted && (
        <Button
          label={testSent ? 'Sent — lock your phone and wait 5s' : 'Send a test reminder'}
          variant="ghost"
          onPress={test}
          disabled={testSent}
        />
      )}

      <Card title="If reminders don’t arrive" subtitle="Common on Tecno, Infinix, Itel, Xiaomi, Samsung">
        <Text style={styles.body}>
          Battery saver kills apps in the background. Fix it once:{'\n'}
          Settings → Apps → Expo Go (later: Kesho) → Battery → “No restrictions” / “Allow background activity”.{'\n'}
          On Tecno/Infinix also: Phone Master → Auto-start → turn it ON.
        </Text>
      </Card>
    </View>
  );
}

function StepBtn({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}>
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

function whenLabel(at) {
  const key = dateKey(at);
  const today = dateKey();
  const time = fmtTime(at.getHours(), at.getMinutes());
  if (key === today) return `Today ${time}`;
  if (key === addDays(today, 1)) return `Tomorrow ${time}`;
  return `${prettyDate(key)} ${time}`;
}

const styles = StyleSheet.create({
  h2: { color: colors.text, backgroundColor: 'transparent', fontSize: 19, fontWeight: '800' },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  body: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, lineHeight: 21 },
  mt: { marginTop: space.md },
  flex: { flex: 1 },
  nextBox: {
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  nextLabel: { color: colors.accent, backgroundColor: 'transparent', fontSize: 12, fontWeight: '700' },
  nextText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginTop: 2 },
  nextCount: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  slotTitle: { color: colors.text, backgroundColor: 'transparent', fontSize: 16, fontWeight: '700' },
  slotHint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, gap: space.md },
  time: { color: colors.text, backgroundColor: 'transparent', fontSize: 26, fontWeight: '800', minWidth: 90, textAlign: 'center' },
  step: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  stepPressed: { opacity: 0.6 },
  stepText: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
});
