// Me tab → "My journey": lifetime totals (they never reset) and milestones reached.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import Card from '../../ui/Card';
import { on } from '../../core/bus';
import { kes } from '../../core/format';
import { colors, space, radius, font } from '../../core/theme';
import { getJourney } from './journey.service';

export default function JourneySection() {
  const [j, setJ] = useState(null);
  const load = useCallback(async () => setJ(await getJourney()), []);

  useEffect(() => {
    load();
    const off = on('event', load);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => { off(); sub.remove(); };
  }, [load]);

  if (!j) return null;
  const { stats, recent, next } = j;
  const hours = Math.floor(stats.focusMin / 60);
  const focusText = hours > 0 ? `${hours} h ${stats.focusMin % 60} m` : `${stats.focusMin} m`;

  return (
    <Card title="🌅 My journey" subtitle="Totals since day one. They never reset.">
      <View style={styles.grid}>
        <Stat value={`${stats.days}`} label="days shown up" />
        <Stat value={focusText} label="deep focus" />
        <Stat value={`${stats.held}`} label={`urges held of ${stats.urges}`} />
        <Stat value={kes(stats.saved)} label="put aside" small />
      </View>
      {next && (
        <Text style={styles.next}>Next: Day {next.day} — {next.left} more day{next.left === 1 ? '' : 's'} of showing up.</Text>
      )}
      {recent.length > 0 && (
        <View style={styles.list}>
          {recent.map((m) => (
            <Text key={m.key} style={styles.item}>{m.emoji}  {m.title}</Text>
          ))}
        </View>
      )}
    </Card>
  );
}

function Stat({ value, label, small }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, small && styles.valueSmall]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { width: '47%', flexGrow: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: space.md },
  value: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xxl, fontWeight: '900' },
  valueSmall: { fontSize: font.xl },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.xs, marginTop: 2 },
  next: { color: colors.text, backgroundColor: 'transparent', fontSize: font.sm, marginTop: space.md },
  list: { marginTop: space.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.md },
  item: { color: colors.text, backgroundColor: 'transparent', fontSize: font.md, paddingVertical: 3 },
});
