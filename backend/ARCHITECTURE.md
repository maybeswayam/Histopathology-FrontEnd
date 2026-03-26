# Backend Architecture

## System Role

The backend is the inference boundary between browser clients and the trained CNN checkpoint.

It provides:

- model lifecycle management
- prediction endpoints
- Grad-CAM generation
- health visibility

It does not currently provide:

- auth
- persistence
- user management
- background jobs

## Request Lifecycle

### `/predict-with-gradcam`

```text
multipart/form-data request
  -> FastAPI UploadFile
  -> PIL decode and RGB conversion
  -> HistoPathModel.predict(image)
      -> resize + normalize
      -> model forward
      -> softmax
      -> class mapping
  -> build input tensor again for Grad-CAM
  -> GradCAM(model.model)
      -> register hooks on target conv layer
      -> forward pass
      -> backward pass for target class
      -> weighted activation map
      -> interpolation and normalization
  -> overlay_heatmap()
  -> PNG encode + base64
  -> JSON response
```

## Module Boundaries

### `app.py`

- FastAPI construction
- CORS configuration
- startup initialization
- active route definitions

### `src/model/model_loader.py`

- checkpoint path discovery
- architecture instantiation
- singleton pattern
- preprocessing transform
- inference wrapper

### `src/model/model.py`

- model factory for MobileNetV2, ResNet18, ResNet50, and EfficientNet-B0

### `src/model/gradcam_service.py`

- hook registration
- target-layer selection
- CAM generation
- overlay rendering

## Active vs Legacy Paths

### Active

- `app.py`
- `src/model/model_loader.py`
- `src/model/model.py`
- `src/model/gradcam_service.py`

### Legacy or duplicate

- `app/routes/predict.py`
- `app/utils/model_loader.py`

These files are not imported by `app.py`.

## Architectural Risks

- no config abstraction for environment-specific behavior
- no typed request or response models with Pydantic
- no API auth or tenant isolation
- open CORS and permissive file handling
- duplicate legacy code paths increase maintenance risk
