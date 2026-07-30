"""Settings / CORS unit checks."""

from src.config import Settings


def test_cors_origins_split(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000, https://histo.example")
    monkeypatch.setenv("AUTH_DISABLED", "true")
    settings = Settings()
    assert settings.cors_origins == ["http://localhost:3000", "https://histo.example"]
    assert settings.auth_disabled is True


def test_default_upload_limit():
    settings = Settings()
    assert settings.max_upload_bytes == 10 * 1024 * 1024
    assert "image/png" in settings.allowed_mime_types
