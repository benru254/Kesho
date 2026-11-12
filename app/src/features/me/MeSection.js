// Me tab → "My why": your reason, who you are becoming, your trigger and your plan. Editable.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { getProfile, saveProfile } from '../../core/profile';
import { on } from '../../core/bus';
import { colors, space, radius, font } from '../../core/theme';
import { QUESTIONS, Question } from './WhyForm';

const LABELS = { why: 'MY WHY', identity: 'I AM BECOMING', trigger: 'WHAT PULLS ME OFF TRACK', plan: 'WHEN IT HAPPENS, I WILL' };

export default function MeSection() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = useCallback(async () => setProfile(await getProfile()), []);
  useEffect(() => {
    load();
    return on('profile-changed', load);
  }, [load]);

  if (!profile) return null;

  if (draft) {
    return (
      <Card title="My why">
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(v) => setDraft({ ...draft, name: v })}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          maxLength={30}
        />
        {QUESTIONS.map((q) => (
          <Question key={q.key} q={q} value={draft[q.key] || ''} onChange={(v) => setDraft({ ...draft, [q.key]: v })} />
        ))}
        <Button label="Save" onPress={async () => { await saveProfile({ ...draft, onboarded: true }); setDraft(null); }} />
        <Button label="Cancel" variant="ghost" onPress={() => setDraft(null)} style={styles.mtSm} />
      </Card>
    );
  }

  const empty = !profile.why && !profile.identity && !profile.plan;
  return (
    <Card title={`${profile.name || 'Me'} — my why`}>
      {empty ? (
        <Text style={styles.muted}>
          Not written yet. Two minutes here makes every other part of Kesho stronger: your own words come back to you
          when you need them.
        </Text>
      ) : (
        Object.keys(LABELS).filter((k) => profile[k]).map((k) => (
          <View key={k} style={styles.item}>
            <Text style={styles.itemLabel}>{LABELS[k]}</Text>
            <Text style={k === 'why' ? styles.why : styles.itemText}>{k === 'why' ? `“${profile[k]}”` : profile[k]}</Text>
          </View>
        ))
      )}
      <Button label={empty ? 'Write my why' : 'Edit'} variant={empty ? 'primary' : 'ghost'} onPress={() => setDraft({ ...profile })} style={styles.mt} />
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.md, lineHeight: 22 },
  item: { marginBottom: space.md },
  itemLabel: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xs, fontWeight: '900', letterSpacing: 1.2 },
  itemText: { color: colors.text, backgroundColor: 'transparent', fontSize: font.md, marginTop: 4, lineHeight: 22 },
  why: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, fontWeight: '600', marginTop: 4, lineHeight: 25 },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm, marginBottom: space.xs },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: font.md,
    marginBottom: space.lg,
  },
  mt: { marginTop: space.sm },
  mtSm: { marginTop: space.sm },
});
