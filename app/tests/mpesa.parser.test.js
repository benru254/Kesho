// M-Pesa SMS reader on FAKE messages in the exact real formats (see fixtures/mpesa-samples.txt).
import { check, done } from './lib/check.js';
import { fixtureLines } from './lib/fixture.js';
import { parseMpesa } from '../src/features/money/mpesa/mpesa.parser.js';

const lines = fixtureLines('mpesa-samples.txt');
const r = lines.map(parseMpesa);
const kinds = r.map((x) => (x ? x.kind : 'ignored'));

check(lines.length === 15, '15 sample messages');
check(kinds.filter((k) => k === 'unknown').length === 0, 'every format understood');
check(kinds[6] === 'ignored', '"Failed, wrong PIN" is ignored');
check(kinds.filter((k) => k === 'business').length === 5, 'all 5 till/merchant receipts = business');
check(r[0].kind === 'till' && r[0].amount === 130 && r[0].counterparty === 'JANE TEST SHOP' && r[0].date === '2026-09-30' && r[0].time === '14:50', 'till payment');
check(r[1].kind === 'balance' && r[1].balance === 133, 'balance enquiry');
check(r[2].kind === 'business' && r[2].amount === 1050 && r[2].counterparty === 'CUSTOMER ONE TEST', 'shop till receipt, phone stripped');
check(r[3].kind === 'paybill' && r[3].counterparty === 'KPLC PREPAID' && r[3].account === '11111111111' && r[3].fee === 5, 'paybill + fee');
check(r[5].kind === 'sent' && r[5].counterparty === 'test person' && r[5].fee === 13 && r[5].time === '22:44', 'send money, phone stripped');
check(r[10].kind === 'received' && r[10].direction === 'in' && r[10].amount === 1050, 'personal money received');
check(r[11].kind === 'paybill' && r[11].counterparty === 'AIRTEL MONEY', 'lowercase "confirmed." works');
check(r[9].kind === 'business' && r[9].date === '2026-05-08', 'merchant account receipt');
done();
