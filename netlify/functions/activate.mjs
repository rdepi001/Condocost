// POST /api/activate { session_id } -> { token }  Turns a paid checkout into a report code.
import { json, fail, stripe, signToken, body } from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  const { session_id } = await body(req);
  if (typeof session_id !== "string" || !session_id.startsWith("cs_")) return fail("bad_request");
  try {
    const s = await stripe("GET", `checkout/sessions/${encodeURIComponent(session_id)}`);
    if (s.payment_status !== "paid") return fail("not_paid", 402);
    return json({ token: signToken(s.id) });
  } catch (e) {
    return fail(e.code || "server_error", 500);
  }
};
