# HistoAI Frontend

## Overview

The frontend is a Next.js 14 application that provides the browser-facing product for HistoAI. It owns:

- landing and entry routes
- Supabase authentication flows
- protected dashboard and analysis pages
- image upload and prediction orchestration
- rendering classification results and Grad-CAM heatmaps
- saved analysis history retrieval
- a Gemini-backed assistant panel

This layer is not just presentation. It is also the orchestration boundary between the browser, Supabase, the inference backend, and Gemini.

For a module-level map, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

### Core platform

- Next.js `14.2.25`
- React `18.3.1`
- React DOM `18.3.1`
- TypeScript `^5`

### Styling and UI

- Tailwind CSS `^4.1.9`
- `@tailwindcss/postcss` `^4.1.9`
- `tw-animate-css` `1.3.3`
- `tailwind-merge` `^2.5.5`
- `tailwindcss-animate` `^1.0.7`
- `class-variance-authority` `^0.7.1`
- `clsx` `^2.1.1`
- shadcn/ui components built on Radix primitives

### Integration and app libraries

- `@supabase/ssr` `latest`
- `@supabase/supabase-js` `latest`
- `@google/generative-ai` `^0.24.1`
- `axios` `latest`
- `framer-motion` `^12.23.24`
- `lucide-react` `^0.454.0`
- `next-themes` `^0.4.6`
- `geist` `^1.3.1`
- `ogl` `^1.0.11`
- `sonner` `^1.7.4`
- `zod` `3.25.76`
- `react-hook-form` `^7.60.0`
- `@hookform/resolvers` `^3.10.0`

### Direct runtime dependencies declared in `package.json`

```json
"dependencies": {
  "@google/generative-ai": "^0.24.1",
  "@hookform/resolvers": "^3.10.0",
  "@radix-ui/react-accordion": "1.2.2",
  "@radix-ui/react-alert-dialog": "1.1.4",
  "@radix-ui/react-aspect-ratio": "1.1.1",
  "@radix-ui/react-avatar": "1.1.2",
  "@radix-ui/react-checkbox": "1.1.3",
  "@radix-ui/react-collapsible": "1.1.2",
  "@radix-ui/react-context-menu": "2.2.4",
  "@radix-ui/react-dialog": "1.1.4",
  "@radix-ui/react-dropdown-menu": "2.1.4",
  "@radix-ui/react-hover-card": "1.1.4",
  "@radix-ui/react-label": "2.1.1",
  "@radix-ui/react-menubar": "1.1.4",
  "@radix-ui/react-navigation-menu": "1.2.3",
  "@radix-ui/react-popover": "1.1.4",
  "@radix-ui/react-progress": "1.1.1",
  "@radix-ui/react-radio-group": "1.2.2",
  "@radix-ui/react-scroll-area": "1.2.2",
  "@radix-ui/react-select": "2.1.4",
  "@radix-ui/react-separator": "1.1.1",
  "@radix-ui/react-slider": "1.2.2",
  "@radix-ui/react-slot": "1.1.1",
  "@radix-ui/react-switch": "1.1.2",
  "@radix-ui/react-tabs": "1.1.2",
  "@radix-ui/react-toast": "1.2.4",
  "@radix-ui/react-toggle": "1.1.1",
  "@radix-ui/react-toggle-group": "1.1.1",
  "@radix-ui/react-tooltip": "1.1.6",
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "latest",
  "@tanstack/react-table": "^8.21.3",
  "@types/recharts": "^2.0.1",
  "@vercel/analytics": "1.3.1",
  "autoprefixer": "^10.4.20",
  "axios": "latest",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "1.0.4",
  "date-fns": "4.1.0",
  "embla-carousel-react": "8.5.1",
  "framer-motion": "^12.23.24",
  "geist": "^1.3.1",
  "input-otp": "1.4.1",
  "lucide-react": "^0.454.0",
  "next": "14.2.25",
  "next-themes": "^0.4.6",
  "ogl": "^1.0.11",
  "react": "^18.3.1",
  "react-day-picker": "9.8.0",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.60.0",
  "react-resizable-panels": "^2.1.7",
  "recharts": "2.15.4",
  "sonner": "^1.7.4",
  "tailwind-merge": "^2.5.5",
  "tailwindcss-animate": "^1.0.7",
  "vaul": "^0.9.9",
  "zod": "3.25.76"
}
```

```json
"devDependencies": {
  "@tailwindcss/postcss": "^4.1.9",
  "@types/node": "^22",
  "@types/react": "^18.3.26",
  "@types/react-dom": "^18.3.7",
  "postcss": "^8.5",
  "tailwindcss": "^4.1.9",
  "tw-animate-css": "1.3.3",
  "typescript": "^5"
}
```

## Architecture

### Folder layout

```text
frontend/
|-- app/
|   |-- analyze/
|   |-- auth/
|   |-- dashboard/
|   |-- landing/
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- ui/
|   |-- landing/
|   |-- GeminiChat.tsx
|   |-- HistoryCard.tsx
|   |-- HistoryDetailModal.tsx
|   |-- modern-prediction-results.tsx
|   |-- simple-image-upload.tsx
|   `-- StatCard.tsx
|-- hooks/
|-- lib/
|   `-- supabase/
|-- public/
|-- scripts/
|   `-- 001_create_tables.sql
|-- services/
|   |-- api.ts
|   |-- api.ts.bak
|   `-- unified-api.ts
|-- middleware.ts
|-- next.config.mjs
|-- package.json
`-- tsconfig.json
```

### Active runtime paths

- `app/analyze/page.tsx`: upload, inference call, Supabase insert
- `app/dashboard/page.tsx`: auth check, history query, derived metric rendering
- `services/unified-api.ts`: active integration layer for backend inference and Gemini
- `lib/supabase/*`: browser/server/middleware client creation
- `components/HistoryDetailModal.tsx`: saved-case review modal
- `components/GeminiChat.tsx`: assistant UI

Legacy paths that still exist:

- `services/api.ts`
- `services/api.ts.bak`

## API and Interface Contract

### Backend inference contract

The frontend expects a backend at `NEXT_PUBLIC_BACKEND_URL` with:

- `GET /health`
- `POST /predict`
- `POST /predict-with-gradcam`

The active UI path uses `POST /predict-with-gradcam`.

Request:

```http
POST /predict-with-gradcam
Content-Type: multipart/form-data

file=<binary image>
```

Expected response shape:

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

### Gemini contract

`services/unified-api.ts` supports:

- `predictCancer(file, "backend" | "gemini" | "both")`
- `sendChatMessage(message)`
- health checks for backend and Gemini

### Supabase contract

The dashboard assumes a record shape compatible with:

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

The SQL bootstrap in `scripts/001_create_tables.sql` creates:

- `id`
- `user_id`
- `image_url`
- `prediction`
- `confidence`
- `heatmap_url`
- `created_at`
- `processing_time`

The active analyze page inserts:

- `user_id`
- `prediction`
- `confidence`
- `image_url`
- `probabilities`
- `heatmap`

This schema mismatch is real and needs correction before production use.

### Key component interfaces

`SimpleImageUpload`

```ts
interface SimpleImageUploadProps {
  onImageUpload: (file: File) => void
  isLoading: boolean
}
```

`ModernPredictionResults`

```ts
interface ModernPredictionResultsProps {
  results: UnifiedPredictionResult
}
```

`HistoryCard`

```ts
interface HistoryCardProps {
  analysis: HistoryAnalysis
}
```

`HistoryDetailModal`

```ts
interface HistoryDetailModalProps {
  analysis: HistoryAnalysis
  children: React.ReactNode
}
```

`StatCard`

```ts
interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  detail?: string
  tone?: "emerald" | "rose" | "amber" | "sky"
  meter?: number
}
```

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm
- Supabase project and credentials
- backend running locally or remotely
- Gemini API key if Gemini features are required

### Environment variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GEMINI_API_KEY=<gemini-api-key>
```

Variables actually referenced in code:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_GEMINI_API_KEY`

### Install

```bash
cd frontend
npm install
```

### Bootstrap database

Run `scripts/001_create_tables.sql` in Supabase before using dashboard history.

### Run locally

```bash
npm run dev
```

### Build and serve

```bash
npm run build
npm run start
```

## How It Works

### Authentication

- `app/auth/login/page.tsx` uses `supabase.auth.signInWithPassword`
- `app/auth/sign-up/page.tsx` uses `supabase.auth.signUp`
- `middleware.ts` delegates to `lib/supabase/middleware.ts`
- middleware redirects unauthenticated users away from `/dashboard` and `/analyze`
- authenticated users are redirected away from `/auth/login` and `/auth/sign-up`

### Analyze flow

1. `SimpleImageUpload` returns a `File`
2. `app/analyze/page.tsx` creates a local preview via `FileReader`
3. the page calls `unifiedAPI.predictCancer(file, "backend")`
4. `services/unified-api.ts` posts multipart form data to `${BACKEND_URL}/predict-with-gradcam`
5. result data is rendered by `ModernPredictionResults`
6. the record is inserted into Supabase under `analysis_history`

### Dashboard flow

1. `app/dashboard/page.tsx` fetches the current user from Supabase
2. it queries `analysis_history` filtered by `user_id`
3. derived metrics are computed client-side:
   - total analyses
   - malignant count
   - benign count
   - average confidence
   - seven-day activity
   - malignant rate
4. `HistoryCard` renders summaries
5. `HistoryDetailModal` renders original image and Grad-CAM side-by-side

### Gemini chat

`GeminiChat` keeps message history in component state and calls `unifiedAPI.sendChatMessage(message)`.

That method:

- instantiates `gemini-2.5-flash`
- injects a system instruction describing HistoAI
- returns raw assistant text

### State and rendering model

The app uses local component state rather than a global store:

- `useState` for request state, result state, and chat state
- `useEffect` for auth checks and initial fetches
- direct service calls from page components

## Key Design Decisions

- App Router was used to keep routing, middleware, and page composition in a single framework.
- Supabase is used directly from the frontend for auth and persistence, reducing custom backend surface area.
- `unified-api.ts` abstracts backend inference and Gemini behind one API boundary.
- Saved analyses are rendered from persisted records rather than replaying inference.
- Grad-CAM is stored in a browser-friendly format so the dashboard can replay historical results without extra processing.

## Known Limitations and Future Improvements

- `analysis_history` SQL and the active insert payload do not match.
- Gemini calls happen client-side, which is not appropriate for production secret handling.
- `lib/supabase/client.ts` logs Supabase configuration data to the console and should be cleaned up.
- `services/api.ts` and `services/api.ts.bak` duplicate older integration paths.
- Image payloads are stored as data URLs rather than object storage references.
- Dashboard aggregation is client-side and will not scale for large per-user histories.
