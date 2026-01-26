╔════════════════════════════════════════════════════════════════════════════╗
║                  FRAUDSENTRY QUICK REFERENCE CARD                          ║
║                     MVC Architecture at a Glance                            ║
╚════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
DIRECTORY STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

backend/
├── models/
│   ├── ensemble_model.py      ← 3 models with weighted voting
│   └── fraud_detector.py       ← Preprocessing & analysis
├── controllers/
│   └── fraud_controller.py     ← ML + Gemini orchestration
├── config/
│   └── config.py               ← All settings centralized
├── utils/
│   ├── data_processor.py       ← Validation & processing
│   └── logger.py               ← Logging setup
├── app.py                      ← Flask REST API
└── requirements.txt            ← Python dependencies

frontend/src/
├── pages/
│   ├── Dashboard.jsx           ← Main page (to create)
│   └── Reports.jsx             ← Stats page (to create)
├── components/
│   ├── TransactionForm.jsx     ← Input form (NEW)
│   ├── RiskScore.jsx           ← Risk display (NEW)
│   ├── ModelComparison.jsx     ← Model predictions
│   └── RiskVisualization.jsx   ← Charts & stats
├── services/
│   └── fraudAPI.js             ← API client (ENHANCED)
├── styles/
│   ├── TransactionForm.css     ← Form styling (NEW)
│   └── RiskScore.css           ← Risk styling (NEW)
├── App.jsx
└── main.jsx


═══════════════════════════════════════════════════════════════════════════════
QUICK COMMANDS
═══════════════════════════════════════════════════════════════════════════════

START BACKEND:
  $ cd backend && pip install -r requirements.txt && python app.py

START FRONTEND:
  $ cd frontend && npm install && npm run dev

TEST API:
  $ curl http://localhost:5000/health

INSTALL NEW PYTHON PACKAGE:
  $ pip install <package> && pip freeze > backend/requirements.txt


═══════════════════════════════════════════════════════════════════════════════
API ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

POST /api/analyze
  → Single transaction analysis
  ← is_fraud, risk_score, confidence, explanation, model_predictions

POST /api/batch-analyze
  → Multiple transactions
  ← total, fraud_count, legitimate_count, fraud_rate, results[]

GET /api/models/info
  → Model configuration
  ← models[], weights{}, threshold, ensemble_formula

GET /health
  → Service status
  ← {status: "OK"}


═══════════════════════════════════════════════════════════════════════════════
COMPONENT USAGE
═══════════════════════════════════════════════════════════════════════════════

TRANSACTION FORM:
  import TransactionForm from '../components/TransactionForm';
  <TransactionForm onSubmit={handleAnalyze} loading={loading} error={error} />

RISK SCORE:
  import RiskScore from '../components/RiskScore';
  <RiskScore riskScore={0.75} isFraud={true} confidence={0.92} />

FRAUD API:
  import { fraudAPI } from '../services/fraudAPI';
  const result = await fraudAPI.analyzeSingle(transaction);


═══════════════════════════════════════════════════════════════════════════════
MACHINE LEARNING MODELS
═══════════════════════════════════════════════════════════════════════════════

Random Forest (40% weight)
  ✓ Detects known fraud patterns
  ✓ Tree-based ensemble
  File: fraud_model.joblib

XGBoost (40% weight)
  ✓ Finds hidden patterns
  ✓ Gradient boosting
  File: fraud_model_xgboost.joblib

Isolation Forest (20% weight)
  ✓ Detects anomalies
  ✓ Density-based approach
  File: isolation_forest.joblib

ENSEMBLE FORMULA:
  Risk = (XGB × 0.40) + (RF × 0.40) + (ISO × 0.20)

THRESHOLD:
  IF Risk > 0.5 → FRAUD
  IF Risk ≤ 0.5 → LEGITIMATE


═══════════════════════════════════════════════════════════════════════════════
FEATURES REQUIRED
═══════════════════════════════════════════════════════════════════════════════

1. amount              (float)  Transfer amount
2. oldbalanceOrg      (float)  Sender initial balance
3. newbalanceOrig     (float)  Sender final balance
4. oldbalanceDest     (float)  Recipient initial balance
5. newbalanceDest     (float)  Recipient final balance

OPTIONAL:
  type (str)         "TRANSFER" or "CASH_OUT"


═══════════════════════════════════════════════════════════════════════════════
ERROR HANDLING PATTERNS
═══════════════════════════════════════════════════════════════════════════════

TRY/CATCH IN COMPONENTS:
  try {
    const result = await fraudAPI.analyzeSingle(transaction);
    setResult(result);
  } catch (error) {
    setError(error.message);
  }

API ERROR STRUCTURE:
  {
    message: "Descriptive error message",
    type: "ERROR_TYPE",
    originalError: {...}
  }

COMMON ERRORS:
  NETWORK_ERROR    → Backend not running
  TIMEOUT          → Request took too long
  BAD_REQUEST      → Invalid transaction data
  SERVER_ERROR     → Backend error
  UNKNOWN          → Unexpected error


═══════════════════════════════════════════════════════════════════════════════
CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

BACKEND (.env):
  GEMINI_API_KEY=<your-key>
  DEBUG=False
  SECRET_KEY=<your-secret>
  FLASK_ENV=production

FRONTEND (.env):
  VITE_API_URL=http://localhost:5000


═══════════════════════════════════════════════════════════════════════════════
NEW FILES CREATED
═══════════════════════════════════════════════════════════════════════════════

Python:
  ✓ backend/models/ensemble_model.py
  ✓ backend/models/fraud_detector.py
  ✓ backend/controllers/fraud_controller.py
  ✓ backend/config/config.py
  ✓ backend/utils/data_processor.py
  ✓ backend/utils/logger.py
  ✓ backend/app.py
  ✓ backend/requirements.txt

React:
  ✓ frontend/src/components/TransactionForm.jsx
  ✓ frontend/src/components/RiskScore.jsx
  ✓ frontend/src/services/fraudAPI.js (ENHANCED)
  ✓ frontend/src/styles/TransactionForm.css
  ✓ frontend/src/styles/RiskScore.css

Documentation:
  ✓ MVC_ARCHITECTURE.md
  ✓ FRONTEND_MIGRATION_GUIDE.md
  ✓ MVC_REORGANIZATION_STATUS.md
  ✓ QUICK_REFERENCE_CARD.md (This file)


═══════════════════════════════════════════════════════════════════════════════
TESTING QUICK CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

□ Backend starts without errors
□ Frontend starts without errors
□ /health endpoint responds
□ /api/analyze accepts transaction
□ fraudAPI service connects
□ TransactionForm renders
□ RiskScore displays
□ Error handling works
□ Loading states work


═══════════════════════════════════════════════════════════════════════════════
COMMON ISSUES & SOLUTIONS
═══════════════════════════════════════════════════════════════════════════════

❌ "ModuleNotFoundError: No module named 'flask'"
   → Run: pip install -r backend/requirements.txt

❌ "Port 5000 already in use"
   → Kill process: lsof -i :5000 then kill -9 <PID>

❌ "Backend not responding"
   → Check: curl http://localhost:5000/health
   → Verify: All 3 model files exist

❌ "npm packages missing"
   → Run: cd frontend && npm install

❌ "API returns 404"
   → Check: backend is running on :5000
   → Verify: endpoint path is correct

❌ "CORS error"
   → Check: Flask-CORS is installed
   → Verify: Frontend URL matches CORS config


═══════════════════════════════════════════════════════════════════════════════
KEY FILES TO UNDERSTAND
═══════════════════════════════════════════════════════════════════════════════

FOR ML LOGIC:
  → backend/models/ensemble_model.py      (Start here!)
  → backend/models/fraud_detector.py

FOR API:
  → backend/app.py                        (Start here!)
  → backend/controllers/fraud_controller.py

FOR CONFIGURATION:
  → backend/config/config.py              (All settings)

FOR FRONTEND UI:
  → frontend/src/components/TransactionForm.jsx  (Start here!)
  → frontend/src/components/RiskScore.jsx

FOR API COMMUNICATION:
  → frontend/src/services/fraudAPI.js     (Start here!)


═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS PRIORITY ORDER
═══════════════════════════════════════════════════════════════════════════════

1. TEST BACKEND API
   ✓ Most important for system functionality

2. INTEGRATE FRONTEND & BACKEND
   ✓ Test fraudAPI service connection

3. CREATE DASHBOARD PAGE
   ✓ Combine components into working page

4. SET UP ROUTING
   ✓ Add React Router

5. REFACTOR EXISTING COMPONENTS
   ✓ Move to new structure


═══════════════════════════════════════════════════════════════════════════════
RESOURCES
═══════════════════════════════════════════════════════════════════════════════

Full Documentation:
  • MVC_ARCHITECTURE.md             ← Complete architecture
  • FRONTEND_MIGRATION_GUIDE.md     ← Component guide
  • MVC_REORGANIZATION_STATUS.md    ← Detailed status

Code Examples:
  • backend/app.py                  ← Flask setup
  • frontend/src/components/TransactionForm.jsx  ← Form component
  • frontend/src/components/RiskScore.jsx       ← Display component


═══════════════════════════════════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════════════════════════════════

✅ Your FraudSentry system is now organized into proper MVC architecture
✅ Backend: Python/Flask with clear separation of models, controllers, config
✅ Frontend: React with organized components, pages, services, utils
✅ New components: TransactionForm, RiskScore with complete styling
✅ Enhanced API service: Better error handling and validation
✅ Documentation: Comprehensive guides for implementation

Ready to:
  → Test backend API
  → Test frontend components
  → Connect frontend to backend
  → Deploy to production


═══════════════════════════════════════════════════════════════════════════════
