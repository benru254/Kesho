# Kesho tests

Run from the `app` folder:

```
npm test
```

- Every `*.test.js` file here is bundled with esbuild and run with Node.
- Phone-only packages (expo-sqlite, react-native, expo) are replaced by small stand-ins in `stubs/`.
  `stubs/expo-sqlite.js` uses Node's built-in SQLite, so database tests run real SQL.
- Database tests need **Node 22 or newer**. On older Node they are skipped (not failed), with a message.
- `fixtures/mpesa-samples.txt` holds **FAKE** M-Pesa messages: real formats, invented names, numbers and codes.
  Never put real SMS, backups or personal data in this repository — it is public.

Add a test: create `something.test.js`, import `check` and `done` from `./lib/check.js`, call `done()` at the end.
