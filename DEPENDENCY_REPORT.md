# Dependency Report

## Overview

This document outlines the dependencies, versions, and environment setup for each component of the HistoAI project.

## Frontend (frontend)

### Core Dependencies (from package.json)

- Node.js 18+ required
- Package Manager: pnpm
- Next.js Framework
- Key Dependencies:
  - next.js (app router)
  - @google/generative-ai ^0.24.1
  - @supabase/supabase-js (latest)
  - @supabase/ssr (latest)
  - Multiple Radix UI components (v1.x - v2.x)
  - Tailwind CSS

### Environment Setup

```bash
# Install pnpm if not installed
npm install -g pnpm

# Install dependencies
cd frontend
pnpm install

# Run development server
pnpm dev
```

## Backend (backend)

### Core Dependencies (from requirements.txt)

- Python 3.10+
- Key Dependencies:
  - fastapi==0.104.1
  - uvicorn[standard]==0.24.0
  - torch==2.1.0
  - torchvision==0.16.0
  - Pillow==10.1.0
  - numpy==1.24.3
  - scikit-learn==1.3.2

### Environment Setup

```bash
# Create virtual environment
python -m venv backend-env

# Activate environment
# Windows:
.\backend-env\Scripts\activate
# Unix/macOS:
source backend-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app:app --reload
```

## Model Training (model)

### Core Dependencies (from requirements.txt)

- Python 3.10+
- Key Dependencies:
  - torch==2.0.1
  - torchvision==0.15.2
  - scikit-learn==1.3.0
  - numpy==1.25.2
  - opencv-python==4.8.0.76
  - pillow==10.0.0
  - matplotlib==3.7.2

### Environment Setup

```bash
# Create virtual environment
python -m venv model-env

# Activate environment
# Windows:
.\model-env\Scripts\activate
# Unix/macOS:
source model-env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Version Conflicts and Resolutions

### PyTorch Ecosystem

- **Conflict**: Different torch/torchvision versions between backend (2.1.0/0.16.0) and model (2.0.1/0.15.2)
- **Resolution**: Standardize on newer versions (2.1.0/0.16.0) for both components

### NumPy

- **Conflict**: Different versions (1.24.3 vs 1.25.2)
- **Resolution**: Standardize on 1.25.2 as it's newer and compatible

### Pillow

- **Conflict**: Different versions (10.1.0 vs 10.0.0)
- **Resolution**: Standardize on 10.1.0 for security updates

## Recommended Project Structure

```text
mini-project/
|-- frontend/              # Next.js frontend
|   |-- node_modules/      # Node dependencies
|-- backend/               # FastAPI backend
|   |-- backend-env/       # Python virtual environment
|-- model/                 # Model training
|   |-- model-env/         # Python virtual environment
`-- shared/                # Shared resources
    `-- models/            # Trained model files
```

### Environment Management Strategy

1. **Frontend**: Independent Node.js environment managed by pnpm
2. **Backend & Model**: Separate Python virtual environments to prevent dependency conflicts
3. **Shared Resources**: Common directory for model files and other shared assets

## Next Steps

1. Create and activate virtual environments
2. Install dependencies for each component
3. Verify installations with test runs
4. Standardize PyTorch versions
5. Set up shared resource directory

---

Phase 1 completed: environments verified, dependencies installed, and project ready for backend-model integration.
