# 🛡️ CrowdGuard AI — Predictive Crowd Panic Detection & Containment System

**RV College of Engineering | Interdisciplinary Project**
**Guide:** Prof. Mithun T P

| USN | Name | Dept |
|-----|------|------|
| 1RV23AI085 | Samruddhi D | AI & ML |
| 1RV23BT044 | Priyam Parashar | Biotech |
| 1RV23CS134 | Meghana D Hegde | CS |
| 1RV23EC128 | Saloni Jadhav | ECE |

---

## 📌 Overview

CrowdGuard AI is a multimodal crowd safety system that performs video and audio analysis to detect violence and panic, then exposes results through a dashboard.

### Pipeline
```
VIDEO/AUDIO INPUT → PREPROCESS → VIDEO MODEL → AUDIO MODEL → FUSION → RISK SCORE → ALERT → DASHBOARD
```

---

## 🗂️ Project Structure

```
crowd-panic-system/
├── backend/
│   ├── inference.py
│   ├── main.py
│   ├── model_loader.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── Procfile
│   ├── run.py
│   ├── train.py
│   └── models/
├── frontend/
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   ├── tailwind.config.js
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
├── notebook/
│   └── crowdguard_training.ipynb
├── uploads/
│   ├── agr/
│   └── non-agr/
└── README.md
```

---

## 🔧 Backend

The backend is a FastAPI app that supports video, audio, and multimodal inference.

### Local setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Train a video model from uploads
The included script can train a lightweight video classifier using `uploads/agr` and `uploads/non-agr`.

```bash
cd backend
python train.py
```

The trained model is saved as:

- `backend/models/video_model.pkl`

### Model loading behavior
- `backend/models/video_model.pkl` is loaded as a scikit-learn video model.
- If TensorFlow/Keras weights are present in `backend/models/`, the backend can also load them.
- If no trained audio model is present, audio analysis uses a fallback heuristic model.

### Important backend files
- `backend/main.py` — FastAPI application
- `backend/model_loader.py` — model loading and fallback logic
- `backend/inference.py` — video/audio/multimodal pipelines
- `backend/train.py` — training script for video data
- `backend/render.yaml` — Render configuration
- `backend/Procfile` — startup command for deployment

---

## 🌐 Frontend

The frontend is built with Next.js and uses `NEXT_PUBLIC_API_URL` to target the backend.

### Local setup
```bash
cd frontend
npm install
npm run dev
```

### Production build
```bash
cd frontend
npm run build
```

### Deployment config
- `frontend/vercel.json` is configured for Vercel
- `frontend/next.config.js` reads `NEXT_PUBLIC_API_URL`

### Key frontend files
- `frontend/src/lib/api.ts` — API client
- `frontend/src/app/upload/page.tsx` — upload and inference page
- `frontend/src/app/dashboard/page.tsx` — dashboard page

---

## 🚀 Deployment

### Backend on Render
Deploy the backend using `backend/render.yaml` or set up a Render web service with:
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `UPLOAD_DIR=/tmp/uploads`
  - `VIDEO_MODEL_PATH=models/video_model.h5` (optional)
  - `AUDIO_MODEL_PATH=models/audio_model.h5` (optional)

### Frontend on Vercel
Deploy the `frontend/` folder as a Next.js app and set:
- `NEXT_PUBLIC_API_URL=https://<your-backend-url>`

---

## 📍 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | System status |
| POST | `/analyze/video` | Video violence analysis |
| POST | `/analyze/audio` | Audio panic analysis |
| POST | `/analyze/multimodal` | Combined video + audio |
| GET | `/demo/simulate` | Simulated demo result |

---

## 🔧 Notes
- `frontend/src/lib/api.ts` uses `NEXT_PUBLIC_API_URL`.
- `backend/render.yaml` is configured to mount uploads at `/tmp/uploads`.
- `backend/Procfile` starts the backend with `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- `backend/train.py` trains a video model from `uploads/agr` and `uploads/non-agr`.
- Audio analysis can still fall back to a heuristic model if a trained audio model is absent.

---

## ✅ Quick start

1. Train the backend model if needed:
   ```bash
   cd backend
   python train.py
   ```
2. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open `http://localhost:3000`.

---

## © 2024 CrowdGuard AI — RV College of Engineering
