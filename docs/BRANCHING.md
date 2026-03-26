# Branching Guide

## Default Branches

- `main`: stable branch intended for the latest approved state
- `develop`: integration branch for ongoing work

## Feature Branches

Create feature branches from `develop` using names such as:

- `feature/dashboard-ui-refresh`
- `feature/backend-inference-cleanup`
- `feature/model-training-update`

## Docs Branches

Use `docs/*` branches for documentation-only work such as setup guides, architecture notes, and repository cleanup notes.

## Suggested Flow

1. Branch from `develop`.
2. Commit focused changes with clear messages.
3. Merge back into `develop`.
4. Promote `develop` into `main` when the state is ready.
