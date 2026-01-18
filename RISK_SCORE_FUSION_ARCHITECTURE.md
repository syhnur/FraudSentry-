# Risk Score Fusion - Architecture Diagram & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FraudSentry Backend (FastAPI)                    │
│                                                                      │
│  POST /upload-batch                                                 │
│      ↓                                                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Input: CSV with transaction features                       │    │
│  │ • amount                                                   │    │
│  │ • oldbalanceOrg                                            │    │
│  │ • newbalanceOrig                                           │    │
│  │ • oldbalanceDest                                           │    │
│  │ • newbalanceDest                                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│      ↓                                                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │          RISK SCORE FUSION - ENSEMBLE LAYER               │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ Model 1: XGBoost (40% Weight)                        │  │    │
│  │  │ ├─ Type: Supervised Gradient Boosting               │  │    │
│  │  │ ├─ Output: probability [0.0-1.0]                    │  │    │
│  │  │ ├─ Strength: High fraud sensitivity                │  │    │
│  │  │ └─ Example: 0.87 → "Very Suspicious"               │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ Model 2: Random Forest (40% Weight)                 │  │    │
│  │  │ ├─ Type: Supervised Parallel Ensemble               │  │    │
│  │  │ ├─ Output: probability [0.0-1.0]                    │  │    │
│  │  │ ├─ Strength: High precision validation              │  │    │
│  │  │ └─ Example: 0.81 → "Confirms XGBoost"              │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ Model 3: Isolation Forest (20% Weight)              │  │    │
│  │  │ ├─ Type: Unsupervised Anomaly Detection             │  │    │
│  │  │ ├─ Output: -1 (anomaly) or 1 (normal)               │  │    │
│  │  │ ├─ Normalized: 1.0 (anomaly) or 0.0 (normal)        │  │    │
│  │  │ └─ Strength: Catches unusual patterns               │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ WEIGHTED FUSION CALCULATION                         │  │    │
│  │  │                                                      │  │    │
│  │  │  Final_Risk = (0.87 × 0.4)                          │  │    │
│  │  │              + (0.81 × 0.4)                         │  │    │
│  │  │              + (1.00 × 0.2)                         │  │    │
│  │  │  ────────────────────────────────                   │  │    │
│  │  │            = 0.348 + 0.324 + 0.200                 │  │    │
│  │  │            = 0.872 ← ENSEMBLE RISK SCORE           │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ DECISION THRESHOLD                                  │  │    │
│  │  │                                                      │  │    │
│  │  │  If Ensemble_Risk > 0.5:                            │  │    │
│  │  │    ✓ FLAG AS FRAUD                                 │  │    │
│  │  │  Else:                                              │  │    │
│  │  │    ✓ CLEAR AS SAFE                                 │  │    │
│  │  │                                                      │  │    │
│  │  │  In our example: 0.872 > 0.5 → FRAUD ✓✓✓           │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘    │
│      ↓                                                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Output: API Response                                       │    │
│  │ {                                                          │    │
│  │   "stats": {                                               │    │
│  │     "total_scanned": 10000,                                │    │
│  │     "ensemble_flags": 78,                                  │    │
│  │     "unanimous_agreement": 42                              │    │
│  │   },                                                       │    │
│  │   "top_risky_transactions": [                              │    │
│  │     {                                                      │    │
│  │       "XGB_Risk_Score": 0.87,                              │    │
│  │       "RF_Risk_Score": 0.81,                               │    │
│  │       "Ensemble_Risk_Score": 0.87,                         │    │
│  │       "Ensemble_Prediction": 1,                            │    │
│  │       "Fraud_Type": "Account Takeover"                     │    │
│  │     }                                                      │    │
│  │   ]                                                        │    │
│  │ }                                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│      ↓                                                              │
│  Returns to Frontend (React) & Database (SQLite)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Decision Flow Diagram

```
                          TRANSACTION INPUT
                               ↓
                    ┌──────────────────────┐
                    │   Get 3 Predictions  │
                    └──────────────────────┘
                               ↓
        ┌──────────────────────┼──────────────────────┐
        ↓                      ↓                      ↓
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │   XGBoost   │      │Random Forest│      │Isolation    │
   │  Output:    │      │  Output:    │      │Forest       │
   │  0.87 ─────→│      │  0.81 ─────→│      │Output:      │
   │             │      │             │      │-1 (anomaly) │
   │ (0.0-1.0)   │      │ (0.0-1.0)   │      │→ Norm: 1.0  │
   └─────────────┘      └─────────────┘      └─────────────┘
        ↓ (40%)              ↓ (40%)              ↓ (20%)
        │                    │                    │
        ├─ 0.87 × 0.4 ──→ 0.348
        │
        ├─────── 0.81 × 0.4 ──→ 0.324
        │
        └──────────────── 1.0 × 0.2 ──→ 0.200
                                          ───────
                            ENSEMBLE RISK = 0.872
                                          ═══════
                                             ↓
                    ┌────────────────────────┴────────────────────┐
                    │                                             │
             ┌──────▼─────┐                              ┌────────▼──┐
             │ 0.872 > 0.5?                             │ Confidence│
             │    YES ✓    │                            │    HIGH   │
             └──────┬──────┘                            └───────────┘
                    ↓
            ╔═══════════════════╗
            ║  🚨 FRAUD FLAG 🚨 ║
            ║  (HIGH CONFIDENCE)║
            ║  Consensus: 3/3   ║
            ╚═══════════════════╝
                    ↓
         ┌──────────────────────┐
         │ Assign Fraud Type    │
         │ • Rule-based check   │
         │ • SHAP explanation   │
         │ • Behavioral anomaly │
         └──────────────────────┘
                    ↓
         ┌──────────────────────┐
         │ Add to Results List  │
         │ (sorted by score)    │
         └──────────────────────┘
```

---

## Risk Score Range Interpretation

```
┌──────────────────────────────────────────────────────────────────────┐
│ Ensemble Risk Score Distribution                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  0.0 ─────┬───── 0.2 ─────┬───── 0.4 ─────┬───── 0.6 ─────┬─ 1.0   │
│           │               │               │               │         │
│  SAFE     │    LOW RISK   │  MEDIUM RISK  │  HIGH RISK    │ FRAUD  │
│  (Clean)  │ (Monitor)     │ (Review)      │ (Alert)       │ (Flag) │
│           │               │               │               │         │
│  ✓✓✓✓✓    │   ✓✓✓        │   ✓✓          │    ✓          │ ✗✗✗✗✗  │
│           │               │               │               │         │
│  0.0-0.3  │   0.3-0.5     │   0.5-0.7     │   0.7-0.9     │ 0.9-1.0│
│           │               │               │               │         │
│   └─────────────────── THRESHOLD = 0.5 ──────────────────┘          │
│                          (Decision Point)                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Threshold Zones:

| Range | Label | Action | Examples |
|-------|-------|--------|----------|
| 0.0-0.3 | SAFE | Clear | Legit local transfer |
| 0.3-0.5 | LOW RISK | Monitor | Unusual but not fraud |
| 0.5 | **THRESHOLD** | **DECISION POINT** | - |
| 0.5-0.7 | MEDIUM RISK | Review | Suspicious pattern |
| 0.7-0.9 | HIGH RISK | Alert | Likely fraud |
| 0.9-1.0 | CRITICAL | Flag | Definite fraud |

---

## Agreement Level Diagram

```
Unanimous Agreement (All 3 Models Agree):
═══════════════════════════════════════════

    XGBoost: 1 (FRAUD)
        ✓✓
    Random Forest: 1 (FRAUD)
        ✓✓
    Isolation Forest: 1 (ANOMALY)
        ─────────────────────
        UNANIMOUS: 3/3 ✓✓✓✓✓

    Confidence Level: MAXIMUM
    Action: FLAG + ALERT + INVESTIGATE
    Priority: CRITICAL


Partial Agreement (2 of 3 Models):
═══════════════════════════════════════════

    XGBoost: 1 (FRAUD)
        ✓✓
    Random Forest: 1 (FRAUD)
        ✓✓
    Isolation Forest: 0 (NORMAL)
        ─────────────────────
        AGREEMENT: 2/3 ✓✓✓

    Confidence Level: GOOD
    Action: FLAG + REVIEW
    Priority: HIGH


Mild Concern (1-2 Models):
═══════════════════════════════════════════

    XGBoost: 0.55 (mild concern)
        ✓
    Random Forest: 0.45 (mild concern)
        ✓
    Isolation Forest: 0 (NORMAL)
        ─────────────────────
        ENSEMBLE: 0.40

    Status: SAFE (< 0.5 threshold)
    Confidence Level: LOW
    Action: MONITOR
    Priority: LOW
```

---

## Model Characteristics Comparison

```
┌────────────────────────┬──────────────┬──────────────┬──────────────┐
│ Characteristic         │   XGBoost    │ Random Forest│ Iso. Forest  │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Learning Type          │ Supervised   │ Supervised   │ Unsupervised │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Fraud Awareness        │ Full (Trained) │ Full (Trained) │ None       │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Output Type            │ Probability  │ Probability  │ Binary (-1/1)│
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ AUC Score              │ 0.9986       │ 0.9952       │ Variable     │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Precision              │ 92%          │ 85%          │ 65%          │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Recall                 │ 77%          │ 72%          │ 82%          │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Speed                  │ Fast         │ Fast         │ Very Fast    │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Interpretability       │ Good (SHAP)  │ Good (SHAP)  │ Poor (Black) │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ False Alarm Rate       │ Low          │ Very Low     │ Medium       │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Best For               │ Sensitivity  │ Specificity  │ Anomalies    │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Weight in Ensemble     │ 40%          │ 40%          │ 20%          │
├────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Weakness               │ Sometimes    │ Misses 28%   │ Too broad    │
│                        │ overconfident│ of frauds    │ anomalies    │
└────────────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Real-World Scenario Examples

### Scenario 1: UNANIMOUS FRAUD ✓✓✓

```
Transaction: $95,000 transfer from account with $500 balance

XGBoost Analysis:
├─ Pattern Match: Account Takeover (ATO)
├─ Risk Score: 0.92
└─ Flag: YES ✓

Random Forest Analysis:
├─ Unusual Balance Depletion: YES
├─ Risk Score: 0.89
└─ Flag: YES ✓

Isolation Forest Analysis:
├─ Behavioral Anomaly: Severe
├─ Score: -1 (ANOMALY)
└─ Normalized: 1.0 ✓

Ensemble Calculation:
├─ Final Risk = (0.92 × 0.4) + (0.89 × 0.4) + (1.0 × 0.2)
├─           = 0.368 + 0.356 + 0.200
├─           = 0.924
└─ Decision: FRAUD ✓✓✓ (All 3 models agree)

Action: 🚨 CRITICAL ALERT - Immediate investigation required
```

### Scenario 2: PARTIAL AGREEMENT ✓✓

```
Transaction: $5,200 transfer (potential structuring)

XGBoost Analysis:
├─ Just above $5k threshold
├─ Risk Score: 0.58
└─ Flag: YES ✓

Random Forest Analysis:
├─ Amount unusual but not extreme
├─ Risk Score: 0.42
└─ Flag: NO (< 0.5)

Isolation Forest Analysis:
├─ Amount pattern detected
├─ Score: -1 (ANOMALY)
└─ Normalized: 1.0 ✓

Ensemble Calculation:
├─ Final Risk = (0.58 × 0.4) + (0.42 × 0.4) + (1.0 × 0.2)
├─           = 0.232 + 0.168 + 0.200
├─           = 0.600
└─ Decision: FRAUD ✓ (Ensemble > 0.5)

Action: ⚠️  FLAG FOR REVIEW - 2/3 models flagged it
Confidence: MEDIUM - Analyst review recommended
```

### Scenario 3: SAFE TRANSACTION ✓

```
Transaction: $3,000 routine payment between known accounts

XGBoost Analysis:
├─ Normal transaction pattern
├─ Risk Score: 0.12
└─ Flag: NO

Random Forest Analysis:
├─ Within typical balance range
├─ Risk Score: 0.08
└─ Flag: NO

Isolation Forest Analysis:
├─ Normal behavior pattern
├─ Score: 1 (NORMAL)
└─ Normalized: 0.0

Ensemble Calculation:
├─ Final Risk = (0.12 × 0.4) + (0.08 × 0.4) + (0.0 × 0.2)
├─           = 0.048 + 0.032 + 0.000
├─           = 0.080
└─ Decision: SAFE ✓ (Ensemble < 0.5)

Action: ✓ CLEAR - No action required
Confidence: HIGH - All models agree it's legitimate
```

---

## Data Flow in Batch Upload

```
1. User uploads CSV via Frontend
                    ↓
2. Backend receives file (/upload-batch)
                    ↓
3. Parse CSV → Extract features (5 columns)
                    ↓
4. Run through 3 Models in Parallel:
   ├─ XGBoost.predict_proba() → [0.0-1.0]
   ├─ RandomForest.predict_proba() → [0.0-1.0]
   └─ IsoForest.predict() → [-1 or 1]
                    ↓
5. Normalize ISO scores to [0.0-1.0]
                    ↓
6. Calculate Ensemble Risk for Each Transaction
   └─ (xgb × 0.4) + (rf × 0.4) + (iso × 0.2)
                    ↓
7. Apply Threshold (> 0.5) → Binary Prediction
                    ↓
8. Generate Fraud Types (rule-based or SHAP)
                    ↓
9. Create Results DataFrame with All Scores
   ├─ XGB_Risk_Score
   ├─ RF_Risk_Score
   ├─ Ensemble_Risk_Score ← PRIMARY
   ├─ Ensemble_Prediction ← PRIMARY DECISION
   └─ Fraud_Type
                    ↓
10. Sort by Ensemble Score (descending)
                    ↓
11. Take Top 100 riskiest transactions
                    ↓
12. Calculate Statistics:
    ├─ total_scanned
    ├─ ensemble_flags
    ├─ unanimous_agreement (all 3 flagged it)
    └─ Other model counts
                    ↓
13. Return JSON Response to Frontend
                    ↓
14. Frontend displays results + allows analyst review
```

---

## Success Indicators

```
✅ System is Working Well When:

1. Ensemble_flags < XGB_flags
   └─ Fewer alerts = Better precision

2. Unanimous_agreement = 40-50% of ensemble_flags
   └─ Half agree on everything = Good confidence distribution

3. False alarm rate < 0.05%
   └─ Very few legitimate transactions flagged

4. Fraud catch rate > 75%
   └─ Most actual frauds caught

5. Ensemble scores spread across 0.0-1.0
   └─ Not all clustering at extremes

6. No NaN or error values in ensemble_risks
   └─ All calculations complete
```

---

**Architecture Status**: ✅ Production Ready  
**Last Updated**: January 16, 2026
