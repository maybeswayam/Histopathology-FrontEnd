# Local Setup

## Prerequisites

- Node.js 18+
- Python 3.11+
- npm
- A Supabase project for auth and history storage
- Frontend environment variables in `frontend/.env.local`

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Expected URL: `http://localhost:3000`

## Backend

```powershell
cd backend
py -m pip install -r requirements.txt
py run_server.py
```

Useful endpoint checks:

- `GET /health`
- `POST /predict`
- `POST /predict-with-gradcam`

Expected URL: `http://127.0.0.1:8000`

## Database

Run the SQL in `frontend/scripts/001_create_tables.sql` against Supabase before using the dashboard history flow.

## Typical Local Workflow

1. Start the backend.
2. Start the frontend.
3. Sign in through the frontend.
4. Upload an image from `/analyze`.
5. Review the saved result in `/dashboard`.
