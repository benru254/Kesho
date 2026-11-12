// The focus timer. Opens over everything when a task's "▶ Focus on this" is pressed.
// Steps: pick 15 / 25 / 45 minutes → countdown (screen stays on) → "Did you finish the task?"
// One task, one timer, nothing else on screen.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import { on, emit } from '../../core/bus';
import { getProfile, shorten } from '../../core/profile';
import { heavy } from '../../core/haptics';
import { celebrate } from '../../core/celebrate';
import { colors, space, font } from '../../core/theme';
import { DURATIONS, remainingMs, fraction, clock, prettyMinutes } from './focus.timer';
import { startSession, endSession, resumeOrSettle } from './focus.service';

const AWAKE_TAG = 'kesho-focus';

export default function FocusOverlay() {
  const [step, setStep] = useState(null); // null | 'pick' | 'run' | 'ask'
  const [task, setTask] = useState({ taskId: null, title: '' });
  const [active, setActive] = useState(null);
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [why, setWhy] = useState('');
  const finishing = useRef(false);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    const res = await endSession();
    deactivateKeepAwake(AWAKE_TAG);
    setActive(null);
    finishing.current = false;
    if (!res.counted) {
      setStep(null);
      emit('focus-finished', { taskId: null, taskDone: false });
      return;
    }
    heavy();
    setResult(res);
    setStep(res.active && res.active.taskId ? 'ask' : null);
    if (!(res.active && res.active.taskId)) close(res, false);
  }, []);

  const close = (res, taskDone) => {
    setStep(null);
    emit('focus-finished', { taskId: res.active ? res.active.taskId : null, taskDone });
    celebrate({
      emoji: '🎯',
      title: `${prettyMinutes(res.minutes)} of real focus.`,
      text: taskDone ? 'Task finished. That is how goals get built.' : 'Not finished yet — but it moved. Go again later.',
    });
  };

  // Open from a task, or resume a session that was running when the app closed.
  useEffect(() => {
    const off = on('focus-start', (t) => {
      setTask({ taskId: t.taskId || null, title: t.title || '' });
      setStep('pick');
    });
    resumeOrSettle().then((a) => {
      if (a) {
        setActive(a);
        setTask({ taskId: a.taskId, title: a.title });
        setStep('run');
      }
    }).catch(() => {});
    getProfile().then((p) => setWhy(p.why)).catch(() => {});
    return off;
  }, []);

  // The countdown: recomputed from the clock every second.
  useEffect(() => {
    if (step !== 'run' || !active) return undefined;
    activateKeepAwakeAsync(AWAKE_TAG).catch(() => {});
    const tick = () => {
      const ms = remainingMs(active.startedAt, active.plannedMin);
      setLeft(ms);
      if (ms === 0) finish();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [step, active, finish]);

  const start = async (plannedMin) => {
    const a = await startSession({ taskId: task.taskId, title: task.title, plannedMin });
    setActive(a);
    setStep('run');
  };

  if (!step) return null;

  return (
    <Modal visible animationType="fade" onRequestClose={() => (step === 'pick' ? setStep(null) : undefined)}>
      <View style={styles.screen}>
        {step === 'pick' && (
          <View style={styles.center}>
            <Text style={styles.kicker}>FOCUS</Text>
            <Text style={styles.title}>{task.title || 'One thing'}</Text>
            <Text style={styles.sub}>Phone face down. One task. How long?</Text>
            {DURATIONS.map((m) => (
              <Button key={m} label={`${m} minutes`} onPress={() => start(m)} style={styles.wide} variant={m === 25 ? 'primary' : 'ghost'} />
            ))}
            <Button label="Not now" variant="ghost" onPress={() => setStep(null)} style={styles.cancel} />
          </View>
        )}

        {step === 'run' && active && (
          <View style={styles.center}>
            <Text style={styles.kicker}>FOCUSING ON</Text>
            <Text style={styles.title}>{active.title || 'One thing'}</Text>
            <Text style={styles.clock}>{clock(left)}</Text>
            <View style={styles.bar}>
              <ProgressBar percent={fraction(active.startedAt, active.plannedMin) * 100} height={6} />
            </View>
            <Text style={styles.sub}>Nothing else exists for these minutes.</Text>
            {why ? <Text style={styles.why}>“{shorten(why, 110)}”</Text> : null}
            <Button label="Stop early" variant="ghost" onPress={finish} style={styles.cancel} />
          </View>
        )}

        {step === 'ask' && result && (
          <View style={styles.center}>
            <Text style={styles.bigEmoji}>🎯</Text>
            <Text style={styles.title}>{prettyMinutes(result.minutes)} done.</Text>
            <Text style={styles.sub}>Did you finish “{result.active.title}”?</Text>
            <Button label="Yes — tick it off" onPress={() => close(result, true)} style={styles.wide} />
            <Button label="Not yet" variant="ghost" onPress={() => close(result, false)} style={styles.wide} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, backgroundColor: 'transparent', fontSize: font.xl, fontWeight: '800', textAlign: 'center', marginTop: space.sm },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.md, textAlign: 'center', marginTop: space.md, marginBottom: space.lg },
  clock: { color: colors.text, backgroundColor: 'transparent', fontSize: 76, fontWeight: '200', marginTop: space.xl, fontVariant: ['tabular-nums'] },
  bar: { alignSelf: 'stretch', marginTop: space.md },
  why: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.sm, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
  bigEmoji: { fontSize: 64, color: colors.text, backgroundColor: 'transparent' },
  wide: { alignSelf: 'stretch', marginTop: space.md },
  cancel: { alignSelf: 'stretch', marginTop: space.xl },
});
