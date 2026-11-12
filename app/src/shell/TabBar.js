// The bottom bar: one button per tab, plus round "action" buttons from the registry in the middle
// (today: the Pause button). Knows nothing about the features themselves.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tappable from '../ui/Tappable';
import { emit } from '../core/bus';
import { colors, space } from '../core/theme';

export default function TabBar({ tabs, actions, activeKey, onSelect }) {
  const half = Math.ceil(tabs.length / 2);
  const renderTab = (t) => {
    const active = t.key === activeKey;
    return (
      <Tappable key={t.key} onPress={() => onSelect(t.key)} style={styles.tab}>
        <Text style={[styles.icon, !active && styles.dim]}>{t.icon}</Text>
        <Text style={[styles.label, active && styles.labelOn]}>{t.title}</Text>
        <View style={[styles.dot, active && styles.dotOn]} />
      </Tappable>
    );
  };

  return (
    <View style={styles.bar}>
      <View style={styles.side}>{tabs.slice(0, half).map(renderTab)}</View>
      {actions.map((a) => (
        <Tappable key={a.key} onPress={() => emit(a.event, {})} style={styles.action}>
          <Text style={styles.actionIcon}>{a.icon}</Text>
          <Text style={styles.actionLabel}>{a.label}</Text>
        </Tappable>
      ))}
      <View style={styles.side}>{tabs.slice(half).map(renderTab)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: space.xs,
  },
  side: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { alignItems: 'center', paddingVertical: space.sm, paddingHorizontal: space.sm, minWidth: 64 },
  icon: { fontSize: 20, color: colors.text, backgroundColor: 'transparent' },
  dim: { opacity: 0.55 },
  label: { fontSize: 11, color: colors.muted, backgroundColor: 'transparent', marginTop: 2 },
  labelOn: { color: colors.accent, fontWeight: '800' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: colors.accent },
  action: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -22,
    marginHorizontal: space.xs,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  actionIcon: { fontSize: 20, color: colors.accentText, backgroundColor: 'transparent' },
  actionLabel: { fontSize: 10, fontWeight: '800', color: colors.accentText, backgroundColor: 'transparent' },
});
