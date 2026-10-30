// The ⚙️ Settings tab: shows every feature's Section (from features/registry.js), one under another.
// It knows nothing about the features themselves.

import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { colors, space } from '../core/theme';

export default function SettingsScreen({ sections }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Settings</Text>
      {sections.map(({ key, Section }) => (
        <View key={key} style={styles.section}>
          <Section />
        </View>
      ))}
      <Text style={styles.footer}>Kesho · your data lives only on this phone (and in backups you make).</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  h1: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800', marginBottom: space.lg },
  section: { marginBottom: space.xl },
  footer: { color: colors.placeholder, backgroundColor: 'transparent', fontSize: 11, textAlign: 'center' },
});
