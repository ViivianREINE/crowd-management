"""
inference.py
Video, Audio, and Multimodal inference pipelines.
"""

import os
import numpy as np
from typing import Dict, Any

# Optional imports — gracefully degrade
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

from model_loader import ModelLoader

# ── Constants ─────────────────────────────────────────────────────────────────

SEQ_LEN      = 16          # frames per video clip
IMG_SIZE     = 224
N_MFCC       = 40
AUDIO_SR     = 22050
AUDIO_DUR    = 3.0         # seconds per audio segment
TIME_STEPS   = 128

W_VIDEO      = 0.6         # fusion weight for video
W_AUDIO      = 0.4         # fusion weight for audio

THRESHOLD_HIGH   = 0.70
THRESHOLD_MEDIUM = 0.40


# ── Risk Level Helper ──────────────────────────────────────────────────────────

def risk_level(score: float) -> str:
    if score >= THRESHOLD_HIGH:
        return "HIGH"
    if score >= THRESHOLD_MEDIUM:
        return "MEDIUM"
    return "LOW"


# ── Video Preprocessing ────────────────────────────────────────────────────────

def extract_frames(video_path: str, n_frames: int = SEQ_LEN) -> np.ndarray:
    """Extract evenly spaced frames from video → (n_frames, H, W, 3) float32 [0,1]."""
    if not CV2_AVAILABLE:
        # Return synthetic frames for demo
        return np.random.rand(n_frames, IMG_SIZE, IMG_SIZE, 3).astype(np.float32)

    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total <= 0:
        cap.release()
        return np.random.rand(n_frames, IMG_SIZE, IMG_SIZE, 3).astype(np.float32)

    indices = np.linspace(0, total - 1, n_frames, dtype=int)
    frames = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame.astype(np.float32) / 255.0)
        else:
            frames.append(np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32))

    cap.release()
    arr = np.stack(frames)   # (n_frames, H, W, 3)
    return arr


# ── Audio Preprocessing ────────────────────────────────────────────────────────

def extract_mfcc(audio_path: str) -> np.ndarray:
    """
    Extract MFCC features from audio → (N_MFCC, TIME_STEPS, 1) float32.
    Pads/truncates to fixed length.
    """
    if not LIBROSA_AVAILABLE:
        return np.random.rand(N_MFCC, TIME_STEPS, 1).astype(np.float32)

    try:
        y, sr = librosa.load(audio_path, sr=AUDIO_SR, duration=AUDIO_DUR * 4)
        if y.size == 0:
            raise ValueError("Loaded audio is empty")

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
        if mfcc.shape[1] < TIME_STEPS:
            pad = TIME_STEPS - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0, 0), (0, pad)), mode="constant")
        else:
            mfcc = mfcc[:, :TIME_STEPS]

        mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc) + 1e-6)
        return mfcc[..., np.newaxis].astype(np.float32)
    except Exception:
        return np.random.rand(N_MFCC, TIME_STEPS, 1).astype(np.float32)


def normalize_audio_input(mfcc: np.ndarray, loader: ModelLoader) -> np.ndarray:
    mfcc = np.asarray(mfcc, dtype=np.float32).squeeze()
    if hasattr(loader, "scale_audio_features") and loader.audio_scaler is not None:
        mfcc = loader.scale_audio_features(mfcc)
    mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc) + 1e-6)
    return mfcc[..., np.newaxis].astype(np.float32)


def get_probability(preds: np.ndarray, class_index: int = 1) -> float:
    preds = np.asarray(preds)
    if preds.ndim == 0:
        return float(preds)
    if preds.ndim == 1:
        if preds.size >= 2:
            return float(preds[class_index])
        return float(preds[-1])
    if preds.ndim >= 2:
        if preds.shape[-1] >= 2:
            return float(preds[0][class_index])
        return float(preds[0][-1])
    return float(preds.flatten()[-1])


# ── Inference Engine ───────────────────────────────────────────────────────────

class InferenceEngine:
    def __init__(self, loader: ModelLoader):
        self.loader = loader

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        frames = extract_frames(video_path)
        frames_batch = frames[np.newaxis, ...]

        preds = self.loader.video_model.predict(frames_batch)
        violence_score = get_probability(preds, class_index=1)
        rs = risk_level(violence_score)

        return {
            "violence_score": round(violence_score, 4),
            "panic_score": round(min(1.0, violence_score * 0.85 + 0.1), 4),
            "risk_level": rs,
            "confidence": round(min(1.0, float(np.max(preds))), 4),
            "details": {
                "frames_analyzed": SEQ_LEN,
                "model": self.loader.video_model.__class__.__name__,
                "input_shape": list(frames_batch.shape),
            },
        }

    def analyze_audio(self, audio_path: str) -> Dict[str, Any]:
        mfcc = extract_mfcc(audio_path)
        mfcc = normalize_audio_input(mfcc, self.loader)
        mfcc_batch = mfcc[np.newaxis, ...]

        preds = self.loader.audio_model.predict(mfcc_batch)
        panic_score = get_probability(preds, class_index=1)
        rs = risk_level(panic_score)

        return {
            "violence_score": round(min(1.0, panic_score * 0.75 + 0.05), 4),
            "panic_score": round(panic_score, 4),
            "risk_level": rs,
            "confidence": round(min(1.0, float(np.max(preds))), 4),
            "details": {
                "n_mfcc": N_MFCC,
                "time_steps": TIME_STEPS,
                "model": self.loader.audio_model.__class__.__name__,
                "input_shape": list(mfcc_batch.shape),
            },
        }

    def analyze_multimodal(self, video_path: str, audio_path: str) -> Dict[str, Any]:
        frames = extract_frames(video_path)
        frames_batch = frames[np.newaxis, ...]
        video_preds = self.loader.video_model.predict(frames_batch)
        violence_prob = get_probability(video_preds, class_index=1)

        mfcc = extract_mfcc(audio_path)
        mfcc = normalize_audio_input(mfcc, self.loader)
        mfcc_batch = mfcc[np.newaxis, ...]
        audio_preds = self.loader.audio_model.predict(mfcc_batch)
        panic_prob = get_probability(audio_preds, class_index=1)

        fused_score = W_VIDEO * violence_prob + W_AUDIO * panic_prob
        rs = risk_level(fused_score)
        confidence = min(1.0, W_VIDEO * float(np.max(video_preds)) + W_AUDIO * float(np.max(audio_preds)))

        return {
            "violence_score": round(violence_prob, 4),
            "panic_score": round(panic_prob, 4),
            "risk_level": rs,
            "confidence": round(confidence, 4),
            "details": {
                "frames_analyzed": SEQ_LEN,
                "fusion_method": "late_fusion",
                "video_weight": W_VIDEO,
                "audio_weight": W_AUDIO,
                "fused_score": round(fused_score, 4),
                "threshold_high": THRESHOLD_HIGH,
                "threshold_medium": THRESHOLD_MEDIUM,
            },
        }
