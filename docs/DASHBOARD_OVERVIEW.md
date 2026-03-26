# Dashboard Overview

## Main Areas

- `frontend/app/dashboard/page.tsx`: dashboard page layout
- `frontend/components/HistoryCard.tsx`: saved case preview card
- `frontend/components/HistoryDetailModal.tsx`: detailed popup for a saved case
- `frontend/components/GeminiChat.tsx`: right-side assistant panel
- `frontend/components/StatCard.tsx`: reusable metric card component

## Current Layout

The dashboard currently has:

1. A top workspace section with account actions and snapshot context.
2. A statistics row for totals, malignant cases, benign cases, and average confidence.
3. A saved-history section that opens detailed case modals.
4. A right-side support column for Gemini copilot and workspace notes.

## Data Sources

- Supabase auth is used to resolve the signed-in user.
- Supabase `analysis_history` is used for saved case history.
- The dashboard computes totals and rates from that saved history client-side.

## Design Direction

- Green and white are the active dashboard theme colors.
- The dashboard is intentionally product-style rather than a plain data table.
- History remains the main working area, with the assistant and notes as secondary tools.
