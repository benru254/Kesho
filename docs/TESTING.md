# Kesho — testing

Two kinds of testing: **automated** (Copilot runs before every build) and **on the phone** (Reuben).

## 1. Automated tests

```powershell
cd C:\Users\reuben\Desktop\kesho\app
npm test
```

Must end with `0 failed`. If anything fails, **do not build** — report the output to Claude.

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

How it works: `tests/run.js` bundles each test with esbuild, swaps phone packages for `tests/stubs/`
(SQLite uses Node's built-in `node:sqlite`), and runs it with Node in the Africa/Nairobi time zone.
Database tests need **Node 22+** (they are skipped, not failed, on older Node).

**Privacy:** `tests/fixtures/` holds FAKE data only. When a new M-Pesa format appears, Claude copies its
structure with invented names, numbers and codes.

## 2. Phone checklist (after installing a new APK)

Do the parts related to the update, plus the quick smoke test.

**Smoke test (every update, 1 minute)**
- [ ] App opens; tabs: Today, Money, Report, Settings
- [ ] Data from before the update is still there

**Today**
- [ ] Morning check-in saves (card turns green)
- [ ] Add 3 tasks → input disappears; tick all → "All done"
- [ ] "I moved today" → week count goes up

**Money**
- [ ] + In 5000 → "Pay yourself first?" offers 500
- [ ] − Out as Wants → warning if wants > 30%
- [ ] M-Pesa card: balance shown, shop till total shown separately, sort one payment → it leaves the list

**Report**
- [ ] Shows this week (or last week on Mondays); ‹ › moves between weeks
- [ ] Focus card shows ONE suggestion

**Settings → Reminders**
- [ ] "Send a test reminder" arrives with the phone locked

**Settings → Backup**
- [ ] Back up → share menu → Drive → file appears in Drive
- [ ] Restore that file → "Restored ✓", data unchanged
- [ ] "Undo the last restore" appears and works
