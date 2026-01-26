╔════════════════════════════════════════════════════════════════════════════╗
║              FRONTEND COMPONENT MIGRATION GUIDE                             ║
║          Moving from scattered files to MVC structure                       ║
╚════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
CURRENT STATE vs DESIRED STATE
═══════════════════════════════════════════════════════════════════════════════

CURRENT (Messy):
frontend/src/
├── App.jsx
├── InventoryLogin.jsx
├── FraudTypeBreakdown.jsx
├── ModelComparisonCards.jsx
├── main.jsx
└── App.css

DESIRED (Organized):
frontend/src/
├── pages/
│   ├── Dashboard.jsx
│   ├── TransactionAnalysis.jsx
│   └── Reports.jsx
├── components/
│   ├── TransactionForm.jsx
│   ├── RiskScore.jsx
│   ├── ModelComparison.jsx
│   ├── RiskVisualization.jsx
│   └── LoginForm.jsx
├── services/
│   └── fraudAPI.js
├── utils/
│   └── formatters.js
├── App.jsx (refactored)
├── main.jsx
└── App.css


═══════════════════════════════════════════════════════════════════════════════
MIGRATION STEPS
═══════════════════════════════════════════════════════════════════════════════

STEP 1: MOVE LoginComponent
─────────────────────────────────
FROM: frontend/src/InventoryLogin.jsx
TO:   frontend/src/components/LoginForm.jsx
WHY:  Reusable component for login, not a page

STEP 2: MOVE MODEL COMPARISON
──────────────────────────────────
FROM: frontend/src/ModelComparisonCards.jsx
TO:   frontend/src/components/ModelComparison.jsx
WHY:  Reusable component showing model predictions

STEP 3: MOVE FRAUD STATISTICS
───────────────────────────────────
FROM: frontend/src/FraudTypeBreakdown.jsx
TO:   frontend/src/components/RiskVisualization.jsx
WHY:  Reusable component for charts/stats

STEP 4: CREATE PAGES
────────────────────────
New: frontend/src/pages/Dashboard.jsx
  └─ Combines all components
  └─ Main entry page
  └─ Shows transaction analysis form
  └─ Shows results with risk score and explanation

New: frontend/src/pages/Reports.jsx
  └─ Shows fraud statistics
  └─ Displays charts (FraudTypeBreakdown)
  └─ Shows historical data

STEP 5: CREATE NEW COMPONENTS
──────────────────────────────────
New: frontend/src/components/TransactionForm.jsx
  └─ Form inputs for transaction data
  └─ Validation
  └─ Calls fraudAPI.analyzeSingle()

New: frontend/src/components/RiskScore.jsx
  └─ Display risk percentage
  └─ Show fraud/safe verdict
  └─ Color coding (red for fraud, green for safe)

STEP 6: UPDATE App.jsx
──────────────────────────
Updated: frontend/src/App.jsx
  └─ Add routing (React Router)
  └─ Route to Dashboard, Reports, Login
  └─ Setup main layout


═══════════════════════════════════════════════════════════════════════════════
DETAILED COMPONENT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

🔷 PAGES (Full page views)
───────────────────────────

1. Dashboard.jsx
   Purpose: Main analysis page
   Contains:
     • TransactionForm (collect input)
     • RiskScore (display result)
     • ModelComparison (show predictions)
     • Explanation text

   Usage:
     import Dashboard from './pages/Dashboard';
     <Dashboard />

2. Reports.jsx
   Purpose: Fraud statistics page
   Contains:
     • RiskVisualization (charts)
     • Statistics summary
     • Historical fraud data

   Usage:
     import Reports from './pages/Reports';
     <Reports />

3. TransactionAnalysis.jsx
   Purpose: Detailed transaction view
   Contains:
     • Transaction details
     • Step-by-step fraud analysis
     • Comparison of model predictions

   Usage:
     import TransactionAnalysis from './pages/TransactionAnalysis';
     <TransactionAnalysis />


🔶 COMPONENTS (Reusable)
────────────────────────

1. TransactionForm.jsx
   Purpose: Input form for transaction data
   Props:
     onSubmit(transaction) - called when form submitted
     loading - show loading spinner
     error - display error message
   
   State:
     amount, senderBalance, receiverBalance, type
   
   Usage:
     <TransactionForm 
       onSubmit={handleAnalyze}
       loading={isLoading}
       error={error}
     />

2. RiskScore.jsx
   Purpose: Display fraud verdict
   Props:
     riskScore (0-1)
     isFraud (boolean)
     confidence (0-1)
   
   Display:
     • Large percentage (red if fraud, green if safe)
     • Verdict text
     • Confidence level
   
   Usage:
     <RiskScore 
       riskScore={0.75}
       isFraud={true}
       confidence={0.92}
     />

3. ModelComparison.jsx
   Purpose: Show individual model predictions
   Props:
     modelPredictions {
       xgboost: 0.85,
       randomForest: 0.70,
       isolationForest: 0.60
     }
   
   Display:
     • Bar chart showing each model
     • Weighted result
     • Model explanations
   
   Usage:
     <ModelComparison 
       modelPredictions={predictions}
     />

4. RiskVisualization.jsx
   Purpose: Show fraud statistics
   Props:
     data {
       fraudCount: 150,
       legitCount: 2500,
       riskDistribution: [...]
     }
   
   Display:
     • Pie chart (fraud vs legitimate)
     • Risk distribution histogram
     • Summary statistics
   
   Usage:
     <RiskVisualization data={stats} />

5. LoginForm.jsx
   Purpose: User authentication
   Props:
     onLogin(credentials) - called on submit
     error - display login error
   
   State:
     username, password
   
   Usage:
     <LoginForm onLogin={handleLogin} />


═══════════════════════════════════════════════════════════════════════════════
COMPONENT INTERACTION FLOW
═══════════════════════════════════════════════════════════════════════════════

App.jsx
  │
  ├─→ Routes (React Router)
  │
  ├─→ Dashboard Page
  │   │
  │   ├─→ TransactionForm (component)
  │   │   └─→ on submit → calls fraudAPI.analyzeSingle()
  │   │
  │   ├─→ RiskScore (component)
  │   │   └─→ displays result from API
  │   │
  │   ├─→ ModelComparison (component)
  │   │   └─→ shows individual model predictions
  │   │
  │   └─→ Explanation text
  │       └─→ from AI (Gemini)
  │
  └─→ Reports Page
      │
      └─→ RiskVisualization (component)
          └─→ displays fraud statistics


═══════════════════════════════════════════════════════════════════════════════
IMPLEMENTATION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

STEP 1: Move existing components
  □ InventoryLogin.jsx → components/LoginForm.jsx
  □ ModelComparisonCards.jsx → components/ModelComparison.jsx
  □ FraudTypeBreakdown.jsx → components/RiskVisualization.jsx

STEP 2: Create new components
  □ components/TransactionForm.jsx
  □ components/RiskScore.jsx

STEP 3: Create pages
  □ pages/Dashboard.jsx (main page with TransactionForm + RiskScore)
  □ pages/Reports.jsx (with RiskVisualization)
  □ pages/TransactionAnalysis.jsx (detailed view)

STEP 4: Update main App.jsx
  □ Add React Router
  □ Add route definitions
  □ Add navigation menu
  □ Link to pages

STEP 5: Create index files
  □ components/index.js (export all components)
  □ pages/index.js (export all pages)

STEP 6: Test
  □ Frontend starts without errors
  □ API endpoints respond
  □ Forms submit correctly
  □ Results display correctly
  □ Navigation works


═══════════════════════════════════════════════════════════════════════════════
REFACTORING EACH COMPONENT
═══════════════════════════════════════════════════════════════════════════════

COMPONENT: InventoryLogin.jsx → LoginForm.jsx
─────────────────────────────────────────────

BEFORE:
  const InventoryLogin = () => {
    const handleLogin = async (email, password) => {
      // Login logic
      // Direct database call
      // Hardcoded endpoints
    }
  }

AFTER:
  const LoginForm = ({ onLogin, error, loading }) => {
    const [credentials, setCredentials] = useState({...})
    
    const handleSubmit = (e) => {
      e.preventDefault()
      onLogin(credentials)  // ← Let parent handle API
    }
    
    return (
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <input {...} />
        <button disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    )
  }

CHANGES:
  ✓ Moved to components/ folder
  ✓ Receive onLogin callback as prop
  ✓ Component is presentational (only UI)
  ✓ Parent handles API calls
  ✓ Reusable across pages


COMPONENT: ModelComparisonCards.jsx → ModelComparison.jsx
──────────────────────────────────────────────────────────

BEFORE:
  const ModelComparisonCards = (data) => {
    // Hardcoded display
    // Limited to specific data format
  }

AFTER:
  const ModelComparison = ({ modelPredictions }) => {
    return (
      <div>
        {Object.entries(modelPredictions).map(([model, score]) => (
          <Card key={model}>
            <h3>{model}</h3>
            <ProgressBar value={score} />
          </Card>
        ))}
        <div>
          Weighted Score: {calculateWeighted(modelPredictions)}
        </div>
      </div>
    )
  }

CHANGES:
  ✓ Moved to components/ folder
  ✓ Accept data as prop (more flexible)
  ✓ Reusable with different data
  ✓ Cleaner component structure


═══════════════════════════════════════════════════════════════════════════════
EXAMPLE: Creating Dashboard.jsx
═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import RiskScore from '../components/RiskScore';
import ModelComparison from '../components/ModelComparison';
import { fraudAPI } from '../services/fraudAPI';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (transaction) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API via fraudAPI service
      const response = await fraudAPI.analyzeSingle(transaction);
      setResult(response);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Fraud Analysis</h1>
      
      {/* Input Form */}
      <TransactionForm 
        onSubmit={handleAnalyze}
        loading={loading}
        error={error}
      />
      
      {/* Results */}
      {result && (
        <div className="results">
          <RiskScore 
            riskScore={result.risk_score}
            isFraud={result.is_fraud}
            confidence={result.confidence}
          />
          
          <div className="explanation">
            <p>{result.explanation}</p>
          </div>
          
          <ModelComparison 
            modelPredictions={result.model_predictions}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;


═══════════════════════════════════════════════════════════════════════════════
KEY PRINCIPLES
═══════════════════════════════════════════════════════════════════════════════

✅ SINGLE RESPONSIBILITY
   Each component does ONE thing well

✅ REUSABILITY
   Components accept data as props
   Not hardcoded with specific data

✅ COMPOSITION
   Build complex UI from simple components

✅ PROP DRILLING
   Pass data and callbacks down
   Keep components loosely coupled

✅ API SEPARATION
   fraudAPI.js handles all backend calls
   Components don't know about HTTP

✅ ERROR HANDLING
   Pass error state to components
   Display errors gracefully


═══════════════════════════════════════════════════════════════════════════════
COMMON MISTAKES TO AVOID
═══════════════════════════════════════════════════════════════════════════════

❌ MISTAKE: Hardcoding data in components
   ✓ FIX: Accept data as props

❌ MISTAKE: API calls inside components
   ✓ FIX: Use fraudAPI service, pass callbacks

❌ MISTAKE: Too many props (prop drilling)
   ✓ FIX: Use Context API or Redux for deep nesting

❌ MISTAKE: Component doing too much
   ✓ FIX: Split into smaller components

❌ MISTAKE: Mixing business logic and UI
   ✓ FIX: Keep components presentational


═══════════════════════════════════════════════════════════════════════════════
TESTING ORGANIZED COMPONENTS
═══════════════════════════════════════════════════════════════════════════════

Test TransactionForm:
  • Form renders
  • User can type values
  • Submit calls onSubmit callback
  • Loading state shows
  • Error message displays

Test RiskScore:
  • Shows risk percentage
  • Shows correct verdict (fraud/safe)
  • Color correct (red/green)
  • Confidence displays

Test ModelComparison:
  • Shows all models
  • Shows weighted score
  • Bar chart displays

Dashboard integration:
  • Form and results work together
  • API call succeeds
  • Results display
  • Error handling works


═══════════════════════════════════════════════════════════════════════════════
