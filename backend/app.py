from fastapi import Depends, FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import HTTPException
import logging
import base64
import io
import time
import uuid

from src.config import Settings, get_settings
from src.auth import require_user
from src.upload import read_and_validate_image
from src.model.model_loader import get_model
from src.model.gradcam_service import GradCAM, overlay_heatmap


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="HistoAI Histopathology API",
    description="CNN inference + Grad-CAM for research/education use.",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    expose_headers=["X-Request-Id"],
)

model = None


@app.middleware("http")
async def attach_request_id(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
    user_id = getattr(request.state, "user_id", None)
    logger.info(
        "request_id=%s method=%s path=%s status=%s user_id=%s elapsed_ms=%s",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        user_id,
        elapsed_ms,
    )
    return response


@app.on_event("startup")
async def startup_event():
    global model
    try:
        model = get_model()
        logger.info(
            "Model initialized successfully version=%s path=%s",
            settings.model_version,
            settings.model_path or "(auto-discovered)",
        )
    except Exception as e:
        logger.error("Model initialization failed: %s", e)
        raise e


@app.get("/")
async def root():
    return {
        "message": "HistoAI Backend is running",
        "version": settings.app_version,
        "model_version": settings.model_version,
    }


@app.get("/health")
async def health_check():
    if model is None:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": "Model not initialized"},
        )
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_version": settings.model_version,
        "auth_required": not settings.auth_disabled,
    }


def _enrich_prediction(prediction_result: dict, settings: Settings) -> dict:
    confidence = float(prediction_result.get("confidence") or 0)
    abstain = confidence < settings.abstain_threshold
    return {
        **prediction_result,
        "model_version": settings.model_version,
        "abstain": abstain,
        "abstain_threshold": settings.abstain_threshold,
        "label": "inconclusive" if abstain else prediction_result.get("prediction"),
    }


@app.post("/predict")
async def predict(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(require_user),
    cfg: Settings = Depends(get_settings),
):
    try:
        image, _ = await read_and_validate_image(file, cfg)
        prediction_result = model.predict(image)
        return _enrich_prediction(prediction_result, cfg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Prediction error request_id=%s user_id=%s err=%s",
            getattr(request.state, "request_id", None),
            user.get("sub"),
            e,
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-with-gradcam")
async def predict_with_gradcam(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(require_user),
    cfg: Settings = Depends(get_settings),
):
    try:
        image, _ = await read_and_validate_image(file, cfg)
        prediction_result = model.predict(image)
        device = next(model.model.parameters()).device
        input_tensor = model.transform(image).unsqueeze(0).to(device)
        input_tensor.requires_grad_(True)

        class_idx = 1 if prediction_result["prediction"] == "malignant" else 0

        gradcam_service = GradCAM(model.model)
        heatmap = gradcam_service(input_tensor, class_idx)
        overlayed_image = overlay_heatmap(heatmap, image)

        buffered = io.BytesIO()
        overlayed_image.save(buffered, format="PNG")
        heatmap_base64 = base64.b64encode(buffered.getvalue()).decode()

        enriched = _enrich_prediction(prediction_result, cfg)
        return {
            **enriched,
            "heatmap": f"data:image/png;base64,{heatmap_base64}",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Grad-CAM prediction error request_id=%s user_id=%s err=%s",
            getattr(request.state, "request_id", None),
            user.get("sub"),
            e,
        )
        import traceback

        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
