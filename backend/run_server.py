#!/usr/bin/env python3
"""Run the FastAPI inference server using env-based settings."""

import sys

import uvicorn

from src.config import get_settings


def main() -> None:
    settings = get_settings()
    print(f"Starting HistoAI API on {settings.host}:{settings.port}")
    print(f"Model version: {settings.model_version}")
    print(f"Auth disabled: {settings.auth_disabled}")
    print(f"CORS origins: {settings.cors_origins}")
    try:
        uvicorn.run(
            "app:app",
            host=settings.host,
            port=settings.port,
            reload=settings.reload,
            log_level="info",
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
