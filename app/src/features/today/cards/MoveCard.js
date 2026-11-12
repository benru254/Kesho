// "Move 10 minutes": one tap when done. Shows this week's count.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space } from '../../../core/theme';
import { celebrate, oneOf } from '../../../core/celebrate';
import { setMoved } from '../today.service';

export default function MoveCard({ date, day, weekCount, onChanged }) {
  const moved = !!(day && day.moved);

  const toggle = async () => {
    await setMoved(date, !moved);
    if (!moved) {
      celebrate({
        emoji: '🚶',
        title: oneOf(['You moved.', 'Body: done.', 'Walk logged.']),
        text: `${weekCount + 1} of the last 7 days. Your head will be clearer tonight.`,
      });
    }
    onChanged();
  };

  return (
    <Card
      title="Move 10 minutes"
      subtitle="A walk counts. Starting tiny is the whole trick."
      done={moved}
    >
      <Text style={styles.week}>Last 7 days: {weekCount} of 7</Text>
      {moved ? (
        <Button label="Undo" variant="ghost" onPress={toggle} style={styles.undo} />
      ) : (
        <Button label="I moved today ✓" onPress={toggle} style={styles.mainBtn} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  week: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13 },
  undo: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  mainBtn: { marginTop: space.md },
});
