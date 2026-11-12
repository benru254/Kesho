// needs: sqlite
// Focus timer, Pause (urges), 24-hour wait list, milestones, profile — on a real database.
import { check, done } from './lib/check.js';
import { remainingMs, minutesDone, fraction, clock, prettyMinutes } from '../src/features/focus/focus.timer.js';
import * as F from '../src/features/focus/focus.service.js';
import * as P from '../src/features/pause/pause.service.js';
import * as W from '../src/features/money/wish/wish.service.js';
import { waitState, unlockTime } from '../src/features/money/wish/wish.calc.js';
import * as M from '../src/features/money/money.service.js';
import { newMilestones, nextDayMilestone } from '../src/features/journey/journey.calc.js';
import * as J from '../src/features/journey/journey.service.js';
import { getProfile, saveProfile, shorten } from '../src/core/profile.js';
import { get, run, all } from '../src/core/db/database.js';
import { dateKey } from '../src/core/dates.js';

check((await get('SELECT version FROM schema_version')).version === 4, 'database migrated to v4');

// --- focus timer math
const t0 = '2026-11-12T08:00:00.000Z';
const ms0 = new Date(t0).getTime();
check(remainingMs(t0, 25, ms0 + 10 * 60000) === 15 * 60000 && remainingMs(t0, 25, ms0 + 99 * 60000) === 0, 'time left from the clock');
check(minutesDone(t0, 25, ms0 + 10.9 * 60000) === 10 && minutesDone(t0, 25, ms0 + 99 * 60000) === 25, 'minutes done, never above planned');
check(fraction(t0, 20, ms0 + 5 * 60000) === 0.25 && clock(754000) === '12:34' && clock(0) === '00:00', 'progress + clock text');
check(prettyMinutes(95) === '1 h 35 min' && prettyMinutes(40) === '40 min', 'pretty minutes');

// --- focus sessions
const a = await F.startSession({ taskId: 7, title: 'Write quote', plannedMin: 25 });
check((await F.getActive()).id === a.id, 'session is remembered while running');
const start = new Date(a.startedAt).getTime();
check((await F.resumeOrSettle(start + 5 * 60000)).id === a.id, 'app reopened mid-session → timer comes back');
const early = await F.endSession(start + 12 * 60000);
check(early.counted && early.minutes === 12 && !early.completed && early.active.taskId === 7, 'stopped early → 12 minutes counted');
check((await F.getActive()) === null && (await F.minutesOn(dateKey())) === 12, 'minutes saved, nothing running');
await F.startSession({ plannedMin: 15 });
check(!(await F.endSession(Date.now() + 20000)).counted && (await F.minutesOn(dateKey())) === 12, 'false start (<1 min) is not counted');
const b = await F.startSession({ plannedMin: 15 });
check((await F.resumeOrSettle(new Date(b.startedAt).getTime() + 60 * 60000)) === null && (await F.minutesOn(dateKey())) === 27, 'ran out while app was closed → full credit');

// --- pause
const u1 = await P.logUrge('phone'); await P.setOutcome(u1, 'held');
const u2 = await P.logUrge('phone'); await P.setOutcome(u2, 'slipped');
await P.logUrge('spend');
const us = await P.getUrgeStats();
check(us.total === 3 && us.held === 1 && us.topTrigger === 'phone', 'urges counted honestly (held, slipped, unanswered)');

// --- wait list
check(waitState(unlockTime(t0), ms0 + 3 * 3600000).hoursLeft === 21 && !waitState(unlockTime(t0), ms0).ready, 'want is locked for 24 hours');
check(waitState(unlockTime(t0), ms0 + 25 * 3600000).ready, 'after 24 hours you may decide');
await W.addWish('Headphones', 3500);
await W.addWish('Shoes', 2000);
await W.addWish('Snack', 0);
let waiting = await W.getWaiting();
check(waiting.length === 3, 'wants parked');
await W.dropWish(waiting.find((w) => w.title === 'Headphones').id);
await W.buyWish(waiting.find((w) => w.title === 'Shoes').id);
await W.dropWish(waiting.find((w) => w.title === 'Snack').id);
const kept = await W.getKept();
check(kept.count === 2 && kept.total === 3500 && (await W.getWaiting()).length === 0, 'let go = money kept');
const sum = await M.getMonthSummary(dateKey().slice(0, 7));
check(sum.spend.find((s) => s.key === 'wants').total === 2000, 'bought on purpose → recorded under Wants');
let threw = false; try { await W.addWish('  ', 5); } catch { threw = true; }
check(threw, 'a want needs a name');

// --- milestones
const m1 = newMilestones({ days: 8, held: 1, focusMin: 30, saved: 0, kept: 0 }, []);
check(m1.save.includes('days-1') && m1.save.includes('days-7') && m1.save.includes('held-1'), 'all reached milestones are stored');
check(m1.show.length === 2 && m1.show.some((m) => m.key === 'days-7') && !m1.show.some((m) => m.key === 'days-3'), 'only the highest per group is celebrated (no flood)');
check(newMilestones({ days: 8, held: 1, focusMin: 30, saved: 0, kept: 0 }, m1.save).show.length === 0, 'never celebrated twice');
check(newMilestones({ days: 8, held: 1, focusMin: 60, saved: 1500, kept: 1 }, m1.save).show.length === 3, 'focus hour, savings level, first want let go');
check(nextDayMilestone(8).day === 14 && nextDayMilestone(8).left === 6 && nextDayMilestone(400) === null, 'next day milestone');

await run("INSERT INTO daily_log (date, moved, updated_at) VALUES ('2026-11-01', 1, 'x'), ('2026-11-02', 1, 'x'), ('2026-11-03', 1, 'x')");
const stats = await J.getStats();
check(stats.days === 3 && stats.held === 1 && stats.focusMin === 27 && stats.kept === 3500, 'journey totals read from every feature');
const shown = await J.checkMilestones();
check(shown.some((m) => m.key === 'days-3') && shown.some((m) => m.key === 'held-1'), 'milestones found from real data');
check((await J.checkMilestones()).length === 0 && (await all('SELECT key FROM milestones')).length >= 4, 'stored once, quiet afterwards');
check((await J.getJourney()).next.day === 7, 'journey shows the next milestone');

// --- profile
check((await getProfile()).name === 'Reuben' && (await getProfile()).onboarded === false, 'default profile');
const p = await saveProfile({ why: '  I want my own space  ', onboarded: true });
check(p.why === 'I want my own space' && (await getProfile()).onboarded === true, 'profile saved and trimmed');
check(shorten('a'.repeat(200), 50).length === 50 && shorten('short') === 'short', 'long text shortened for notifications');
done();
