# CondoCost: launch package

The new CondoCost replaces the Replit demo. Everything a visitor sees is now real: no fake sample numbers presented as theirs.

**Free (brings people in)**
- True monthly cost: mortgage, dues, any number of special assessments (with start dates), property tax, HO-6, flood, utilities. Breakdown bar, 24-month chart, share of income, plain-English warnings.
- Save several condos and compare them side by side.
- Post-Surfside Florida buyer checklist (SIRS, milestone inspection, reserves, insurance, rentals, lawsuits) that turns every unknown into a ready-to-send email of questions.
- Print or save any page as a PDF.

**Paid: Document Decoder, $39 one time per property (up to 6 documents)**
- Upload the budget, assessment notice, SIRS, milestone report or minutes. AI pulls out dues, assessments, reserves, insurance, red flags, good signs and questions, each with a page number.
- One tap loads the numbers into the cost snapshot and checklist.
- Documents are read and discarded. Nothing is stored, so there's no database to secure.

## Files
- `public/`: the app, privacy policy, terms, icons
- `netlify/functions/`: checkout, activate, credit, decode. No packages to install.
- `store-assets/`: Google Play icon and feature graphic
- `tests/`: calculator tests (`node --test tests/calc.test.mjs`)

## Replace before uploading
- `public/index.html`: `supportEmail` (and `price` if you change it in Stripe)
- `public/privacy.html`, `public/terms.html`: `REPLACE_WITH_YOUR_LLC_NAME`, `REPLACE_WITH_YOUR_EMAIL`

## Netlify environment variables
| Name | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys (the same key TagMatch uses is fine) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_` while testing) |
| `STRIPE_PRICE_ID` | Stripe → Product "CondoCost Document Decoder" → one-time $39 price → `price_...` |
| `SESSION_SECRET` | A long random password, different from TagMatch's |
| `SITE_URL` | e.g. `https://condocost.netlify.app` |
| `DOCS_PER_REPORT` | Optional, default 6 (keep in sync with `docsPerReport` in index.html) |
| `FREE_REPORTS_FOR_TESTING` | Optional. `true` lets you test decoding without paying. Remove before launch. |

## Deploy
Same as TagMatch: new GitHub repository `condocost` → upload this folder → Netlify → Add new site → Import from GitHub → add the variables → Trigger deploy.

## Google Play
Same steps as TagMatch (pwabuilder.com → Android package → fill in `public/.well-known/assetlinks.json` → Play Console closed test). Before publishing the Android version, either hide the buy button there or enroll in Google's US external payment links program.
.
