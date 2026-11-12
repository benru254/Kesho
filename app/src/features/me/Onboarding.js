// First-run welcome: four short questions that give Kesho your own words to work with.
// Shown once (until answered or skipped). Everything can be edited later in the Me tab.

import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import Button from '../../ui/Button';
import { getProfile, saveProfile } from '../../core/profile';
import { celebrate } from '../../core/celebrate';
import { colors, space, font } from '../../core/theme';
import { QUESTIONS, Question } from './WhyForm';

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getProfile().then((p) => {
      if (!p.onboarded) {
        setAnswers({ why: p.why, identity: p.identity, trigger: p.trigger, plan: p.plan });
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  const finish = async (skipped) => {
    const saved = await saveProfile({ ...(skipped ? {} : answers), onboarded: true });
    setVisible(false);
    if (!skipped && saved.why) {
      celebrate({ level: 'big', emoji: '🌅', title: 'Kesho knows your why.', text: 'On the days you forget it, the app will remember for you.' });
    }
  };

  if (!visible) return null;
  const q = QUESTIONS[index];
  const last = index === QUESTIONS.length - 1;

  return (
    <Modal visible animationType="fade" onRequestClose={() => finish(true)}>
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {index === -1 ? (
            <View>
              <Text style={styles.sun}>🌅</Text>
              <Text style={styles.h1}>Kesho</Text>
              <Text style={styles.lead}>
                This app is on your side — especially on the days you are not.
              </Text>
              <Text style={styles.body}>
                Four short questions first. Your answers stay on this phone. Kesho uses your own words
                to pull you back when feelings try to take over.
              </Text>
              <Button label="Begin" onPress={() => setIndex(0)} style={styles.mt} />
              <Button label="Skip for now" variant="ghost" onPress={() => finish(true)} style={styles.mtSm} />
            </View>
          ) : (
            <View>
              <Text style={styles.stepText}>{index + 1} of {QUESTIONS.length}</Text>
              <Question
                key={q.key}
                q={q}
                value={answers[q.key] || ''}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))}
                autoFocus
              />
              <Button label={last ? 'Save' : 'Next'} onPress={() => (last ? finish(false) : setIndex(index + 1))} />
              <Button label="Back" variant="ghost" onPress={() => setIndex(index - 1)} style={styles.mtSm} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.xl, paddingTop: 72 },
  sun: { fontSize: 64, color: colors.text, backgroundColor: 'transparent' },
  h1: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.hero, fontWeight: '900', marginTop: space.sm },
  lead: { color: colors.text, backgroundColor: 'transparent', fontSize: font.xl, fontWeight: '700', marginTop: space.md, lineHeight: 30 },
  body: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.md, marginTop: space.md, lineHeight: 23 },
  stepText: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 1.5, marginBottom: space.md },
  mt: { marginTop: space.xl },
  mtSm: { marginTop: space.sm },
});
