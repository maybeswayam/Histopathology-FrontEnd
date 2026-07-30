"""Application settings via environment variables."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import List


def _split_origins(raw: str) -> List[str]:
    return [part.strip() for part in raw.split(",") if part.strip()]


class Settings:
    def __init__(self) -> None:
        self.app_name = "HistoAI Backend"
        self.app_version = os.getenv("APP_VERSION", "1.0.0")
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
        self.reload = os.getenv("RELOAD", "false").lower() in {"1", "true", "yes"}

        # Auth — set AUTH_DISABLED=true only for local demos without Supabase JWT
        self.auth_disabled = os.getenv("AUTH_DISABLED", "false").lower() in {
            "1",
            "true",
            "yes",
        }
        self.supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
        self.supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")

        # CORS — comma-separated origins; never use * in staging/prod
        origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )
        self.cors_origins = _split_origins(origins)

        # Upload limits
        self.max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
        self.max_image_dimension = int(os.getenv("MAX_IMAGE_DIMENSION", "10000"))
        self.allowed_mime_types = {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        }

        # Model
        self.model_path = os.getenv("MODEL_PATH", "")
        self.model_version = os.getenv("MODEL_VERSION", "mobilenet_v2-unknown")
        self.abstain_threshold = float(os.getenv("ABSTAIN_THRESHOLD", "0.55"))

        # Rate limit (simple in-memory; per-process)
        self.rate_limit_per_minute = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
