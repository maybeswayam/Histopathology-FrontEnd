# Repository Map

## frontend

- `frontend/app/page.tsx`: landing page
- `frontend/app/analyze/page.tsx`: image upload and prediction flow
- `frontend/app/dashboard/page.tsx`: account dashboard and saved history
- `frontend/services/unified-api.ts`: frontend API wrapper for FastAPI inference
- `frontend/components/HistoryCard.tsx`: saved case card
- `frontend/components/HistoryDetailModal.tsx`: saved case popup
- `frontend/lib/supabase/*`: Supabase client, server, and middleware helpers

## backend

- `backend/app.py`: FastAPI app entrypoint
- `backend/run_server.py`: local dev server launcher
- `backend/src/model/model_loader.py`: checkpoint loading and inference wrapper
- `backend/src/model/model.py`: model architecture definitions
- `backend/src/model/gradcam_service.py`: Grad-CAM generation
- `backend/models/model_best.pth`: local trained checkpoint used by the API

## model

- `model/src/model/train.py`: training loop
- `model/src/model/dataset.py`: dataset and label mapping
- `model/src/model/model.py`: training-side model definition
- `model/src/model/gradcam.py`: explainability logic
- `model/scripts/generate_gradcam.py`: Grad-CAM script

## supporting docs

- `SYSTEM_ARCHITECTURE.md`
- `ROADMAP.md`
- `DEPENDENCY_REPORT.md`
- `phases/PHASE2.md`
- `phases/PHASE3.md`
