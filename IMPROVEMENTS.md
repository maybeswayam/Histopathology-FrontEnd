# HistoAI — Comprehensive Improvements Spec

**Document type:** Production & scaling gap analysis + actionable improvement plan  
**Audience:** Engineering, product, ML, security  
**Scope:** Entire monorepo (`frontend/`, `backend/`, `model/`, `docs/`)  
**Status of product today:** Research demo with auth’d inference, storage, Docker/CI — **async Grad-CAM queue + ML retrain still open**  
**Last reviewed against codebase:** 2026-07-29 (implementation pass)  
**Companion:** `DESIGN_IMPROVEMENTS.md` (UI/UX)

Status legend: **DONE** · **PARTIAL** · **OPEN**

---

## Table of contents

0. [Remaining backlog (re-audit)](#0-remaining-backlog-re-audit)
1. [Executive summary](#1-executive-summary)
2. [How to use this document](#2-how-to-use-this-document)
3. [Current architecture (baseline)](#3-current-architecture-baseline)
4. [Priority framework](#4-priority-framework)
5. [P0 — Launch blockers](#5-p0--launch-blockers)
6. [P1 — Scaling & operability](#6-p1--scaling--operability)
7. [P2 — Product, ML, compliance, maintainability](#7-p2--product-ml-compliance-maintainability)
8. [P3 — Polish, DX, and nice-to-haves](#8-p3--polish-dx-and-nice-to-haves)
9. [Cross-cutting workstreams](#9-cross-cutting-workstreams)
10. [Phased delivery plan](#10-phased-delivery-plan)
11. [Success metrics & acceptance gates](#11-success-metrics--acceptance-gates)
12. [Risk register](#12-risk-register)
13. [File & component inventory (what to touch)](#13-file--component-inventory-what-to-touch)
14. [Out of scope / explicit non-goals (for now)](#14-out-of-scope--explicit-non-goals-for-now)
15. [Appendix A — Suggested schema & API contracts](#15-appendix-a--suggested-schema--api-contracts)
16. [Appendix B — Environment & secrets matrix](#16-appendix-b--environment--secrets-matrix)
17. [Appendix C — Stale documentation cleanup checklist](#17-appendix-c--stale-documentation-cleanup-checklist)

---

## 0. Remaining backlog (re-audit)

### Scorecard

| ID | Item | Status |
|----|------|--------|
| P0-01 | Disclaimers / intended-use gate | **DONE** — gate + banners + abstain UX; legal sign-off still operator-owned |
| P0-02 | Backend auth + CORS lockdown | **DONE** — JWT + locked CORS; **watch:** `AUTH_DISABLED=true` in local/compose defaults |
| P0-03 | Browser Gemini secrets / dual classifier | **DONE** |
| P0-04 | `analysis_history` schema mismatch | **DONE** |
| P0-05 | Object storage (stop base64-in-DB) | **DONE** w/ fallback — must run `setup_supabase.sql` buckets or rows still get data URLs |
| P0-06 | Docker / CI / deploy | **DONE** — Dockerfiles, compose, CI, Makefile, `docs/DEPLOYMENT.md` |
| P0-07 | TypeScript `ignoreBuildErrors` | **DONE** |
| P0-08 | Backend upload validation | **DONE** — `src/upload.py` + FE enforce |
| P1-01 | Async Grad-CAM jobs | **OPEN** — still sync on request thread |
| P1-02 | Model version / checksum | **PARTIAL** — `MODEL_VERSION` returned; **no SHA256 pin**; path auto-discover if unset |
| P1-03 | Dashboard pagination + thin selects | **DONE** |
| P1-04 | Observability | **PARTIAL** — `X-Request-Id` + structured logs; no Sentry/metrics |
| P1-05 | Rate limits | **DONE** — in-memory per process (not shared across replicas) |
| P1-06 | API docs/tests vs live routes | **PARTIAL** — legacy `backend/app/` removed; **`test_api.py` still hits `/model-info` + `/predict-batch`** |
| P1-07 | Backend pydantic-settings / env | **DONE** |
| P1-08 | Capacity / load-test story | **OPEN** |
| P2-01 | Dual classifier (Gemini) | **DONE** |
| P2-02 | Training weighted-loss bug / retrain | **OPEN** |
| P2-03 | Model card + OOD abstain | **PARTIAL** — abstain UX; model card deferred |
| P2-04 | Shared train/serve package | **OPEN** |
| P2-05 | Privacy / retention / delete-my-data | **DONE** — wipe + `docs/PRIVACY.md` |
| P2-06 | Delete dead FE components | **DONE** — orphan landing kit gone (kept `dark_veil.tsx`) |
| P2-07 | Stale ROADMAP / SYSTEM_ARCHITECTURE | **PARTIAL** — STALE banners added; **bodies still Gemini-era** |
| P2-08 | Test strategy + CI | **DONE** — GH Actions + unit tests (fix legacy `test_api.py`) |
| P2-09 | Calibration / honest confidence UX | **PARTIAL** — model suggestion + abstain; no calibration |
| P2-10 | PII console logs | **DONE** |
| P2-11 | Document/delete `train_v2` | **OPEN** |
| P2-12 | Next image optimization | **OPEN** — `images.unoptimized: true` |
| P3-08 | Makefile / DX scripts | **DONE** |
| P3-* other | Batch API, PDF, admin, i18n | **OPEN** (defer) |

### Fix next (ordered)

1. **Prod discipline** — never ship with `AUTH_DISABLED=true`; run full `setup_supabase.sql` (buckets)  
2. **P1-01** — async Grad-CAM queue when concurrency matters  
3. **P1-02** — SHA256 checksum + fail-fast if `MODEL_PATH` missing in prod  
4. **P1-06** — delete or rewrite `backend/test_api.py`; add `/model-info` or drop references  
5. **P2-07** — rewrite or archive ROADMAP / SYSTEM_ARCHITECTURE bodies  
6. **P1-04 / P1-08** — Sentry + capacity doc  
7. **P2-02 / P2-03 / P2-04** — ML retrain, model card, shared package  

### Already shipped (do not re-do)

- Intended-use gate, disclaimers, abstain UX  
- Schema + typed history insert  
- Gemini removed; CNN-only API client  
- JWT auth + CORS + upload validation + rate limit  
- Supabase Storage path (`lib/storage.ts`) + SQL buckets  
- Docker / compose / CI / Makefile / DEPLOYMENT.md  
- Dashboard pagination, privacy wipe, config settings  
- Dead FE landing kit + legacy backend routes removed  

---

## 1. Executive summary

```text
Sign in (Supabase) → Intended-use gate → Upload (/analyze)
  → FastAPI (JWT) MobileNetV2 + Grad-CAM → Storage upload → CaseReview → dashboard
```

**Phase B boundary hardening is largely in the tree.** What remains is scale/ML/ops depth plus prod config discipline.

| Boundary | Today (re-check) | Still needed |
|----------|------------------|--------------|
| **Identity** | JWT on predict + CORS origins | Keep `AUTH_DISABLED` off in real deploys |
| **Inference** | Auth’d, validated, rate-limited, **still sync** | Async queue (P1-01) |
| **Storage** | Storage upload + data-URL fallback | Ensure buckets exist; prefer fail-loud later |
| **Model truth** | CNN-only + version + abstain | SHA pin, model card, retrain |
| **Ops** | Docker + CI | Capacity tests, Sentry, rewrite stale root docs |
| **Trust** | Gate + banners + privacy wipe | Legal sign-off |

**Bottom line:** Stop treating auth/CORS/upload/Docker as open. Next leverage is **async Grad-CAM**, **model checksum**, **stale-doc rewrite**, and **never deploying with auth disabled / missing storage buckets**. Design track is closed — see `DESIGN_IMPROVEMENTS.md` (accepted).

---

## 2. How to use this document

Each improvement item follows this template:

- **Problem** — what is wrong / risky today (with concrete file references where possible)
- **Impact** — who/what breaks (security, cost, correctness, scale, legal, UX)
- **Current evidence** — where it shows up in the repo
- **Improvement plan** — concrete steps
- **Target design** — what “done” looks like
- **Acceptance criteria** — testable checks
- **Effort / dependency** — rough sizing and blockers
- **Owner suggestion** — Eng / ML / Product / Security

Priority labels:

| Label | Meaning |
|-------|---------|
| **P0** | Must fix before any public or multi-user production deploy |
| **P1** | Must fix before meaningful concurrent usage / growth |
| **P2** | Required for a credible clinical-adjacent or lab product |
| **P3** | Quality, DX, polish — do after P0–P2 foundations |

---

## 3. Current architecture (baseline)

### 3.1 Monorepo layout

```text
HistoAI-/
├── frontend/     # Next.js 14 App Router — UX, auth, history, Gemini
├── backend/      # FastAPI — MobileNetV2 inference + Grad-CAM
├── model/        # Offline PyTorch training (no HTTP server)
├── docs/         # Setup, repo map, dashboard notes
├── phases/       # Historical phase docs
└── *.md          # Root architecture / roadmap / dependency reports (partly stale)
```

### 3.2 Runtime ownership

| Concern | Owner today | Gap |
|---------|-------------|-----|
| Auth | Frontend → Supabase | Backend ignores auth |
| Prediction | Browser → FastAPI directly | No gateway, no auth, no queue |
| History | Browser → Supabase | Schema mismatch; blobs in DB |
| Chat / optional vision | Browser → Gemini (`NEXT_PUBLIC_*`) | Key exposed; LLM used as classifier |
| Training | `model/` offline | No promote/registry into backend |
| Deploy | Manual local scripts | No containers / CI / envs |

### 3.3 Active vs legacy paths (important)

**Active (trust these):**

- Frontend: `services/unified-api.ts`, `app/analyze/page.tsx`, `app/dashboard/page.tsx`
- Backend: `app.py`, `src/model/model_loader.py`, `src/model/gradcam_service.py`
- Model: `src/model/train.py`, `scripts/generate_gradcam.py`

**Legacy / duplicate (do not extend; plan deletion):**

- `backend/app/routes/predict.py`, `backend/app/utils/model_loader.py`
- `frontend/services/api.ts`, `frontend/services/api.ts.bak`, `frontend/lib/api.ts`
- Duplicate UI: `gemini-chat.tsx` vs `GeminiChat.tsx`, older upload/results components
- Docs claiming FE is not wired to FastAPI / Grad-CAM missing (`ROADMAP.md`, parts of `SYSTEM_ARCHITECTURE.md`)

---

## 4. Priority framework

Order work by **risk reduction per week**, not by feature excitement:

1. Legal/trust framing + kill Gemini-as-classifier in prod paths  
2. Authenticate backend; move secrets server-side; lock CORS  
3. Fix DB schema; move images/heatmaps to object storage  
4. Docker + CI; stop ignoring TypeScript build errors  
5. Async inference jobs + model version in every response  
6. Paginated history + observability  
7. ML eval harness, promote process, generalization work  
8. Cleanup legacy code and stale docs  

---

## 5. P0 — Launch blockers

---

### P0-01. Medical / product trust & liability framing
**Status: PARTIAL** — intended-use gate, banners, `CaseReview` disclaimer, and `docs/INTENDED_USE.md` shipped. Still open: abstain/low-confidence UX, legal copy sign-off, export/PDF disclaimer.

#### Problem
HistoAI presents binary **benign / malignant** cancer predictions to end users with Grad-CAM “explanations.” Without mandatory research framing and refusal UX, liability and overtrust remain. *(Gemini classifier path has been removed — no longer invents diagnoses via LLM.)*

#### Impact
- Misinterpretation as a diagnostic device
- Liability if used clinically without intended-use controls
- Loss of trust if confident wrong answers are shown without caveats
- Blocks hospital/lab adoption conversations

#### Current evidence
- Analyze UI shows prediction + confidence as primary outcome (`frontend/app/analyze/page.tsx`, `modern-prediction-results.tsx`)
- Gemini prediction mode exists and can average with CNN (`frontend/services/unified-api.ts` `combineResults`)
- No persistent disclaimer, terms acceptance, or audit of acknowledgment

#### Improvement plan
1. **Product decision:** Position v1 as **research / educational / decision-support prototype**, not a diagnostic device.
2. Add blocking first-run **Terms + Intended Use** acceptance (stored per user in DB).
3. Add always-visible disclaimer on `/analyze`, `/dashboard`, and result cards:
   - “Not a medical diagnosis. For research/education only. Consult a qualified pathologist.”
4. Remove or hard-disable production paths that treat Gemini as a cancer classifier.
5. Add **low-confidence / abstain** UX when confidence &lt; threshold or image fails QC.
6. Legal review of copy before any public URL.

#### Target design
- Predictions labeled “model suggestion” with model version + timestamp
- User must acknowledge disclaimer before first analysis
- Export/share flows include the same disclaimer

#### Acceptance criteria
- [ ] Disclaimer visible without scrolling on analyze + results
- [ ] User cannot analyze until intended-use accepted (persisted)
- [ ] Gemini cannot return a clinical class label in production builds
- [ ] Copy reviewed and checked into `docs/INTENDED_USE.md`

#### Effort / dependency
**M** (1–3 days eng + product/legal). Blocks marketing language. No hard eng dependency.

#### Owner
Product (lead) + Eng + Legal advisor

---

### P0-02. Unauthenticated, open inference API
**Status: OPEN** — `backend/app.py` still uses `allow_origins=["*"]`; `/predict` and `/predict-with-gradcam` have no auth. Browser still calls FastAPI directly via `NEXT_PUBLIC_BACKEND_URL`.

#### Problem
The FastAPI backend accepts predictions from anyone who can reach the URL. There is no JWT/API-key verification, no tenant binding, and CORS is fully open.

#### Impact
- Cost abuse (CPU/GPU burn via Grad-CAM)
- Unauthorized access to model behavior (model extraction / scraping)
- PHI/slide images sent to an unprotected endpoint
- Frontend Supabase auth provides a false sense of security

#### Current evidence
```21:27:backend/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
- No auth middleware on `/predict` or `/predict-with-gradcam`
- Backend ARCHITECTURE.md explicitly lists “no API auth or tenant isolation”

#### Improvement plan
1. Require `Authorization: Bearer <Supabase JWT>` (or backend-issued service token) on all predict routes.
2. Verify JWT with Supabase JWT secret / JWKS; extract `sub` as `user_id`.
3. Restrict CORS to known frontend origins via env (`CORS_ORIGINS`).
4. Optionally add a Next.js **BFF route** (`/api/predict`) so the browser never talks to FastAPI directly.
5. Reject requests without valid auth with `401`; log `user_id` + request id.

#### Target design
```text
Browser → Next.js /api/predict (session cookie)
        → FastAPI (service auth or forwarded verified JWT)
        → model workers
```

#### Acceptance criteria
- [ ] Unauthenticated `POST /predict-with-gradcam` returns 401
- [ ] CORS rejects unknown origins in staging/prod
- [ ] Prediction logs include verified `user_id`
- [ ] Local dev still works with documented test token flow

#### Effort / dependency
**L** (3–5 days). Depends on env secrets matrix (Appendix B).

#### Owner
Eng (backend + frontend) + Security review

---

### P0-03. Secrets exposed to the browser (Gemini API key)
**Status: DONE** — Gemini dependency, chat UI, and classifier modes removed; `unified-api.ts` is CNN-only. No `NEXT_PUBLIC_GEMINI_*` in env examples. **Rule going forward:** any future LLM must be server-only (BFF), never `NEXT_PUBLIC_*`.

#### Problem *(historical — fixed by removal)*
`NEXT_PUBLIC_GEMINI_API_KEY` was embedded in the client bundle. Anyone could extract it and abuse quota.

#### Impact
- Direct financial/abuse risk on Google Cloud billing
- Inability to rotate keys without redeploying frontend
- Violates basic secret-handling standards

#### Current evidence
```4:6:frontend/services/unified-api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
```
- Chat and optional prediction call Gemini from the browser

#### Improvement plan
1. Remove all `NEXT_PUBLIC_*` usage for Gemini (and any future LLM/provider keys).
2. Create Next.js Route Handlers:
   - `POST /api/chat` — server-side Gemini with system prompt
   - (If kept) `POST /api/assist` — explanation only, never primary diagnosis
3. Store `GEMINI_API_KEY` server-only in Vercel/host env.
4. Rate-limit chat per authenticated user.
5. Rotate the currently exposed key after migration (assume it is compromised).

#### Target design
Browser never imports `@google/generative-ai` with a real key. Only server routes hold secrets.

#### Acceptance criteria
- [ ] Production JS bundle contains no Gemini API key string
- [ ] Chat works via `/api/chat` for authenticated users only
- [ ] Old key rotated; docs updated
- [ ] `.env.example` documents server-only vars correctly

#### Effort / dependency
**M** (1–2 days). Blocks any public deploy with Gemini enabled.

#### Owner
Eng (frontend)

---

### P0-04. Analysis history schema mismatch (correctness bug)
**Status: DONE** — `001_create_tables.sql`, `002_align_analysis_history.sql`, and `setup_supabase.sql` include `heatmap`, `probabilities`, `processing_time`, `heatmap_url`. Analyze insert + `types/analysis.ts` match. Ensure live Supabase has been run through `setup_supabase.sql`.

#### Problem *(historical — fixed)*
SQL bootstrap and runtime inserts disagreed; history could fail or types could drift.

#### Impact
- Users lose analysis history (core product loop broken)
- Dashboard empty / inconsistent
- Hard to debug because insert errors may be swallowed or only shown in analyze error state

#### Current evidence

**SQL** (`frontend/scripts/001_create_tables.sql`):

| Column | Present |
|--------|---------|
| `heatmap_url` | yes |
| `processing_time` | yes |
| `heatmap` | **no** |
| `probabilities` | **no** |

**Insert** (`frontend/app/analyze/page.tsx`):

```58:65:frontend/app/analyze/page.tsx
const { error: dbError } = await supabase.from("analysis_history").insert({
  user_id: user.id,
  prediction: prediction.prediction,
  confidence: prediction.confidence,
  image_url: imageUrl,
  probabilities: prediction.probabilities,
  heatmap: prediction.heatmap,
});
```

**Consumer types** (`HistoryCard.tsx`) expect `heatmap` and `probabilities`.

#### Improvement plan
1. Inventory actual live Supabase schema (may differ from SQL file).
2. Write a forward migration (not only `CREATE TABLE IF NOT EXISTS`):
   - Align column names to one canonical schema (prefer storage URLs, not base64 — see P0-05).
3. Update analyze insert + dashboard select + TypeScript types together.
4. Add a smoke test: insert → select → assert fields.
5. Replace root docs that describe the wrong schema.

#### Target design (canonical row — see also Appendix A)
Metadata in Postgres; binaries in object storage; columns match code 1:1.

#### Acceptance criteria
- [ ] Fresh DB from migrations supports analyze insert with zero errors
- [ ] Dashboard renders prediction, confidence, image, heatmap for new rows
- [ ] Shared TypeScript type / generated types match DB
- [ ] Migration checked into repo; `001_create_tables.sql` updated or superseded

#### Effort / dependency
**S–M** (0.5–2 days). **Hard dependency for P0-05.**

#### Owner
Eng (frontend + data)

---

### P0-05. Images & heatmaps stored as data URLs in the database
**Status: OPEN** — Analyze still `FileReader` → data URL into `image_url` and persists backend `heatmap` base64. No Supabase Storage buckets. Schema alignment did **not** fix storage architecture.

#### Problem
Original slides and Grad-CAM overlays are stored as giant base64 `data:` strings in `TEXT` columns. This will blow up row size, backups, API payloads, and dashboard load times.

#### Impact
- Postgres bloat; slow queries; expensive backups
- Dashboard `select("*")` downloads megabytes per user
- Poor mobile UX; possible Supabase payload limits
- Difficult CDN caching / virus scanning / lifecycle policies

#### Current evidence
- Analyze page: `FileReader.readAsDataURL` → insert `image_url`
- Backend returns `heatmap` as `data:image/png;base64,...`
- Both persisted into `analysis_history`

#### Improvement plan
1. Create Supabase Storage buckets: `slides` (private), `heatmaps` (private).
2. On analyze success:
   - Upload original image bytes to `slides/{user_id}/{analysis_id}.ext`
   - Upload heatmap PNG to `heatmaps/{user_id}/{analysis_id}.png`
   - Insert row with **URLs/paths only** + prediction metadata
3. Prefer generating heatmap once in backend and uploading from BFF, or return heatmap bytes to BFF for upload (avoid double base64 in DB).
4. Dashboard uses signed URLs (short TTL) for display.
5. Backfill script for any existing base64 rows (or discard demo data).
6. Set bucket policies: users can only read/write their prefix; RLS-aligned.

#### Target design
```text
analysis_history:
  id, user_id, prediction, confidence, probabilities jsonb,
  image_path, heatmap_path, model_version, processing_ms, created_at

Storage:
  slides/...  heatmaps/...
```

#### Acceptance criteria
- [ ] No new row stores `data:image/...` in Postgres
- [ ] Average history list payload &lt; ~5KB/row metadata
- [ ] Signed URL access works; unauthenticated URL access fails
- [ ] Retention policy documented (e.g., delete objects on row delete)

#### Effort / dependency
**L** (3–5 days). Depends on P0-04 schema alignment.

#### Owner
Eng (frontend) + optional backend help for heatmap bytes

---

### P0-06. No production deployment foundation
**Status: OPEN** — Still no `Dockerfile`, `docker-compose`, or `.github` workflows. Local `npm run dev` + `run_server.py` only.

#### Problem
There is no Dockerfile, docker-compose, CI workflow, Procfile, or environment-specific deploy config. Runtime assumptions are “developer laptop.”

#### Impact
- Cannot reproducibly deploy staging/prod
- Onboarding requires tribal knowledge
- No path to horizontal scale or GPU hosts
- Config drift between machines

#### Current evidence
- Glob for `Dockerfile*`, `docker-compose*`, `.github/**`, `vercel.json` → **none**
- Backend: `run_server.py` hardcoded host/port, reload=True
- Frontend: `next.config.mjs` with `ignoreBuildErrors: true`
- Model weights discovery via heuristic path walking

#### Improvement plan
1. **Backend Dockerfile:** Python 3.11, install requirements, copy `models/model_best.pth`, run uvicorn without reload, non-root user.
2. **Frontend:** Deploy to Vercel/similar with server env vars; build must fail on TS errors (see P0-07).
3. **docker-compose.dev.yml:** frontend + backend (+ optional redis later).
4. **CI (GitHub Actions):** lint + typecheck + unit tests + build images on PR.
5. **Staging environment** with separate Supabase project.
6. Document runbooks in `docs/DEPLOYMENT.md`.
7. Pin model artifact into image or mount from object storage with checksum.

#### Target design
One-command local stack; CI green required to merge; staging URL for demos.

#### Acceptance criteria
- [ ] `docker compose up` brings healthy backend `/health` + frontend
- [ ] CI runs on every PR
- [ ] Staging deploy documented and repeatable
- [ ] Prod secrets not in git; `.env.example` complete

#### Effort / dependency
**L** (3–5 days initial). Ongoing ops ownership.

#### Owner
Eng (full-stack / DevOps)

---

### P0-07. TypeScript build errors ignored
**Status: DONE** — `typescript.ignoreBuildErrors` removed from `frontend/next.config.mjs`. Keep CI green once P0-06 lands.

#### Problem *(historical — fixed)*
Next.js was configured to ship even when TypeScript failed.

#### Impact
- Production can contain type-unsafe UI around predictions/confidence
- Hides regressions in history types after schema changes
- Undermines confidence in refactors

#### Current evidence
```1:8:frontend/next.config.mjs
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

#### Improvement plan
1. Remove `ignoreBuildErrors`.
2. Run `pnpm tsc --noEmit` / `next build` and fix all errors.
3. Add CI step that fails on type errors.
4. Optionally enable ESLint in CI (`next lint`).

#### Acceptance criteria
- [ ] `ignoreBuildErrors` removed
- [ ] Clean `next build` on main
- [ ] CI blocks merge on type errors

#### Effort / dependency
**S–M** depending on latent errors.

#### Owner
Eng (frontend)

---

### P0-08. Permissive / missing upload validation on inference
**Status: OPEN** — Live `app.py` still unbounded `await file.read()` then `Image.open`. FE copy says “Max 10MB” but `simple-image-upload.tsx` does not enforce size. Legacy `backend/app/routes/predict.py` checks are unused.

#### Problem
Backend accepts arbitrary uploads, opens with PIL, and runs Grad-CAM with no explicit max size, MIME allowlist, dimension limits, or virus/content checks.

#### Impact
- DoS via huge files or decompression bombs
- Unexpected formats crash workers
- Wasted compute on non-histology junk

#### Current evidence
```59:69:backend/app.py
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    ...
    image_data = await file.read()  # unbounded
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
```

#### Improvement plan
1. Enforce max upload size (e.g., 20–50 MB) at reverse proxy + FastAPI.
2. Allowlist MIME: `image/jpeg`, `image/png`, `image/webp` (decide on TIFF later).
3. Cap dimensions (e.g., reject &gt; 10k×10k; downscale carefully for model input only).
4. Use `Image.verify()` / safe loader patterns; limit PIL decompression.
5. Return structured `400` errors with stable error codes.
6. Mirror client-side validation in upload component for UX.

#### Acceptance criteria
- [ ] Oversized file → 413/400, no model forward
- [ ] `.exe` / non-image → 400
- [ ] Valid PNG/JPEG → 200
- [ ] Tests cover rejection cases

#### Effort / dependency
**S–M** (1–2 days). Pairs with P0-02.

#### Owner
Eng (backend)

---

## 6. P1 — Scaling & operability

---

### P1-01. Synchronous Grad-CAM on the request thread
**Status: OPEN** — Still inline in `predict_with_gradcam`. Analyze progress stages are client-timed, not job-backed.
#### Problem
`/predict-with-gradcam` runs preprocess, forward, Grad-CAM hooks, overlay, and base64 encode inline in the HTTP handler. Under concurrency, latency spikes and workers block.

#### Impact
- Timeouts under multi-user load
- Cannot scale CPU/GPU workers independently from API
- Poor UX for “analyze” with no progress beyond spinner
- Hard to retry partial failures

#### Current evidence
Full pipeline in `backend/app.py` `predict_with_gradcam`; no queue/broker; architecture docs state “no background jobs.”

#### Improvement plan
1. Introduce job queue (Redis + RQ/Celery/Arq) or a simple worker process.
2. API returns `202 { job_id }` or websocket/SSE progress.
3. Worker writes result + heatmap to storage; client polls `GET /jobs/{id}`.
4. Keep a **fast path** `/predict` (no Grad-CAM) for low-latency class-only if needed.
5. Set timeouts, idempotency keys, and dead-letter handling.
6. Autoscale workers separately from API pods.

#### Target design
```text
POST /v1/analyses → job_id
Worker: predict → gradcam → upload storage → mark complete
GET /v1/analyses/{id} → status + result URLs
```

#### Acceptance criteria
- [ ] Concurrent 10 Grad-CAM jobs do not stall health checks
- [ ] Client can resume result after refresh via job/analysis id
- [ ] p95 latency SLOs defined and measured

#### Effort / dependency
**XL** (1–2 weeks). Depends on P0-02, P0-05, P0-06.

#### Owner
Eng (backend)

---

### P1-02. Single-node model lifecycle & path heuristics
**Status: OPEN** — Path walking in `model_loader.py`; no `MODEL_VERSION` / SHA in responses or DB.
#### Problem
Model loading uses multi-path file discovery and prints to stdout; no explicit `MODEL_PATH` / checksum / version. Train and serve classifier heads differ slightly between packages.

#### Impact
- Wrong checkpoint can load silently in some cwd contexts
- Cannot pin/rollback model versions in prod
- Train/serve mismatch risk

#### Current evidence
- `backend/src/model/model_loader.py` `_find_model_file` walks several paths
- Train (`model/src/model/model.py`): replaces `classifier[1]` with `Linear`
- Serve (`backend/src/model/model.py`): replaces entire `classifier` with `Sequential(Dropout, Linear)`
- `model/models/` often empty; live weights under `backend/models/model_best.pth`

#### Improvement plan
1. Require `MODEL_PATH` and `MODEL_VERSION` env vars in prod.
2. Verify SHA256 of checkpoint at startup; fail fast on mismatch.
3. Unify train and serve model factory into one shared module/package **or** freeze serve architecture to match training export.
4. Include `model_version` in every prediction response and DB row.
5. Add `GET /model-info` (documented but missing) returning version, checksum, classes, input size.
6. Document promote flow: train → eval gate → copy artifact → bump version.

#### Acceptance criteria
- [ ] Startup fails if MODEL_PATH missing/checksum wrong (prod)
- [ ] `/health` or `/model-info` returns version
- [ ] Analyze history stores `model_version`
- [ ] Train/serve weight load verified by automated test

#### Effort / dependency
**M–L**. Foundational for ML ops.

#### Owner
ML + Eng (backend)

---

### P1-03. Dashboard loads entire history client-side
**Status: OPEN** — Still full history fetch; counts repeated in welcome / workspace / history panel. Index exists in SQL (`user_id, created_at`) but UI does not paginate.
#### Problem
Dashboard fetches all `analysis_history` rows with `select("*")` and computes stats in the browser.

#### Impact
- Latency and memory grow linearly (worse with base64 blobs)
- No pagination UX
- Stats become expensive; mobile clients struggle

#### Current evidence
```61:69:frontend/app/dashboard/page.tsx
const { data: historyData } = await supabase
  .from("analysis_history")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", { ascending: false })
```

#### Improvement plan
1. Paginate (`range` / cursor) with page size 10–20.
2. List query selects thin columns only (no giant text); signed URLs on demand.
3. Move aggregates to SQL views or RPC: `total`, `malignant_count`, `avg_confidence`, `week_count`.
4. Virtualize long lists if needed.
5. Add filters (date, prediction) server-side.

#### Acceptance criteria
- [ ] First paint does not download full history
- [ ] Stats match SQL aggregates for &gt;1000 rows
- [ ] Infinite scroll or paging works

#### Effort / dependency
**M**. Best after P0-05.

#### Owner
Eng (frontend)

---

### P1-04. No observability, SLOs, or error tracking
**Status: OPEN**

#### Problem
No request IDs, metrics, tracing, or Sentry-like error reporting. Logs are basic `logging` / `console.log` (including sensitive login email logs).

#### Impact
- Cannot diagnose production incidents
- Cannot prove SLOs for demos/customers
- No ML drift visibility

#### Current evidence
- Backend: stdlib logging only
- Frontend: `console.log` of email/login in `auth/login/page.tsx`; Supabase URL logged in `lib/supabase/client.ts`
- No metrics exporters / APM

#### Improvement plan
1. Add structured JSON logging with `request_id`, `user_id`, `model_version`, `latency_ms`.
2. Integrate Sentry (frontend + backend) with PII scrubbing.
3. Metrics: request rate, error rate, p50/p95 latency, queue depth, model inference time.
4. Remove PII from client logs (email, tokens, URLs with keys).
5. Define SLOs (example): availability 99.5% staging; p95 predict &lt; 5s without Grad-CAM, &lt; 15s with.
6. Optional: prediction audit table (input hash, output, version) for drift.

#### Acceptance criteria
- [ ] Every API response has `X-Request-Id`
- [ ] Errors appear in Sentry with stack traces
- [ ] Dashboard or Prometheus/Grafana shows latency + errors
- [ ] No email/PII in browser console in production builds

#### Effort / dependency
**M–L**.

#### Owner
Eng + Ops

---

### P1-05. No rate limiting / abuse controls
**Status: OPEN** — Especially critical while P0-02 remains open.
#### Problem
Even after auth, a single user (or stolen token) can spam Grad-CAM and Gemini/chat.

#### Impact
- Cost explosions
- Noisy neighbor on shared workers
- Gemini quota exhaustion

#### Improvement plan
1. Per-user rate limits on predict and chat (e.g., 30 analyzes/hour, 60 chats/hour — tune later).
2. Global IP limits at reverse proxy.
3. Quotas stored in Redis or Supabase.
4. Clear `429` responses with `Retry-After`.
5. Admin kill-switch env flag to disable Grad-CAM or Gemini under incident.

#### Acceptance criteria
- [ ] Exceeding quota returns 429
- [ ] Limits documented for users
- [ ] Kill-switch tested in staging

#### Effort / dependency
**M**. After P0-02 and Gemini BFF.

#### Owner
Eng

---

### P1-06. Missing / misleading API surface vs docs & tests
**Status: OPEN** — Live routes unchanged; `test_api.py` still references `/model-info`, `/predict-batch`; legacy `backend/app/routes/` unused.
#### Problem
Docs and tests reference endpoints that do not exist on the live app (`/predict-batch`, `/model-info`). Legacy route modules confuse contributors.

#### Impact
- Failed integrations
- False confidence from outdated tests
- Wasted onboarding time

#### Current evidence
- Live routes in `backend/app.py`: `/`, `/health`, `/predict`, `/predict-with-gradcam`
- `SYSTEM_ARCHITECTURE.md`, `phases/PHASE3.md`, `backend/test_api.py` mention missing endpoints
- Legacy `backend/app/routes/predict.py` unused

#### Improvement plan
1. Either implement `/model-info` and (if needed) `/predict-batch`, **or** delete references and fix tests.
2. Add OpenAPI completeness: Pydantic response models for all routes.
3. Delete or quarantine legacy `backend/app/` duplicates.
4. Single source of truth: generated OpenAPI + short `backend/API.md`.

#### Acceptance criteria
- [ ] `test_api.py` passes against running server
- [ ] OpenAPI lists only real routes
- [ ] Legacy unused modules removed or clearly marked and excluded from packaging

#### Effort / dependency
**S–M**.

#### Owner
Eng (backend)

---

### P1-07. Backend config is hardcoded / no environment abstraction
**Status: OPEN**

#### Problem
Host, port, CORS, device (CPU/GPU), model path, and log level are not managed via a typed settings layer.

#### Impact
- Fragile deploys
- Difficult multi-env promotion
- Easy to accidentally run reload or debug settings in prod

#### Current evidence
- `run_server.py` uses fixed `0.0.0.0:8000` and `reload=True`
- CORS hardcoded
- Device selection simplistic in loader

#### Improvement plan
1. Introduce `pydantic-settings` `Settings` class.
2. Env vars: `HOST`, `PORT`, `CORS_ORIGINS`, `MODEL_PATH`, `MODEL_VERSION`, `MODEL_SHA256`, `DEVICE`, `MAX_UPLOAD_BYTES`, `LOG_LEVEL`, `REDIS_URL`, etc.
3. Disable reload in prod entrypoint.
4. Document in `.env.example` and DEPLOYMENT.md.

#### Acceptance criteria
- [ ] Zero magic constants for deploy-sensitive values
- [ ] Staging/prod differ only by env
- [ ] Invalid config fails at startup with clear message

#### Effort / dependency
**S**.

#### Owner
Eng (backend)

---

### P1-08. No horizontal scaling story for GPU/CPU inference
**Status: OPEN**

#### Problem
Architecture assumes one process holding one model in memory. No sticky sessions plan, no shared storage for jobs, no autoscaling policy.

#### Impact
- Cannot serve bursty classroom/demo or multi-lab usage
- Risk of OOM if multiple uvicorn workers each load the model without planning

#### Improvement plan
1. Decide: single GPU worker pool vs CPU-only for v1.
2. If multiple API workers: load model once per worker deliberately; measure RAM.
3. Shared Redis for jobs; shared object storage for artifacts.
4. Health check distinguishes “process up” vs “model ready” vs “queue saturated.”
5. Capacity plan doc: max concurrent Grad-CAM jobs per instance.

#### Acceptance criteria
- [ ] Capacity numbers written (`docs/CAPACITY.md`)
- [ ] Load test script exists (k6/locust) for N concurrent uploads
- [ ] Scaling runbook: when to add workers

#### Effort / dependency
**L**. After P1-01.

#### Owner
Eng + Ops

---

## 7. P2 — Product, ML, compliance, maintainability

---

### P2-01. Dual classifier truth (CNN vs Gemini vs “both”)
**Status: DONE** — Gemini modes removed; analyze uses backend CNN only. Do not reintroduce averaging.

#### Problem
Product can run backend, Gemini, or average them. That creates conflicting “diagnoses” and invents confidence by averaging incompatible systems.

#### Impact
- Undermines scientific credibility
- Unvalidated LLM path treated like a medical model
- Confusing UX (`prediction-mode-selector` exists; analyze hardcodes `'backend'`)

#### Current evidence
- `unified-api.ts` modes: `backend` | `gemini` | `both`
- `combineResults` averages confidences
- Analyze page hardcodes `'backend'` but selector/API still allow dual paths

#### Improvement plan
1. **Product rule:** Only MobileNetV2 (or future validated CNN) is the prediction source of truth.
2. Gemini (server-side) may explain histology concepts or summarize model output textually — never assign benign/malignant as authority.
3. Remove `both` averaging; remove Gemini vision classifier from prod feature flags.
4. If research comparison is needed, put it behind an explicit “experimental lab” flag with separate UI labeling.

#### Acceptance criteria
- [ ] Production analyze path has a single classifier
- [ ] No confidence averaging across Gemini and CNN
- [ ] UI copy matches behavior

#### Effort / dependency
**S** after P0-01 and P0-03.

#### Owner
Product + Eng

---

### P2-02. Training quality: dead weighted loss & class imbalance
**Status: OPEN**

#### Problem
`train.py` computes class weights for severe imbalance then overwrites with unweighted `CrossEntropyLoss()`.

#### Impact
- Model may be biased toward majority (malignant in coded counts)
- Metrics can look good while minority class suffers
- Silent training bug reduces trust in checkpoint

#### Current evidence
```49:58:model/src/model/train.py
total_samples = 6442
num_benign = 1013
num_malignant = 5429
...
criterion = nn.CrossEntropyLoss(weight=weights)
...
criterion = nn.CrossEntropyLoss()  # overwrites weights
```

#### Improvement plan
1. Remove duplicate optimizer/criterion block; keep one intentional strategy.
2. Prefer patient/slide-level splits to avoid leakage.
3. Report per-class precision/recall/F1, confusion matrix, calibration.
4. Consider focal loss / oversampling if imbalance remains.
5. Re-train and compare against current `model_best.pth` on a frozen test set.

#### Acceptance criteria
- [ ] Training config YAML/JSON checked in
- [ ] Per-class metrics logged each epoch
- [ ] New checkpoint beats baseline on agreed test set or documented why not
- [ ] Weighted/focal choice is intentional and tested

#### Effort / dependency
**L** (ML days–weeks).

#### Owner
ML

---

### P2-03. Hard-coded dataset contract & weak generalization story
**Status: OPEN**

#### Problem
Folder-name → label mapping is hard-coded for BreakHis-style breast histology. No stain normalization, no OOD detection, no documented domain limits.

#### Impact
- Real user uploads (different stains, organs, scanners) get confident wrong labels
- Extending to new classes requires code edits
- Product overclaims capability

#### Current evidence
- `model/src/model/dataset.py` and ARCHITECTURE.md list fixed folder names
- Inference always returns benign/malignant + confidence; no “unknown” class

#### Improvement plan
1. Publish **Model Card**: training data, intended image types, known failure modes.
2. Add basic QC: blur detection, empty slide, extreme size.
3. Add OOD score (e.g., max softmax threshold + embedding distance) → abstain.
4. Externalize label maps to config files.
5. Optional stain augmentation in training.

#### Acceptance criteria
- [ ] Model card in `model/MODEL_CARD.md`
- [ ] Abstain path returns `prediction: "inconclusive"` with reason
- [ ] UI handles inconclusive without implying diagnosis

#### Effort / dependency
**L**.

#### Owner
ML + Product

---

### P2-04. Train/serve code duplication & drift
**Status: OPEN**

#### Problem
Nearly duplicated `model.py`, Grad-CAM, dataset utils across `model/` and `backend/`.

#### Impact
- Fixes land in one tree only
- Architecture mismatches (classifier head)
- Longer onboarding

#### Improvement plan
1. Extract shared package `histoai_ml` (or `packages/ml`) used by train + serve.
2. Backend depends on versioned package or monorepo path dependency.
3. Single Grad-CAM implementation.
4. CI tests import compatibility.

#### Acceptance criteria
- [ ] One model factory used by train and serve
- [ ] Grad-CAM single implementation
- [ ] Backend build installs shared package cleanly

#### Effort / dependency
**L**. Can follow P1-02.

#### Owner
ML + Eng

---

### P2-05. Privacy, retention, and compliance readiness (HIPAA/GDPR-oriented)
**Status: OPEN** — RLS exists; no retention job, delete-my-data UX, or audit log table.

#### Problem
Slides may be PHI/sensitive. Current system lacks retention controls, deletion UX beyond raw SQL policy, audit logs, DPA language, and encryption/access reviews beyond Supabase defaults.

#### Impact
- Cannot sell to regulated customers
- GDPR erasure hard with base64-in-DB and no storage lifecycle
- Audit gaps

#### Current evidence
- RLS policies exist for select/insert/delete (good start)
- No documented retention; images in DB; Gemini may receive image bytes in optional modes
- Login email logged to console

#### Improvement plan
1. Data inventory: what PII/PHI exists where (auth, DB, storage, logs, LLM).
2. User “Delete my data” flow: DB rows + storage objects.
3. Retention job (e.g., 90 days) configurable.
4. Audit log table: who analyzed what, when, model version (store hashes not raw slides in logs).
5. Ensure LLM path never receives identifiable slide pixels unless covered by BAA and feature flag.
6. Legal: privacy policy, DPA, subprocessors list.
7. Security review of RLS + storage policies.

#### Acceptance criteria
- [ ] Documented data map
- [ ] Account deletion removes storage + history
- [ ] Privacy policy published
- [ ] Audit log queryable for a user session

#### Effort / dependency
**XL** (ongoing). Product/legal heavy.

#### Owner
Product + Security + Eng

---

### P2-06. Frontend legacy services & dead components
**Status: PARTIAL** — `services/api.ts`, `lib/api.ts`, Gemini chat deleted. Still clean up: `prediction-mode-selector.tsx`, unused upload/results wrappers, unused `StatCard`, orphan `components/landing/*` template files, finish git removal of deleted chat files.

#### Problem
Multiple API clients and UI duplicates increase confusion and regression risk.

#### Impact
- Wrong import during feature work
- Bundle bloat
- Docs disagree with code

#### Current evidence
- Active: `services/unified-api.ts`
- Legacy: `services/api.ts`, `api.ts.bak`, `lib/api.ts`
- Duplicate chat/upload/results components listed in ARCHITECTURE.md

#### Improvement plan
1. Grep for imports; delete unreachable files.
2. Keep one upload component, one results component, one chat component.
3. Add `frontend/ARCHITECTURE.md` “do not use” section until deletions land.
4. Enforce via lint boundary if needed.

#### Acceptance criteria
- [ ] Only one prediction service module remains
- [ ] Dead components deleted
- [ ] Bundle analysis shows no orphan heavy imports

#### Effort / dependency
**S–M**.

#### Owner
Eng (frontend)

---

### P2-07. Stale roadmap & architecture documentation
**Status: OPEN** — `ROADMAP.md` and `SYSTEM_ARCHITECTURE.md` still describe Gemini-only FE and unwired FastAPI. README / LOCAL_SETUP / INTENDED_USE are closer to truth.

#### Problem
Root `ROADMAP.md` and parts of `SYSTEM_ARCHITECTURE.md` still describe Gemini-only FE, unwired FastAPI, missing Grad-CAM — contradicting current code.

#### Impact
- Wrong planning decisions
- New contributors implement already-done work
- External reviewers distrust the repo

#### Improvement plan
1. Rewrite ROADMAP against this IMPROVEMENTS.md priority order.
2. Update SYSTEM_ARCHITECTURE to match live routes and unified-api flow.
3. Mark `phases/PHASE2.md` / `PHASE3.md` as historical.
4. Single “current truth” index in `docs/REPOSITORY_MAP.md`.

#### Acceptance criteria
- [ ] No doc claims Grad-CAM is missing or FE unwired
- [ ] Historical docs clearly labeled
- [ ] README links to IMPROVEMENTS.md + LOCAL_SETUP.md

#### Effort / dependency
**S**.

#### Owner
Eng + Product

---

### P2-08. Weak testing strategy
**Status: OPEN**

#### Problem
Scattered verify/test scripts; frontend lacks serious test suite; backend tests reference missing endpoints; no CI gate.

#### Impact
- Regressions in predict/schema/auth slip through
- Refactors are scary

#### Improvement plan
1. Backend: pytest for health, auth rejection, validation, predict happy path with fixture image, Grad-CAM smoke (CPU).
2. Frontend: Playwright e2e for login → analyze (mock backend) → history row.
3. Contract tests: OpenAPI vs client types.
4. ML: checkpoint load test + deterministic inference golden vector.
5. Wire all into CI.

#### Acceptance criteria
- [ ] CI runs unit + at least one e2e smoke
- [ ] Golden inference test pinned to model version
- [ ] Flakes tracked and &lt;1% on main

#### Effort / dependency
**L**.

#### Owner
Eng + ML

---

### P2-09. Confidence calibration & result UX honesty
**Status: PARTIAL** — UI says “model suggestion” + research disclaimer; no calibration, abstain, or confidence bands.

#### Problem
Softmax confidence is shown as if it were clinical certainty. No calibration, no confidence intervals, no guidance thresholds.

#### Impact
- Overtrust in high softmax on OOD images
- Poor decision support UX

#### Improvement plan
1. Temperature scaling / calibration on validation set.
2. UX bands: low / medium / high with explicit copy.
3. Show class probabilities always (benign vs malignant).
4. Link Grad-CAM as “model attention, not proof of disease.”

#### Acceptance criteria
- [ ] Calibration method documented
- [ ] UI never says “diagnosis”
- [ ] Probabilities + model version visible on results and history detail

#### Effort / dependency
**M**.

#### Owner
ML + Product + Eng

---

### P2-10. Supabase client logging & middleware hardening
**Status: PARTIAL** — Re-audit remaining `console.log` on auth/client; middleware exists.

#### Problem
Client logs Supabase URL and key presence; login logs email; middleware auth is cookie-based (good) but analyze also re-checks ad hoc.

#### Impact
- Noise and potential info leakage in shared demos
- Inconsistent auth UX

#### Improvement plan
1. Strip debug logs behind `NODE_ENV === 'development'`.
2. Centralize auth gate; trust middleware + server components where possible.
3. Prefer server actions / route handlers for sensitive writes after BFF migration.

#### Acceptance criteria
- [ ] Production console clean of secrets/PII
- [ ] Unauthenticated users never hit analyze data path

#### Effort / dependency
**S**.

#### Owner
Eng (frontend)

---

### P2-11. `train_v2.py` and undocumented alternate training paths
**Status: OPEN**

#### Problem
Alternate training entrypoints without docs create uncertainty about which recipe produced `model_best.pth`.

#### Impact
- Irreproducible science
- Wasted experiments

#### Improvement plan
1. Document or delete `train_v2.py`.
2. Tag checkpoints with git commit + config hash + dataset hash.
3. Experiment log (even a simple CSV/W&B).

#### Acceptance criteria
- [ ] One documented official train entrypoint
- [ ] Checkpoint metadata includes provenance

#### Effort / dependency
**S–M**.

#### Owner
ML

---

### P2-12. Next image optimization disabled / frontend performance
**Status: OPEN** — `images.unoptimized: true` remains; unblock after object-storage URLs (P0-05).

#### Problem
`images.unoptimized: true` and large client pages; landing may be heavy; no performance budget.

#### Impact
- Slower LCP on marketing and dashboard thumbnails
- Worse mobile experience

#### Improvement plan
1. Re-enable Next image optimization for remote/storage URLs where possible.
2. Lazy-load dashboard chat and history detail.
3. Code-split heavy landing visuals.
4. Set Lighthouse budgets in CI (optional).

#### Acceptance criteria
- [ ] LCP improved on landing/dashboard vs baseline measurement
- [ ] History thumbnails use sized images not full originals

#### Effort / dependency
**M**. After storage URLs exist.

#### Owner
Eng (frontend)

---

## 8. P3 — Polish, DX, and nice-to-haves

---

### P3-01. Batch prediction API
**Status: OPEN** (defer)
**Problem:** Docs mention `/predict-batch`; not implemented. Useful for labs.  
**Plan:** Implement authenticated batch job that fans out to queue; zip results.  
**Acceptance:** Batch of 50 images completes with per-item status.  
**Effort:** M–L after P1-01.

---

### P3-02. Prediction comparison / second reader workflow
**Problem:** No multi-user review of the same slide.  
**Plan:** Share analysis with another user; comments; agree/disagree.  
**Effort:** L. Product-driven.

---

### P3-03. Export reports (PDF)
**Problem:** No portable report for research notes.  
**Plan:** PDF with image, heatmap, probabilities, disclaimer, model version.  
**Effort:** M.

---

### P3-04. Admin console
**Problem:** No visibility into usage, failures, model version rollout.  
**Plan:** Admin-only Supabase role + simple metrics page.  
**Effort:** L.

---

### P3-05. Multi-architecture serving (ResNet/EfficientNet)
**Problem:** Backend factory supports multiple arches; training package mostly MobileNetV2; unclear prod choice.  
**Plan:** Explicitly support one prod arch; keep others experimental behind config.  
**Effort:** S–M.

---

### P3-06. Internationalization / accessibility
**Problem:** English-only; a11y not audited.  
**Plan:** axe checks; keyboard paths for upload; i18n if expanding markets.  
**Effort:** M+.

---

### P3-07. Dependency hygiene
**Problem:** Dual lockfiles (npm + pnpm) in frontend; backend lists unused jose/passlib; torch version drift historically noted.  
**Plan:** One package manager; remove unused deps; Dependabot; pin hashes where critical.  
**Effort:** S–M.  
**Evidence:** `DEPENDENCY_REPORT.md`, `frontend/package-lock.json` + `pnpm-lock.yaml`, unused auth libs in backend requirements.

---

### P3-08. Developer experience scripts
**Problem:** Manual multi-terminal startup.  
**Plan:** Root `Makefile` / `package.json` workspaces scripts: `make dev`, `make test`, `make lint`.  
**Effort:** S.

---

### P3-09. Placeholder / utility scripts cleanup in backend
**Problem:** Many one-off scripts (`create_placeholder_model.py`, `compare_checkpoints.py`, `inspect_model.py`, etc.) without a curated tools docs index.  
**Plan:** Move to `backend/scripts/` with README; delete obsolete ones.  
**Effort:** S.

---

### P3-10. Branding / UX consistency
**Status: PARTIAL** — Package renamed `histoai-frontend`; shared Logo/AppHeader shipped. Remaining visual gaps tracked in `DESIGN_IMPROVEMENTS.md` (home hero imagery, AppHeader primary CTA, orphan landing kit).
**Problem:** Marketing vs app craft gaps and leftover template components.  
**Plan:** Follow `DESIGN_IMPROVEMENTS.md` remaining backlog — do not drive-by restyle outside that plan.  
**Effort:** S–M.

---

## 9. Cross-cutting workstreams

These are not single tickets — they span many P0–P2 items.

### 9.1 Security workstream
- AuthN/Z on inference  
- Secret management  
- CORS lockdown  
- Upload validation  
- RLS + storage policies  
- PII scrubbing in logs  
- Key rotation after Gemini exposure  
- Dependency vulnerability scanning  

### 9.2 Data platform workstream
- Schema migrations as code  
- Object storage  
- Signed URLs  
- Retention & deletion  
- Aggregates/RPC for dashboard  

### 9.3 MLOps workstream
- Model card  
- Checksummed artifacts  
- Eval gate before promote  
- Version in API + DB  
- Drift/prediction logging  
- Shared train/serve code  

### 9.4 Product trust workstream
- Intended use  
- Disclaimers  
- Single source of clinical truth  
- Abstain/inconclusive UX  
- Privacy policy  

### 9.5 Platform / DevOps workstream
- Docker  
- CI  
- Staging  
- Observability  
- Capacity & load tests  
- Runbooks  

---

## 10. Phased delivery plan

### Phase A — Stabilize truth — **MOSTLY COMPLETE**
**Shipped:** P0-01 (gate/disclaimers), P0-04 (schema), P0-07 (TS), P2-01 (CNN-only), much of design trust UX.  
**Leftover:** abstain UX, legal sign-off, finish dead-code cleanup.

### Phase B — Secure the boundary — **NEXT (in progress / open)**
**Goal:** Safe to put on a private staging URL.

| Item | Status |
|------|--------|
| P0-03 Gemini server-side | **DONE** via removal |
| P0-02 Backend auth + CORS | **OPEN** |
| P0-08 Upload validation | **OPEN** |
| P0-05 Object storage | **OPEN** |
| P1-05 Basic rate limits | **OPEN** |
| P0-06 Docker + CI skeleton | **OPEN** |

**Exit gate:** Unauthenticated inference fails; images not in Postgres; compose/CI exists.

### Phase C — Scale the path (2–3 weeks) — **NOT STARTED**
| Item | Priority |
|------|----------|
| P1-01 Async jobs | P1 |
| P1-02 Model versioning | P1 |
| P1-03 Dashboard pagination + SQL stats | P1 |
| P1-04 Observability | P1 |
| P1-07 Settings/env | P1 |
| P1-08 Capacity plan + load test | P1 |

### Phase D — Credible ML product (ongoing) — **NOT STARTED**
P2-02, P2-03, P2-04, P2-08, P2-09 remaining, P2-05.

### Phase E — Expand (later)
P3 items as needed. See also `DESIGN_IMPROVEMENTS.md` for parallel UI backlog.

---

## 11. Success metrics & acceptance gates

### 11.1 Engineering KPIs
| Metric | Demo today (approx) | Target after Phase C |
|--------|---------------------|----------------------|
| Unauthenticated predict | Allowed | 0% success |
| Secrets in browser bundle | Gemini key present | 0 provider secrets |
| History insert success rate | Unknown / fragile | ≥ 99% on staging |
| Avg DB row size for new analyses | Multi-MB possible | &lt; 2 KB metadata |
| p95 Grad-CAM latency @ 5 concurrent | Untested | Measured + budgeted |
| CI on main | None | Required green |

### 11.2 Product KPIs
| Metric | Target |
|--------|--------|
| Disclaimer acknowledgment rate | 100% before first analyze |
| Support tickets “is this a diagnosis?” | Declining after copy changes |
| User-reported lost history | Near zero after P0-04/05 |

### 11.3 ML KPIs
| Metric | Target |
|--------|--------|
| Per-class F1 on frozen test set | Tracked every promote |
| Abstain rate on known OOD set | High abstain, low forced errors |
| Calibration ECE | Measured and improved |

---

## 12. Risk register

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| Public deploy before auth | High if rushed | Critical | Phase B gate; no public DNS until auth |
| Exposed Gemini key already stolen | High | High | Rotate immediately in Phase B |
| Schema already diverged in live Supabase | High | High | Inventory prod DB before migrating |
| Train/serve head mismatch causes silent bad preds | Medium | Critical | Golden inference tests + unify factory |
| Users treat Grad-CAM as proof | High | High | Copy + P0-01 |
| GPU cost overrun | Medium | High | Rate limits + async queue + quotas |
| PHI sent to Gemini | Medium | Critical | Feature flag off; BFF policy; contracts |
| Docs-driven wrong architecture work | High | Medium | P2-07 early |
| Ignoring TS errors hides bugs | High | Medium | P0-07 immediately |

---

## 13. File & component inventory (what to touch)

### 13.1 Frontend (high touch)
| Path | Why |
|------|-----|
| `frontend/app/analyze/page.tsx` | Insert schema, storage upload, disclaimer, API via BFF |
| `frontend/app/dashboard/page.tsx` | Pagination, thin selects, stats RPC |
| `frontend/services/unified-api.ts` | Split: browser client → `/api/*` only |
| `frontend/app/api/**` (new) | Chat + predict proxy |
| `frontend/scripts/*.sql` / migrations | Schema truth |
| `frontend/next.config.mjs` | Remove ignoreBuildErrors; images |
| `frontend/lib/supabase/*` | Remove debug logs; storage helpers |
| `frontend/components/modern-prediction-results.tsx` | Disclaimer, probabilities, version |
| `frontend/components/GeminiChat.tsx` | Call `/api/chat` |
| `frontend/components/simple-image-upload.tsx` | Client validation |
| Legacy delete candidates | `services/api.ts*`, `lib/api.ts`, duplicate chat/upload/results |

### 13.2 Backend (high touch)
| Path | Why |
|------|-----|
| `backend/app.py` | Auth, validation, settings, versioned routes, jobs |
| `backend/src/model/model_loader.py` | MODEL_PATH, checksum, device |
| `backend/src/model/model.py` | Align with training |
| `backend/src/model/gradcam_service.py` | Shared/ perf |
| `backend/run_server.py` | Prod entry without reload |
| `backend/requirements.txt` | Remove unused; add settings/queue deps |
| `backend/test_api.py` | Fix to real routes |
| Legacy delete | `backend/app/routes/*`, `backend/app/utils/*` |

### 13.3 Model (high touch)
| Path | Why |
|------|-----|
| `model/src/model/train.py` | Fix loss; metrics; config |
| `model/src/model/model.py` | Shared factory |
| `model/src/model/dataset.py` | Externalize maps; splits |
| `model/scripts/generate_gradcam.py` | Align with serve |
| New | `MODEL_CARD.md`, eval scripts, config YAML |

### 13.4 Docs
| Path | Why |
|------|-----|
| `IMPROVEMENTS.md` | This file — living plan |
| `ROADMAP.md` | Rewrite to match |
| `SYSTEM_ARCHITECTURE.md` | Update or archive |
| `docs/LOCAL_SETUP.md` | Add storage, auth, env |
| `docs/DEPLOYMENT.md` (new) | Phase B+ |
| `docs/CAPACITY.md` (new) | Phase C |
| `docs/INTENDED_USE.md` (new) | Phase A |
| `phases/*` | Mark historical |

---

## 14. Out of scope / explicit non-goals (for now)

Do **not** prioritize these ahead of P0/P1 unless a stakeholder explicitly funds them:

- Full FDA/CE regulatory submission as a medical device  
- Multi-organ cancer taxonomy expansion  
- Real-time collaborative WSI viewer (whole-slide gigapixel)  
- Training foundation models from scratch  
- Mobile native apps  
- Marketplace / multi-tenant SaaS billing (can follow after Phase C)

These may be strategically important later; they are distractions while the inference boundary and storage model are unsafe.

---

## 15. Appendix A — Suggested schema & API contracts

### A.1 Suggested `analysis_history` (metadata only)

```sql
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL CHECK (prediction IN ('benign', 'malignant', 'inconclusive')),
  confidence DECIMAL(5, 4) NOT NULL,
  probabilities JSONB,
  inconclusive_reason TEXT,
  image_path TEXT NOT NULL,
  heatmap_path TEXT,
  model_version TEXT NOT NULL,
  model_sha256 TEXT,
  processing_ms INTEGER,
  source TEXT NOT NULL DEFAULT 'backend' CHECK (source IN ('backend')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: select/insert/delete own rows (update optional)
-- Storage paths are relative keys into private buckets; serve via signed URLs
```

### A.2 Suggested prediction response (FastAPI)

```json
{
  "prediction": "malignant",
  "confidence": 0.91,
  "probabilities": { "benign": 0.09, "malignant": 0.91 },
  "model_version": "mobilenetv2-breakhis-2026-03-01",
  "model_sha256": "abc...",
  "processing_ms": 842,
  "heatmap_path": null,
  "request_id": "..."
}
```

For async:

```json
{ "job_id": "...", "status": "queued" }
```

### A.3 Suggested BFF routes (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/analyses` | Auth session → enqueue/proxy predict; upload slide |
| GET | `/api/analyses/:id` | Status + signed URLs |
| POST | `/api/chat` | Authenticated Gemini explanation assistant |
| DELETE | `/api/account/data` | GDPR-style delete |

---

## 16. Appendix B — Environment & secrets matrix

| Variable | Layer | Public? | Notes |
|----------|-------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Yes | OK public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Yes | OK with RLS; still protect |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **No** | Never `NEXT_PUBLIC_` |
| `GEMINI_API_KEY` | Server only | **No** | Replace `NEXT_PUBLIC_GEMINI_API_KEY` |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Maybe | Prefer same-origin `/api` in prod |
| `BACKEND_SERVICE_TOKEN` / JWT secret | Backend | **No** | Verify Supabase JWT |
| `CORS_ORIGINS` | Backend | **No** | Explicit list |
| `MODEL_PATH` | Backend | **No** | Absolute path in container |
| `MODEL_VERSION` | Backend | No | Returned to clients |
| `MODEL_SHA256` | Backend | No | Startup verify |
| `REDIS_URL` | Backend | **No** | Jobs (Phase C) |
| `SENTRY_DSN` | FE+BE | **No** | Ops |
| `MAX_UPLOAD_BYTES` | Backend | No | Validation |

**Action:** Create root and per-package `.env.example` files reflecting this matrix; rotate any key that was ever `NEXT_PUBLIC_GEMINI_*`.

---

## 17. Appendix C — Stale documentation cleanup checklist

- [ ] `ROADMAP.md` — rewrite status section; remove “FE not connected / no Grad-CAM / Gemini predictions”
- [ ] `SYSTEM_ARCHITECTURE.md` — update to CNN + Grad-CAM + intended-use; remove phantom routes or implement them
- [ ] `DEPENDENCY_REPORT.md` — refresh after Gemini removal
- [x] `docs/INTENDED_USE.md` — exists
- [x] `docs/LOCAL_SETUP.md` — updated toward current flow (keep current)
- [ ] `phases/PHASE2.md`, `PHASE3.md` — add banner: historical
- [ ] `backend/README.md` — document auth + env once P0-02/P1-07 land
- [x] `frontend` package name / metadata — `histoai-frontend` (verify)
- [ ] Delete or quarantine unused `backend/app/routes`, `backend/app/utils`
- [ ] Delete orphan FE: `prediction-mode-selector.tsx`, unused landing kit, old upload/results if unused
- [ ] Root `README.md` — link remaining backlog in §0 of this file

---

## Final recommendation

**Done enough to stop re-litigating:** trust gate, schema, Gemini removal, TS gate.

**Do next:** P0-02 → P0-08 → P0-05 → P0-06, then P1 pagination/versioning.

Treat remaining work as a **three-boundary hardening project**: auth the API, store media correctly, make deploy/CI real. UI polish beyond `DESIGN_IMPROVEMENTS.md` remaining items should not jump the queue.

---

### Changelog

| Date | Note |
|------|------|
| 2026-07-28 | Initial comprehensive spec |
| 2026-07-29 | Re-audit: marked DONE/PARTIAL/OPEN; added §0 remaining backlog; Phase A mostly complete |

*Prefer checking boxes and updating Status lines as items close.*
