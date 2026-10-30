# COPILOT TASK 01 — Organize Kesho into one folder and run it on Reuben's phone

You are working for Reuben. Claude (the architect) wrote this task. You (Copilot) do ALL the file and
terminal work. Reuben only tests the app on his Android phone and reports back.
Follow the steps in order. Do not skip ahead. Do not "improve" things that are not in this task.

## Background (read first)
- Kesho is a personal Android app: Expo + React Native + expo-sqlite + expo-notifications.
- The code was delivered in 3 zips. Each one landed in its own Desktop folder:
  `kesho-part1`, `kesho-part2`, `kesho-part3` (and maybe `life-app` and/or `kesho`).
- **`kesho-part3` holds the newest, complete code** (Today + Reminders + Money) and a working Expo
  setup you created earlier (package.json, app.json, metro.config.js, node_modules). It is the source of truth.
- The older folders are obsolete, but we keep them (archived) in case something is needed later.
- TARGET IS ANDROID ONLY, tested with Expo Go on a real phone. Never run or fix for web.

## Final result we want
```
C:\Users\reuben\Desktop\
├── kesho\                       ← the ONE project
│   ├── .github\copilot-instructions.md
│   ├── .gitignore
│   ├── docs\  (STRUCTURE.md, ROADMAP.md, tasks\)
│   └── app\   (package.json, app.json, App.js, src\ ...)
└── _kesho-archive\              ← all old folders, untouched
```

---

## Step 1 — Stop everything
Stop every running Expo/Metro/node process (ports 8081 and 8082). Close any browser preview of the app.

## Step 2 — Inventory (report, change nothing)
For each of these Desktop folders that exists: `kesho`, `kesho-part1`, `kesho-part2`, `kesho-part3`, `life-app`
print: does it exist, does `app\package.json` (or `package.json`) exist, and the `expo` version in it.
Show Reuben a short table.

## Step 3 — Archive the old folders (move, never delete)
1. Create `C:\Users\reuben\Desktop\_kesho-archive`.
2. Move into it every folder from Step 2 that exists, **EXCEPT `kesho-part3`**.
   (If a `kesho` folder exists, it gets archived too, so the name is free.)
3. Use `Move-Item`. Do NOT use `Remove-Item` on anything in this task.

## Step 4 — Make kesho-part3 the project
1. Rename `C:\Users\reuben\Desktop\kesho-part3` to `C:\Users\reuben\Desktop\kesho`.
2. Verify these files exist (report any missing one and STOP):
   - `kesho\app\package.json`
   - `kesho\app\App.js` (must contain only: `export { default } from './src/App';` plus a comment)
   - `kesho\app\src\App.js`
   - `kesho\app\src\features\registry.js` (must list today, money, reminders)
   - `kesho\app\src\features\money\MoneyScreen.js`
   - `kesho\app\src\core\db\migrations.js` (must contain `version: 2`)
   - `kesho\docs\STRUCTURE.md`
3. Make sure there is NO second copy of `src` anywhere else inside `kesho` (e.g. `kesho\src`). If found, report and STOP.
4. Create the folder `kesho\docs\tasks\` and save this task file in it as `01-organize-and-run.md`.

## Step 5 — Create the rules file
Create `kesho\.github\copilot-instructions.md` in the editor (UTF-8), with exactly this content:

```markdown
# Kesho — rules for Copilot

## Roles
- Claude = architect. Writes code + task files (docs\tasks\NN-*.md). Follow them step by step.
- Copilot = does ALL file and terminal work.
- Reuben = tests on his Android phone and reports. Never ask Reuben to edit files or run commands.

## Project
- Root: C:\Users\reuben\Desktop\kesho . Expo app in app\ . Never create or run a copy elsewhere.
- Old folders are in C:\Users\reuben\Desktop\_kesho-archive . Never use code from there unless a task says so.
- Target: ANDROID ONLY, real phone, Expo Go (later an APK built with EAS). Never run or fix for web
  (no --web, no react-native-web fixes, no browser testing).
- Read docs\STRUCTURE.md before changing code. Follow its rules.

## Applying a new zip from Claude
- Unzip with: Expand-Archive -Path <zip> -DestinationPath C:\Users\reuben\Desktop\kesho -Force
- Never "Extract All" into a new folder. Never create kesho-partN folders.
- Files in the zip REPLACE the project files at the same path. Do not merge by hand.

## Never
- Never edit package.json / app.json or install/upgrade packages unless a task says so.
  When a task says to install: `npx expo install <pkg>` only.
- Never run `npm audit fix` (breaks Expo versions).
- Never write files with PowerShell (Set-Content, Out-File, echo >). Use the editor, UTF-8.
- Never delete user folders. Archive with Move-Item.
- Never rebuild a file from memory. Read it first.

## Code rules
- Every Text / TextInput / button: explicit color AND backgroundColor from src\core\theme.js.
- Screens never write SQL; they call *.service.js.
- Database changes = new numbered migration, add-only. Never edit an old migration.

## After any change
- Run: cd C:\Users\reuben\Desktop\kesho\app ; npx expo start   (LAN mode, shows QR for the phone)
- Commit when Reuben confirms it works: git add . ; git commit -m "<what changed>"
```

## Step 6 — Git safety net
In `C:\Users\reuben\Desktop\kesho`:
1. Create `.gitignore` (editor, UTF-8) with:
   ```
   node_modules/
   .expo/
   dist/
   web-build/
   *.log
   ```
2. If `kesho\.git` does not exist: `git init`.
3. `git add .` then `git commit -m "Organize: one kesho folder, Part 3 (Today, Reminders, Money)"`.

## Step 7 — Run for the phone
```
cd C:\Users\reuben\Desktop\kesho\app
npx expo start
```
- Use LAN mode (default). NOT `--localhost`, NOT `--web`.
- If Metro complains about cache, run `npx expo start --clear` once. If `--clear` fails with a permission
  error on the temp folder, run without it.
- Tell Reuben: "Scan the QR with Expo Go on your phone." Keep the server running.

## Step 8 — If Reuben's phone shows a problem (only then)
- **"Project is incompatible with this version of Expo Go" / SDK mismatch:**
  read the SDK number Expo Go supports from the message (e.g. 55), then run
  `npx expo install expo@^<N>.0.0` followed by `npx expo install --fix`, then `npx expo start --clear`.
  Report the exact versions before and after.
- **Phone can't connect / QR loads forever:** phone and PC must be on the same Wi-Fi.
  Then try `npx expo start --tunnel` (accept installing @expo/ngrok if asked).
- **Red error screen on the phone:** copy the full error text and the Metro terminal output into the
  report for Claude. Do NOT try to fix code on your own.

## Step 9 — Report (short)
Give Reuben a summary to send to Claude:
1. The inventory table from Step 2.
2. What was archived, and the final `kesho` tree (2 levels deep, skip node_modules).
3. Expo SDK version in `kesho\app\package.json`.
4. Whether the QR code showed, and anything that failed (exact error text).
