"""
AI-Powered Predictive Crowd Panic Detection & Containment System
FastAPI Backend - main.py
"""

import os
import uuid
import time
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from model_loader import ModelLoader
from inference import InferenceEngine

# ── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CrowdGuard AI API",
    description="AI-Powered Predictive Crowd Panic Detection & Containment System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Global model loader & inference engine (loaded once at startup)
model_loader: Optional[ModelLoader] = None
inference_engine: Optional[InferenceEngine] = None


# ── Startup / Shutdown ───────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    global model_loader, inference_engine
    print("[INFO] Loading models...")
    model_loader = ModelLoader()
    model_loader.load_all()
    inference_engine = InferenceEngine(model_loader)
    print("[INFO] Models loaded successfully.")


@app.on_event("shutdown")
async def shutdown_event():
    print("[INFO] Shutting down server...")


# ── Response Models ──────────────────────────────────────────────────────────

class AnalysisResult(BaseModel):
    job_id: str
    violence_score: float
    panic_score: float
    risk_level: str          # LOW | MEDIUM | HIGH
    confidence: float
    processing_time_ms: float
    alert_triggered: bool
    details: dict


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", response_model=HealthResponse)
async def root():
    return HealthResponse(
        status="online",
        models_loaded=model_loader is not None and model_loader.is_ready(),
        version="1.0.0",
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        models_loaded=model_loader is not None and model_loader.is_ready(),
        version="1.0.0",
    )


@app.post("/analyze/video", response_model=AnalysisResult)
async def analyze_video(file: UploadFile = File(...)):
    """
    Upload a video file and get violence + panic analysis.
    Returns violence_score, panic_score, risk_level, and alert status.
    """
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video (mp4, avi, mov, etc.)")

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}_{file.filename}"

    try:
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        start = time.time()
        result = inference_engine.analyze_video(str(save_path))
        elapsed_ms = (time.time() - start) * 1000

        return AnalysisResult(
            job_id=job_id,
            violence_score=result["violence_score"],
            panic_score=result["panic_score"],
            risk_level=result["risk_level"],
            confidence=result["confidence"],
            processing_time_ms=round(elapsed_ms, 2),
            alert_triggered=result["risk_level"] == "HIGH",
            details=result.get("details", {}),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    finally:
        if save_path.exists():
            os.remove(save_path)


@app.post("/analyze/audio", response_model=AnalysisResult)
async def analyze_audio(file: UploadFile = File(...)):
    """
    Upload an audio file and get panic/distress analysis.
    """
    allowed = ["audio/", "video/webm", "application/octet-stream"]
    if file.content_type and not any(file.content_type.startswith(a) for a in allowed):
        raise HTTPException(status_code=400, detail="File must be audio (wav, mp3, ogg, etc.)")

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}_{file.filename}"

    try:
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        start = time.time()
        result = inference_engine.analyze_audio(str(save_path))
        elapsed_ms = (time.time() - start) * 1000

        return AnalysisResult(
            job_id=job_id,
            violence_score=result["violence_score"],
            panic_score=result["panic_score"],
            risk_level=result["risk_level"],
            confidence=result["confidence"],
            processing_time_ms=round(elapsed_ms, 2),
            alert_triggered=result["risk_level"] == "HIGH",
            details=result.get("details", {}),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    finally:
        if save_path.exists():
            os.remove(save_path)


@app.post("/analyze/multimodal", response_model=AnalysisResult)
async def analyze_multimodal(
    video: UploadFile = File(...),
    audio: UploadFile = File(...),
):
    """
    Upload both video and audio for full multimodal analysis.
    Uses late fusion: risk_score = 0.6 * video_prob + 0.4 * audio_prob
    """
    job_id = str(uuid.uuid4())
    video_path = UPLOAD_DIR / f"{job_id}_video_{video.filename}"
    audio_path = UPLOAD_DIR / f"{job_id}_audio_{audio.filename}"

    try:
        video_content = await video.read()
        audio_content = await audio.read()
        with open(video_path, "wb") as f:
            f.write(video_content)
        with open(audio_path, "wb") as f:
            f.write(audio_content)

        start = time.time()
        result = inference_engine.analyze_multimodal(str(video_path), str(audio_path))
        elapsed_ms = (time.time() - start) * 1000

        return AnalysisResult(
            job_id=job_id,
            violence_score=result["violence_score"],
            panic_score=result["panic_score"],
            risk_level=result["risk_level"],
            confidence=result["confidence"],
            processing_time_ms=round(elapsed_ms, 2),
            alert_triggered=result["risk_level"] == "HIGH",
            details=result.get("details", {}),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    finally:
        for p in [video_path, audio_path]:
            if p.exists():
                os.remove(p)


@app.get("/demo/simulate")
async def simulate_demo():
    """
    Returns a simulated analysis result for frontend demo/testing.
    """
    import random
    violence = round(random.uniform(0.3, 0.95), 3)
    panic = round(random.uniform(0.2, 0.90), 3)
    fused = round(0.6 * violence + 0.4 * panic, 3)
    risk = "HIGH" if fused >= 0.7 else ("MEDIUM" if fused >= 0.4 else "LOW")

    return {
        "job_id": str(uuid.uuid4()),
        "violence_score": violence,
        "panic_score": panic,
        "risk_level": risk,
        "confidence": round(random.uniform(0.75, 0.98), 3),
        "processing_time_ms": round(random.uniform(120, 800), 2),
        "alert_triggered": risk == "HIGH",
        "details": {
            "frames_analyzed": random.randint(30, 300),
            "audio_duration_sec": round(random.uniform(2, 30), 1),
            "fusion_method": "late_fusion",
            "video_weight": 0.6,
            "audio_weight": 0.4,
            "fused_score": fused,
        },
    }
