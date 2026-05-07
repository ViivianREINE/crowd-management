"""Train a lightweight video classifier from uploads and save a scikit-learn model."""

import argparse
from pathlib import Path
import cv2
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_DIR = PROJECT_ROOT / "uploads"
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_PATH = MODEL_DIR / "video_model.pkl"

SEQ_LEN = 16
IMG_SIZE = 224


def extract_frames(video_path: Path, seq_len: int = SEQ_LEN, img_size: int = IMG_SIZE) -> np.ndarray:
    cap = cv2.VideoCapture(str(video_path))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return np.zeros((seq_len, img_size, img_size, 3), dtype=np.uint8)

    indices = np.linspace(0, total_frames - 1, seq_len, dtype=int)
    frames = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((img_size, img_size, 3), dtype=np.uint8))
            continue

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (img_size, img_size))
        frames.append(frame)

    cap.release()
    return np.stack(frames)


def extract_video_features(frames: np.ndarray) -> np.ndarray:
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
        np.histogram(f, bins=12, range=(0, 255), density=True)[0] for f in gray_frames
    ], axis=0)

    return np.concatenate([
        [motion, brightness_std, edge_energy, texture_var],
        histogram.astype(np.float32),
    ], axis=0)


def load_dataset(dataset_dir: Path):
    X = []
    y = []
    for label, folder_name in [(1, "agr"), (0, "non-agr")]:
        folder = dataset_dir / folder_name
        if not folder.exists():
            continue

        videos = sorted(folder.glob("*.mp4"))
        for video_path in videos:
            frames = extract_frames(video_path)
            X.append(extract_video_features(frames))
            y.append(label)
            print(f"Loaded {video_path.name} -> label={label}")

    if len(X) == 0:
        raise ValueError(f"No video files found in {dataset_dir}. Place training videos in {dataset_dir}/agr and {dataset_dir}/non-agr.")

    return np.stack(X, axis=0), np.array(y, dtype=np.int32)


def train_video_model(dataset_dir: Path, output_path: Path):
    X, y = load_dataset(dataset_dir)
    if len(np.unique(y)) < 2:
        raise ValueError("Need both agr and non-agr videos for training.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTrained video model with {len(X_train)} examples. Test accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred, target_names=["non-agr", "agr"]))

    joblib.dump(model, output_path)
    print(f"Saved trained video model to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train video model from uploads dataset.")
    parser.add_argument(
        "--dataset",
        type=Path,
        default=DEFAULT_DATASET_DIR,
        help="Path to the uploads dataset root containing agr/ and non-agr/",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_PATH,
        help="Output path for the trained video model pickle.",
    )
    args = parser.parse_args()

    print(f"Using dataset: {args.dataset}")
    print(f"Saving model to: {args.output}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    train_video_model(args.dataset, args.output)
