import test from "node:test";
import assert from "node:assert/strict";
import { mortgagePayment, breakdown, projection, assessmentInMonth, money } from "../public/calc.js";

test("mortgage payment matches standard amortization", () => {
  assert.equal(Math.round(mortgagePayment(300000, 7, 30)), 1996);
  assert.equal(mortgagePayment(120000, 0, 10), 1000);
  assert.equal(mortgagePayment(0, 7, 30), 0);
});

test("assessment only counts in its months", () => {
  const a = { amount: 4680, months: 12, startsIn: 2 };
  assert.equal(assessmentInMonth(a, 1), 0);
  assert.equal(assessmentInMonth(a, 2), 390);
  assert.equal(assessmentInMonth(a, 13), 390);
  assert.equal(assessmentInMonth(a, 14), 0);
});

test("full breakdown adds every cost", () => {
  const p = { price: 300000, downPct: 20, rate: 7, years: 30, dues: 815, taxMode: "pct", taxPct: 2, ho6: 120, flood: 40, utilities: 150, other: 0,
    assessments: [{ amount: 4680, months: 12, startsIn: 0 }] };
  const b = breakdown(p);
  assert.equal(Math.round(b.parts.mortgage), 1597);
  assert.equal(b.parts.tax, 500);
  assert.equal(b.parts.assessments, 390);
  assert.equal(Math.round(b.total), 1597 + 815 + 390 + 500 + 120 + 40 + 150);
  const proj = projection(p, 14);
  assert.ok(proj[0] > proj[13], "cost drops after the assessment ends");
});

test("cash purchase has no mortgage; tax as amount", () => {
  const b = breakdown({ price: 250000, cash: true, dues: 600, taxMode: "amount", taxAmount: 3600 });
  assert.equal(b.parts.mortgage, 0);
  assert.equal(b.total, 900);
});

test("money formatting", () => {
  assert.equal(money(1234.5), "$1,235");
  assert.equal(money(-3, true), "-$3.00");
});
