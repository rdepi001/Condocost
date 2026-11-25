// POST /api/checkout -> { url }  One-time Stripe Checkout for a Document Decoder report.
import { env, json, fail, stripe, siteUrl } from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  const price = env("STRIPE_PRICE_ID");
  if (!price) return fail("not_configured", 500);
  const site = siteUrl(req);
  try {
    const s = await stripe("POST", "checkout/sessions", {
      mode: "payment",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      success_url: `${site}/?session_id={CHECKOUT_SESSION_ID}#decoder`,
      cancel_url: `${site}/?checkout=cancelled#decoder`,
      allow_promotion_codes: "true",
      "metadata[docs_used]": "0",
      "payment_intent_data[description]": "CondoCost Document Decoder report",
    });
    return json({ url: s.url });
  } catch (e) {
    return fail(e.code || "server_error", 500, e.message);
  }
};
