// needs: sqlite
// M-Pesa import → sort → ledger on a real database.
import { check, done } from './lib/check.js';
import { fixtureLines } from './lib/fixture.js';
import * as S from '../src/features/money/mpesa/mpesa.service.js';
import * as M from '../src/features/money/money.service.js';
import { all } from '../src/core/db/database.js';
import { getSetting } from '../src/core/settings.js';

const lines = fixtureLines('mpesa-samples.txt');
const msgs = lines.map((body, i) => ({ body, date: 1e12 + (lines.length - i) * 1000 })); // file is newest-first

const r1 = await S.importMessages(msgs);
check(r1.added === 14 && r1.pending === 8, '14 stored (failed-PIN ignored), 8 personal waiting to sort');
check((await S.importMessages(msgs)).added === 0, 'importing again adds nothing');
check((await getSetting('mpesa_balance')).amount === 3, 'balance taken from newest personal SMS');

const st = await S.getMpesaState('2026-09');
check(st.business.count === 4 && st.business.total === 4350, 'September shop till kept separate');
const B = Object.fromEntries((await M.getBuckets()).map((b) => [b.key, b.id]));

const kplc = st.pending.find((p) => p.party_key === 'kplc prepaid');
await S.sortItem(kplc.id, { bucketId: B.needs });
await S.sortItem(kplc.id, { bucketId: B.needs });
const tx = await all("SELECT amount, bucket_id, ext_ref FROM money_tx WHERE origin = 'mpesa'");
check(tx.length === 2 && tx.some((t) => t.ext_ref === 'TX00000004-FEE' && t.amount === 5 && t.bucket_id === B.fees), 'sorted once → payment + fee row, never doubled');

const shop = st.pending.filter((p) => p.party_key === 'jane test shop');
await S.sortItem(shop[0].id, { bucketId: B.wants });
const next = (await S.getMpesaState('2026-09')).pending.find((p) => p.party_key === 'jane test shop');
check(next.suggestion && next.suggestion.bucketId === B.wants, 'remembers your choice as a suggestion');

const st2 = await S.getMpesaState('2026-09');
await S.sortItem(st2.pending.find((p) => p.kind === 'received').id, { sourceId: (await M.getSources())[0].id });
await S.skipItem(st2.pending.find((p) => p.party_key === 'airtel money').id);
check((await S.sortAllSuggested()) === 1, '"Sort like last time" applies saved choices');

const sep = await M.getMonthSummary('2026-09');
const spend = Object.fromEntries(sep.spend.map((x) => [x.key, x.total]));
check(sep.totalIn === 0, 'shop till money is NOT personal income');
check(spend.needs === 200 && spend.wants === 230 && spend.fees === 5, 'needs, wants and fees add up');
check((await M.getMonthSummary('2026-05')).totalIn === 1050, 'received money sorted as income');
check((await S.syncFromPhone()).available === false, 'no native module (Expo Go/tests) → safe, no crash');
done();
