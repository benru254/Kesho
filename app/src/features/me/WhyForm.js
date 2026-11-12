// The four questions behind "My why" — used by both the first-run welcome and the Me tab editor.

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, space, radius, font } from '../../core/theme';

export const QUESTIONS = [
  {
    key: 'why',
    title: 'Why do you want to change your life?',
    hint: 'In your own words. Kesho will show this back to you on the days you want to quit.',
    placeholder: 'e.g. I want my own space, freedom to choose, and to never be stuck because of money.',
    lines: 4,
    max: 300,
  },
  {
    key: 'identity',
    title: 'Who are you becoming?',
    hint: 'One sentence. Actions follow identity.',
    placeholder: 'I am becoming someone who finishes what he starts.',
    lines: 2,
    max: 140,
  },
  {
    key: 'trigger',
    title: 'What usually pulls you off track?',
    hint: 'Name it honestly. You can’t beat what you won’t name.',
    placeholder: 'e.g. When I feel low I scroll for hours and skip the work.',
    lines: 2,
    max: 140,
  },
  {
    key: 'plan',
    title: 'When that happens, I will…',
    hint: 'A plan made now beats willpower later. The Pause button will show you this.',
    placeholder: 'e.g. press Pause, walk 5 minutes, then do 15 minutes of my one thing.',
    lines: 2,
    max: 140,
  },
];

export function Question({ q, value, onChange, autoFocus }) {
  return (
    <View style={styles.q}>
      <Text style={styles.title}>{q.title}</Text>
      <Text style={styles.hint}>{q.hint}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={q.placeholder}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { minHeight: 24 * q.lines + 24 }]}
        multiline
        maxLength={q.max}
        autoFocus={autoFocus}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  q: { marginBottom: space.lg },
  title: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, fontWeight: '800' },
  hint: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm, marginTop: 4, marginBottom: space.sm, lineHeight: 19 },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    fontSize: font.md,
    lineHeight: 22,
  },
});
