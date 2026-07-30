# HistoAI Project - Complete Implementation Roadmap

> **STALE (2026-07-29):** This file still describes Gemini dual-path and “FE not wired to FastAPI.”  
> **Source of truth:** [`IMPROVEMENTS.md`](./IMPROVEMENTS.md), [`DESIGN_IMPROVEMENTS.md`](./DESIGN_IMPROVEMENTS.md), [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).  
> Current path: Next.js → FastAPI MobileNetV2 + Grad-CAM → Supabase history/storage. Gemini removed.

## 📋 Executive Summary

**Project**: Histopathology Cancer Detection System  
**Tech Stack**: Next.js (Frontend) + FastAPI (Backend) + PyTorch (ML Model)  
**Current Status**: Phase 3 Complete - Backend integrated, dual AI paths available  
**Critical Issues**: Environment configuration, dependency conflicts, frontend-backend integration

---

## 🎯 Project Status Overview

### ✅ What's Working
- Backend FastAPI server with MobileNetV2 model
- Model successfully loaded (`model_best.pth`)
- Frontend using Google Gemini AI for predictions
- Supabase authentication and database
- Virtual environments created for backend and model training
- Complete UI components and pages

### ⚠️ What Needs Attention
- Frontend `.env` file missing (critical for Supabase & Gemini)
- Dual API services causing confusion (`services/api.ts` vs `lib/api.ts`)
- PyTorch version conflicts between backend and model training
- Frontend not connected to FastAPI backend
- No Grad-CAM visualization integrated
- Production deployment configuration missing

### 🔴 Critical Blockers
1. Missing environment variables for frontend
2. Unclear which API service is being used
3. No unified prediction flow
4. Dependency version mismatches

---

## 🚀 PHASE 1: Environment Setup & Dependency Resolution
**Duration**: 30-45 minutes | **Priority**: CRITICAL

### Step 1.1: Frontend Environment Setup

**Tasks**:
```powershell
# Navigate to frontend
cd frontend

# Create .env.local file
New-Item -Path ".env.local" -ItemType File
```

**Add to `.env.local`** (user must provide actual values):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

**Install dependencies**:
```powershell
npm install -g pnpm
pnpm install
```

**Verification**:
- [ ] `.env.local` file created with all variables
- [ ] `node_modules` folder exists
- [ ] No installation errors

---

### Step 1.2: Backend Environment Setup

**Tasks**:
```powershell
cd ..\backend
.\backend-env\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Verify model exists**:
```powershell
Test-Path "models\model_best.pth"  # Should return True
```

**Verification**:
- [ ] Virtual environment activated
- [ ] All packages installed
- [ ] PyTorch 2.1.0 installed
- [ ] Model file exists

---

### Step 1.3: Model Training Environment Setup

**Tasks**:
```powershell
cd ..\model
.\model-env\Scripts\Activate.ps1
```

**Update `requirements.txt`** to match backend:
```txt
torch==2.1.0
torchvision==0.16.0
scikit-learn==1.3.2
numpy==1.25.2
opencv-python==4.8.0.76
pillow==10.1.0
matplotlib==3.7.2
tqdm==4.66.1
```

**Install**:
```powershell
pip install -r requirements.txt --upgrade
```

**Verification**:
- [ ] PyTorch 2.1.0 installed (matches backend)
- [ ] All dependencies updated
- [ ] No version conflicts

---

## 🚀 PHASE 2: Backend Verification & Testing
**Duration**: 20-30 minutes | **Priority**: HIGH

### Step 2.1: Model Loading Verification

**Create `backend/verify_setup.py`**:
```python
import torch
import os
from src.model.model_loader import get_model

def verify_model():
    print("=" * 50)
    print("MODEL VERIFICATION")
    print("=" * 50)
    
    model_path = "models/model_best.pth"
    if os.path.exists(model_path):
        print(f"✅ Model file found: {model_path}")
        file_size = os.path.getsize(model_path) / (1024 * 1024)
        print(f"   Size: {file_size:.2f} MB")
    else:
        print(f"❌ Model file not found")
        return False
    
    try:
        model = get_model()
        print("✅ Model loaded successfully")
        print(f"   Device: {next(model.parameters()).device}")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return False
    
    try:
        dummy_input = torch.randn(1, 3, 224, 224)
        if torch.cuda.is_available():
            dummy_input = dummy_input.cuda()
        with torch.no_grad():
            output = model(dummy_input)
        print("✅ Model inference test passed")
    except Exception as e:
        print(f"❌ Inference failed: {e}")
        return False
    
    print("\n✅ ALL CHECKS PASSED")
    return True

if __name__ == "__main__":
    verify_model()
```

**Run**:
```powershell
cd backend
python verify_setup.py
```

**Verification**:
- [ ] Model file found
- [ ] Model loads successfully
- [ ] Inference test passes

---

### Step 2.2: Backend API Testing

**Start server**:
```powershell
python run_server.py
```

**Test in new terminal**:
```powershell
# Test health
curl http://localhost:8000/health

# Expected: {"status":"healthy","model_loaded":true}
```

**Verification**:
- [ ] Server starts on port 8000
- [ ] Health endpoint returns healthy
- [ ] No errors in logs
- [ ] Model loaded successfully

---

## 🚀 PHASE 3: Frontend Integration
**Duration**: 45-60 minutes | **Priority**: HIGH

### Step 3.1: Create Unified API Service

**Create `frontend/services/unified-api.ts`**:
```typescript
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export type PredictionMode = 'backend' | 'gemini' | 'both';

export interface UnifiedPredictionResult {
  prediction: string;
  confidence: number;
  analysis?: string;
  probabilities?: { benign: number; malignant: number };
  source: 'backend' | 'gemini' | 'combined';
  processing_time: number;
}

export const unifiedAPI = {
  async predictCancer(file: File, mode: PredictionMode = 'backend'): Promise<UnifiedPredictionResult> {
    const startTime = Date.now();
    
    if (mode === 'backend') {
      return await this.predictWithBackend(file, startTime);
    } else if (mode === 'gemini') {
      return await this.predictWithGemini(file, startTime);
    } else {
      const [backendResult, geminiResult] = await Promise.all([
        this.predictWithBackend(file, startTime).catch(() => null),
        this.predictWithGemini(file, startTime).catch(() => null)
      ]);
      return this.combineResults(backendResult, geminiResult, startTime);
    }
  },

  async predictWithBackend(file: File, startTime: number): Promise<UnifiedPredictionResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BACKEND_URL}/predict`, formData);
    return {
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      probabilities: response.data.probabilities,
      source: 'backend',
      processing_time: Date.now() - startTime
    };
  },

  async predictWithGemini(file: File, startTime: number): Promise<UnifiedPredictionResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const fileBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(fileBuffer).toString('base64');
    
    const prompt = `Analyze this histopathology image. Return JSON: {"prediction": "Cancerous" or "Non-Cancerous", "confidence": 0-1, "analysis": "explanation"}`;
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: file.type, data: base64String } }
    ]);
    
    const analysisResult = JSON.parse(result.response.text());
    return {
      prediction: analysisResult.prediction === 'Cancerous' ? 'malignant' : 'benign',
      confidence: analysisResult.confidence,
      analysis: analysisResult.analysis,
      source: 'gemini',
      processing_time: Date.now() - startTime
    };
  },

  combineResults(backend: any, gemini: any, startTime: number): UnifiedPredictionResult {
    if (!backend) return { ...gemini, source: 'gemini' };
    if (!gemini) return { ...backend, source: 'backend' };
    return {
      prediction: backend.prediction,
      confidence: (backend.confidence + gemini.confidence) / 2,
      analysis: gemini.analysis,
      probabilities: backend.probabilities,
      source: 'combined',
      processing_time: Date.now() - startTime
    };
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
};
```

**Verification**:
- [ ] Unified API service created
- [ ] Supports backend, Gemini, and combined modes
- [ ] Health check functions implemented

---

### Step 3.2: Create Mode Selector Component

**Create `frontend/components/prediction-mode-selector.tsx`**:
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PredictionMode } from '@/services/unified-api';

interface Props {
  value: PredictionMode;
  onChange: (mode: PredictionMode) => void;
  backendHealthy: boolean;
  geminiHealthy: boolean;
}

export function PredictionModeSelector({ value, onChange, backendHealthy, geminiHealthy }: Props) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Prediction Mode</h3>
      <div className="flex gap-2">
        <Button
          variant={value === 'backend' ? 'default' : 'outline'}
          onClick={() => onChange('backend')}
          disabled={!backendHealthy}
          className="flex-1"
        >
          <span className={backendHealthy ? 'text-green-500' : 'text-red-500'}>●</span>
          <span className="ml-2">Backend</span>
        </Button>
        <Button
          variant={value === 'gemini' ? 'default' : 'outline'}
          onClick={() => onChange('gemini')}
          disabled={!geminiHealthy}
          className="flex-1"
        >
          <span className={geminiHealthy ? 'text-green-500' : 'text-red-500'}>●</span>
          <span className="ml-2">Gemini</span>
        </Button>
        <Button
          variant={value === 'both' ? 'default' : 'outline'}
          onClick={() => onChange('both')}
          disabled={!backendHealthy || !geminiHealthy}
          className="flex-1"
        >
          Both
        </Button>
      </div>
    </Card>
  );
}
```

**Verification**:
- [ ] Mode selector component created
- [ ] Health indicators working
- [ ] Mode switching functional

---

### Step 3.3: Test Frontend

**Start frontend**:
```powershell
cd frontend
pnpm dev
```

**Test checklist**:
- [ ] Frontend starts on http://localhost:3000
- [ ] No console errors
- [ ] Authentication works
- [ ] Navigate to /analyze
- [ ] Upload image
- [ ] Backend prediction works
- [ ] Results display correctly

---

## 🚀 PHASE 4: Advanced Features
**Duration**: 2-3 hours | **Priority**: MEDIUM

### Step 4.1: Add Grad-CAM Visualization

**Backend**: Add Grad-CAM endpoint to `app.py`
**Frontend**: Display heatmap in results component

### Step 4.2: Batch Processing

**Backend**: Add `/predict-batch` endpoint
**Frontend**: Create batch upload component

### Step 4.3: Performance Optimization

- Add caching for frequent predictions
- Implement request queuing
- Add model quantization for faster inference

---

## 🚀 PHASE 5: Production Deployment
**Duration**: 1-2 hours | **Priority**: LOW

### Step 5.1: Environment Configuration

- Create production `.env` files
- Configure CORS properly
- Set up SSL certificates

### Step 5.2: Deployment

- Deploy backend to cloud (AWS/GCP/Azure)
- Deploy frontend to Vercel
- Configure CDN for static assets

### Step 5.3: Monitoring

- Add logging and error tracking
- Set up performance monitoring
- Configure alerts

---

## 📝 Quick Start Commands

### Start Backend:
```powershell
cd backend
.\backend-env\Scripts\Activate.ps1
python run_server.py
```

### Start Frontend:
```powershell
cd frontend
pnpm dev
```

### Verify Everything:
```powershell
# Backend health
curl http://localhost:8000/health

# Frontend
# Open http://localhost:3000 in browser
```

---

## 🎯 Success Criteria

### Phase 1 Complete:
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] No version conflicts

### Phase 2 Complete:
- [ ] Backend server running
- [ ] Model loads successfully
- [ ] API endpoints responding

### Phase 3 Complete:
- [ ] Frontend connected to backend
- [ ] Predictions working
- [ ] Mode selector functional

### Phase 4 Complete:
- [ ] Grad-CAM visualization working
- [ ] Batch processing implemented
- [ ] Performance optimized

### Phase 5 Complete:
- [ ] Production deployment successful
- [ ] Monitoring configured
- [ ] System stable

---

## 🆘 Troubleshooting

### Backend won't start:
- Check if port 8000 is available
- Verify model file exists
- Check virtual environment is activated

### Frontend errors:
- Verify `.env.local` exists
- Check all environment variables are set
- Ensure backend is running

### Prediction fails:
- Check image format (JPEG/PNG)
- Verify file size < 10MB
- Check backend logs for errors

### CORS errors:
- Verify CORS middleware in backend
- Check BACKEND_URL in frontend .env

---

## 📚 Additional Resources

- **System Architecture**: See `SYSTEM_ARCHITECTURE.md`
- **Dependencies**: See `DEPENDENCY_REPORT.md`
- **Phase 2 Details**: See `PHASE2.md`
- **Phase 3 Details**: See `PHASE3.md`

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Ready for Implementation
