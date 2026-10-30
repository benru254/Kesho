// Mood, stress and getting important things done.

import React from 'react';
import Card from '../../../ui/Card';
import StatLine from './StatLine';

export default function MindCard({ cur, diff }) {
  return (
    <Card title="Mind & work">
      <StatLine label="Average mood" value={cur.moodAvg != null ? `${cur.moodAvg}/5` : '–'} delta={diff.moodAvg} />
      <StatLine label="Average stress" value={cur.stressAvg != null ? `${cur.stressAvg}/5` : '–'} delta={diff.stressAvg} better="down" />
      <StatLine
        label="Important tasks done"
        value={cur.tasksPlanned > 0 ? `${cur.tasksDone} of ${cur.tasksPlanned} (${cur.taskRate}%)` : '–'}
        delta={diff.taskRate}
        unit="%"
      />
    </Card>
  );
}
