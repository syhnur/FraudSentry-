# FraudSentry PlantUML Diagrams - Quick Reference

## 📁 Diagram Files Created

I've split your comprehensive architecture into **4 focused diagrams** that work perfectly with online PlantUML editors:

### 1. Backend API Architecture
**File:** [1_backend_api.puml](file:///Users/sy4hnur/Desktop/FraudSentry/diagrams/1_backend_api.puml)

**Contains:**
- FastAPI application structure
- 7 REST API endpoints
- Pydantic models (Transaction, ReportRequest)
- Fraud detection service
- Database layer (SQLite)
- External services (Gemini AI, PDF Generator)

**Best for:** Understanding the API layer and service architecture

---

### 2. ML Models Architecture
**File:** [2_ml_models.puml](file:///Users/sy4hnur/Desktop/FraudSentry/diagrams/2_ml_models.puml)

**Contains:**
- Random Forest Model (high precision)
- XGBoost Model (high sensitivity)
- Isolation Forest (anomaly detection)
- SHAP Explainer
- Ensemble Risk Scorer (fusion formula)
- Training & evaluation scripts

**Best for:** Understanding the ML pipeline and model ensemble

---

### 3. Frontend Architecture
**File:** [3_frontend.puml](file:///Users/sy4hnur/Desktop/FraudSentry/diagrams/3_frontend.puml)

**Contains:**
- React component hierarchy
- Authentication (Login with WebAuthn)
- Dashboard, Detection, History views
- Visualization components
- Axios API client

**Best for:** Understanding the React application structure

---

### 4. Simplified System Overview
**File:** [4_simplified_overview.puml](file:///Users/sy4hnur/Desktop/FraudSentry/diagrams/4_simplified_overview.puml)

**Contains:**
- High-level system architecture
- Main component interactions
- Data flow overview
- Model consensus tiers

**Best for:** Quick overview and presentations

---

## 🌐 How to Use with Online PlantUML Editor

### Option 1: PlantUML Web Server (Recommended)
1. Go to: **http://www.plantuml.com/plantuml/uml**
2. Copy the contents of any `.puml` file
3. Paste into the editor
4. Click "Submit" to render

### Option 2: PlantText
1. Go to: **https://www.planttext.com/**
2. Paste your diagram code
3. Click "Refresh" to render

---

## 📊 Diagram Sizes

All diagrams are optimized for online editors:
- **Backend API:** ~120 lines
- **ML Models:** ~150 lines
- **Frontend:** ~110 lines
- **Simplified:** ~70 lines

Each diagram is **small enough** to work with online PlantUML editors without "bad request" errors!

---

## 💡 Tips

- **Start with #4 (Simplified)** for a quick overview
- **Use #1-3** for detailed documentation
- **Combine diagrams** in your thesis/documentation as needed
- All diagrams use consistent styling and colors

---

## 🎨 Color Coding

- **Blue (#E3F2FD):** Backend/API
- **Orange (#FFF3E0):** ML Models
- **Purple (#F3E5F5):** Frontend
- **Green (#E8F5E9):** Database
- **Pink (#FCE4EC):** External Services
