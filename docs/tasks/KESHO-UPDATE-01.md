# KESHO-UPDATE-01 — Build the real Kesho APK (no PC needed, full notifications)

**For Copilot.** Claude wrote this. Follow the steps in order. Do not change app code.
Project root: `C:\Users\reuben\Desktop\kesho` (all paths below are relative to it).

Why: Expo Go needs the PC running and blocks part of expo-notifications on Android.
A standalone APK (built in Expo's cloud with EAS) runs on its own, offline, with full notifications.
This update adds NO app features — only the build setup.

---

## STEP 0 — Make sure the ONE project folder exists
Reuben is still running `Desktop\kesho-part3\app`. Before anything else:
1. Stop all Expo/Metro/node processes (ports 8081, 8082).
2. If `C:\Users\reuben\Desktop\kesho\app\src\features\money\MoneyScreen.js` does NOT exist:
   run **KESHO-MASTER.md Steps 1–7** now (archive kesho-part1/2/3 + life-app into `_kesho-archive`,
   build the one `kesho` folder, npm install, compile check, git commit).
3. From now on work ONLY in `C:\Users\reuben\Desktop\kesho`. Never run kesho-part3 again.

## STEP 1 — Add the build config file
Create this file (editor, UTF-8):

### FILE: app/eas.json

````json
{
  "cli": {
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
````

And replace this file completely:

### FILE: docs/ROADMAP.md

````markdown
# Kesho — roadmap

Goal: income 10k → 100k KES/month by January 2028. Sleep, movement, peace of mind.
Design rule: built for the lazy, emotional Reuben — the productive Reuben doesn't need help.

## Done
- [x] Part 1 — Today screen: morning check-in, 1–3 tasks (carry-over), move, night check-in, no-guilt welcome
- [x] Part 2 — Reminders: smart plan (skips what's done, max 3/day, tapers when away), editable times, test button
- [x] Part 2 — Energy note: low-mood "minimum day", high-mood "hardest thing first"
- [x] Part 2 — Folder restructure (kesho/app/src/core|ui|features)
- [x] Part 3 — Money: income by source (+ fastest-growing, one-source risk), 100k goal path (16.6%/month), needs/wants, pots (emergency / pay myself / invest), pay-yourself-first 10% prompt, money ladder, recent list
- [x] Master — one folder `Desktop\kesho`, whole app in KESHO-MASTER.md, old folders archived

## Next
- [ ] Update 01 — Real Kesho APK (EAS build): works without the PC, full notifications
- [ ] Part 4 — M-Pesa SMS auto-read (needs the APK; needs real sample messages)
- [ ] Part 5 — Sunday report: patterns between mood, sleep, movement, money
- [ ] Part 6 — Backup/restore to Google Drive (reminder every 7 days)

## Ideas parked (decide later)
- Food tracking
- Meditation timer
- Tapping a notification opens the exact card
- Starting balance of money already saved (before Kesho)
- Debts tracker (who I owe / who owes me)
````

Save this update document as `docs\tasks\KESHO-UPDATE-01.md`.

## STEP 2 — Install the EAS tool (once per PC)
```
npm install -g eas-cli
eas --version
```

## STEP 3 — Log in to Expo (REUBEN types this — Copilot cannot)
Open a terminal for Reuben and tell him:
"Type `eas login`, then your Expo account username/email and password."
Then verify with `eas whoami` (must print his username).

## STEP 4 — Link the project to Expo (this is allowed to edit app.json)
```
cd C:\Users\reuben\Desktop\kesho\app
eas init
```
- Answer **Yes** to create the project "kesho" on his account.
- It adds `extra.eas.projectId` (and maybe `owner`) to `app.json`. That is expected — keep it.
- Do not change anything else in app.json.

## STEP 5 — Compile check before spending a cloud build
```
npx expo export --platform android
```
Must finish with no errors. If it fails: STOP and report the full error.

## STEP 6 — Build the APK in Expo's cloud (~10–40 min, needs internet)
```
cd C:\Users\reuben\Desktop\kesho\app
eas build -p android --profile preview
```
Prompts:
- "Generate a new Android Keystore?" → **Yes** (Expo stores it safely; needed for all future updates).
- If asked to install `expo-dev-client`: answer **No** (we want a normal app, not a dev build).
Keep the terminal open until it prints **"Build finished"** and an `https://expo.dev/.../builds/...` link.
Free accounts can wait in a queue; that is normal. If it fails, open the build page,
copy the error from the failed step (e.g. "Run gradlew"), and report it. Do not change code.

## STEP 7 — Commit
```
cd C:\Users\reuben\Desktop\kesho
git add .
git commit -m "Update 01: EAS build config, first Kesho APK"
```

## STEP 8 — Report for Reuben
1. Did Step 0 have to rebuild the folder? (yes/no)
2. The build link from Step 6 (Reuben opens it ON HIS PHONE to download the APK).
3. Any errors, with exact text.

---

## Notes for later updates (Copilot: read, no action)
- From now on Reuben uses the installed APK daily. Code changes need a NEW build (`eas build -p android --profile preview`)
  and installing the new APK over the old one — his data stays, as long as the same keystore is used (EAS handles that).
- For quick testing of new code before building, `npx expo start --lan` + Expo Go still works.
