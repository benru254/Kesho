// Shared one-tap choice row (chips). Used for mood, sleep, stress, etc.

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, space, radius } from '../core/theme';

// One-tap choice row.
// options: [{ value: 1, label: '😞' }, ...]
export default function ChoiceRow({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minWidth: 48,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, backgroundColor: 'transparent', fontSize: 18 },
  chipTextSelected: { color: colors.accentText },
});
