# Kesho — changelog

## Update 03 — Backup, weekly report, organized project, GitHub
- **Backup & restore**: Settings → Backup → share to Google Drive; restore from a file; safety copy + "Undo the last restore";
  banner above every tab when the backup is 7+ days old; reminder notification at 19:30 when due.
- **Weekly report** (new 📊 tab): showing up, check-ins, sleep, movement, mood, stress, tasks, money; change vs last week;
  "never miss twice" count; patterns from the last 28 days (only with enough data); ONE focus for next week;
  notification every Sunday 19:00.
- **Settings tab** (⚙️): Reminders and Backup now live here. The registry supports `Screen`, `Section`, `Banner`, `init`.
- New shared helpers: `core/notify.js`, week helpers in `core/dates.js`.
- **Automated tests** in `app/tests` (`npm test`): 8 files, 89 checks, fake M-Pesa data only.
- **Docs**: README, STRUCTURE, DATABASE, DECISIONS, TESTING, WORKFLOW, CHANGELOG. Every source file has a header comment.
- Code published on GitHub: `benru254/Kesho` — from now on GitHub is the source of truth (Claude pushes, Copilot pulls).
- M-Pesa bridge imports `requireOptionalNativeModule` from `expo` (not the indirect `expo-modules-core`).
- New packages (exact SDK 54 versions): expo-file-system ~19.0.24, expo-sharing ~14.0.8, expo-document-picker ~14.0.8; dev: esbuild.

## Update 02 — M-Pesa SMS auto-read (Part 4)
- Native module `modules/kesho-sms` reads MPESA SMS (installed APK only).
- Shop till receipts kept separate as business. Personal payments wait to be sorted (Need / Want / Not spending, or income source).
- Suggestions from past choices + "Sort N like last time". M-Pesa fees bucket. Real M-Pesa balance from SMS.
- Database v3: `mpesa_inbox`.

## Update 01 — Installable APK
- `eas.json` (preview profile = APK). App works without the PC; full notifications.

## Master — one project folder
- Everything in `Desktop\kesho`; old folders archived.

## Part 3 — Money
- In / out / aside, sources, needs/wants, pots, pay-yourself-first, 100k goal path, money ladder. Database v2.

## Part 2 — Reminders
- Smart plan: skips done items, max 3/day, gentle when away, low-mood messages, editable times, test button.
- Energy note on Today (low-energy minimum day / high-energy hardest thing first).

## Part 1 — Today
- Morning check-in, 1–3 tasks with carry-over, move, night check-in, no-guilt welcome. Database v1.
