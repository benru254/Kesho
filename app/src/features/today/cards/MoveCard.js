// "Move 10 minutes": one tap when done. Celebrates the first time ever and shows this week's count.

import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space } from '../../../core/theme';
import { setMoved } from '../today.service';

export default function MoveCard({ date, day, weekCount, onChanged }) {
  const moved = !!(day && day.moved);
  const [firstEver, setFirstEver] = useState(false);

  const toggle = async () => {
    const res = await setMoved(date, !moved);
    setFirstEver(res.firstEver);
    onChanged();
  };

  return (
    <Card
      title="Move 10 minutes"
      subtitle="A walk counts. Starting tiny is the whole trick."
      done={moved}
    >
      {moved ? (
        <>
          <Text style={styles.win}>
            {firstEver ? 'First time ever. This is how it starts. 🏆' : 'Done. Your body thanks you.'}
          </Text>
          <Text style={styles.week}>This week: {weekCount} of 7 days</Text>
          <Button label="Undo" variant="ghost" onPress={toggle} style={styles.undo} />
        </>
      ) : (
        <>
          <Text style={styles.week}>This week: {weekCount} of 7 days</Text>
          <Button label="I moved today ✓" onPress={toggle} style={styles.mainBtn} />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  win: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  week: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.xs },
  undo: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  mainBtn: { marginTop: space.md },
});
