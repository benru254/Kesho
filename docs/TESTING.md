# Kesho — testing

Two kinds of testing: **automated** (Copilot runs before every build) and **on the phone** (Reuben).

## 1. Automated tests

```powershell
cd C:\Users\reuben\Desktop\kesho\app
npm test
```

Must end with `10 passed, 0 failed, 0 skipped` (154 checks). If anything fails, **do not build** — report the output to Claude.

| File | What it proves |
|---|---|
| `dates.test.js` | weeks start Monday, month/year rollovers |
| `reminders.plan.test.js` | skips done items, max 3/day, gentle when away, Monday fresh start |
| `money.goal.test.js` | +16.6%/month path, verdicts, KES formatting, money ladder |
| `money.service.test.js` | ledger totals, soft delete, pots, withdrawals, goal saving (real SQLite) |
| `mpesa.parser.test.js` | every M-Pesa format seen so far (fake data, real formats) |
| `mpesa.service.test.js` | import → sort → ledger, till = business, fees, no doubles, suggestions (real SQLite) |
| `report.calc.test.js` | week stats, "missed twice", comparisons, patterns, focus |
| `backup.test.js` | export → damage → restore = identical; bad files refused; reminder timing (real SQLite) |
| `today.test.js` | sun progress (incl. low-energy days), sky, Kesho's voice, ONE thing, tomorrow's one thing, day number never resets (real SQLite) |
| `alive.test.js` | focus timer (incl. app closed mid-session), Pause urges, 24h wait list, milestones once each, profile (real SQLite) |

How it works: `tests/run.js` bundles each test with esbuild, swaps phone packages for `tests/stubs/`
(SQLite uses Node's built-in `node:sqlite`), and runs it with Node in the Africa/Nairobi time zone.
Database tests need **Node 22+** (they are skipped, not failed, on older Node).

**Privacy:** `tests/fixtures/` holds FAKE data only. When a new M-Pesa format appears, Claude copies its
structure with invented names, numbers and codes.

## 2. Phone checklist (after installing a new APK)

Do the parts related to the update, plus the quick smoke test.

**Smoke test (every update, 1 minute)**
- [ ] App opens; tabs: Today, Money, ⏸ Pause (round, middle), Report, Me
- [ ] Data from before the update is still there

**Today**
- [ ] Sky colors match the time of day; DAY N shown; one line of Kesho's voice
- [ ] Morning check-in saves → toast + vibration; the sun rises a little
- [ ] First task is gold (★ THE ONE THING); ☆ on another task moves the star
- [ ] ▶ Focus → pick 15 → timer counts down, screen stays on → Stop early → "Did you finish?" → Yes ticks the task
- [ ] Night check-in with "Tomorrow's ONE thing" → night sky with stars; tomorrow that task is already gold

**Pause (⏸)**
- [ ] Pick a trigger → breathing circle 60 s → your why shown → "It passed" → "You held" toast

**Me**
- [ ] First run: the 4 "My why" questions appear once; answers show in Me → My why
- [ ] My journey shows days, focus, urges held, put aside; Day 1 / first urge held milestone appears full-screen once

**Money**
- [ ] + In 5000 → "Pay yourself first?" offers 500 → Yes → celebration
- [ ] Wait list: park a want → "Decide in 24 h"; "Let it go now" → "KES … stays yours" 
- [ ] − Out as Wants → warning if wants > 30%
- [ ] M-Pesa card: balance shown, shop till total shown separately, sort one payment → it leaves the list

**Report**
- [ ] Shows this week (or last week on Mondays); ‹ › moves between weeks
- [ ] Focus card shows ONE suggestion

**Me → Reminders**
- [ ] "Send a test reminder" arrives with the phone locked

**Me → Backup**
- [ ] Back up → share menu → Drive → file appears in Drive
- [ ] Restore that file → "Restored ✓", data unchanged
- [ ] "Undo the last restore" appears and works
