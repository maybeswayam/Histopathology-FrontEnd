# Privacy & data retention

**Audience:** Research / educational demo operators  
**Product posture:** HistoAI is **not** a diagnostic medical device.

## What we store

| Data | Where | Purpose |
|------|-------|---------|
| Account (email) | Supabase Auth | Sign-in |
| Intended-use acceptance timestamp | `user_profiles` | Gate before analyze |
| Prediction metadata | `analysis_history` | Dashboard history |
| Slide + Grad-CAM images | Supabase Storage (`slides`, `heatmaps`) when configured; otherwise inline data URLs (legacy/demo) | Case review |

## Retention

- Default research demo: **user-controlled**. Users may delete their workspace data at any time from the dashboard.
- Operators should not keep orphaned storage objects after row delete; the in-app wipe removes history rows and best-effort storage prefixes.
- If you deploy for an institution, define a written retention window (e.g. 30/90 days) and automate lifecycle rules on the storage buckets.

## Delete my data

Dashboard → **Delete my data** removes:

1. All `analysis_history` rows for the user  
2. Storage objects under `{user_id}/` in `slides` and `heatmaps`  
3. Best-effort `user_profiles` row (re-accept intended use on next visit)

Account deletion (Supabase Auth user) is separate — use Supabase dashboard or Auth admin APIs.

## Inference logs

Backend request logs include `request_id`, `user_id` (JWT `sub`), path, and latency. Do not log raw image bytes or PHI in production log drains.
