// POST /api/credit { token } -> { ok, used, limit }  How many documents are left on a report.
import { json, fail, reportCredit, body } from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  const { token } = await body(req);
  try {
    const c = await reportCredit(token);
    return json({ ok: c.ok, used: c.used ?? 0, limit: c.limit ?? 0, reason: c.reason ?? null });
  } catch (e) {
    return fail(e.code || "server_error", 500);
  }
};
