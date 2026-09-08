# GoPratle Requirement Posting Flow

A small full-stack monorepo for event hosts to post a requirement for an **Event Planner**, **Performer**, or **Crew**. It uses a four-step Next.js wizard and persists each submission to one MongoDB `requirements` collection using Mongoose discriminators.

## Stack

- `frontend/` — Next.js 16 App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios
- `backend/` — Node.js, Express 5, Mongoose
- MongoDB Atlas — data store (connection string supplied via environment variable)

## Project structure

```
frontend/
  app/post-requirement/       # URL-driven four-step form
  components/wizard/          # individual wizard steps and UI
  lib/validation.ts           # Zod category and step schemas
  lib/api.ts                  # Axios API client
backend/
  src/models/                 # base Requirement + three discriminators
  src/controllers/            # create, list and get logic
  src/routes/                 # /api/requirements routes
```

## Local setup

1. Install Node.js 20.9 or newer, then install both workspaces from the repository root:

   ```bash
   npm install
   ```

2. Create `backend/.env` from `backend/.env.example` and provide your Atlas URI:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/gopratle?retryWrites=true&w=majority
   CORS_ORIGIN=http://localhost:3000
   PORT=5000
   ```

3. Create `frontend/.env.local` from `frontend/.env.local.example`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start both applications:

   ```bash
   npm run dev
   ```

   The web app is at `http://localhost:3000/post-requirement?step=1`; the API is at `http://localhost:5000`.

## API quick test

Check the API first:

```bash
curl http://localhost:5000/api/health
```

Create a performer requirement:

```bash
curl -X POST http://localhost:5000/api/requirements \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"performer\",\"eventName\":\"Rahul's Sangeet\",\"eventType\":\"Wedding\",\"dateType\":\"single\",\"startDate\":\"2026-11-14\",\"location\":\"Chennai\",\"venue\":\"Taj Club House\",\"performerType\":\"Live Band\",\"performanceDuration\":\"1–2 hrs\",\"audienceSize\":150,\"budgetRange\":\"₹1L–5L\"}"
```

Available endpoints:

- `POST /api/requirements` — accepts a `category` of `planner`, `performer`, or `crew`; returns `201` on success and `400` validation errors.
- `GET /api/requirements` — lists every requirement, newest first.
- `GET /api/requirements?category=performer` — lists one category.
- `GET /api/requirements/:id` — returns one requirement.

All types share the `requirements` MongoDB collection. The base `Requirement` model has `category` as its discriminator key, so planner, performer, and crew-specific fields remain clearly separated without separate collections.

## Verification

```bash
npm test
npm run build --workspace frontend
```

The backend test suite covers Mongoose discriminator and validation behavior. The frontend production build includes TypeScript validation.

## Deployment

### Atlas

1. Create a free MongoDB Atlas M0 cluster.
2. Create a database user and add its credentials to the connection string.
3. For this take-home, allow network access for the deployment hosts (Atlas IP allowlist `0.0.0.0/0` is the simple option; restrict it for a real application).
4. Set the resulting connection string as `MONGODB_URI` in Render.

### Render (backend)

Create a Web Service using the `backend` directory as the root directory.

- Build command: `npm install`
- Start command: `npm start`
- Environment: `MONGODB_URI`, `CORS_ORIGIN`, and optional `PORT` (Render provides its own port)

Set `CORS_ORIGIN` to the final Vercel frontend URL, for example `https://your-app.vercel.app`. Multiple comma-separated origins are supported for preview/local use.

### Vercel (frontend)

Import the same repository and set `frontend` as the root directory. Add:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
```

Redeploy after adding or changing this variable, as `NEXT_PUBLIC_*` values are compiled into the browser bundle.

## Still to do manually

- Create/configure the Atlas cluster and put the real URI in `backend/.env` (and Render).
- Deploy the backend to Render and set its production CORS origin.
- Deploy the frontend to Vercel with the Render URL in `NEXT_PUBLIC_API_URL`.
- Smoke-test the deployed flow, then record the requested 5–7 minute demo.
# gopratle
