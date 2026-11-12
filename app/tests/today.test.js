// needs: sqlite
// Today: day progress (the sun), Kesho's voice, the ONE thing, day number that never resets.
import { check, done } from './lib/check.js';
import { dayProgress, nextStep } from '../src/features/today/today.progress.js';
import { voiceLine } from '../src/features/today/today.voice.js';
import * as T from '../src/features/today/today.service.js';
import { skyPhase, starField, sunHeight } from '../src/ui/sky.calc.js';
import { run } from '../src/core/db/database.js';

// --- progress
const base = { morningDone: false, tasksPlanned: 0, tasksDone: 0, moved: false, nightDone: false, mood: null };
check(dayProgress(base) === 0, 'nothing done → sun on the horizon');
check(dayProgress({ ...base, morningDone: true, mood: 4 }) === 0.25, 'morning check-in = a quarter');
check(dayProgress({ ...base, morningDone: true, mood: 4, tasksPlanned: 2, tasksDone: 1 }) === 0.38, 'half the tasks = half a part');
check(dayProgress({ morningDone: true, tasksPlanned: 3, tasksDone: 3, moved: true, nightDone: true, mood: 4 }) === 1, 'everything → full sun');
check(dayProgress({ ...base, morningDone: true, mood: 1 }) === 0.15, 'low day: honest check-in gets credit');
check(dayProgress({ ...base, morningDone: true, mood: 2, tasksPlanned: 3, tasksDone: 1, nightDone: true }) === 1, 'low day: one task + close = full day');
check(nextStep({ ...base, hour: 7 }) === 'morning' && nextStep({ ...base, morningDone: true, hour: 9 }) === 'plan', 'next step order');

// --- sky
check(skyPhase(6) === 'dawn' && skyPhase(12) === 'day' && skyPhase(18) === 'dusk' && skyPhase(23) === 'night' && skyPhase(2) === 'night', 'sky follows the clock');
check(starField(500).length === 60 && starField(3).length === 3 && JSON.stringify(starField(5)) === JSON.stringify(starField(5)), 'stars: one per day, max 60, stable');
check(sunHeight(2) === 1 && sunHeight(-1) === 0, 'sun height clamped');

// --- voice
const v = (c) => voiceLine({ hour: 9, kind: 'normal', gapDays: 1, progress: 0.25, mood: 4, morningDone: true, nightDone: false, oneThing: null, tomorrowOne: null, why: '', identity: '', seed: 'x', ...c });
check(/Day one/.test(v({ kind: 'first', morningDone: false })), 'first day voice');
check(/came back after 4 days/.test(v({ kind: 'back', gapDays: 5, morningDone: false })) , 'welcome back, no guilt');
check(/my own space/.test(v({ kind: 'back', gapDays: 5, morningDone: false, why: 'I want my own space' })), 'welcome back quotes your why');
check(/never miss twice/.test(v({ kind: 'nudge', gapDays: 2, morningDone: false })), 'missed yesterday → never miss twice');
check(/bar is lower/.test(v({ mood: 2 })), 'low mood → lower bar');
check(/Finish the report/.test(v({ oneThing: { title: 'Finish the report', done: false } })), 'names your one thing');
check(/Press Focus/.test(v({ hour: 16, oneThing: { title: 'Finish the report', done: false } })), 'afternoon → pushes Focus');
check(/already won/.test(v({ oneThing: { title: 'x', done: true }, progress: 0.5 })), 'one thing done → day won');
check(/Day closed/.test(v({ nightDone: true })) && /Call supplier/.test(v({ nightDone: true, tomorrowOne: 'Call supplier' })), 'closed day, tomorrow named');
check(/finishes what he starts/.test(v({ progress: 1, identity: 'someone who finishes what he starts' })), 'full day reflects identity');

// --- service: ONE thing + day number
await T.addTask('2026-11-10', 'First');
await T.addTask('2026-11-10', 'Second');
let tasks = await T.getTasks('2026-11-10');
check(tasks[0].title === 'First' && tasks[0].is_one === 1 && tasks[1].is_one === 0, 'first task becomes the ONE thing');
await T.setOne(tasks[1].id);
tasks = await T.getTasks('2026-11-10');
check(tasks[0].title === 'Second' && tasks.filter((t) => t.is_one).length === 1, 'choosing another ONE thing moves the star');

await T.setTomorrowOne('2026-11-10', 'Call the supplier');
await T.setTomorrowOne('2026-11-10', 'Call the gas supplier');
const tomorrow = await T.getTasks('2026-11-11');
check(tomorrow.length === 1 && tomorrow[0].is_one === 1 && tomorrow[0].title === 'Call the gas supplier', 'tomorrow’s one thing saved once, editable');
check((await T.getTomorrowOne('2026-11-10')) === 'Call the gas supplier', 'tomorrow’s one thing readable tonight');

await T.carryOver('2026-11-12', await (async () => (await T.getCarryOverCandidates('2026-11-12')).tasks)());
check((await T.getTasks('2026-11-12')).filter((t) => t.is_one).length === 1, 'carried tasks keep exactly one ONE thing');

check((await T.getDayContext('2026-11-10')).kind === 'first', 'no history → first');
await run("INSERT INTO daily_log (date, morning_done_at, updated_at) VALUES ('2026-11-01', 'x', 'x'), ('2026-11-02', 'x', 'x'), ('2026-11-08', 'x', 'x')");
const c1 = await T.getDayContext('2026-11-09');
check(c1.kind === 'normal' && c1.dayNumber === 4, 'day number counts days shown up (gaps do not reset it)');
check((await T.getDayContext('2026-11-10')).kind === 'nudge', 'missed yesterday → nudge');
const c2 = await T.getDayContext('2026-11-20');
check(c2.kind === 'back' && c2.gapDays === 12 && c2.dayNumber === 4, 'long gap → welcome back, same day number');
check((await T.getTodayExtras('2026-11-10')).focusMin === 0, 'extras readable with no focus yet');
done();
