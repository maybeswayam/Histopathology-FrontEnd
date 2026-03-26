# HistoAI Model

## Overview

The model package is the offline machine-learning workspace for HistoAI. It is responsible for:

- dataset loading and benign/malignant label mapping
- architecture definition
- training and validation
- checkpoint serialization
- Grad-CAM generation outside the API server

This package does not serve traffic directly. It produces the checkpoint artifacts consumed by the backend inference service.

For the training and artifact flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

- Python `3.11+` recommended
- torch `2.1.0`
- torchvision `0.16.0`
- scikit-learn `1.3.2`
- numpy `1.25.2`
- opencv-python `4.8.0.76`
- Pillow `10.1.0`
- matplotlib `3.7.2`
- tqdm `4.66.1`

The pinned environment in `requirements.txt` is:

```text
torch==2.1.0
torchvision==0.16.0
scikit-learn==1.3.2
numpy==1.25.2
opencv-python==4.8.0.76
pillow==10.1.0
matplotlib==3.7.2
tqdm==4.66.1
```

## Architecture

### Folder layout

```text
model/
|-- models/
|   `-- models/
|       |-- checkpoint.pth
|       `-- model_best.pth
|-- scripts/
|   `-- generate_gradcam.py
|-- src/
|   `-- model/
|       |-- dataset.py
|       |-- gradcam.py
|       |-- model.py
|       |-- train.py
|       |-- train_v2.py
|       `-- utils.py
|-- requirements.txt
`-- README.md
```

### Primary module responsibilities

- `src/model/dataset.py`
  - scans dataset directories
  - maps classes to binary labels
  - builds training and validation transforms
  - constructs `DataLoader`s

- `src/model/model.py`
  - creates the MobileNetV2 classifier used for training

- `src/model/train.py`
  - performs the end-to-end training loop
  - computes accuracy, F1, and ROC-AUC
  - saves checkpoints

- `src/model/utils.py`
  - saves and loads checkpoints

- `scripts/generate_gradcam.py`
  - loads a checkpoint
  - computes prediction and Grad-CAM for a single image
  - saves a visualization image

## Interface Contract

### Dataset contract

The dataset loader expects subdirectories under `--data_dir` with these mappings.

Benign (`0`)

- `BREAST_ADENOSIS`
- `BREAST_FIBRODENOMA`
- `BREAST_PYLLODES_TUMOR`
- `BREAST_TUBULAR_ADENOMA`

Malignant (`1`)

- `BREAST_DUCTAL_CARCINOMA`
- `BREAST_LOBULAR_CARCINOMA`
- `BREAST_MUCINOUS_CARCINOMA`
- `BREAST_PAPILLARY_CARCINOMA`

Supported image extensions:

- `.png`
- `.jpg`
- `.jpeg`

### Training CLI

`src/model/train.py` accepts:

```bash
python -m src.model.train \
  --data_dir data \
  --arch mobilenet_v2 \
  --epochs 15 \
  --batch_size 32 \
  --lr 0.001 \
  --pretrained \
  --resume \
  --checkpoint_path models/checkpoint.pth \
  --save_dir models \
  --num_workers 4 \
  --seed 42
```

Arguments:

- `--data_dir`: dataset root
- `--arch`: architecture name, default `mobilenet_v2`
- `--epochs`: epoch count
- `--batch_size`: batch size
- `--lr`: learning rate
- `--pretrained`: initialize from ImageNet weights
- `--resume`: resume from checkpoint
- `--checkpoint_path`: checkpoint to load
- `--save_dir`: output directory for checkpoints
- `--num_workers`: `DataLoader` worker count
- `--seed`: global seed

### Checkpoint contract

`src/model/utils.py` saves:

```python
{
  "epoch": int,
  "model_state_dict": ...,
  "optimizer_state_dict": ...,
  "best_acc": float,
  "train_acc": float,
  "val_acc": float
}
```

The backend loader consumes `model_state_dict` from this structure.

### Grad-CAM CLI

`scripts/generate_gradcam.py` accepts:

```bash
python scripts/generate_gradcam.py \
  --image_path <path-to-image> \
  --model_path models/model_best.pth \
  --output_path gradcam_output.png
```

Outputs:

- console prediction summary
- saved visualization image

## Setup and Installation

### Prerequisites

- Python 3.11+
- optional CUDA GPU for faster training
- local dataset laid out according to the folder contract above

### Install

```bash
cd model
py -m pip install -r requirements.txt
```

### Train

```bash
py -m src.model.train --data_dir <dataset-root> --pretrained
```

### Resume

```bash
py -m src.model.train --data_dir <dataset-root> --resume --checkpoint_path models/checkpoint.pth
```

### Generate Grad-CAM

```bash
py scripts/generate_gradcam.py --image_path <image> --model_path models/model_best.pth --output_path gradcam_output.png
```

## How It Works

### Dataset construction

`HistopathDataset` scans the expected subdirectories, loads images with PIL, converts them to RGB, and assigns a binary label.

Training transform:

- resize to `224x224`
- random horizontal flip with `p=0.5`
- convert to tensor
- normalize with ImageNet mean/std

Validation transform:

- resize to `224x224`
- convert to tensor
- normalize with ImageNet mean/std

The dataset is split into train and validation with `random_split` and a deterministic seed.

### Model architecture

The active architecture is MobileNetV2 from torchvision:

- optional ImageNet initialization
- classifier head replaced with a 2-class linear layer

Class encoding:

- `0 = benign`
- `1 = malignant`

### Training loop

`train.py` performs:

1. device selection
2. seed setup
3. loader creation
4. model creation
5. optimizer setup with Adam
6. learning-rate schedule with `StepLR(step_size=7, gamma=0.1)`
7. epoch-level training and validation
8. metric calculation
9. checkpoint save
10. best-model promotion by validation accuracy

### Metrics

Metrics are computed from softmax probabilities:

- accuracy via `accuracy_score`
- binary F1 via `f1_score(..., average="binary")`
- ROC-AUC via `roc_auc_score(labels, preds[:, 1])`

### Checkpointing

`save_checkpoint` writes:

- `checkpoint.pth` every save
- `model_best.pth` when validation accuracy improves

This artifact structure is what the backend loader expects.

### Grad-CAM generation

The preferred explainability path is `scripts/generate_gradcam.py`.

Process:

1. load model architecture with `pretrained=False`
2. load `model_state_dict` from checkpoint
3. preprocess image with validation transforms
4. run inference for predicted class and confidence
5. attach forward and backward hooks to `model.features[-4]`
6. compute channel weights by mean-pooling gradients
7. sum weighted activations and apply ReLU
8. upsample CAM to `224x224`
9. normalize to `[0, 1]`
10. generate heatmap and overlay visualization

## Key Design Decisions

- MobileNetV2 is used to balance accuracy and deployment cost.
- Offline training is kept separate from online inference so the backend stays lightweight.
- Training-time preprocessing aligns with backend inference preprocessing.
- Checkpoints are kept simple and backend-compatible.
- Grad-CAM is available both as research code and as a standalone CLI script.

## Known Limitations and Future Improvements

- `train.py` computes class weights and then overwrites the weighted loss with a plain `CrossEntropyLoss`; the imbalance logic is currently ineffective.
- Dataset mapping is hard-coded to a specific folder taxonomy.
- Only MobileNetV2 is actively supported in the model package.
- There is no experiment tracking, config versioning, or artifact metadata.
- `src/model/gradcam.py` appears to be an older path and is less aligned with `scripts/generate_gradcam.py`.
- `train_v2.py` exists but is undocumented.
