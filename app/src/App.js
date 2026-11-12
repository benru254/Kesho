// THE APP SHELL — opens the database, starts every feature, draws tabs, banners and overlays.
// It reads features/registry.js and never needs to change when a feature is added or removed.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getDb } from './core/db/database';
import { on } from './core/bus';
import { colors, space } from './core/theme';
import { features } from './features/registry';
import SettingsScreen from './shell/SettingsScreen';
import TabBar from './shell/TabBar';
import useNotificationTab from './shell/useNotificationTab';

// 'settings' is kept as the key so older notifications ({ tab: 'settings' }) still open it.
const ME_TAB = 'settings';

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
      list.push({ key: ME_TAB, title: 'Me', icon: '🧭', Screen: () => <SettingsScreen sections={sections} /> });
    }
    return list;
  }, []);
  const banners = useMemo(() => features.filter((f) => f.Banner), []);
  const overlays = useMemo(() => features.filter((f) => f.Overlay), []);
  const actions = useMemo(() => features.filter((f) => f.action).map((f) => ({ key: f.key, ...f.action })), []);

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

  // Tapping a notification opens its tab.
  const openTab = useCallback((key) => {
    if (tabs.some((t) => t.key === key)) setActive(key);
  }, [tabs]);
  useNotificationTab(openTab);

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
            <TabBar tabs={tabs} actions={actions} activeKey={current.key} onSelect={setActive} />
            {overlays.map(({ key, Overlay }) => <Overlay key={key} />)}
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
});
