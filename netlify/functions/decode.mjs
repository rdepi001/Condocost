// POST /api/decode { pdf: base64, name, token }  -> streamed JSON text
// Paid: reads one association document and returns findings with page numbers.
import { env, fail, body, reportCredit, useCredit, streamClaude } from "../lib/util.mjs";

const PROMPT = `You are reading one Florida condominium association document for a buyer or owner. Extract facts ONLY from this document. Never guess or use outside knowledge. Page numbers are the PDF page (first page = 1).
Reply with only JSON in this exact shape (use null or [] when the document doesn't say):
{
 "docType": "budget"|"special_assessment_notice"|"reserve_study"|"sirs"|"milestone_inspection"|"insurance"|"meeting_minutes"|"financial_statement"|"rules_or_declaration"|"estoppel"|"other",
 "association": string|null,
 "docDate": string|null,
 "summary": string,                      // 2-3 plain-English sentences a non-expert understands
 "monthlyDues": [{"unit": string|null, "amount": number, "page": number}],   // per-unit monthly regular dues; convert quarterly to monthly and say so in unit
 "assessments": [{"description": string, "perUnit": number|null, "buildingTotal": number|null, "installments": number|null, "firstDue": string|null, "status": "proposed"|"approved"|"unknown", "page": number}],
 "reserves": {"balance": number|null, "percentFunded": number|null, "recommendedAnnual": number|null, "budgetedAnnual": number|null, "waivedOrReduced": boolean|null, "page": number|null},
 "sirs": {"mentioned": boolean, "completed": boolean|null, "date": string|null, "page": number|null},
 "milestone": {"mentioned": boolean, "phase": string|null, "date": string|null, "repairsRequired": boolean|null, "repairDeadline": string|null, "page": number|null},
 "insurance": {"annualPremium": number|null, "windDeductible": string|null, "carrier": string|null, "page": number|null},
 "litigation": [{"summary": string, "page": number}],
 "redFlags": [{"title": string, "detail": string, "severity": "high"|"medium"|"low", "page": number}],
 "goodSigns": [{"title": string, "detail": string, "page": number}],
 "questions": [string]                   // 3-6 specific follow-up questions to ask the association, based on this document
}
Red flags include: large or upcoming special assessments, low or waived/reduced reserves, deferred maintenance, required structural repairs, missing SIRS or milestone inspection, big dues or insurance increases, loans or lines of credit, litigation, delinquencies, insurance gaps. State facts, not conclusions about safety. Do not give legal, financial or engineering advice.`;

export default async (req) => {
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  const { pdf, token } = await body(req);
  if (typeof pdf !== "string" || pdf.length < 100) return fail("bad_request");
  if (pdf.length > 5_800_000) return fail("file_too_large", 413);
  const data = pdf.replace(/^data:application\/pdf;base64,/, "");
  if (!Buffer.from(data.slice(0, 12), "base64").toString("latin1").startsWith("%PDF")) return fail("not_pdf");
  let credit;
  try { credit = await reportCredit(token); } catch (e) { return fail(e.code || "server_error", 500); }
  if (!credit.ok) return fail(credit.reason === "limit_reached" ? "limit_reached" : "payment_required", 402);
  return streamClaude({
    prompt: PROMPT,
    pdf: data,
    model: env("DOC_MODEL", "claude-sonnet-5-5"),
    maxTokens: 4000,
    onDone: () => useCredit(credit.pi, credit.used),
  });
};
