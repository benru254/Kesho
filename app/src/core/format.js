// Money formatting. Written by hand because some Android phones format numbers badly.

export function withCommas(n) {
  const neg = n < 0;
  const s = String(Math.round(Math.abs(n)));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return (neg ? '-' : '') + out;
}

export function kes(n) {
  return `KES ${withCommas(n || 0)}`;
}

// 12500 -> "12.5k", 1200000 -> "1.2M"
export function kesShort(n) {
  const a = Math.abs(n || 0);
  if (a >= 1e9) return `${trim(n / 1e9)}B`;
  if (a >= 1e6) return `${trim(n / 1e6)}M`;
  if (a >= 1e3) return `${trim(n / 1e3)}k`;
  return String(Math.round(n || 0));
}

function trim(x) {
  return (Math.round(x * 10) / 10).toString();
}

// Reads what you typed ("1,500" or "1500") into a whole number. Returns 0 if not a number.
export function parseAmount(text) {
  const n = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}
