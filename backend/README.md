# GramVerse AI - Backend Orchestration Engine

Production-grade FastAPI backend for **GramVerse AI**, an AI-powered rural governance, GIS mapping, offline survey synchronization, and Gram Panchayat Development Plan (GPDP) intelligence platform.

---

## 🏛️ Architecture & Role Overview

The backend acts as the central orchestration hub connecting frontend client applications (Citizen Portal, Panchayat Admin, Field Surveyor PWA) with relational spatial databases, AI inference pipelines, and document generators.

- **FastAPI (Asynchronous REST API)**: Asynchronous non-blocking endpoints with Pydantic v2 data validation.
- **SQLAlchemy 2.0 (Async Engine)**: Async ORM with dual-mode spatial support (PostGIS `Geometry('POINT', 4326)` for PostgreSQL production; transparent fallback for local test runners).
- **Firebase Authentication & RBAC**: Real-time token decoding with 4 role tiers (`admin`, `panchayat`, `citizen`, `survey`) and instant development bypass tokens.
- **Idempotent Offline Sync**: Client-generated UUID tracking for intermittent rural connectivity.
- **RFC 7946 GeoJSON**: Native Leaflet / OpenLayers format for infrastructure assets and complaint points.
- **AI Gateway & Rule Engines**: Integrated welfare scheme rule engine (PMAY-G, PM-KISAN, JJM, etc.), complaint NLP/CV routing, GPDP priority optimizer, and GramBot RAG chatbot service.
- **GPDP PDF Generation**: Dynamic ReportLab PDF synthesis for Gram Sabha budget planning.

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py             # Pydantic-settings config (.env parsing)
│   │   ├── security.py           # Firebase Auth verify & RBAC dependencies
│   │   └── storage.py            # Async multipart file uploads
│   ├── database/
│   │   ├── base.py               # DeclarativeBase with common timestamp mixin
│   │   └── session.py            # Async engine, sessionmaker, and DB probe
│   ├── models/                   # SQLAlchemy 2.0 ORM Models
│   │   ├── user.py               # Users & role mapping
│   │   ├── village.py            # Village demographics & boundaries
│   │   ├── household.py          # Household socioeconomic survey records
│   │   ├── survey.py             # Idempotent offline field surveys
│   │   ├── infrastructure.py     # Civic assets with spatial coordinates
│   │   ├── complaint.py          # Civic complaints & CV image defects
│   │   ├── scheme.py             # Welfare schemes & household eligibility
│   │   ├── priority.py           # GPDP priority projects
│   │   └── types.py              # SafeGeometry PostGIS/SQLite type decorator
│   ├── schemas/                  # Pydantic v2 Request/Response Schemas
│   │   ├── auth.py, village.py, household.py, survey.py,
│   │   ├── gis.py, complaint.py, ai.py, dashboard.py
│   ├── services/                 # Business Logic & AI Gateways
│   │   ├── survey_sync.py        # Offline batch sync with savepoints
│   │   ├── scheme_engine.py      # Central & State welfare scheme rules
│   │   ├── priority_planner.py   # GPDP priority formula optimizer
│   │   ├── ai_classifier.py      # NLP complaint classification & CV tags
│   │   ├── rag_service.py        # GramBot RAG gateway with citations
│   │   ├── dashboard_service.py  # Aggregation metrics & Redis caching
│   │   └── pdf_generator.py      # ReportLab GPDP PDF generator
│   ├── routes/                   # API Routers mounted under /api/v1
│   │   ├── auth.py, villages.py, households.py, surveys.py,
│   │   ├── infrastructure.py, complaints.py, ai.py,
│   │   ├── dashboard.py, reports.py
│   └── main.py                   # FastAPI application factory & CORS setup
├── tests/                        # Full Automated Pytest Suite (49 tests)
├── Dockerfile                    # Containerization configuration
├── docker-compose.yml            # Multi-service stack (FastAPI + PostGIS + Redis)
├── requirements.txt              # Production Python dependencies
├── .env.example                  # Environment template
└── README.md                     # Backend documentation
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- PostgreSQL 15+ with PostGIS 3+ (or Docker)
- Redis 7+ (optional for local caching)

### 2. Local Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 3. Running with Docker Compose (Recommended)

Spins up FastAPI, PostgreSQL with PostGIS, and Redis with zero local installation:

```bash
docker compose up --build -d
```
- API Documentation: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

### 4. Running Locally without Docker (SQLite Development Mode)

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔐 Authentication & RBAC

All protected endpoints require an `Authorization: Bearer <token>` header.

### Production Tokens
Firebase ID tokens issued via the frontend Firebase SDK are verified cryptographically via Firebase Admin SDK.

### Development Bypass Tokens
To facilitate rapid frontend and API development without active Firebase credentials:
- `dev-admin-token` -> Role: `admin` (Full access)
- `dev-panchayat-token` -> Role: `panchayat` (Panchayat official operations)
- `dev-citizen-token` -> Role: `citizen` (Grievances and household views)
- `dev-survey-token` -> Role: `survey` (Offline survey uploads)

---

## 📡 Key API Endpoints Overview

| Method | Endpoint | Description | Required Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System and Database Health Probe | Public |
| `POST` | `/api/v1/auth/sync` | Sync Firebase User to Local DB | Authenticated |
| `GET` | `/api/v1/villages` | List Gram Panchayats with KPIs | Public |
| `POST` | `/api/v1/surveys/sync` | Batch Offline Survey Ingestion | `survey`, `panchayat`, `admin` |
| `GET` | `/api/v1/infrastructure/geojson` | GeoJSON FeatureCollection for Leaflet | Public |
| `POST` | `/api/v1/complaints` | Submit Complaint with CV Image Upload | `citizen`, `panchayat`, `admin` |
| `GET` | `/api/v1/ai/schemes/evaluate/{id}` | Evaluate Welfare Scheme Eligibility | Authenticated |
| `POST` | `/api/v1/ai/priorities/simulate` | GPDP Priority Budget Simulation | `panchayat`, `admin` |
| `POST` | `/api/v1/ai/rag/query` | GramBot Scheme Query with Citations | Public |
| `GET` | `/api/v1/dashboard/village/{id}` | Aggregated Dashboard KPIs (Cached) | Authenticated |
| `GET` | `/api/v1/reports/gpdp/{id}/download` | Generate Downloadable GPDP PDF | Authenticated |

---

## 🧪 Testing

The repository contains an exhaustive test suite covering all routers, database models, offline sync idempotency, rule engines, and spatial GeoJSON conversions:

```bash
pytest -v
```

**Results:** `49 passed in 6.15s (100% pass rate)`.

---

## 🤝 Team Hand-off Notes

- **Member 3 (Database & GIS Lead):**
  - Models in `app/models/infrastructure.py` and `app/models/village.py` use `SafeGeometry` to store PostGIS points.
  - The GeoJSON serializer in `app/routes/infrastructure.py` outputs RFC 7946 GeoJSON with `[longitude, latitude]` coordinate ordering, ready for Leaflet and Turf.js.
- **Member 4 (AI/ML Lead):**
  - AI services in `app/services/ai_classifier.py` and `app/services/rag_service.py` are modular and ready for plug-and-play integration with fine-tuned Hugging Face models, Gemini API, or LangChain vectorstores.
- **Member 5 (Cloud & DevOps Lead):**
  - Pre-configured `Dockerfile` and `docker-compose.yml` include healthchecks, volume mounts for persistent uploads, and production uvicorn worker flags.
