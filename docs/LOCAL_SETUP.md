# Local Setup

## Prerequisites

- Node.js 18+
- Python 3.11+
- npm
- A free [Supabase](https://supabase.com) project (auth + Postgres)

## 1. Create / open a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Wait until the database is ready.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Create tables + RLS (required for history)

1. In Supabase: **SQL Editor → New query**.
2. Paste the full contents of [`frontend/scripts/setup_supabase.sql`](../frontend/scripts/setup_supabase.sql).
3. Click **Run**. You should see success.
4. Confirm under **Table Editor**:
   - `analysis_history`
   - `user_profiles`
5. Confirm under **Storage**: buckets `slides` and `heatmaps` (created by the same SQL).

This enables:

| Flow | Table |
|------|--------|
| Sign up / login | Supabase Auth (`auth.users`) |
| Intended-use accept | `user_profiles` |
| Analyze → save result | `analysis_history` |
| Dashboard history | `analysis_history` (RLS: only your rows) |

## 3. Auth settings for local development

In **Authentication → Providers → Email**:

- Enable **Email** provider.
- For local testing, turn **off** “Confirm email” so you can sign in immediately after sign-up.
  (Turn confirm back on before any public deploy.)

In **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs: add `http://localhost:3000/dashboard` and `http://localhost:3000/**`

## 4. Frontend environment

```powershell
cd frontend
copy .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_AUTH_BYPASS=false
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Important:** `NEXT_PUBLIC_AUTH_BYPASS=true` disables real Supabase. Inserts become no-ops and dashboard history stays empty.

Restart the Next.js dev server after changing env vars.

## 5. Run the app

Terminal A — backend:

```powershell
cd backend
copy .env.example .env
# For first local bring-up without JWT verification:
#   AUTH_DISABLED=true
# For real auth (recommended once Supabase works):
#   AUTH_DISABLED=false
#   SUPABASE_JWT_SECRET=<Project Settings → API → JWT Secret>
py -m pip install -r requirements.txt
py run_server.py
```

Terminal B — frontend:

```powershell
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend health: `http://127.0.0.1:8000/health`

## 6. End-to-end check

1. Open `/auth/sign-up`, create an account, then sign in at `/auth/login`.
2. Open `/analyze`, accept intended use, upload a PNG/JPG slide.
3. Wait for prediction + Grad-CAM.
4. Open `/dashboard` — the case should appear under **Recent analyses**.
5. In Supabase **Table Editor → analysis_history**, you should see a new row with your `user_id`.

### If history is empty

| Symptom | Fix |
|---------|-----|
| Bypass mode | Set `NEXT_PUBLIC_AUTH_BYPASS=false` and restart |
| `relation "analysis_history" does not exist` | Run `setup_supabase.sql` |
| `new row violates row-level security` | Confirm you are signed in; RLS requires `auth.uid() = user_id` |
| Intended-use setup error | Run `setup_supabase.sql` (creates `user_profiles`) |
| Login fails after sign-up | Disable email confirm for local, or confirm via email link |

## Typical local workflow

1. Start backend → start frontend.
2. Sign in.
3. Analyze a slide.
4. Review it on the dashboard.
