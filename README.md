# Kesho

**Kesho** (Swahili: *tomorrow*) is a personal Android app that helps one person — Reuben — track his
**time, money and health** and move steadily toward his goals, **without living a miserable life**.

It is built for real life, not for perfect days: it works offline for weeks, never guilt-trips,
asks for about **2 minutes a day**, and tells the truth with numbers. It is built for the lazy,
emotional days — and it fights for you on them, using your own words.
Why each feature works the way it does: [docs/PSYCHOLOGY.md](docs/PSYCHOLOGY.md)

> Main goal tracked in the app: personal income **10,000 → 100,000 KES/month by January 2028**
> (that means +16.6% every month), plus better sleep, regular movement and peace of mind.

---

## What it does

| Tab | What you get |
|---|---|
| ☀️ **Today** | A **living sky**: follows the real time of day, the sun rises as you complete the day, one star per day you showed up · **DAY N** counter that never resets · Kesho's voice (one honest line that reacts to you) · morning check-in · **THE ONE THING** (gold) + up to 2 more tasks · ▶ **Focus timer** on any task · move 10 minutes · night check-in that plans **tomorrow's one thing** · low-energy days get a lower bar |
| 💰 **Money** | Money in / out / put aside in seconds · **M-Pesa SMS read automatically** (shop till money kept separate as business) · income-goal path · income by source · needs vs wants · **24-hour wait list** for wants · pots (emergency fund, pay yourself, invest) · "pay yourself first" 10% prompt |
| ⏸ **Pause** | The round button in the middle of the tab bar, for the moment a feeling is about to decide for you: name the pull → breathe 60 s → your own why → your if-then plan → held / slipped, no shame |
| 📊 **Report** | Weekly report (Mon–Sun): showing up, sleep, movement, mood, stress, tasks, deep focus, urges held, money, money kept · change vs last week · patterns from the last 28 days · **one** focus for next week |
| 🧭 **Me** | **My why** (your reason, who you are becoming, your trigger, your plan) · **My journey** (lifetime totals + milestones) · Reminders · Backup / restore |

**Feels alive:** buttons give a light vibration, real wins get a toast + confetti, milestones (Day 7, 30, 100,
first urge held, focus hours, KES saved…) get a full-screen moment — once each. Tapping a notification opens
the right tab. A sunrise app icon and splash screen.

**Reminders:** max 3 a day (morning, move, night), skipped when already done, gentler on low-mood days,
fewer when you're away ("never miss twice"), plus a Sunday 19:00 report and a weekly backup reminder.

## Design rules

1. **Built for the lazy, emotional day** — the productive day doesn't need help. One tap beats a form.
2. **Honest, never cruel** — real numbers and clear warnings; no guilt, no red failure screens, no streak shaming.
3. **Offline first** — everything works with no internet. Data lives on the phone.
4. **Personal only** — business money (shop till) is never mixed with personal income.
5. **Easy to change** — features are separate folders that plug into one switchboard.

---

## Tech

- **React Native + Expo SDK 54**, plain JavaScript
- **expo-sqlite** — local database (one file on the phone)
- **expo-notifications** — local reminders (no server, no push)
- **expo-file-system / expo-sharing / expo-document-picker** — backup & restore via Google Drive
- **Local native module** `app/modules/kesho-sms` (Kotlin) — reads M-Pesa SMS (Android only)
- **EAS Build** — builds the installable APK in Expo's cloud

No backend server. No accounts. No analytics.

## Folder structure (short)

```
kesho/
├── README.md                 ← you are here
├── docs/                     ← how everything works (start with STRUCTURE.md)
├── .github/copilot-instructions.md
└── app/                      ← the Android app
    ├── src/
    │   ├── App.js            ← app shell: database, tabs, banners
    │   ├── core/             ← shared foundation (database, dates, money format, theme, settings, events)
    │   ├── ui/               ← shared building blocks (Button, Card, ...)
    │   ├── shell/            ← tab bar, Me tab container, notification → tab
    │   └── features/         ← one folder per feature + registry.js (the switchboard)
    ├── modules/kesho-sms/    ← native Android SMS reader
    └── tests/                ← automated tests (npm test)
```

Full map with every file: [docs/STRUCTURE.md](docs/STRUCTURE.md)

---

## Getting started (Windows, development)

Requirements: **Node.js 22 LTS**, Git, an Android phone, an [Expo](https://expo.dev) account.

```powershell
git clone https://github.com/benru254/Kesho.git
cd Kesho\app
npm install
npm test                 # all tests must pass
npx expo start --lan     # scan the QR code with Expo Go on the phone (same Wi-Fi)
```

**Expo Go limits:** M-Pesa SMS reading and some notification features only work in the installed APK.
Expo Go is for quick testing of screens.

## Build and install the APK

```powershell
cd app
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Open the build link **on the phone**, download the APK and install it (allow "Install unknown apps").
Updates are installed over the old app — data stays, as long as the same EAS keystore is used
(EAS keeps it; never create a new one).

If Android blocks the SMS permission ("Restricted setting"): Settings → Apps → Kesho → ⋮ → **Allow restricted settings**.

## Data & privacy

- All data is in one SQLite file **on the phone**. Nothing is uploaded anywhere.
- Backups are JSON files you save to **your own Google Drive** from Me → Backup.
- Kesho reads only SMS from **MPESA**, only on the phone.
- ⚠️ **This repository is public.** Never commit backups (`kesho-backup-*.json`), databases, real SMS,
  screenshots with money, keystores or passwords. `.gitignore` blocks the common ones — but check before pushing.

## Tests

```powershell
cd app
npm test
```

10 test files (154 checks): dates, reminder plan, goal math, money ledger, M-Pesa reader, M-Pesa import/sorting,
weekly report, backup/restore, Today (sun, voice, ONE thing), focus, pause, wait list, milestones — run on a real SQLite database. M-Pesa test data is **fake** (real formats, invented
names and numbers). Details: [docs/TESTING.md](docs/TESTING.md)

## How this project is built

- **Claude** (architect) designs features, writes and tests all code, and pushes it here. Each update has notes in `docs/tasks/`.
- **GitHub Copilot** pulls the code onto Reuben's PC, runs the tests and builds the APK.
- **Reuben** tests the app on his phone and decides what comes next.

Details: [docs/WORKFLOW.md](docs/WORKFLOW.md)

## Documentation

| File | What's inside |
|---|---|
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Every folder and file, and the code rules |
| [docs/PSYCHOLOGY.md](docs/PSYCHOLOGY.md) | The psychology behind every feature |
| [docs/DATABASE.md](docs/DATABASE.md) | Every table and column, migrations |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why things are the way they are |
| [docs/TESTING.md](docs/TESTING.md) | Automated tests + phone test checklist |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | How updates are written, applied, built and released |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Done, next, parked ideas |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | What changed in each update |

---

Personal project by Reuben (Kenya). All rights reserved.
