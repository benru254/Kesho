// THE PAUSE BUTTON — for the moment a feeling is about to make the decision for you.
// Urges rise, peak and pass like a wave, usually within minutes. Pause puts 60 seconds
// between the feeling and the action, shows you your own "why" and your own plan,
// then asks honestly how it went. No shame either way: noticing is the skill.
//
// Steps: what is pulling you? → breathe 60s → did it pass? → (if not) your plan → outcome.

import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../ui/Button';
import Tappable from '../../ui/Tappable';
import Breath from './Breath';
import { on, emit } from '../../core/bus';
import { getProfile } from '../../core/profile';
import { celebrate } from '../../core/celebrate';
import { colors, space, radius, font } from '../../core/theme';
import { TRIGGERS, logUrge, setOutcome, getUrgeStats } from './pause.service';

const BREATHE_SECONDS = 60;

export default function PauseOverlay() {
  const [step, setStep] = useState(null); // null | 'what' | 'breathe' | 'after' | 'plan'
  const [urgeId, setUrgeId] = useState(null);
  const [profile, setProfile] = useState({ why: '', plan: '', trigger: '' });
  const [stats, setStats] = useState({ total: 0, held: 0 });

  useEffect(() => on('pause-open', async () => {
    setProfile(await getProfile());
    setStats(await getUrgeStats());
    setUrgeId(null);
    setStep('what');
  }), []);

  const close = () => {
    setStep(null);
    emit('pause-closed', {});
  };

  const choose = async (key) => {
    setUrgeId(await logUrge(key));
    setStep('breathe');
  };

  const breathDone = useCallback(() => setStep('after'), []);

  const held = async () => {
    await setOutcome(urgeId, 'held');
    close();
    celebrate({
      emoji: '🛡️',
      title: 'You held.',
      text: `That is ${stats.held + 1} time${stats.held === 0 ? '' : 's'} you chose instead of reacting. This is the muscle.`,
    });
  };

  const slipped = async () => {
    await setOutcome(urgeId, 'slipped');
    close();
    celebrate({ emoji: '🤝', title: 'Logged honestly.', text: 'No shame. You noticed it — that is how it starts to change.' });
  };

  const focusInstead = () => {
    setOutcome(urgeId, 'held').catch(() => {});
    close();
    emit('focus-start', { taskId: null, title: 'Something useful instead' });
  };

  if (!step) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={close}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {step === 'what' && (
          <View>
            <Text style={styles.kicker}>PAUSE</Text>
            <Text style={styles.title}>Good. You stopped first.</Text>
            <Text style={styles.sub}>What is pulling you right now?</Text>
            {TRIGGERS.map((t) => (
              <Tappable key={t.key} onPress={() => choose(t.key)} style={styles.option}>
                <Text style={styles.optionText}>{t.label}</Text>
              </Tappable>
            ))}
            <Button label="Close" variant="ghost" onPress={close} style={styles.mt} />
          </View>
        )}

        {step === 'breathe' && (
          <View>
            <Text style={styles.kicker}>60 SECONDS</Text>
            <Text style={styles.title}>The feeling is a wave. Let it pass through.</Text>
            <Breath seconds={BREATHE_SECONDS} onDone={breathDone} />
            {profile.why ? (
              <View style={styles.quote}>
                <Text style={styles.quoteLabel}>YOU WROTE THIS</Text>
                <Text style={styles.quoteText}>“{profile.why}”</Text>
              </View>
            ) : null}
            <Button label="Skip" variant="ghost" onPress={breathDone} style={styles.mt} />
          </View>
        )}

        {step === 'after' && (
          <View>
            <Text style={styles.kicker}>CHECK</Text>
            <Text style={styles.title}>How strong is the pull now?</Text>
            <Text style={styles.sub}>Be honest. Either answer is fine.</Text>
            <Button label="It passed — I'm good" onPress={held} style={styles.mt} />
            <Button label="Still strong" variant="ghost" onPress={() => setStep('plan')} style={styles.mt} />
          </View>
        )}

        {step === 'plan' && (
          <View>
            <Text style={styles.kicker}>YOUR PLAN</Text>
            <Text style={styles.title}>Still strong. That is normal — now use the plan.</Text>
            {profile.plan ? (
              <View style={styles.quote}>
                <Text style={styles.quoteLabel}>WHEN THIS HAPPENS, I WILL</Text>
                <Text style={styles.quoteText}>{profile.plan}</Text>
              </View>
            ) : (
              <Text style={styles.sub}>
                No plan saved yet (add one in Me → My why). For now: stand up, drink water, walk 5 minutes. Then decide.
              </Text>
            )}
            <Button label="Do 15 focused minutes instead" onPress={focusInstead} style={styles.mt} />
            <Button label="I held" variant="ghost" onPress={held} style={styles.mt} />
            <Button label="I slipped — log it" variant="ghost" onPress={slipped} style={styles.mt} />
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.xl, paddingTop: 64, paddingBottom: 60 },
  kicker: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, backgroundColor: 'transparent', fontSize: font.xl, fontWeight: '800', marginTop: space.sm, lineHeight: 30 },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.md, marginTop: space.md, marginBottom: space.md, lineHeight: 22 },
  option: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.lg,
    marginTop: space.sm,
  },
  optionText: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg },
  quote: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.lg,
    marginTop: space.lg,
  },
  quoteLabel: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 1.2 },
  quoteText: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, lineHeight: 25, marginTop: space.sm },
  mt: { marginTop: space.md },
});
