// "Your week is ready" — every Sunday at 19:00.

import { scheduleWeekly } from '../../core/notify';

const ID = 'kesho-report-weekly';
const SUNDAY = 1; // Expo numbering: 1 = Sunday

export async function initReport() {
  await scheduleWeekly(
    ID,
    SUNDAY,
    19,
    0,
    '📊 Your week in Kesho',
    'Your Sunday report is ready: what worked, what didn’t, one focus for next week. 2 minutes.'
  );
}
