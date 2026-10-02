<div align="center">

# 🛡️ 𝐂𝐫𝐨𝐰𝐝𝐆𝐮𝐚𝐫𝐝 𝐀𝐈

### <em>Multimodal Crowd Panic Detection & Real-Time Risk Intelligence</em>

<p>
  <strong>
    An AI-powered safety system combining computer vision, audio intelligence,
    multimodal fusion, risk scoring, and real-time alerting to identify
    potential crowd violence and panic.
  </strong>
</p>

<br>

[![Python](https://img.shields.io/badge/Python-3.11%2B-5A3E36?style=for-the-badge&logo=python&logoColor=FFF7F3)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-B76E79?style=for-the-badge&logo=fastapi&logoColor=FFF7F3)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-D8A7A7?style=for-the-badge&logo=next.js&logoColor=5A3E36)](https://nextjs.org/)
[![TensorFlow](https://img.shields.io/badge/AI-TensorFlow-C9A79A?style=for-the-badge&logo=tensorflow&logoColor=5A3E36)](https://www.tensorflow.org/)
[![OpenCV](https://img.shields.io/badge/Vision-OpenCV-8C6259?style=for-the-badge&logo=opencv&logoColor=FFF7F3)](https://opencv.org/)
[![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-B76E79?style=for-the-badge&logo=tailwindcss&logoColor=FFF7F3)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-EAD8CF?style=for-the-badge&logo=vercel&logoColor=5A3E36)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-D8A7A7?style=for-the-badge)](https://render.com/)

<br>

🌷 **See the signal. Measure the risk. Trigger the response.**

</div>

---

<div align="center">

> ♡ **CrowdGuard AI transforms video and audio signals into an interpretable crowd-risk assessment.**

</div>

---

## 🌸 Table of Contents

- [About](#-about)
- [Project Overview](#-project-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Capabilities](#-key-capabilities)
- [System Architecture](#-system-architecture)
- [Multimodal Intelligence](#-multimodal-intelligence)
- [Video Intelligence](#-video-intelligence)
- [Audio Intelligence](#-audio-intelligence)
- [Risk Scoring](#-risk-scoring)
- [Alert Engine](#-alert-engine)
- [Interactive Dashboard](#-interactive-dashboard)
- [Backend API](#-backend-api)
- [Model Architecture](#-model-architecture)
- [Training Pipeline](#-training-pipeline)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the System](#-running-the-system)
- [Demo Mode](#-demo-mode)
- [Deployment](#-deployment)
- [Technology Stack](#-technology-stack)
- [Limitations](#-limitations)
- [Future Scope](#-future-scope)
- [Project Team](#-project-team)
- [Project Timeline](#-project-timeline)
- [License](#-license)

---

# 🌷 About

**CrowdGuard AI** is a multimodal artificial-intelligence system designed to analyze crowd-related video and audio signals and estimate the likelihood of violence, panic, or elevated crowd risk.

The system combines:

```text
🎥 Video Intelligence
        +
🎙️ Audio Intelligence
        ↓
   Multimodal Fusion
        ↓
    Risk Scoring
        ↓
  Alert Generation
        ↓
 Interactive Dashboard
````

The project consists of a **FastAPI inference backend** and a **Next.js interactive frontend**.

Users can submit:

* Video files
* Audio files
* Video + audio together

and receive:

* Violence score
* Panic score
* Risk level
* Confidence
* Processing time
* Alert status
* Additional inference details

---

# ✦ Project Overview

CrowdGuard AI is built around the idea that crowd incidents can produce multiple observable signals.

Visual information may reveal:

```text
rapid movement
abnormal motion
scene dynamics
crowd violence indicators
```

while audio may provide additional information through:

```text
MFCC patterns
spectral characteristics
audio dynamics
panic/distress-related signals
```

Instead of relying on one modality alone, CrowdGuard combines the two signals using a weighted late-fusion strategy.

```text
Video Probability
       × 0.6
          │
          ├──────────────┐
          │              │
          ▼              │
     ┌─────────┐         │
     │         │         │
     │  FUSION │◄────────┤
     │         │         │
     └────┬────┘         │
          ▲              │
          │              │
          × 0.4          │
          │              │
    Audio Probability────┘
          │
          ▼
     Fused Risk Score
          │
          ▼
    LOW / MEDIUM / HIGH
```

---

# 🚨 The Problem

Large public gatherings can become difficult to monitor because crowd behavior can change rapidly.

Potential warning signals may include:

* sudden increases in movement
* abnormal scene dynamics
* aggressive crowd activity
* panic-related acoustic patterns
* rapidly increasing risk indicators

Traditional monitoring systems may require human operators to continuously observe multiple feeds.

CrowdGuard AI explores how multimodal machine learning can provide an additional automated layer for **early risk assessment and alert generation**.

---

# 💡 The Solution

CrowdGuard AI processes available media through independent analysis pipelines and combines their outputs.

```text
                   INPUT
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       🎥 VIDEO              🎙️ AUDIO
          │                     │
          ▼                     ▼
   Frame Extraction       Audio Processing
          │                     │
          ▼                     ▼
   Video Model            MFCC Features
          │                     │
          ▼                     ▼
 Violence Probability    Panic Probability
          │                     │
          └──────────┬──────────┘
                     ▼
              Late Fusion
                     │
              0.6V + 0.4A
                     │
                     ▼
               Risk Score
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
         LOW       MEDIUM      HIGH
          │          │          │
          └──────────┼──────────┘
                     ▼
              Alert Generation
                     │
                     ▼
             Monitoring Dashboard
```

---

# 💗 Key Capabilities

<table>
<tr>
<td width="50%">

### 🎥 Video Intelligence

Analyzes sampled video frames to estimate violence-related risk.

</td>

<td width="50%">

### 🎙️ Audio Intelligence

Extracts MFCC-based features for panic/distress analysis.

</td>
</tr>

<tr>
<td>

### 🧠 Multimodal Fusion

Combines video and audio probabilities using a weighted late-fusion strategy.

</td>

<td>

### ⚠️ Risk Classification

Maps the fused score into LOW, MEDIUM, or HIGH risk.

</td>
</tr>

<tr>
<td>

### 🔔 Real-Time Alerts

Generates alert events when elevated risk is detected.

</td>

<td>

### 📊 Live Monitoring

Displays risk gauges, trends, statistics, and alert history through the dashboard.

</td>
</tr>

<tr>
<td>

### 🌐 REST API

FastAPI endpoints expose video, audio, multimodal, health, and demo functionality.

</td>

<td>

### 🖥️ Modern Web Interface

Next.js + Tailwind CSS provides an interactive monitoring experience.

</td>
</tr>
</table>

---

# 🪞 System Architecture

```text
                         ┌──────────────────────────┐
                         │       MEDIA INPUT        │
                         │                          │
                         │   Video / Audio / Both   │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       FastAPI API        │
                         └────────────┬─────────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
                   ▼                  ▼                  ▼
             Video Route         Audio Route       Multimodal
                   │                  │                  │
                   ▼                  ▼                  ▼
             Frame Pipeline      MFCC Pipeline      Both Pipelines
                   │                  │                  │
                   ▼                  ▼                  │
             Video Model        Audio Model           │
                   │                  │                  │
                   └──────────┬───────┘                  │
                              ▼                          │
                       Probability Scores ◄──────────────┘
                              │
                              ▼
                       Late-Fusion Layer
                              │
                              ▼
                         Risk Engine
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
                LOW         MEDIUM        HIGH
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                       Alert Generation
                              │
                              ▼
                   Next.js Monitoring UI
                              │
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
               Gauges      Charts      Alert Log
```

---

# 🎥 Video Intelligence

The video processing pipeline is implemented in:

```text
backend/inference.py
backend/model_loader.py
```

The system samples:

```text
16 frames
```

from a video clip.

Frames are resized to:

```text
224 × 224
```

and normalized.

The inference architecture can support a TensorFlow video model based on:

```text
MobileNetV2
      ↓
TimeDistributed Feature Extraction
      ↓
Global Average Pooling
      ↓
LSTM
      ↓
Dense Layer
      ↓
Softmax
```

The model-building implementation uses:

```text
MobileNetV2
LSTM(256)
Dense(128)
Dropout(0.4)
Dense(2, softmax)
```

The two output classes represent:

```text
NORMAL
VIOLENCE
```

---

# 🔬 Video Feature-Based Model

The repository also includes a lightweight scikit-learn training pipeline.

The training script:

```text
backend/train.py
```

extracts engineered visual features including:

### Motion

Measures frame-to-frame intensity changes.

```text
Motion ≈ mean(|Frameₜ − Frameₜ₋₁|)
```

### Brightness Variation

Measures changes in scene brightness.

### Edge Energy

Uses Canny edge detection to estimate structural activity.

### Texture Variance

Measures spatial intensity variation.

### Histogram Features

Averaged grayscale histograms are also included.

These features are used to train:

```text
RandomForestClassifier
```

with:

```text
n_estimators = 100
random_state = 42
```

---

# 🎙️ Audio Intelligence

Audio analysis is based around:

```text
MFCC
+
Audio dynamics
+
Spectral characteristics
```

The configured audio representation uses:

```text
Sampling Rate = 22050 Hz
MFCC Features = 40
Time Steps = 128
```

The TensorFlow audio architecture implemented in the repository uses convolutional layers:

```text
Input
  ↓
Conv2D(32)
  ↓
Batch Normalization
  ↓
Max Pooling
  ↓
Conv2D(64)
  ↓
Batch Normalization
  ↓
Max Pooling
  ↓
Conv2D(128)
  ↓
Global Average Pooling
  ↓
Dense(256)
  ↓
Dropout(0.5)
  ↓
Softmax Output
```

The intended classes are:

```text
NORMAL
PANIC
```

---

# 🧠 Multimodal Fusion

The central intelligence layer combines video and audio signals.

The implemented fusion equation is:

```text
                    ┌───────────────────┐
                    │ Video Probability │
                    └─────────┬─────────┘
                              │
                            × 0.6
                              │
                              ▼
                        ┌───────────┐
                        │           │
                        │   FUSED   │
                        │   SCORE   │
                        │           │
                        └─────▲─────┘
                              │
                            × 0.4
                              │
                    ┌─────────┴─────────┐
                    │ Audio Probability │
                    └───────────────────┘
```

Mathematically:

```text
Fused Risk
=
0.6 × Video Probability
+
0.4 × Audio Probability
```

This is implemented as **late fusion**.

---

# 🚦 Risk Scoring

CrowdGuard converts the fused score into three risk levels.

|     Fused Score | Risk Level |
| --------------: | ---------- |
|        `< 0.40` | 🟢 LOW     |
| `0.40 – < 0.70` | 🟡 MEDIUM  |
|        `≥ 0.70` | 🔴 HIGH    |

Therefore:

```text
score < 0.40
      ↓
LOW

0.40 ≤ score < 0.70
      ↓
MEDIUM

score ≥ 0.70
      ↓
HIGH
```

A HIGH-risk result automatically sets:

```text
alert_triggered = true
```

---

# 🔔 Alert Engine

The frontend maintains an alert history for analyzed results.

Each alert records:

```text
Alert ID
Timestamp
Risk Level
Message
Violence Score
Panic Score
```

### HIGH

```text
⚠ CRITICAL
Immediate intervention required
```

### MEDIUM

```text
⚡ WARNING
Elevated risk detected
```

### LOW

```text
✓ CLEAR
No significant threat detected
```

The frontend also supports optional alert sounds.

```text
HIGH   → stronger alert tone
MEDIUM → warning tone
LOW    → no warning tone
```

Users can mute or enable alert sounds directly from the alert panel.

---

# 📊 Interactive Dashboard

The monitoring dashboard is implemented using:

```text
Next.js
React
Recharts
Tailwind CSS
Lucide Icons
```

The dashboard provides:

### Current Risk

```text
Violence Gauge
Panic Gauge
Overall Risk
```

### Monitoring Statistics

```text
Total Scans
High Risk
Medium Risk
Clear
```

### Threat Timeline

Displays historical:

```text
Violence Score
Panic Score
```

### Fused Risk Chart

Displays the most recent fused-risk values.

### Alert Log

Provides a continuously updated list of detected risk events.

---

# 🖥️ Application Pages

The frontend contains three primary routes.

```text
/
├── Home
│
├── /upload
│   └── Media Analysis
│
└── /dashboard
    └── Live Monitoring
```

---

## 🏠 Home

The landing page introduces:

* CrowdGuard AI
* System capabilities
* Processing pipeline
* Development team
* Analysis and dashboard entry points

---

## 📤 Analyze

The analysis page supports:

```text
Video analysis
Audio analysis
Multimodal analysis
```

Users can select the analysis mode and submit media for inference.

Results include:

```text
Violence Score
Panic Score
Risk Level
Confidence
Processing Time
Alert Status
```

---

## 📡 Live Dashboard

The dashboard continuously requests the demo endpoint every:

```text
3 seconds
```

and visualizes the generated risk stream.

The monitoring interface can be:

```text
LIVE
```

or:

```text
PAUSED
```

---

# 🌐 Backend API

The backend is implemented using **FastAPI**.

Main application:

```text
backend/main.py
```

---

## `GET /`

Health endpoint.

Example response:

```json
{
  "status": "online",
  "models_loaded": true,
  "version": "1.0.0"
}
```

---

## `GET /health`

Returns backend and model-loader status.

```json
{
  "status": "ok",
  "models_loaded": true,
  "version": "1.0.0"
}
```

---

## `POST /analyze/video`

Upload a video for violence and panic analysis.

```text
Content-Type: multipart/form-data
```

Response contains:

```text
job_id
violence_score
panic_score
risk_level
confidence
processing_time_ms
alert_triggered
details
```

---

## `POST /analyze/audio`

Upload an audio file for panic/distress analysis.

Supported media is validated using audio-related content types.

---

## `POST /analyze/multimodal`

Accepts:

```text
video
+
audio
```

and performs combined inference using the multimodal fusion layer.

The fusion rule is:

```text
Risk = 0.6 × Video + 0.4 × Audio
```

---

## `GET /demo/simulate`

Provides a simulated analysis response for frontend demonstration and dashboard testing.

The endpoint generates:

```text
Violence Score
Panic Score
Fused Score
Risk Level
Confidence
Processing Time
Alert Status
```

This endpoint is useful when trained models or media inputs are not available.

---

# 📦 API Response Schema

The primary analysis response follows:

```json
{
  "job_id": "uuid",
  "violence_score": 0.82,
  "panic_score": 0.71,
  "risk_level": "HIGH",
  "confidence": 0.91,
  "processing_time_ms": 245.32,
  "alert_triggered": true,
  "details": {}
}
```

---

# 🧠 Model Loading Strategy

CrowdGuard uses a flexible model-loading architecture.

The backend searches for configured or candidate model files.

### Video

Possible formats include:

```text
.pkl
.h5
.keras
```

### Audio

Possible formats include:

```text
.h5
.keras
```

### Audio Scaler

The system can additionally load:

```text
audio_scaler.pkl
```

---

## Fallback Mode

If trained model weights are unavailable, the backend does not simply crash.

Instead it can fall back to lightweight models.

### Video fallback

Uses motion intensity and scene dynamics.

### Audio fallback

Uses MFCC-derived statistics including:

```text
energy
spectral variation
variance
```

This makes the application demonstrable even without large trained model files.

> **Important:** fallback inference is intended for demonstration/testing and should not be interpreted as equivalent to a validated production model.

---

# 🧪 Training Pipeline

The repository includes:

```text
backend/train.py
```

for training a lightweight video classifier.

The expected dataset structure is:

```text
uploads/
│
├── agr/
│   ├── video_01.mp4
│   ├── video_02.mp4
│   └── ...
│
└── non-agr/
    ├── video_01.mp4
    ├── video_02.mp4
    └── ...
```

The labels are:

```text
agr      → 1
non-agr  → 0
```

The pipeline:

```text
Video
  ↓
Frame Sampling
  ↓
224 × 224 Frames
  ↓
Feature Extraction
  ↓
Train/Test Split
  ↓
Random Forest
  ↓
Evaluation
  ↓
video_model.pkl
```

Training uses a stratified:

```text
75% training
25% testing
```

split with:

```text
random_state = 42
```

---

# 🗂️ Project Structure

```text
crowd-management/
│
├── 🌷 README.md
├── 📄 DEPLOY.md
├── ⚙️ .gitignore
│
├── 🧠 backend/
│   │
│   ├── main.py
│   ├── inference.py
│   ├── model_loader.py
│   ├── train.py
│   ├── run.py
│   ├── requirements.txt
│   ├── Procfile
│   └── render.yaml
│
├── 🖥️ frontend/
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vercel.json
│   │
│   └── src/
│       │
│       ├── app/
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   │
│       │   ├── upload/
│       │   │   └── page.tsx
│       │   │
│       │   └── dashboard/
│       │       └── page.tsx
│       │
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── AlertPanel.tsx
│       │   └── RiskGauge.tsx
│       │
│       └── lib/
│           └── api.ts
│
└── 📓 notebook/
    └── crowdguard_training.ipynb
```

---

# 🤍 Installation

## Prerequisites

### Backend

```text
Python 3.11+
pip
```

### Frontend

```text
Node.js
npm
```

---

# 🐍 Backend Setup

Clone the repository and enter the backend:

```bash
git clone <repository-url>
cd crowd-management/backend
```

Create a virtual environment:

### Windows

```bash
python -m venv .venv

.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv

source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation is available through the standard:

```text
/docs
```

endpoint.

---

# 🌸 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# ⚙️ Environment Configuration

The frontend reads the backend URL from:

```text
NEXT_PUBLIC_API_URL
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For a deployed backend:

```env
NEXT_PUBLIC_API_URL=<your-backend-url>
```

The frontend defaults to:

```text
http://localhost:8000
```

when the environment variable is not supplied.

---

# 🚀 Running the Complete System

Start the backend:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Then start the frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

The complete workflow becomes:

```text
Browser
   ↓
Next.js Frontend
   ↓
FastAPI Backend
   ↓
Model Loader
   ↓
Inference Engine
   ↓
Risk Scoring
   ↓
JSON Response
   ↓
Dashboard
```

---

# 🧪 Demo Mode

CrowdGuard includes a dedicated demo endpoint:

```text
GET /demo/simulate
```

The dashboard uses this endpoint to generate a continuously changing demonstration stream.

The generated values are intentionally simulated.

Therefore:

> **Demo-mode risk scores must not be interpreted as real crowd measurements or validated predictions.**

Demo mode is useful for:

* UI testing
* dashboard demonstrations
* frontend development
* alert-system testing
* visualization

---

# ☁️ Deployment

The repository contains deployment configuration for:

```text
Backend → Render
Frontend → Vercel
```

---

## Backend — Render

The backend contains:

```text
backend/render.yaml
backend/Procfile
```

The application starts with:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

The deployment configuration supports environment variables including:

```text
PYTHON_VERSION
TF_ENABLE_ONEDNN_OPTS
UPLOAD_DIR
MAX_UPLOAD_SIZE
```

Optional model configuration includes:

```text
VIDEO_MODEL_PATH
AUDIO_MODEL_PATH
```

---

## Frontend — Vercel

The frontend contains:

```text
frontend/vercel.json
```

The primary configuration variable is:

```text
NEXT_PUBLIC_API_URL
```

This should point to the deployed FastAPI backend.

---

# 🛠️ Technology Stack

<div align="center">

| Technology            | Role                         |
| --------------------- | ---------------------------- |
| 🐍 Python             | Backend & ML pipeline        |
| ⚡ FastAPI             | REST API                     |
| 🧠 TensorFlow / Keras | Deep-learning model support  |
| 🌲 scikit-learn       | Lightweight video classifier |
| 👁️ OpenCV            | Video processing             |
| 🎙️ Librosa           | Audio feature extraction     |
| 🐼 NumPy              | Numerical processing         |
| ⚛️ Next.js            | Frontend application         |
| ⚛️ React              | UI layer                     |
| 🎨 Tailwind CSS       | Styling                      |
| 📈 Recharts           | Dashboard visualization      |
| 🎯 Lucide React       | UI icons                     |
| ☁️ Render             | Backend deployment           |
| ▲ Vercel              | Frontend deployment          |

</div>

---

# 🧠 Engineering Highlights

### 01 · Multimodal AI

Rather than depending entirely on a single signal, CrowdGuard combines:

```text
Visual evidence
+
Acoustic evidence
```

into one risk estimate.

---

### 02 · Late Fusion

The fusion layer is deliberately simple and interpretable:

```text
0.6 × Video
+
0.4 × Audio
```

This makes the contribution of each modality explicit.

---

### 03 · Graceful Model Degradation

The model-loading system supports trained model files while providing fallback inference when weights are unavailable.

This makes the application easier to demonstrate and develop without requiring heavy models at every stage.

---

### 04 · Separation of Concerns

The project separates:

```text
Frontend
    ↓
API
    ↓
Inference
    ↓
Model Loading
    ↓
Training
```

rather than placing all functionality into one application file.

---

### 05 · Interactive Risk Visualization

The frontend converts model outputs into:

```text
Risk Gauges
Trend Charts
Fused Score Charts
Alert Logs
Live Statistics
```

providing a monitoring-oriented interface rather than returning raw model probabilities alone.

---

# ⚠️ Limitations & Responsible Use

CrowdGuard AI is an **academic/interdisciplinary prototype**, not a certified public-safety system.

### Model validation

The repository does not establish production-level validation across diverse real-world crowd environments.

### Fallback models

Fallback video and audio models are heuristic/demo mechanisms and should not be treated as validated violence or panic classifiers.

### Demo endpoint

`/demo/simulate` generates synthetic results and is intended for demonstration/testing.

### False positives & false negatives

A real deployment would need rigorous evaluation of:

```text
False positives
False negatives
Precision
Recall
Calibration
Robustness
Domain shift
```

before operational use.

### Human oversight

Any real-world safety decision should remain subject to trained human operators and established emergency procedures.

The system should be considered a **decision-support layer**, not an autonomous authority for emergency intervention.

---

# 🌱 Future Scope

Potential extensions include:

```text
✧ Real-time CCTV stream ingestion
✧ Multi-camera fusion
✧ Real-time audio streams
✧ Temporal crowd-density modeling
✧ Transformer-based video models
✧ Advanced audio classification
✧ Multi-modal transformers
✧ Edge deployment optimization
✧ Raspberry Pi / Jetson benchmarking
✧ Model calibration
✧ Explainable AI
✧ Historical incident analytics
✧ Geospatial risk mapping
✧ Automated incident reports
✧ Event-level risk forecasting
✧ Model monitoring and drift detection
✧ Production-grade authentication
✧ Role-based operator access
```

---

# 🎓 Project Context

<div align="center">

###

</div>

The project brings together multiple engineering disciplines:

```text
Artificial Intelligence
        +
Biotechnology
        +
Computer Science
        +
Electronics & Communication
```

to explore an AI-assisted approach to crowd safety.

---

# 📅 Project Timeline

## **2026- Made by Priyam Parashar**

  **RV College of Engineering in 2026**.

---

<div align="center">

# 🛡️ 𝐂𝐫𝐨𝐰𝐝𝐆𝐮𝐚𝐫𝐝 𝐀𝐈

### <em>See the signal. Measure the risk. Trigger the response.</em>

<br>

🌷 ───────────────────────────────── 🌷

**Multimodal AI · Risk Intelligence · Real-Time Monitoring**

🌷 ───────────────────────────────── 🌷

### Built in 2026 at RV College of Engineering

</div>


