// Mood, stress, getting important things done, deep focus and urges faced.

import React from 'react';
import Card from '../../../ui/Card';
import StatLine from './StatLine';

function minutes(min) {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

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
      <StatLine label="Deep focus" value={minutes(cur.focusMin)} delta={diff.focusMin} unit="m" />
      <StatLine label="Urges held" value={cur.urges > 0 ? `${cur.urgesHeld} of ${cur.urges}` : '–'} />
    </Card>
  );
}
