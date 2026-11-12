# KESHO-UPDATE-04 — Kesho comes alive

**For Copilot.** Claude wrote and tested this. Follow the steps in order. Do not edit app code.
Local folder: `C:\Users\reuben\Desktop\kesho` · GitHub: `https://github.com/benru254/Kesho` (branch `main`).

The code is already on GitHub. Claude tested it before pushing: **10 test files, 154 checks**, a real Android
compile with Expo SDK 54, and Expo's Android project generator (icon, splash, SMS module all linked).

## What Update 04 adds (details: docs/CHANGELOG.md, why: docs/PSYCHOLOGY.md)
- Living sky on Today (sun rises with your progress, stars = days shown up), DAY N, Kesho's voice
- THE ONE THING + tomorrow's one thing, ▶ Focus timer, ⏸ Pause button, 24-hour wait list
- 🧭 Me tab: My why (first-run questions), My journey (milestones), Reminders, Backup
- Haptics, celebrations, confetti, milestone moments, notification taps open the right tab
- Sunrise app icon + splash screen
- Database v4 (upgrades itself; existing data is kept)
- 5 new packages (installed by `npm install` — package.json already lists them)

**This update works whether or not Update 03 was applied on this PC.**

---

## STEP 0 — Prerequisites (report; STOP if one fails)
1. `app\eas.json` exists and `eas whoami` prints Reuben's username (Update 01 done).
2. `node --version` is **22 or newer**. If older: `winget install OpenJS.NodeJS.LTS`, reopen the terminal.
3. Stop all Expo/Metro processes.
4. If `git status` shows uncommitted changes: `git add .` → `git commit -m "PC state before update 04"`.

## STEP 1 — Back up the PC-only files
```
cd C:\Users\reuben\Desktop\kesho
New-Item -ItemType Directory -Force C:\Users\reuben\Desktop\_kesho-archive\update04 | Out-Null
Copy-Item app\app.json C:\Users\reuben\Desktop\_kesho-archive\update04\app.json
Copy-Item -Recurse app\modules\kesho-sms C:\Users\reuben\Desktop\_kesho-archive\update04\kesho-sms -ErrorAction SilentlyContinue
```

## STEP 2 — Take GitHub's code
```
git remote -v
```
- No `origin`: `git remote add origin https://github.com/benru254/Kesho.git`
- `origin` points elsewhere: `git remote set-url origin https://github.com/benru254/Kesho.git`
```
git fetch origin
git checkout origin/main -- .
```
(A GitHub sign-in window may open — **Reuben signs in himself**, account `benru254`.)

## STEP 3 — Put the EAS project id back
Open `C:\Users\reuben\Desktop\_kesho-archive\update04\app.json`.
- If it contains `"projectId"`: copy it back →
  `Copy-Item C:\Users\reuben\Desktop\_kesho-archive\update04\app.json app\app.json -Force`
- If it does not: keep GitHub's `app\app.json` (no action).

Do NOT change `app\app.config.js` — it adds the icon and splash on top of app.json.

Archive the file Update 03 replaced, if it is still there:
```
Move-Item app\src\features\reminders\RemindersScreen.js C:\Users\reuben\Desktop\_kesho-archive\update04\ -ErrorAction SilentlyContinue
```

## STEP 4 — Make GitHub's history this folder's history
```
git reset --soft origin/main
git branch -M main
git status
```
Expected: at most `app/app.json` (projectId), `app/package-lock.json`, and maybe extra files under
`app/modules/kesho-sms/` that Expo generated earlier (e.g. `ios/`, `src/`, `index.ts`). **Nothing under `app/src/`.**
If anything under `app/src/` shows as changed: STOP and report the list.

## STEP 5 — Install, test, compile
```
cd app
npm install
npm test
npx expo export --platform android
```
- `npm test` must end with `10 passed, 0 failed, 0 skipped`.
- The export must finish without errors.
- If anything fails: STOP, copy the full output for Claude. Never run `npm audit fix`.

## STEP 6 — Build the APK (~10–40 min)
```
eas build -p android --profile preview
```
Reuse the existing keystore (never a new one — the APK must install over the old app so data is kept).
If it fails: copy the error lines from the failed step on the build page and report. Do not edit code.

## STEP 7 — Reuben tests on the phone
Install the new APK **over** the old one (don't uninstall — that would delete the data).
1. New sunrise icon. Opening shows the sun splash, then **4 "My why" questions** (answer or skip).
2. Today: sky matches the time of day, **DAY N**, one line of Kesho's voice.
3. Morning check-in → vibration + toast; the sun rises a little.
4. First task is gold **★ THE ONE THING**. Press **▶ Focus on this** → 15 min → "Stop early" after a minute or two →
   "Did you finish?" → Yes ticks it off.
5. Press the round **⏸ Pause** → pick something → breathe → "It passed" → "You held" (first time: a full-screen milestone).
6. Money → Wait list: park a want → "Let it go now" → "KES … stays yours".
7. Night check-in with **Tomorrow's ONE thing** → night sky with stars. Next morning that task is already gold.
8. Me tab: My why shows your answers; My journey shows totals; Reminders and Backup still work.
9. Old data (money, check-ins, M-Pesa) is still there.

## STEP 8 — Push this PC's own files (after Reuben confirms Step 7)
```
cd C:\Users\reuben\Desktop\kesho
git add .
git status
git diff --cached --name-only | Select-String -Pattern "kesho-backup|\.db$|\.jks$|\.keystore$|credentials|\.env|\.apk$"
```
The last command must print NOTHING (the repository is PUBLIC). Then:
```
git commit -m "PC: EAS project id, lockfile"
git push -u origin main
```
If the push is rejected: `git pull --rebase origin main`, then push again.
If there is nothing to commit, skip this step.

## STEP 9 — Report for Reuben
Node version · Step 4 `git status` · test + compile results · build link · push result.
