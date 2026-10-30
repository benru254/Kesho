// THE APP SHELL — opens the database, starts every feature, draws the tab bar.
// It reads features/registry.js and never needs to change when a feature is added or removed.

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getDb } from './core/db/database';
import { on } from './core/bus';
import { colors, space } from './core/theme';
import { features } from './features/registry';
import SettingsScreen from './shell/SettingsScreen';

const SETTINGS_TAB = 'settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  // Bumped after a backup restore: every screen re-mounts and reloads its data.
  const [generation, setGeneration] = useState(0);

  const tabs = useMemo(() => {
    const list = features.filter((f) => f.Screen).map((f) => ({ key: f.key, title: f.title, icon: f.icon, Screen: f.Screen }));
    const sections = features.filter((f) => f.Section);
    if (sections.length > 0) {
      list.push({
        key: SETTINGS_TAB,
        title: 'Settings',
        icon: '⚙️',
        Screen: () => <SettingsScreen sections={sections} />,
      });
    }
    return list;
  }, []);

  const banners = useMemo(() => features.filter((f) => f.Banner), []);

  useEffect(() => {
    getDb()
      .then(() => {
        setReady(true);
        // Start each feature's background work. Never blocks the screen; one failure never stops the others.
        features.forEach((f) => {
          if (f.init) f.init().catch((e) => console.warn(`[${f.key}] init failed`, e));
        });
      })
      .catch((e) => setError(String((e && e.message) || e)));
    return on('restored', () => setGeneration((g) => g + 1));
  }, []);

  const current = tabs.find((t) => t.key === active) || tabs[0];
  const Screen = current.Screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Kesho could not open its database</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <View style={styles.root} key={`gen-${generation}`}>
            {banners.map(({ key, Banner }) => <Banner key={key} />)}
            <View style={styles.body}>
              <Screen />
            </View>
            {tabs.length > 1 && (
              <View style={styles.tabBar}>
                {tabs.map((t) => {
                  const on_ = t.key === current.key;
                  return (
                    <Pressable key={t.key} onPress={() => setActive(t.key)} style={styles.tab}>
                      <Text style={styles.tabIcon}>{t.icon}</Text>
                      <Text style={[styles.tabLabel, on_ && styles.tabLabelOn]}>{t.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.bg },
  errorTitle: { color: colors.warn, backgroundColor: 'transparent', fontSize: 17, fontWeight: '700', marginBottom: space.sm },
  errorText: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, textAlign: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: space.sm },
  tabIcon: { fontSize: 20, color: colors.text, backgroundColor: 'transparent' },
  tabLabel: { fontSize: 12, color: colors.muted, backgroundColor: 'transparent', marginTop: 2 },
  tabLabelOn: { color: colors.accent, fontWeight: '700' },
});
