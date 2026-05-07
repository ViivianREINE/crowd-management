"""
model_loader.py
Loads video (CNN+LSTM) and audio (1D CNN) models.
Falls back to lightweight heuristic models when trained weights are unavailable.
"""

import os
import pickle
import numpy as np
from pathlib import Path

# Optional heavy imports — graceful degradation for demo deployments
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    import joblib
    from sklearn.base import BaseEstimator
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


VIDEO_MODEL_PATH = os.getenv("VIDEO_MODEL_PATH", "models/video_model.h5")
AUDIO_MODEL_PATH = os.getenv("AUDIO_MODEL_PATH", "models/audio_model.h5")
AUDIO_SCALER_PATH = os.getenv("AUDIO_SCALER_PATH", "models/audio_scaler.pkl")

VIDEO_MODEL_CANDIDATES = [
    VIDEO_MODEL_PATH,
    "models/video_model.pkl",
    "models/video_model.h5",
    "models/video_model.keras",
    "models/violence_model.keras",
    "models/violence_model.h5",
    "video_model.keras",
    "violence_model.keras",
    "video_model.h5",
    "violence_model.h5",
]
AUDIO_MODEL_CANDIDATES = [
    AUDIO_MODEL_PATH,
    "models/audio_model.h5",
    "models/audio_model.keras",
    "models/panic_model.keras",
    "models/panic_model.h5",
    "audio_model.keras",
    "panic_model.keras",
    "audio_model.h5",
    "panic_model.h5",
]
AUDIO_SCALER_CANDIDATES = [
    AUDIO_SCALER_PATH,
    "models/audio_scaler.pkl",
    "audio_scaler.pkl",
]


def locate_model_path(candidates):
    base_dir = Path(__file__).resolve().parent
    for candidate in candidates:
        if candidate:
            candidate_path = Path(candidate)
            if candidate_path.exists():
                return candidate_path
            if not candidate_path.is_absolute():
                candidate_path = base_dir / candidate_path
                if candidate_path.exists():
                    return candidate_path
    return None


class SklearnVideoModelWrapper:
    """Wraps a scikit-learn classifier to expose Keras-like predict semantics."""

    def __init__(self, model):
        self.model = model

    def predict(self, frames: np.ndarray) -> np.ndarray:
        frames = np.asarray(frames, dtype=np.float32)
        if frames.ndim == 5:
            frames = frames[0]
        features = self.extract_video_features(frames)
        if hasattr(self.model, "predict_proba"):
            prob = self.model.predict_proba([features])[0]
        else:
            pred = self.model.predict([features])[0]
            prob = np.array([1.0 - pred, pred], dtype=np.float32)
        if prob.ndim == 1 and prob.shape[0] == 2:
            return np.array([prob], dtype=np.float32)
        return np.array([[1.0 - prob[-1], prob[-1]]], dtype=np.float32)

    @staticmethod
    def extract_video_features(frames: np.ndarray) -> np.ndarray:
        import cv2

        if frames.ndim != 4:
            raise ValueError("Expected frames shape (seq, H, W, C)")

        gray_frames = np.stack([
            cv2.cvtColor(frame.astype(np.uint8), cv2.COLOR_RGB2GRAY)
            for frame in frames
        ])
        motion = float(np.mean(np.abs(np.diff(gray_frames.astype(np.float32), axis=0))))
        brightness = np.mean(gray_frames, axis=(1, 2)).astype(np.float32)
        brightness_std = float(np.std(brightness))
        edge_energy = float(np.mean([
            np.mean(cv2.Canny(f, 100, 200).astype(np.float32)) for f in gray_frames
        ]))
        texture_var = float(np.mean(np.var(gray_frames.astype(np.float32), axis=(1, 2))))
        histogram = np.mean([
            np.histogram(f, bins=12, range=(0, 255), density=True)[0]
            for f in gray_frames
        ], axis=0)
        return np.concatenate(
            [[motion, brightness_std, edge_energy, texture_var], histogram.astype(np.float32)],
            axis=0,
        )


class MockVideoModel:
    """Simulates a video violence model using motion intensity and scene dynamics."""

    def predict(self, frames: np.ndarray) -> np.ndarray:
        frames = np.asarray(frames, dtype=np.float32)
        if frames.ndim == 5:
            frames = frames[0]

        if frames.shape[0] < 2:
            motion_strength = float(np.mean(np.abs(frames)))
        else:
            motion_strength = float(np.mean(np.abs(np.diff(frames, axis=0))))

        score = 1.0 / (1.0 + np.exp(-((motion_strength * 8.0) - 0.6)))
        score = np.clip(score * 0.9 + 0.05, 0.0, 1.0)
        return np.array([[1.0 - score, score]], dtype=np.float32)


class HeuristicAudioModel:
    """Simulates an audio panic detector using MFCC dynamics and spectral flux."""

    def predict(self, mfcc: np.ndarray) -> np.ndarray:
        arr = np.asarray(mfcc, dtype=np.float32)
        if arr.ndim == 4:
            arr = arr[0]
        arr = arr.squeeze()

        if arr.size == 0:
            score = 0.35
        else:
            energy = float(np.mean(np.abs(arr)))
            flux = float(np.mean(np.abs(np.diff(arr, axis=1)))) if arr.shape[1] > 1 else 0.0
            variance = float(np.var(arr))
            score = 1.0 / (1.0 + np.exp(-((energy * 1.5) + (flux * 0.7) + (variance * 0.4) - 0.25)))
            score = np.clip(score, 0.0, 1.0)

        return np.array([[1.0 - score, score]], dtype=np.float32)


# ── Real TF models ───────────────────────────────────────────────────────────

def build_video_model_tf():
    """
    Builds a MobileNetV2 + LSTM video violence detection model.
    Input: (sequence_length, 224, 224, 3)
    Output: (2,) — [normal, violence]
    """
    import tensorflow as tf
    from tensorflow.keras import layers, Model

    SEQ_LEN = 16
    IMG_SIZE = 224

    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    frame_input = layers.Input(shape=(SEQ_LEN, IMG_SIZE, IMG_SIZE, 3))
    x = layers.TimeDistributed(base)(frame_input)
    x = layers.TimeDistributed(layers.GlobalAveragePooling2D())(x)
    x = layers.LSTM(256, dropout=0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    output = layers.Dense(2, activation="softmax")(x)

    model = Model(inputs=frame_input, outputs=output)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def build_audio_model_tf():
    """
    Builds a 1D CNN panic/violence audio detection model.
    Input: (40, time_steps, 1) — MFCC features
    Output: (2,) — [normal, panic]
    """
    import tensorflow as tf
    from tensorflow.keras import layers, Model

    N_MFCC = 40
    TIME_STEPS = 128

    inp = layers.Input(shape=(N_MFCC, TIME_STEPS, 1))
    x = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(inp)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    output = layers.Dense(2, activation="softmax")(x)

    model = Model(inputs=inp, outputs=output)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ── ModelLoader ──────────────────────────────────────────────────────────────

class ModelLoader:
    def __init__(self):
        self.video_model = None
        self.audio_model = None
        self.audio_scaler = None
        self._ready = False
        self._demo_mode = False

    def load_all(self):
        video_loaded = self._load_video_model()
        audio_loaded = self._load_audio_model()
        self._ready = True
        self._demo_mode = not (video_loaded and audio_loaded)

        if self._demo_mode:
            print("[WARN] Running in fallback mode. Place trained .h5/.keras models in /models to enable full inference.")
        else:
            print("[INFO] Real models loaded successfully.")

    def _load_video_model(self) -> bool:
        model_path = locate_model_path(VIDEO_MODEL_CANDIDATES)
        if model_path is not None:
            if model_path.suffix.lower() == '.pkl' and SKLEARN_AVAILABLE:
                try:
                    sklearn_model = joblib.load(model_path)
                    if isinstance(sklearn_model, BaseEstimator):
                        self.video_model = SklearnVideoModelWrapper(sklearn_model)
                        print(f"[INFO] Scikit-learn video model loaded from {model_path}")
                        return True
                except Exception as e:
                    print(f"[WARN] Failed to load scikit-learn video model from {model_path}: {e}")
            if TF_AVAILABLE:
                try:
                    self.video_model = tf.keras.models.load_model(str(model_path))
                    print(f"[INFO] Video model loaded from {model_path}")
                    return True
                except Exception as e:
                    print(f"[WARN] Failed to load video model from {model_path}: {e}")

        self.video_model = MockVideoModel()
        print("[INFO] Using fallback video model.")
        return False

    def _load_audio_model(self) -> bool:
        model_path = locate_model_path(AUDIO_MODEL_CANDIDATES)
        scaler_path = locate_model_path(AUDIO_SCALER_CANDIDATES)

        if scaler_path is not None:
            self._load_audio_scaler(scaler_path)

        if TF_AVAILABLE and model_path is not None:
            try:
                self.audio_model = tf.keras.models.load_model(str(model_path))
                print(f"[INFO] Audio model loaded from {model_path}")
                return True
            except Exception as e:
                print(f"[WARN] Failed to load audio model from {model_path}: {e}")

        self.audio_model = HeuristicAudioModel()
        print("[INFO] Using fallback audio model.")
        return False

    def _load_audio_scaler(self, scaler_path: Path):
        try:
            with open(scaler_path, "rb") as handle:
                scaler = pickle.load(handle)
            if hasattr(scaler, "transform"):
                self.audio_scaler = scaler
                print(f"[INFO] Audio scaler loaded from {scaler_path}")
            else:
                print(f"[WARN] Loaded object from {scaler_path} is not a valid scaler.")
        except Exception as e:
            print(f"[WARN] Failed to load audio scaler from {scaler_path}: {e}")
            self.audio_scaler = None

    def scale_audio_features(self, mfcc: np.ndarray) -> np.ndarray:
        if self.audio_scaler is None:
            return mfcc

        try:
            flat = mfcc.flatten().reshape(1, -1)
            if flat.shape[1] == len(self.audio_scaler.mean_):
                scaled = self.audio_scaler.transform(flat)
                return scaled.reshape(mfcc.shape)
        except Exception:
            pass

        return mfcc

    def is_ready(self) -> bool:
        return self._ready

    def is_demo_mode(self) -> bool:
        return self._demo_mode
