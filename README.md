# HistoAI

HistoAI is a histopathology analysis monorepo with three main parts:

- `frontend`: Next.js dashboard, auth flow, image upload, history, and Gemini copilot UI.
- `backend`: FastAPI inference API that loads the trained PyTorch checkpoint and returns predictions plus Grad-CAM overlays.
- `model`: PyTorch training and explainability code used to train and evaluate the classifier offline.

## Repository Layout

```text
.
|-- frontend/
|-- backend/
|-- model/
|-- phases/
|-- SYSTEM_ARCHITECTURE.md
|-- ROADMAP.md
|-- DEPENDENCY_REPORT.md
`-- docs/
```

## Local Development

### 1. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### 2. Backend

```powershell
cd backend
py -m pip install -r requirements.txt
py run_server.py
```

Runs on `http://127.0.0.1:8000`.

### 3. Model Workspace

```powershell
cd model
py -m pip install -r requirements.txt
py scripts/train.py
```

Use the model package for training, evaluation, and Grad-CAM generation outside the API server.

## Current Product Flow

1. A user signs in through Supabase in `frontend`.
2. The user uploads an image from `/analyze`.
3. `frontend/services/unified-api.ts` sends the file to the FastAPI backend.
4. `backend/app.py` calls the PyTorch model loader and Grad-CAM service.
5. The frontend renders the prediction and stores the saved result in Supabase.
6. `/dashboard` reads that history and lets the user reopen past cases.

## Branching

The repository is prepared to use:

- `main`: stable default branch
- `develop`: integration branch for ongoing work
- feature branches from `develop` for focused changes

## Included Docs

- `docs/LOCAL_SETUP.md`: local run instructions
- `docs/REPOSITORY_MAP.md`: where key code paths live
- `SYSTEM_ARCHITECTURE.md`: high-level architecture notes
- `ROADMAP.md`: project roadmap and planning
- `DEPENDENCY_REPORT.md`: dependency notes

## Notes

- Local environment files and generated folders are intentionally excluded from git.
- Nested git metadata from the original local folders was removed in this clean export so this repo behaves as one monorepo.
