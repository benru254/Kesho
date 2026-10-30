// Goal path math + KES formatting.
import { check, done } from './lib/check.js';
import { DEFAULT_GOAL as G, monthlyGrowthNeeded, targetFor, monthStatus, ladderLevel } from '../src/features/money/money.goal.js';
import { withCommas, kesShort, parseAmount } from '../src/core/format.js';

check(Math.abs(monthlyGrowthNeeded(G) - 0.166) < 0.001, '10k→100k in 15 months = +16.6%/month');
check(targetFor(G, '2026-10') === 10000 && targetFor(G, '2028-01') === 100000, 'path starts and ends right');
check(targetFor(G, '2027-07') === 39811, 'mid-path target (Jul 2027)');
check(monthStatus(G, '2026-10', 8000, 24).verdict === 'on_track', 'pace on track');
check(monthStatus(G, '2026-11', 3000, 20).verdict === 'behind', 'behind is called behind');
check(withCommas(1234567) === '1,234,567' && kesShort(12500) === '12.5k', 'KES formatting');
check(parseAmount('1,500') === 1500 && parseAmount('abc') === 0, 'amount parsing');
check(ladderLevel(7300).reached === 1000 && ladderLevel(7300).next === 10000, 'money ladder level');
done();
