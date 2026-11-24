// CondoCost math. Pure functions so they can be tested.
export const n = (v) => { const x = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, "")); return Number.isFinite(x) ? x : 0; };

export function mortgagePayment(principal, annualRatePct, years) {
  const P = Math.max(0, principal), r = annualRatePct / 100 / 12, k = Math.round(years * 12);
  if (P <= 0 || k <= 0) return 0;
  if (r === 0) return P / k;
  return (P * r) / (1 - Math.pow(1 + r, -k));
}

// Monthly cost of one assessment in a given month offset (0 = this month).
export function assessmentInMonth(a, monthOffset) {
  const total = n(a.amount), months = Math.max(1, Math.round(n(a.months) || 1)), start = Math.max(0, Math.round(n(a.startsIn)));
  if (total <= 0) return 0;
  return monthOffset >= start && monthOffset < start + months ? total / months : 0;
}

export function breakdown(p, monthOffset = 0) {
  const price = n(p.price), downPct = Math.min(100, Math.max(0, n(p.downPct)));
  const loan = p.cash ? 0 : price * (1 - downPct / 100);
  const mortgage = p.cash ? 0 : mortgagePayment(loan, n(p.rate), n(p.years) || 30);
  const taxYear = p.taxMode === "amount" ? n(p.taxAmount) : price * (n(p.taxPct) / 100);
  const parts = {
    mortgage,
    dues: n(p.dues),
    assessments: (p.assessments || []).reduce((s, a) => s + assessmentInMonth(a, monthOffset), 0),
    tax: taxYear / 12,
    insurance: n(p.ho6),
    flood: n(p.flood),
    utilities: n(p.utilities),
    other: n(p.other),
  };
  const total = Object.values(parts).reduce((s, v) => s + v, 0);
  return { parts, total, loan };
}

export function projection(p, months = 24) {
  return Array.from({ length: months }, (_, i) => breakdown(p, i).total);
}

export function assessmentTotal(p) {
  return (p.assessments || []).reduce((s, a) => s + n(a.amount), 0);
}

// Share of the monthly cost going to the association (dues + assessments).
export function associationShare(p) {
  const b = breakdown(p, 0);
  return b.total > 0 ? (b.parts.dues + b.parts.assessments) / b.total : 0;
}

export const money = (v, cents = false) =>
  (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
