// needs: sqlite
// Money ledger on a real database: totals, soft delete, pots, withdrawals, goal settings.
import { check, done } from './lib/check.js';
import * as M from '../src/features/money/money.service.js';
import { get } from '../src/core/db/database.js';

check((await get('SELECT version FROM schema_version')).version >= 3, 'database migrated');
const sources = await M.getSources();
const B = Object.fromEntries((await M.getBuckets()).map((b) => [b.key, b.id]));
check(sources.length === 3 && B.needs && B.wants && B.fees && B.emergency, 'default sources and buckets seeded');
check((await M.addSource('software / TECH')) === sources[1].id, 'no duplicate source (case-insensitive)');

await M.addTx({ date: '2026-09-10', type: 'in', amount: 6000, sourceId: sources[0].id });
await M.addTx({ date: '2026-09-15', type: 'out', amount: 5000, bucketId: B.needs });
await M.addTx({ date: '2026-10-05', type: 'in', amount: 6000, sourceId: sources[0].id });
await M.addTx({ date: '2026-10-06', type: 'in', amount: 3500, sourceId: sources[1].id });
await M.addTx({ date: '2026-10-07', type: 'out', amount: 4000, bucketId: B.needs });
await M.addTx({ date: '2026-10-08', type: 'out', amount: 2500, bucketId: B.wants });
await M.addTx({ date: '2026-10-09', type: 'aside', amount: 1000, bucketId: B.emergency });
const mistake = await M.addTx({ date: '2026-10-09', type: 'out', amount: 999, bucketId: B.wants });
await M.deleteTx(mistake);
await M.withdrawFromPot({ date: '2026-10-10', bucketId: B.emergency, amount: 300, note: 'clinic' });

let threw = false;
try { await M.withdrawFromPot({ date: '2026-10-10', bucketId: B.emergency, amount: 5000 }); } catch { threw = true; }
check(threw, 'cannot take more out of a pot than it holds');

const s = await M.getMonthSummary('2026-10');
check(s.totalIn === 9500 && s.totalInLast === 6000, 'income this month and last month');
check(s.totalOut === 6500, 'deleted entry does not count');
check(s.totalAside === 700 && s.left === 2300, 'aside includes withdrawal; left = in − out − aside');
check((await M.getEmergencyTarget('2026-10')) === 5000, 'emergency target = last month\'s needs');
check((await M.getPots()).pots.find((p) => p.key === 'emergency').balance === 700, 'pot balance');
await M.saveGoal({ ...(await M.getGoal()), goalAmount: 120000 });
check((await M.getGoal()).goalAmount === 120000 && (await M.getGoal()).startAmount === 10000, 'goal saves and keeps other fields');
done();
