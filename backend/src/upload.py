"""Upload validation helpers."""

from __future__ import annotations

import io
from typing import Tuple

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageFile

from src.config import Settings

# Mitigate decompression bombs
Image.MAX_IMAGE_PIXELS = 40_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = False


async def read_and_validate_image(
    file: UploadFile,
    settings: Settings,
) -> Tuple[Image.Image, bytes]:
    content_type = (file.content_type or "").lower().strip()
    if content_type and content_type not in settings.allowed_mime_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "invalid_mime",
                "message": f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, WebP.",
            },
        )

    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "empty_file", "message": "Uploaded file is empty."},
        )
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail={
                "code": "file_too_large",
                "message": f"File exceeds {settings.max_upload_bytes // (1024 * 1024)}MB limit.",
            },
        )

    try:
        with Image.open(io.BytesIO(data)) as img:
            img.verify()
        image = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "invalid_image", "message": f"Could not decode image: {exc}"},
        ) from exc

    width, height = image.size
    if width > settings.max_image_dimension or height > settings.max_image_dimension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "image_too_large",
                "message": (
                    f"Image dimensions {width}×{height} exceed "
                    f"{settings.max_image_dimension}px limit."
                ),
            },
        )

    return image, data
