# Frontend Architecture

## System Role

The frontend is the orchestration and presentation layer for HistoAI. It owns:

- browser session lifecycle
- upload and analysis UX
- result rendering
- saved-history replay
- assistant interactions

It does not implement inference itself and does not proxy Supabase through the backend.

## Route Map

### Public routes

- `/`
- `/landing`
- `/auth/login`
- `/auth/sign-up`
- `/auth/sign-up-success`

### Protected routes

- `/dashboard`
- `/analyze`

Protection is implemented in `lib/supabase/middleware.ts` and applied through `middleware.ts`.

## Runtime Boundaries

### Browser -> Supabase

Used for:

- authentication
- session restoration
- history reads
- history writes

### Browser -> Backend

Used for:

- `POST /predict-with-gradcam`
- optional backend health checks

### Browser -> Gemini

Used for:

- direct chat requests
- optional Gemini-side prediction mode

## Core Data Flow

### Analyze flow

```text
User selects image
  -> SimpleImageUpload emits File
  -> analyze page stores preview as data URL
  -> unifiedAPI.predictCancer(file, "backend")
  -> backend returns prediction + probabilities + heatmap
  -> ModernPredictionResults renders output
  -> Supabase insert persists record
```

### Dashboard flow

```text
Dashboard mounts
  -> Supabase auth.getUser()
  -> Supabase query analysis_history by user_id
  -> local state stores records
  -> derived metrics computed in component
  -> HistoryCard renders summaries
  -> HistoryDetailModal replays original image + heatmap
```

### Gemini flow

```text
User submits prompt
  -> GeminiChat appends user message locally
  -> unifiedAPI.sendChatMessage(message)
  -> Gemini API returns plain text
  -> GeminiChat appends assistant response
```

## Folder Responsibilities

### `app/`

- route entrypoints
- page-level state
- auth checks
- service orchestration

### `components/`

- page fragments
- reusable dashboard widgets
- shadcn/Radix wrappers in `components/ui`

### `services/`

- typed integration layer to backend and Gemini

### `lib/supabase/`

- client/server/middleware client setup for Supabase SSR integration

## Important Internal Contracts

### Unified prediction result

```ts
interface UnifiedPredictionResult {
  prediction: string
  confidence: number
  analysis?: string
  probabilities?: { benign: number; malignant: number }
  source: "backend" | "gemini" | "combined"
  processing_time: number
  heatmap?: string
}
```

### Saved history record

```ts
interface HistoryAnalysis {
  id: string
  created_at: string
  prediction: string
  confidence: number
  image_url: string
  heatmap?: string | null
  probabilities?: {
    benign: number
    malignant: number
  } | null
}
```

## Architectural Risks

- database access is embedded in page components rather than a typed repository layer
- Gemini is called directly from the browser, exposing API access client-side
- SQL bootstrap and the actual record shape are inconsistent
- legacy service files remain beside the active service path
- dashboard metrics are computed after loading the entire history set client-side
