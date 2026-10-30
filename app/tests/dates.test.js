// Date helpers: weeks start on Monday.
import { check, done } from './lib/check.js';
import { startOfWeek, weekDays, addDays, shortDate, daysBetween } from '../src/core/dates.js';

check(startOfWeek('2026-10-30') === '2026-10-26', 'Friday → Monday 26 Oct');
check(startOfWeek('2026-10-26') === '2026-10-26', 'Monday stays Monday');
check(startOfWeek('2026-11-01') === '2026-10-26', 'Sunday belongs to the week before');
check(weekDays('2026-10-26').join(',') === '2026-10-26,2026-10-27,2026-10-28,2026-10-29,2026-10-30,2026-10-31,2026-11-01', '7 days across month end');
check(addDays('2026-12-31', 1) === '2027-01-01', 'year rollover');
check(shortDate('2026-10-26') === '26 Oct', 'short date');
check(daysBetween('2026-10-01', '2026-10-31') === 30, 'days between');
done();
