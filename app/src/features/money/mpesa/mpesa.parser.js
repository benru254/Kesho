// Reads one M-Pesa SMS and turns it into structured data. Pure logic — tested on Reuben's real messages.
//
// Returns null for messages that are not money movements (e.g. "Failed, wrong PIN").
// Otherwise returns:
//   { code, kind, direction, amount, fee, counterparty, partyKey, account, balance, date, time }
//
// kind:
//   'till'      paid to a Till (Buy Goods)                 → out
//   'paybill'   sent to a Paybill (KPLC, banks, Airtel...) → out
//   'sent'      sent to a person                           → out
//   'withdraw'  cash withdrawal at an agent                → out   (format not yet seen in Reuben's samples)
//   'airtime'   bought airtime                             → out   (format not yet seen in Reuben's samples)
//   'received'  money into your PERSONAL M-Pesa            → in
//   'business'  money into a Lipa na M-Pesa TILL / merchant account (shop sales) → in, but NOT personal
//   'balance'   balance enquiry                            → none
//   'unknown'   has a code but Kesho can't read it yet     → none

const AMT = '([\\d,]+(?:\\.\\d{1,2})?)';
const WHEN_RE = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*at\s*(\d{1,2}):(\d{2})\s*([AP]M)/i;

function num(s) {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function whole(s) {
  const n = num(s);
  return n == null ? null : Math.round(n);
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseWhen(body) {
  const m = WHEN_RE.exec(body);
  if (!m) return { date: null, time: null };
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  let y = parseInt(m[3], 10);
  if (y < 100) y += 2000;
  let h = parseInt(m[4], 10) % 12;
  if (m[6].toUpperCase() === 'PM') h += 12;
  return { date: `${y}-${pad(mo)}-${pad(d)}`, time: `${pad(h)}:${m[5]}` };
}

// "jane  doe 0700000000" -> "jane doe" ; "254700000000 JOHN TEST" -> "JOHN TEST"   (examples are invented)
export function cleanName(s) {
  if (!s) return '';
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .replace(/^(?:\+?254|0)\d{9}\s+/, '')
    .replace(/\s+(?:\+?254|0)\d{9}$/, '')
    .trim();
}

export function partyKey(name) {
  return cleanName(name).toLowerCase();
}

function find(re, body, group = 1) {
  const m = re.exec(body);
  return m ? m[group] : null;
}

export function parseMpesa(body) {
  if (!body) return null;
  const text = String(body);
  const codeMatch = /^\s*([A-Z0-9]{10})\s+confirmed/i.exec(text);
  if (!codeMatch) return null; // "Failed..." and promos have no code

  const base = {
    code: codeMatch[1].toUpperCase(),
    ...parseWhen(text),
    fee: whole(find(/Transaction cost,?\s*Ksh\s*([\d,]+(?:\.\d{1,2})?)/i, text)) || 0,
    balance: whole(find(new RegExp(`New M-PESA balance is Ksh\\s*${AMT}`, 'i'), text)),
    account: null,
    counterparty: '',
  };

  const result = (fields) => {
    const r = { ...base, ...fields };
    r.counterparty = cleanName(r.counterparty);
    r.partyKey = r.counterparty.toLowerCase();
    return r;
  };

  // Balance enquiry
  if (/account balance was/i.test(text)) {
    return result({
      kind: 'balance',
      direction: 'none',
      amount: null,
      fee: 0,
      balance: whole(find(new RegExp(`M-PESA Account\\s*:\\s*Ksh\\s*${AMT}`, 'i'), text)),
    });
  }

  // Shop / merchant till receipts ("New Account balance", "New Merchant Account Balance")
  if (/New (?:Merchant )?Account Balance is/i.test(text) && !/New M-PESA balance/i.test(text)) {
    return result({
      kind: 'business',
      direction: 'in',
      amount: whole(find(new RegExp(`Ksh\\s*${AMT}\\s*received from`, 'i'), text)),
      counterparty: find(/received from\s+(.+?)\.?\s*New (?:Merchant )?Account/i, text) || '',
      balance: null,
    });
  }

  let m;
  if ((m = new RegExp(`Ksh\\s*${AMT} sent to (.+?) for account (\\S+) on\\s`, 'i').exec(text))) {
    return result({ kind: 'paybill', direction: 'out', amount: whole(m[1]), counterparty: m[2], account: m[3] });
  }
  if ((m = new RegExp(`Ksh\\s*${AMT} paid to (.+?)\\.? on\\s`, 'i').exec(text))) {
    return result({ kind: 'till', direction: 'out', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`Ksh\\s*${AMT} sent to (.+?) on\\s`, 'i').exec(text))) {
    return result({ kind: 'sent', direction: 'out', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`received Ksh\\s*${AMT} from (.+?)\\.? on\\s`, 'i').exec(text))
    || (m = new RegExp(`Ksh\\s*${AMT} received from (.+?)\\.? on\\s`, 'i').exec(text))) {
    return result({ kind: 'received', direction: 'in', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`Withdraw\\s*Ksh\\s*${AMT} from (.+?)\\s*New M-PESA`, 'i').exec(text))) {
    return result({ kind: 'withdraw', direction: 'out', amount: whole(m[1]), counterparty: `Cash withdrawal (${cleanName(m[2])})` });
  }
  if ((m = new RegExp(`bought Ksh\\s*${AMT} of airtime`, 'i').exec(text))) {
    return result({ kind: 'airtime', direction: 'out', amount: whole(m[1]), counterparty: 'Airtime' });
  }

  return result({ kind: 'unknown', direction: 'none', amount: null });
}
