# Model Architecture

## System Role

The model package is the offline research and training workspace. It creates the checkpoint lineage that the backend later serves.

## Training Flow

```text
dataset root
  -> HistopathDataset scans folder names
  -> train/validation split
  -> train and validation transforms
  -> MobileNetV2 model factory
  -> optimizer + scheduler
  -> epoch loop
      -> forward
      -> loss
      -> backward
      -> optimizer step
      -> metrics
  -> checkpoint save
      -> checkpoint.pth
      -> model_best.pth
```

## Data Contract

Class semantics are encoded in code, not in an external manifest.

Benign:

- `BREAST_ADENOSIS`
- `BREAST_FIBRODENOMA`
- `BREAST_PYLLODES_TUMOR`
- `BREAST_TUBULAR_ADENOMA`

Malignant:

- `BREAST_DUCTAL_CARCINOMA`
- `BREAST_LOBULAR_CARCINOMA`
- `BREAST_MUCINOUS_CARCINOMA`
- `BREAST_PAPILLARY_CARCINOMA`

## Artifact Flow

Produced artifacts:

- `models/checkpoint.pth`
- `models/model_best.pth`

Consumed downstream:

- the backend loader reads `model_state_dict` from these checkpoints

## Grad-CAM Paths

### Preferred

- `scripts/generate_gradcam.py`

### Secondary

- `src/model/gradcam.py`

The script path is the clearest path for single-image explainability from a saved checkpoint.

## Architectural Risks

- training config is encoded in CLI args and Python constants rather than a versioned config system
- dataset mapping is static and requires code changes to extend
- the weighted-loss idea in `train.py` is currently neutralized by a later overwrite
- there is no experiment registry or reproducibility manifest
