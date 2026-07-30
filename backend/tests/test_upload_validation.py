"""Unit tests for upload validation (no torch required)."""

from __future__ import annotations

import io

import pytest
from fastapi import HTTPException
from fastapi import UploadFile
from PIL import Image

from src.config import Settings
from src.upload import read_and_validate_image


def _png_bytes(width: int = 32, height: int = 32) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (width, height), color=(200, 100, 100)).save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_accepts_valid_png():
    settings = Settings()
    data = _png_bytes()
    upload = UploadFile(filename="slide.png", file=io.BytesIO(data), headers={"content-type": "image/png"})
    image, raw = await read_and_validate_image(upload, settings)
    assert image.size == (32, 32)
    assert len(raw) == len(data)


@pytest.mark.asyncio
async def test_rejects_invalid_mime():
    settings = Settings()
    upload = UploadFile(
        filename="evil.exe",
        file=io.BytesIO(b"MZ"),
        headers={"content-type": "application/octet-stream"},
    )
    with pytest.raises(HTTPException) as exc:
        await read_and_validate_image(upload, settings)
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_rejects_oversized():
    settings = Settings()
    settings.max_upload_bytes = 64
    data = _png_bytes(200, 200)
    upload = UploadFile(filename="big.png", file=io.BytesIO(data), headers={"content-type": "image/png"})
    with pytest.raises(HTTPException) as exc:
        await read_and_validate_image(upload, settings)
    assert exc.value.status_code == 413
