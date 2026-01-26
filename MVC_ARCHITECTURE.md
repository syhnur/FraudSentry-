╔════════════════════════════════════════════════════════════════════════════╗
║                  FRAUDSENTRY MVC ARCHITECTURE GUIDE                         ║
║                      Complete Project Structure                             ║
╚════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
PROJECT STRUCTURE - MVC PATTERN
═══════════════════════════════════════════════════════════════════════════════

FraudSentry/
│
├── backend/                          # BACKEND (Model & Controller)
│   │
│   ├── models/                       # 🔷 MODEL LAYER
│   │   ├── __init__.py
│   │   ├── ensemble_model.py         # Ensemble voting logic
│   │   └── fraud_detector.py         # Fraud detection engine
│   │
│   ├── controllers/                  # 🔶 CONTROLLER LAYER
│   │   ├── __init__.py
│   │   └── fraud_controller.py       # API logic & orchestration
│   │
│   ├── config/                       # Configuration
│   │   ├── __init__.py
│   │   └── config.py                 # App configuration
│   │
│   ├── utils/                        # Utilities
│   │   ├── __init__.py
│   │   ├── data_processor.py         # Data validation & processing
│   │   └── logger.py                 # Logging setup
│   │
│   ├── app.py                        # Flask main app
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # FRONTEND (View Layer)
│   │
│   ├── src/
│   │   │
│   │   ├── pages/                    # 🔷 PAGE VIEWS
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionAnalysis.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── components/               # 🔶 REUSABLE COMPONENTS
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── RiskScore.jsx
│   │   │   ├── ModelComparison.jsx
│   │   │   └── RiskVisualization.jsx
│   │   │
│   │   ├── services/                 # 🔷 API INTEGRATION
│   │   │   └── fraudAPI.js           # API client
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── App.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── logs/                             # Logging
│   └── *.log
│
├── dataset/                          # Data
│
├── fraud_model.joblib                # Pre-trained models
├── fraud_model_xgboost.joblib
└── isolation_forest.joblib


═══════════════════════════════════════════════════════════════════════════════
LAYER BREAKDOWN
═══════════════════════════════════════════════════════════════════════════════

╔═════════════════════════════════════════════════════════════════════════════╗
║                         VIEW LAYER (Frontend)                              ║
║                           React + Vite                                      ║
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Responsibilities:                                                            │
│   ✓ Display UI to users                                                     │
│   ✓ Collect transaction data                                                │
│   ✓ Show fraud analysis results                                             │
│   ✓ Visualize risk scores                                                   │
│   ✓ Display charts and reports                                              │
│                                                                              │
│ Structure:                                                                   │
│   • pages/        → Full page views (Dashboard, Analysis, Reports)         │
│   • components/   → Reusable UI components                                 │
│   • services/     → API client (fraudAPI.js)                               │
│   • utils/        → Helper functions                                        │
│                                                                              │
│ Key Components:                                                              │
│   - Dashboard        → Main overview page                                   │
│   - TransactionAnalysis → Analyze single transactions                       │
│   - Reports          → View fraud statistics                                │
│   - RiskScore        → Display risk percentage                              │
│   - ModelComparison  → Show individual model predictions                    │
│                                                                              │
╚═════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════╗
║                    CONTROLLER LAYER (Backend)                              ║
║                         Flask / Python                                      ║
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Responsibilities:                                                            │
│   ✓ Handle API requests                                                     │
│   ✓ Orchestrate fraud detection workflow                                    │
│   ✓ Call model predictions                                                  │
│   ✓ Generate AI explanations (Gemini)                                       │
│   ✓ Return formatted responses                                              │
│   ✓ Handle errors and validation                                            │
│                                                                              │
│ Structure:                                                                   │
│   FraudController:                                                           │
│   ├─ analyze_fraud()      → Analyze single transaction                      │
│   ├─ batch_analyze_fraud() → Analyze multiple transactions                  │
│   ├─ _generate_explanation() → AI explanation generation                    │
│   └─ get_statistics()      → Calculate fraud statistics                     │
│                                                                              │
│ API Endpoints:                                                               │
│   POST   /api/analyze           → Analyze single transaction                │
│   POST   /api/batch-analyze     → Analyze multiple transactions             │
│   GET    /api/models/info       → Get model information                     │
│   GET    /health                → Health check                              │
│                                                                              │
╚═════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════╗
║                      MODEL LAYER (Backend)                                 ║
║                   ML Models + Data Logic                                    ║
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Responsibilities:                                                            │
│   ✓ Load pre-trained ML models                                              │
│   ✓ Generate predictions                                                    │
│   ✓ Calculate weighted risk scores                                          │
│   ✓ Apply threshold for classification                                      │
│   ✓ Validate and preprocess data                                            │
│   ✓ Handle database operations                                              │
│                                                                              │
│ Structure:                                                                   │
│   EnsembleModel:                                                             │
│   ├─ __init__()                 → Load 3 models                             │
│   ├─ predict()                  → Ensemble prediction + weighted score      │
│   └─ get_model_predictions()    → Individual model predictions              │
│                                                                              │
│   FraudDetector:                                                             │
│   ├─ preprocess_transaction()   → Data preprocessing                        │
│   ├─ analyze_transaction()      → Single transaction analysis               │
│   └─ batch_analyze()            → Multiple transactions                     │
│                                                                              │
│ Models Used:                                                                 │
│   1. Random Forest (40%)         → Known fraud patterns                      │
│   2. XGBoost (40%)               → Hidden patterns                           │
│   3. Isolation Forest (20%)      → Anomaly detection                         │
│                                                                              │
│ Weighted Risk Score Formula:                                                │
│   Risk = (XGB × 0.40) + (RF × 0.40) + (ISO × 0.20)                         │
│                                                                              │
│ Threshold:                                                                   │
│   IF Risk > 0.5 → FRAUD                                                     │
│   IF Risk ≤ 0.5 → LEGITIMATE                                                │
│                                                                              │
╚═════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
DATA FLOW - HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════════

USER INPUT (Frontend)
       │
       ▼
┌─────────────────────────────────┐
│ 1. USER SUBMITS TRANSACTION     │
│    (TransactionForm component)  │
│    • Amount                      │
│    • Sender balance              │
│    • Receiver balance            │
│    • Transaction type            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. FRONTEND CALLS API           │
│    (fraudAPI.js service)        │
│    POST /api/analyze            │
│    body: {transaction data}     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. CONTROLLER RECEIVES REQUEST  │
│    (FraudController)            │
│    • Validate input             │
│    • Extract features           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 4. MODEL PROCESSES DATA         │
│    (FraudDetector)              │
│    • Preprocess                 │
│    • Call ensemble              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 5. ENSEMBLE VOTING              │
│    (EnsembleModel)              │
│    • RF: 0.60 (60% fraud)       │
│    • XGB: 0.50 (50% fraud)      │
│    • ISO: 0.40 (40% anomaly)    │
│    • Weighted: 0.52             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 6. APPLY THRESHOLD              │
│    0.52 > 0.5? YES              │
│    Decision: FRAUD              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 7. GENERATE AI EXPLANATION      │
│    (Gemini API)                 │
│    "This transaction looks      │
│     suspicious because..."      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 8. RETURN RESPONSE              │
│    {                            │
│      is_fraud: true,            │
│      risk_score: 0.52,          │
│      explanation: "...",        │
│      model_predictions: {...}   │
│    }                            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 9. DISPLAY RESULT (Frontend)    │
│    (RiskScore component)        │
│    • Show verdict               │
│    • Show risk percentage       │
│    • Show AI explanation        │
│    • Show model comparison      │
└─────────────────────────────────┘

USER SEES FRAUD ALERT! ✓


═══════════════════════════════════════════════════════════════════════════════
FILE ORGANIZATION LOGIC
═══════════════════════════════════════════════════════════════════════════════

BACKEND/

models/
  ├─ __init__.py                → Export classes
  ├─ fraud_detector.py          → BUSINESS LOGIC (analyze transactions)
  └─ ensemble_model.py          → ML LOGIC (load models, predict)

controllers/
  ├─ __init__.py                → Export classes
  └─ fraud_controller.py        → API LOGIC (orchestrate, generate explanations)

config/
  ├─ __init__.py                → Export Config
  └─ config.py                  → CONFIGURATION (paths, settings, constants)

utils/
  ├─ __init__.py                → Export utilities
  ├─ data_processor.py          → DATA VALIDATION & PROCESSING
  └─ logger.py                  → LOGGING SETUP

app.py                           → FLASK APP (routes, error handlers)


FRONTEND/

src/pages/                        → FULL PAGE VIEWS
  ├─ Dashboard.jsx             → Main dashboard
  ├─ TransactionAnalysis.jsx   → Fraud analysis page
  └─ Reports.jsx               → Statistics/reports page

src/components/                  → REUSABLE UI COMPONENTS
  ├─ TransactionForm.jsx       → Form to input transaction
  ├─ RiskScore.jsx             → Display risk score
  ├─ ModelComparison.jsx       → Show model predictions
  └─ RiskVisualization.jsx     → Charts & visualizations

src/services/                    → API CLIENTS
  └─ fraudAPI.js               → Functions to call backend API

src/utils/                       → HELPERS
  └─ formatters.js             → Format data for display

App.jsx                          → Main app component
main.jsx                         → React entry point


═══════════════════════════════════════════════════════════════════════════════
BENEFITS OF THIS MVC STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

✅ SEPARATION OF CONCERNS
   • Model: Handles data & business logic
   • Controller: Handles requests & orchestration
   • View: Handles UI & user interaction
   → Easy to understand and maintain

✅ SCALABILITY
   • Easy to add new models
   • Easy to add new API endpoints
   • Easy to add new UI pages/components
   • Can scale frontend and backend independently

✅ TESTABILITY
   • Each layer can be tested independently
   • Model logic testable without UI
   • API endpoints testable without frontend

✅ REUSABILITY
   • Components reusable across pages
   • API client reusable across components
   • Model predictions reusable for batch operations

✅ MAINTAINABILITY
   • Clear file organization
   • Each file has single responsibility
   • Easy to locate and fix bugs


═══════════════════════════════════════════════════════════════════════════════
HOW TO USE THIS STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

BACKEND SETUP:
  1. cd backend
  2. pip install -r requirements.txt
  3. python app.py
  4. API running on http://localhost:5000

FRONTEND SETUP:
  1. cd frontend
  2. npm install
  3. npm run dev
  4. Frontend running on http://localhost:5173

API USAGE:
  • From frontend: Use fraudAPI.js service
  • From postman/curl: POST to /api/analyze
  
Adding new API endpoint:
  1. Create method in FraudController
  2. Add route in app.py
  3. Add function in fraudAPI.js
  4. Use in component

Adding new UI component:
  1. Create component in src/components/
  2. Call API via fraudAPI.js
  3. Display results
  4. Integrate in page


═══════════════════════════════════════════════════════════════════════════════
ENVIRONMENT CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

Backend (.env):
  GEMINI_API_KEY=your_api_key_here
  DEBUG=False
  SECRET_KEY=your_secret_key

Frontend (hardcoded in fraudAPI.js):
  API_BASE_URL = 'http://localhost:5000/api'


═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

1. Install backend dependencies
2. Set up .env with Gemini API key
3. Start backend server
4. Create frontend components
5. Test API endpoints
6. Deploy to production


═══════════════════════════════════════════════════════════════════════════════
