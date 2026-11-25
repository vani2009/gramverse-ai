# GramVerse AI - Village Governance & AI Intelligence Platform

GramVerse AI is a role-based village governance platform connecting citizens, field survey teams, panchayat officials, and district administrators through village demographic data, PostGIS maps, grievance workflows, and focused AI capabilities.

Built directly in alignment with the **GramVerse AI UI, Frontend & Backend Development Roadmap**.

---

## 🌟 Architecture & Key Features

### 1. Four Role-Based Interfaces (1-Click Switcher)
- 👨‍💼 **District Administrator**: Multi-village overview (Shivpura, Kalyanpur, Rampur, Belgaon), comparative infrastructure analytics (water, electricity, sanitation coverage %), development rankings, and automated district report generator.
- 🏛️ **Panchayat Official (Sarpanch / Secretary)**: Village demographic statistics, spatial GIS Leaflet map with PostGIS asset/complaint pins, grievance triaging with AI predictions, authorized **category override & review**, and the rule-based **Development Prioritization Planner**.
- 🌾 **Citizen / Villager**: Citizen Jan Seva dashboard, lodge grievances with live NLP category detection & CV defect analysis preview, GPS coordinate capture, stage-by-stage grievance status timeline, **Scheme Explorer** with rule-based matching, and **GramBot AI Chatbot** with verifiable citations.
- 📱 **Field Surveyor (Mobile PWA)**: Mobile-first field survey forms for Household & Civic Infrastructure surveys, GPS geotagging, offline storage in IndexedDB/LocalStorage, network status simulator, and **Offline Sync Queue** manager.

---

### 2. Embedded AI Capabilities & Implementation

| AI Component | Purpose & Technique | UI Implementation in Frontend |
| :--- | :--- | :--- |
| **1. NLP Complaint Classifier** | Auto-categorizes citizen complaints into *Road, Water, Sanitation, Electricity, School, Health* | Live classification as citizen types description, confidence meter (%), token-based explanation, and authorized Panchayat override modal. |
| **2. Computer Vision Model** | Analyzes submitted evidence photos for visible infrastructure defects (potholes, corrosion, etc.) | Interactive CV Inspector overlay with detected defect labels, confidence badges, bounding boxes, and mandatory advisory disclaimer. |
| **3. LLM + RAG Chatbot (GramBot)** | Answers questions regarding GPDP budgets, JJM tap water coverage, and scheme SOPs | Chat interface displaying verifiable knowledge source citations (`[Source: GPDP 2024-25]`, `[Source: JJM Guidelines Section 4.2]`). |
| **4. Rule-Based Scheme Matching** | Matches household socioeconomic profile to welfare schemes | Real-time evaluator against PM-KISAN, Jal Jeevan Mission, PMAY-G, Ayushman Bharat, MGNREGA, PM Surya Ghar, and SBM. |
| **5. Rule-Based Prioritization** | Computes transparent priority score for civic works | Formula: `Score = (Severity [1-5] × Population Affected) ÷ Cost in Lakhs`. Includes live interactive parameter simulator. |

---

## 🚀 Running the Project (One-Click Start)

### ⚡ One-Click Windows Launcher (Recommended)
Simply double-click:
```bash
start.bat
```
*(or run `.\start.ps1` in PowerShell)*

This automatically:
1. Verifies/creates the Python virtual environment and installs backend dependencies.
2. Starts the **FastAPI Backend & PostGIS Database** on `http://localhost:8000`.
3. Seeds the database with demo villages, PostGIS infrastructure, households, and complaints.
4. Starts the **React / Vite Frontend Server** on `http://localhost:3000`.
5. Automatically opens `http://localhost:3000` in your default web browser!

To stop both servers anytime with one click, double-click:
```bash
stop.bat
```
*(or run `.\stop.ps1` in PowerShell)*

---

### Manual Start (Alternative)

**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## 📱 Testing the Offline PWA Sync
1. On the top navigation bar, toggle the network status button from **"Network Online"** to **"Network Offline (PWA)"**.
2. Switch role to **"Survey PWA"** and fill out a Household or Civic Asset survey.
3. Observe the record saved locally into the **Offline Sync Queue** with a pending badge.
4. Toggle the network back to **"Network Online"** and click **"Sync All Pending"**.
5. The queue flushes, and the records appear immediately in the **Household Registry** and **GIS Map**!

---

## 👥 Practical Team Split Alignment
- **Frontend Lead**: Responsive Next.js / Vite React UI, role navigation, Recharts analytics, Leaflet GIS spatial maps.
- **Backend Lead**: FastAPI REST endpoints, Firebase authentication tokens, SQLAlchemy models.
- **Database & GIS**: PostgreSQL + PostGIS geometry points for village infrastructure and complaints.
- **AI/ML Lead**: NLP complaint classifier, CV inference models, RAG vector pipeline with FAISS + LangChain.
- **Cloud / DevOps**: Docker packaging, Google Cloud Run deployment, CI/CD pipelines.
