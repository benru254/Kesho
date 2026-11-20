# Kesho — changelog

## Update 05 — Download and update from GitHub (like Njia)
- `.github/workflows/build-apk.yml`: every push to `main` runs the tests, builds the APK and publishes **Kesho 1.0.N** under Releases.
- Version `1.0.N` / versionCode N from the GitHub build number, so each APK installs over the last one (data kept).
- **In-app updates**: Kesho checks GitHub (when online, max every 12 h). A green strip "✨ Kesho 1.0.N is ready → Get it",
  and **Me → Updates** (installed version, Check for updates, Download).
- New package: expo-application (SDK 54 version). Tests: 11 files, 168 checks.
- EAS no longer used for builds. One-time switch for an EAS-installed Kesho: back up → uninstall → install → restore.

## Update 04 — Kesho comes alive
**Psychology** (why: docs/PSYCHOLOGY.md)
- **My why**: first-run questions (why · who I am becoming · what pulls me off track · my if-then plan). Your words come back in Pause, Focus, Today and reminders.
- **THE ONE THING**: one gold task per day; night check-in plans **tomorrow's one thing**, and the morning reminder names it.
- **⏸ Pause button** (middle of the tab bar): name the urge → 60 s breathing → your why → your plan → held / slipped, logged without shame.
- **▶ Focus timer**: 15 / 25 / 45 min on any task; survives the app being closed; asks if the task is finished.
- **24-hour wait list** (Money): park wants; "let it go" counts money kept; "buy it" records it under Wants.
- **Milestones & My journey** (Me tab): lifetime totals that never reset; Day 7/30/100…, urges held, focus hours, KES saved, money kept — each celebrated once.

**UI / UX / feeling**
- **Living sky** on Today: real time-of-day colors; the sun rises as you complete the day; night + one star per day shown up.
- **DAY N** counter (never resets) and **Kesho's voice** — one honest line that reacts to your mood, progress, absence and one thing.
- Low-energy days get a lower bar: one task + close the day = full sun.
- Haptics on every button; celebration toasts with confetti; full-screen milestone moments.
- New tab bar with the round Pause button; Settings → **🧭 Me** tab.
- Tapping a notification opens the right tab.
- Sunrise **app icon**, adaptive icon and **splash screen** (`tools/make_icons.py`, `app/app.config.js`).

**Report**: deep focus minutes, urges held, money kept by waiting; new focus rule for urges.

**Tech**: database v4 (tasks.is_one, focus_sessions, urges, wishes, milestones) · new packages expo-haptics,
expo-linear-gradient, expo-keep-awake, expo-splash-screen, expo-system-ui (SDK 54 versions) ·
`modules/kesho-sms/android/build.gradle` now in the repo · tests: 10 files, 154 checks.

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
