# PRD — GoPratle Requirement Posting Flow
*Full-Stack Developer Intern technical assignment*

## 1. Context

GoPratle is an event marketplace (Delhi-based) connecting **hosts** with **event planners, performers, and crew** for weddings, corporate events, birthdays, concerts, and festivals. This flow is the host-facing "post what you need" entry point — it's the core action on their product.

A live reference build for this exact assignment is up at `gopratle-frontend-assignment.vercel.app` — confirms a 4-step flow, a dark UI, and Step 1's exact field set (see §7). Worth opening it yourself before you start.

## 2. Goal & Scope

Build a 4-step wizard that:
1. Captures shared event basics
2. Adapts steps 2–3 to the chosen category (Planner / Performer / Crew)
3. Persists the submission to MongoDB, clearly discriminated by category
4. Is deployed live, documented, and demoed on video

**Non-goals (explicitly out of scope):** authentication, payments, file/image uploads, multi-language support, email notifications. The brief says this doesn't need to be production-perfect — don't spend time here.

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 16.x (App Router), TypeScript | Current LTS. Note: bump from Next 14 (used on LeaveFlow/Debales AI) — 14 is EOL as of Oct 2025 |
| Styling | Tailwind CSS | Matches existing stack |
| Form state + validation | React Hook Form + Zod | Purpose-built for multi-step forms; `FormProvider` spans all 4 steps; Zod schema swaps per category |
| API client | Axios | Matches existing stack |
| Backend | Node.js + Express | Matches existing stack (Smart Gym Access Platform) |
| ODM | Mongoose, using **Discriminators** | Clean polymorphic schema: one base schema + 3 category extensions in the same collection |
| Database | MongoDB Atlas (free M0 cluster) | Matches existing stack |
| Frontend hosting | Vercel | Matches existing stack |
| Backend hosting | Render | Matches existing stack; keep Express as a real persistent server, not serverless functions |
| Repo | Single monorepo — `/frontend`, `/backend` | One link to share, one README |

## 4. Data Model

Base schema holds the Step 1 fields shared by every category. Each category is a **Mongoose Discriminator** off that base — same MongoDB collection (`requirements`), distinguished by a `category` field (Mongoose's discriminator key, customized here from the default `__t` to something readable).

```js
// backend/models/Requirement.js
const mongoose = require('mongoose');

const options = { discriminatorKey: 'category', timestamps: true };

const requirementSchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  eventType: {
    type: String, required: true,
    enum: ['Birthday Party', 'Wedding', 'Corporate', 'Concert', 'Festival', 'Other'],
  },
  dateType:  { type: String, required: true, enum: ['single', 'range'], default: 'single' },
  startDate: { type: Date, required: true },
  endDate:   { type: Date }, // required only when dateType === 'range' — enforce in Zod + controller
  location:  { type: String, required: true, trim: true },
  venue:     { type: String, trim: true }, // optional
}, options);

const Requirement = mongoose.model('Requirement', requirementSchema);
module.exports = Requirement;
```

```js
// backend/models/PlannerRequirement.js
const Requirement = require('./Requirement');
const mongoose = require('mongoose');

module.exports = Requirement.discriminator('planner', new mongoose.Schema({
  servicesNeeded:  [{ type: String, enum: ['Full Planning', 'Decor & Design', 'Vendor Coordination', 'Day-of Coordination', 'Budget Management'] }],
  guestCount:      { type: Number },
  budgetRange:     { type: String, enum: ['Under ₹50k', '₹50k–1L', '₹1L–5L', '₹5L+'] },
  stylePreference: { type: String, trim: true },
  additionalNotes: { type: String, trim: true },
}));
```

```js
// backend/models/PerformerRequirement.js
const Requirement = require('./Requirement');
const mongoose = require('mongoose');

module.exports = Requirement.discriminator('performer', new mongoose.Schema({
  performerType:       { type: String, enum: ['DJ', 'Live Band', 'Singer', 'Dancer', 'Anchor/MC', 'Magician', 'Comedian', 'Other'] },
  genrePreference:     { type: String, trim: true },
  performanceDuration: { type: String, enum: ['<30 min', '30–60 min', '1–2 hrs', '2+ hrs'] },
  audienceSize:        { type: Number },
  budgetRange:         { type: String, enum: ['Under ₹50k', '₹50k–1L', '₹1L–5L', '₹5L+'] },
  additionalNotes:     { type: String, trim: true },
}));
```

```js
// backend/models/CrewRequirement.js
const Requirement = require('./Requirement');
const mongoose = require('mongoose');

module.exports = Requirement.discriminator('crew', new mongoose.Schema({
  crewType:           [{ type: String, enum: ['Hospitality', 'Coordination', 'Brand Promotion', 'General Event Support', 'Security', 'Technical/AV'] }],
  numberOfCrewNeeded: { type: Number },
  shiftDuration:      { type: String, enum: ['Half-day', 'Full-day', 'Multi-day'] },
  budgetRange:        { type: String, enum: ['Under ₹50k', '₹50k–1L', '₹1L–5L', '₹5L+'] },
  additionalNotes:    { type: String, trim: true },
}));
```

`crewType` options are pulled from GoPratle's actual crew hiring listing (hospitality, coordination, brand promotion, general event support) — a small touch that shows domain research.

**Why this matters for evaluation:** a single `find({})` on the base `Requirement` model returns every submission across all three categories; filtering by category is a one-line query (`Requirement.find({ category: 'performer' })`). No if/else branching on a bloated flat schema, no three disconnected collections. This is the mechanism that satisfies "clearly categorised."

Internal enum values (`planner` / `performer` / `crew`) are lowercase single words for clean code; the UI-facing labels stay "Event Planner" / "Performer" / "Crew" to match the brief and the reference build.

## 5. API Contract

**POST `/api/requirements`**
Body varies by category — `category` decides which discriminator model handles the write:

```json
{
  "category": "performer",
  "eventName": "Rahul's Sangeet",
  "eventType": "Wedding",
  "dateType": "single",
  "startDate": "2026-11-14",
  "location": "Chennai",
  "venue": "Taj Club House",
  "performerType": "Live Band",
  "performanceDuration": "1–2 hrs",
  "audienceSize": 150,
  "budgetRange": "₹1L–5L"
}
```

Response `201`:
```json
{ "success": true, "data": { "_id": "...", "category": "performer", "eventName": "Rahul's Sangeet", "...": "..." } }
```

Controller logic: switch on `req.body.category` → pick `PlannerRequirement` / `PerformerRequirement` / `CrewRequirement` → `.create(req.body)` → Mongoose validation runs automatically → `try/catch` → `400` on `ValidationError`, `500` otherwise.

**GET `/api/requirements`** *(nice-to-have, not required by the brief)* — list all, optional `?category=` filter. Makes the recording stronger: you can show stored data through your own UI instead of only MongoDB Compass.

**GET `/api/requirements/:id`** *(nice-to-have)* — single record, useful for a Step 4 success screen ("view your submission").

## 6. Frontend Structure

```
frontend/
  app/
    post-requirement/
      page.tsx              — wizard shell: current step state + RHF FormProvider
  components/wizard/
    StepIndicator.tsx        — "Step X of 4"
    Step1EventBasics.tsx
    Step2CategoryFields.tsx  — renders Planner|Performer|Crew step-2 subcomponent
    Step3CategoryFields.tsx  — renders Planner|Performer|Crew step-3 subcomponent
    Step4Review.tsx          — read-only summary + submit
    category-fields/
      PlannerStep2.tsx   PlannerStep3.tsx
      PerformerStep2.tsx PerformerStep3.tsx
      CrewStep2.tsx      CrewStep3.tsx
  lib/
    validation.ts          — Zod: baseSchema + per-category schema, merged by category
    api.ts                 — axios instance + postRequirement()
```

Keep step state in the URL as `?step=2` (not just component state) — free back-button support, no extra library needed.

## 7. Step-by-Step Field Spec

**Step 1 — Event Basics** *(all categories, matches the reference build)*
- Event Name — text, required
- Event Type — select: Birthday Party / Wedding / Corporate / Concert / Festival / Other
- Date — toggle: Single date / Date range → shows one or two date pickers
- Location — text, required
- Venue — text, optional
- Category — 3 selectable cards: **Event Planner / Performer / Crew** (drives Steps 2–3)

**Steps 2 & 3 — by category**

| Category | Step 2 | Step 3 |
|---|---|---|
| Planner | Services needed (multi-select), guest count | Budget range, style preference, notes |
| Performer | Performer type, genre (optional), performance duration | Audience size, budget range, notes |
| Crew | Crew type(s) (multi-select), number of crew needed | Shift duration, budget range, notes |

**Step 4 — Review & Submit**
- Read-only summary of everything entered, with edit links back to the relevant step
- Submit → `POST` → success screen showing the created record's ID

## 8. Validation

- **Frontend:** Zod schema per category, wired to React Hook Form — blocks step navigation until the current step is valid, gives instant feedback
- **Backend:** Mongoose schema validation (required fields, enums) — never trust the client alone

## 9. Deployment

- **Frontend (Vercel):** env var `NEXT_PUBLIC_API_URL` → Render backend URL
- **Backend (Render):** env vars `MONGODB_URI`, `CORS_ORIGIN` (the Vercel URL)
- **Database (Atlas):** free M0 cluster; IP allowlist `0.0.0.0/0` is fine for a take-home (would restrict for anything real)

## 10. Recording Outline (5–7 min)

| Time | Show |
|---|---|
| 0:00–0:15 | One-line intro — what you built, the stack |
| 0:15–1:00 | Step 1, pick **Performer**, fill it in |
| 1:00–2:00 | Steps 2–3 for Performer — call out that the fields are Performer-specific |
| 2:00–2:30 | Step 4 review, submit |
| 2:30–3:15 | Network tab — the POST request payload and 201 response |
| 3:15–3:45 | Repeat Step 1 quickly for **Crew** (or Planner) — prove the adaptive logic actually changes |
| 3:45–4:30 | MongoDB Atlas/Compass — both documents in `requirements`, same collection, different `category` + fields |
| 4:30–5:15 | 30-second code tour: `Requirement.js` discriminators, the controller switch, one wizard step component |
| 5:15–end | Wrap-up |

## 11. Build Order

1. Repo scaffold — `/frontend` (Next.js), `/backend` (Express), Mongoose connected to Atlas
2. `Requirement` model + 3 discriminators — test directly with Postman/Thunder Client before touching UI
3. Express routes + controller (POST, GET) — confirm all 3 categories save and return correctly
4. Wizard shell + Step 1 — get navigation working, no category logic yet
5. Step 2/3 conditional rendering per category + Zod schemas
6. Step 4 review + wire real submission
7. Polish — loading/error states, success screen, optional list view
8. Deploy — Atlas → Render → Vercel, smoke-test on the live URLs
9. Record demo
10. README + push + submit

## 12. Deliverables Checklist

- [ ] Live frontend URL (Vercel)
- [ ] GitHub repo — frontend + backend (monorepo)
- [ ] 5–7 min screen recording
- [ ] README — setup instructions, env var list, brief architecture note
