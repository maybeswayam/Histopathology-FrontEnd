# HistoAI Backend

## Overview

The backend is a FastAPI inference service that exposes the trained HistoAI classifier to the rest of the system. It is responsible for:

- loading the trained PyTorch checkpoint
- preprocessing uploaded histopathology images
- running benign/malignant inference
- generating Grad-CAM overlays
- returning JSON payloads the frontend can render directly

This service is intentionally narrow. It does not currently own user management, persistence, or auth; those concerns are handled by Supabase from the frontend.

For the active request path and module boundaries, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

- Python `3.11+` recommended
- FastAPI `0.104.1`
- uvicorn `[standard]` `0.24.0`
- python-multipart `0.0.6`
- torch `2.1.0`
- torchvision `0.16.0`
- Pillow `10.1.0`
- numpy `1.24.3`
- scikit-learn `1.3.2`
- tqdm `4.66.1`
- opencv-python `4.8.0.76`
- python-jose `[cryptography]` `3.3.0`
- passlib `[bcrypt]` `1.7.4`

The pinned runtime manifest in `requirements.txt` is:

```text
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
torch==2.1.0
torchvision==0.16.0
Pillow==10.1.0
numpy==1.24.3
scikit-learn==1.3.2
tqdm==4.66.1
opencv-python==4.8.0.76
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

## Architecture

### Folder layout

```text
backend/
|-- app.py                        # Active FastAPI entrypoint
|-- run_server.py                 # Local dev launcher
|-- models/
|   `-- model_best.pth            # Checkpoint used by runtime loader
|-- src/
|   `-- model/
|       |-- model.py              # Model factory
|       |-- model_loader.py       # Singleton inference wrapper
|       |-- gradcam_service.py    # Grad-CAM computation and overlay
|       |-- dataset.py            # Training-side helper copy
|       `-- utils.py
|-- app/
|   |-- routes/predict.py         # Older route path, not wired into app.py
|   `-- utils/model_loader.py     # Older loader path, not wired into app.py
|-- test_api.py
|-- test_model_weights.py
|-- verify_model_load.py
|-- verify_setup.py
`-- requirements.txt
```

### Active runtime path

The active code path is:

`app.py -> src/model/model_loader.py -> src/model/model.py -> src/model/gradcam_service.py`

The `app/routes/predict.py` and `app/utils/model_loader.py` files are legacy duplicates and are not part of the live FastAPI startup path.

## API Contract

### `GET /`

Purpose:

- basic service liveness message

Response:

```json
{ "message": "HistoAI Backend is running" }
```

### `GET /health`

Purpose:

- confirm the process is running and the model singleton initialized

Healthy response:

```json
{ "status": "healthy", "model_loaded": true }
```

Failure response when initialization did not complete:

```json
{ "status": "error", "message": "Model not initialized" }
```

Status codes:

- `200` healthy
- `503` model unavailable

### `POST /predict`

Request:

```http
POST /predict
Content-Type: multipart/form-data

file=<binary image>
```

Response:

```json
{
  "prediction": "malignant",
  "confidence": 0.998,
  "probabilities": {
    "benign": 0.002,
    "malignant": 0.998
  }
}
```

### `POST /predict-with-gradcam`

Request:

```http
POST /predict-with-gradcam
Content-Type: multipart/form-data

file=<binary image>
```

Response:

```json
{
  "prediction": "malignant",
  "confidence": 0.998,
  "probabilities": {
    "benign": 0.002,
    "malignant": 0.998
  },
  "heatmap": "data:image/png;base64,<base64-png>"
}
```

### Error behavior

- unreadable images raise `500`
- runtime inference failures raise `500`
- `/health` returns `503` when the model is not initialized

The service does not yet expose a normalized error schema.

## Setup and Installation

### Prerequisites

- Python 3.11+
- a valid checkpoint file, typically `backend/models/model_best.pth`

### Install

```bash
cd backend
py -m pip install -r requirements.txt
```

### Start locally

```bash
py run_server.py
```

Default local URLs:

- `http://localhost:8000`
- `http://localhost:8000/docs`

### Validation commands

```bash
py verify_setup.py
py verify_model_load.py
py test_api.py
```

## How It Works

### Startup and model lifecycle

`app.py` registers a startup hook that calls `get_model()`. The loader creates a single `HistoPathModel` instance and caches it globally. That prevents repeated checkpoint loads on each request.

### Model file discovery

`src/model/model_loader.py` searches for a checkpoint in:

1. current working directory
2. `./models`
3. `backend/models`
4. `../model/models`

Supported names:

- `model_best.pth`
- `best_model.pth`

### Preprocessing pipeline

Every incoming image is:

1. read from `UploadFile`
2. decoded with PIL
3. converted to RGB
4. resized to `224x224`
5. converted to tensor
6. normalized with ImageNet statistics:
   - mean `[0.485, 0.456, 0.406]`
   - std `[0.229, 0.224, 0.225]`

### Inference path

`HistoPathModel.predict`:

1. applies the transform
2. adds batch dimension
3. runs the tensor through the model
4. applies `softmax`
5. selects the maximum-probability class
6. maps:
   - `0 -> benign`
   - `1 -> malignant`
7. returns both class probabilities plus the winning confidence

### Grad-CAM path

For `/predict-with-gradcam`:

1. an input tensor is created from the same image
2. class index is derived from the prediction result
3. `GradCAM(model.model)` is instantiated
4. hooks capture activations and gradients on:
   - `model.features[-4]` for MobileNetV2
   - `layer4[-1]` for ResNet fallback
   - the last convolutional layer otherwise
5. gradients are mean-pooled into channel weights
6. weighted activations are summed and passed through ReLU
7. the CAM is interpolated to `224x224`
8. `overlay_heatmap` blends the colored map with the source image
9. the overlay is encoded as a base64 PNG data URL for the frontend

### Serving behavior

- CORS is fully open via `allow_origins=["*"]`
- no API authentication is enforced
- request size and MIME validation are minimal

## Key Design Decisions

- FastAPI was chosen for low-friction model serving and OpenAPI docs.
- A singleton loader keeps inference startup cost out of the hot path.
- Preprocessing is aligned with the model training pipeline.
- Heatmaps are returned as data URLs so the frontend can render them without another storage tier.
- Grad-CAM is generated server-side to keep the browser free of model internals.

## Known Limitations and Future Improvements

- `allow_origins=["*"]` is development-friendly, not production-safe.
- There is no API auth, quota enforcement, or tenant isolation.
- The service uses legacy duplicate files under `app/` that should be removed or reconciled.
- Request validation should be hardened for content type, file size, and malformed inputs.
- Error payloads should be standardized with typed response models.
- `python-jose` and `passlib` are installed but not used in the active path.
