# Kesho — folder map and code rules

Everything lives in ONE folder: `C:\Users\reuben\Desktop\kesho` (GitHub: `benru254/Kesho`).
Every update is applied inside it. It is never rebuilt in a new folder.

```
kesho/
├── README.md                         ← start here
├── .gitignore                        ← keeps private files and build junk out of GitHub
├── .github/copilot-instructions.md   ← rules Copilot follows in this project
├── .github/workflows/build-apk.yml   ← builds the APK on every push, publishes it under Releases
├── tools/make_icons.py               ← draws the app icon + splash (python tools/make_icons.py)
├── docs/
│   ├── STRUCTURE.md                  ← this file
│   ├── PSYCHOLOGY.md                 ← why each feature works the way it does
│   ├── DATABASE.md  DECISIONS.md  TESTING.md  WORKFLOW.md  ROADMAP.md  CHANGELOG.md
│   └── tasks/                        ← every update document (history + steps for Copilot)
└── app/                              ← the Android app (Expo SDK 54)
    ├── App.js                        ← 1 line: hands over to src/App.js. Don't touch.
    ├── package.json                  ← packages + "npm test"
    ├── app.json                      ← name, Android package com.kesho.app, EAS project id (edited by EAS)
    ├── app.config.js                 ← version 1.0.N + versionCode N (from the GitHub build), icon, splash
    ├── eas.json                      ← old EAS build settings (not used any more — GitHub builds the APK)
    ├── assets/                       ← icon.png, adaptive-icon.png, adaptive-background.png, splash-icon.png
    ├── modules/kesho-sms/            ← native Android module (Kotlin): reads M-Pesa SMS
    ├── tests/                        ← automated tests — see docs/TESTING.md
    └── src/                          ← ALL app code
        ├── App.js                    ← APP SHELL: database, features, tabs, banners, overlays
        ├── core/                     ← SHARED FOUNDATION (no screens)
        │   ├── db/                   ← database.js, migrations.js (add-only!), schemaHelpers.js
        │   ├── bus.js                ← features talk without importing each other
        │   ├── settings.js           ← saved settings: getSetting / setSetting
        │   ├── profile.js            ← your name, why, identity, trigger, plan (read by any feature)
        │   ├── celebrate.js          ← celebrate({...}) — one way to celebrate, for every feature
        │   ├── haptics.js            ← tap / success / warn / heavy vibrations
        │   ├── notify.js             ← schedule one-off / weekly notifications (with the tab to open)
        │   ├── dates.js  format.js   ← dates & weeks · KES formatting
        │   └── theme.js              ← ALL colors, spacing, type sizes, sky colors
        ├── ui/                       ← SHARED BUILDING BLOCKS
        │   ├── Button, Card, ChoiceRow, ProgressBar
        │   ├── Tappable.js           ← shrinks + ticks when pressed
        │   ├── Sky.js                ← the living sky (sun rises with progress, stars at night)
        │   └── sky.calc.js           ← sky phase, sun height, stars (pure)
        ├── shell/
        │   ├── TabBar.js             ← tabs + the round Pause button
        │   ├── SettingsScreen.js     ← the 🧭 Me tab: shows every feature's Section
        │   └── useNotificationTab.js ← tapping a notification opens its tab
        └── features/
            ├── registry.js           ← THE SWITCHBOARD: tabs, sections, banners, overlays, actions
            ├── today/                ← ☀️ the heart: sky, voice, check-ins, ONE thing, tasks
            │   ├── TodayScreen.js
            │   ├── cards/            ← MorningCard, TasksCard, MoveCard, NightCard
            │   ├── today.service.js  ← data (tasks, ONE thing, tomorrow, day number)
            │   ├── today.progress.js ← how much of today is done → sun height (pure)
            │   └── today.voice.js    ← Kesho's one-line voice (pure)
            ├── money/                ← 💰 personal money
            │   ├── MoneyScreen.js  EntrySheet.js
            │   ├── cards/            ← Mpesa, Goal, Income, Spend, Wish (wait list), Pots, Recent
            │   ├── money.service.js  money.goal.js (pure)
            │   ├── mpesa/            ← parser (pure), service, native bridge
            │   └── wish/             ← 24-hour wait list: wish.calc.js (pure), wish.service.js
            ├── report/               ← 📊 weekly report (calc pure, service, notify, cards)
            ├── focus/                ← ⏱ focus timer: focus.timer.js (pure), focus.service.js, FocusOverlay
            ├── pause/                ← ⏸ urge Pause: pause.service.js, Breath.js, PauseOverlay
            ├── me/                   ← 🧭 My why: WhyForm, Onboarding (first run), MeSection
            ├── journey/              ← 🌅 lifetime totals + milestones: journey.calc.js (pure), service, section
            ├── celebrate/            ← CelebrationLayer (toasts, full-screen moments), Confetti
            ├── update/               ← ⬆️ new version on GitHub? update.check.js (pure), service, banner, Me section
            ├── reminders/            ← 🔔 daily reminders (Me tab section)
            └── backup/               ← 💾 backup & restore (Me tab section + banner)
```

## File naming = file job

| Name | Job | May import |
|---|---|---|
| `XxxScreen.js` | a whole tab (frontend) | ui, core, its own feature files |
| `XxxSection.js` / `XxxBanner.js` / `XxxOverlay.js` | a block for the Me tab / the strip above tabs / something over the whole app | same as screens |
| `cards/XxxCard.js` | one piece of a screen | ui, core, its own service |
| `xxx.service.js` | data + logic, the only place with SQL (backend) | core |
| `xxx.calc.js` / `.plan.js` / `.goal.js` / `.parser.js` / `.format.js` / `.timer.js` / `.progress.js` / `.voice.js` | **pure** logic: no database, no phone APIs — tested directly | other pure files, `core/profile.shorten` |
| `xxx.native.js` / `xxx.files.js` / `xxx.notify.js` / `xxx.reminder.js` | talks to the phone (native module, files, notifications) | core |

## Where is the backend?
There is no server. The "backend" is each feature's `*.service.js`, and the database is a file on the phone.
This is on purpose: Kesho works for a month with no internet.

## Code rules
1. Screens never write SQL. Screens call `*.service.js`.
2. A feature never imports another feature. Share through `core/`, or talk through `core/bus.js`.
   A feature may READ another feature's tables in its own service (Report, Journey, Reminders, Today do) — never write them.
   One exception: Money's wait list records a purchase with Money's own `addTx`.
3. Database changes = a NEW numbered entry in `migrations.js`. Never edit an old one. Add-only.
4. Every `Text`, `TextInput` and button sets `color` AND `backgroundColor` from `core/theme.js`.
5. New feature = new folder in `features/` + one entry in `registry.js`.
6. Money is a ledger: one row per movement, totals always calculated. Deleting = soft delete.
7. M-Pesa: shop TILL money is business — never personal income. SMS never enter the ledger until sorted.
8. Every file starts with a comment saying what it does. Pure logic gets a test in `app/tests/`.
9. Celebrate only real wins, always through `core/celebrate.js`. Never guilt, never a broken streak.
10. Notifications: Reminders owns `kesho-plan-*`; Backup `kesho-backup`; Report `kesho-report-weekly`;
    Focus `kesho-focus`. Never cancel another feature's notifications. Always pass `{ tab }` in data.

## Events on the bus (`core/bus.js`)
| Event | Sent by | Heard by |
|---|---|---|
| `event` | `logEvent()` on every user action | Reminders (re-plan), Report, Journey (milestones) |
| `celebrate` | `core/celebrate.js` | CelebrationLayer |
| `focus-start` | Tasks card ▶, Pause ("15 minutes instead") | FocusOverlay |
| `focus-finished` | FocusOverlay | Today (ticks the task if finished) |
| `pause-open` | the ⏸ button in the tab bar | PauseOverlay |
| `pause-closed` | PauseOverlay | Today |
| `update-changed` | Update service after a check / "Later" | Update banner and section |
| `profile-changed` | `core/profile.saveProfile` | Today, Me section |
| `restored` | Backup after a restore | App shell (reload every screen), Backup |
| `backup-changed` | Backup after backup / "Later" | Backup banner, section, reminder |
