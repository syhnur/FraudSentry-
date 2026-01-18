# FraudSentry Dashboard - Quick Start Guide

## 🚀 Getting Started

### Step 1: Start the Backend Server

```bash
cd /Users/sy4hnur/Desktop/FraudSentry
/Users/sy4hnur/Desktop/FraudSentry/venv/bin/python main.py
```

**Expected Output:**
```
Loading models...
Models loaded!
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start the Frontend Server

In a **new terminal window**:
```bash
cd /Users/sy4hnur/Desktop/FraudSentry/frontend
npm run dev
```

**Expected Output:**
```
VITE v7.3.0  ready in 203 ms
➜  Local:   http://localhost:5174/
```

### Step 3: Open Dashboard

Navigate to: `http://localhost:5174/` in your browser

---

## 📊 Dashboard Overview

### New Components Added

#### 1. **Model Comparison Cards**
Located below the existing analytics grid, displays:
- ✅ XGBoost Model (Primary Detector)
  - AUC: 0.9986
  - Recall: 77.18%
  - Precision: 88.61%
  - F1 Score: 82.42%

- ✅ Random Forest (Precision Validator)
  - AUC: 0.9952
  - Recall: 72%
  - Precision: 85%
  - F1 Score: ~77%

- ✅ Isolation Forest (Anomaly Detector)
  - Approach: Unsupervised Learning
  - Recall: 82%
  - Precision: 65%

**Plus:**
- Ensemble formula visualization
- Model weights and roles
- Key insights about the detection system

#### 2. **Fraud Type Breakdown Chart**
Shows interactive distribution of fraud types:
- 📊 Toggle between Pie and Bar charts
- 🔄 Auto-updates every 30 seconds
- 📈 Displays statistics for:
  - Account Takeover (45%)
  - Mule Account (30%)
  - Structuring (15%)
  - Behavioral Anomaly (10%)

- 📖 Fraud Type Guide with explanations
- 🔄 Timestamp showing last update

---

## 🎨 Design Features

### Modern Aesthetic
- Clean white backgrounds
- Teal green accents (#0f766e)
- Smooth hover animations
- Professional card-based layout
- Trust-building color scheme

### Responsive Design
- **Desktop:** Full 3-column layout
- **Tablet:** Adaptive 2-column grid
- **Mobile:** Optimized single-column view
- **Touch:** Larger buttons and spacing

### Accessibility
- High contrast text
- Clear hierarchy
- Descriptive labels
- Loading states
- Error handling

---

## 📱 Using the Dashboard

### Viewing Model Metrics
1. Dashboard loads automatically
2. Scroll to **Model Comparison Cards** section
3. View all 3 models' performance metrics
4. Hover over cards for additional details
5. Check ensemble formula for risk calculation

### Checking Fraud Patterns
1. Find **Fraud Type Breakdown** section
2. Choose chart type (Pie or Bar)
3. View fraud distribution percentages
4. Read fraud type guide for explanations
5. Monitor auto-updates (refresh every 30 seconds)

### Uploading New Data
1. Click **Scan Detection Engine** in sidebar
2. Upload CSV file with transaction data
3. Review detection results
4. Fraud Type Breakdown updates automatically
5. New data reflected in stats within 30 seconds

---

## 🔧 Troubleshooting

### Dashboard Won't Load
**Problem:** Blank page or loading stuck  
**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running (check terminal)
3. Verify frontend is running (check other terminal)
4. Try refreshing page (Cmd+Shift+R to clear cache)
5. Check firewall/ports aren't blocked

### Charts Not Showing Data
**Problem:** "No fraud data available yet" message  
**Solution:**
1. This is normal if no batches have been uploaded yet
2. Upload a test CSV file through **Scan Detection Engine**
3. Charts will populate after upload completes
4. Check backend terminal for any errors
5. Verify `/fraud-type-stats` endpoint is working

### Components Not Styled
**Problem:** Components look plain without colors  
**Solution:**
1. Clear browser cache (Cmd+Shift+R)
2. Restart frontend server: `npm run dev`
3. Hard refresh page in browser
4. Check if App.css file was modified correctly
5. Look for CSS errors in browser DevTools

### Auto-Refresh Not Working
**Problem:** Fraud charts not updating every 30 seconds  
**Solution:**
1. Verify backend is still running
2. Check browser console for fetch errors
3. Verify API endpoint: `http://127.0.0.1:8000/fraud-type-stats`
4. Test endpoint manually: visit URL in new tab
5. Check network tab in browser DevTools (F12)

---

## 📋 Checking System Health

### Verify Backend is Running
```bash
curl http://127.0.0.1:8000/health
```
Should return: `{"database_status":"...", "ai_engine_status":"..."}`

### Verify Frontend is Running
```bash
curl http://localhost:5174/
```
Should return HTML content (dashboard page)

### Test Fraud Stats Endpoint
```bash
curl http://127.0.0.1:8000/fraud-type-stats
```
Should return JSON with fraud_types array

---

## 🧪 Testing the New Components

### Test Model Comparison Cards
1. ✅ Verify all 3 models display correctly
2. ✅ Check metrics are visible and readable
3. ✅ Click cards to see hover effect
4. ✅ View ensemble formula clearly
5. ✅ Read key insights section

### Test Fraud Type Breakdown
1. ✅ Upload a test CSV file
2. ✅ Wait 30 seconds for auto-refresh
3. ✅ Verify chart shows fraud distribution
4. ✅ Toggle between Pie and Bar charts
5. ✅ Click chart buttons smoothly transition
6. ✅ Verify percentages add to ~100%
7. ✅ Check update timestamp changes
8. ✅ Read fraud type guide section

### Test Responsiveness
1. ✅ Open on desktop (full width)
2. ✅ Resize browser to tablet width (768px)
3. ✅ Resize to mobile width (480px)
4. ✅ Verify layouts adapt correctly
5. ✅ Check buttons are touch-friendly

---

## 📚 File Locations

**Frontend Components:**
- `/frontend/src/ModelComparisonCards.jsx` - Model metrics display
- `/frontend/src/FraudTypeBreakdown.jsx` - Fraud chart component
- `/frontend/src/App.jsx` - Main app with integration
- `/frontend/src/App.css` - All styling (lines 1820-2480)

**Backend:**
- `/main.py` - FastAPI server with `/fraud-type-stats` endpoint
- `/fraud_history.db` - SQLite database with fraud history

**Documentation:**
- `DASHBOARD_IMPROVEMENTS.md` - Overview and summary
- `COMPONENT_REFERENCE.md` - Technical reference guide
- `QUICK_START.md` - This file

---

## 🎯 What's New

### Before
- Minimal dashboard with basic metrics
- Only basic model stats in one card
- No fraud type visualization
- Limited user education

### After
- Rich, modern dashboard design
- All 3 models displayed with comprehensive metrics
- Interactive fraud type breakdown chart
- Educational fraud type guide
- Auto-updating statistics
- Trust-building color scheme
- Fully responsive mobile design

---

## ✅ Checklist - Everything Working?

- [ ] Backend server running (terminal shows "Uvicorn running")
- [ ] Frontend server running (terminal shows "VITE ready")
- [ ] Dashboard loads at http://localhost:5174
- [ ] Model Comparison Cards visible below analytics grid
- [ ] Fraud Type Breakdown section visible
- [ ] Charts are styled with colors and proper layout
- [ ] Can toggle between Pie and Bar charts
- [ ] Upload button works in Detection Engine
- [ ] After upload, Fraud charts update
- [ ] All text is readable and professional
- [ ] Hover effects work on cards
- [ ] Mobile view works (resize browser)

---

## 🆘 Need Help?

### Check Logs
1. **Backend errors:** Look at python terminal output
2. **Frontend errors:** Open browser DevTools (F12) → Console
3. **Network issues:** DevTools → Network tab

### Review Files
1. Check component JSX in `/frontend/src/`
2. Review CSS in `/frontend/src/App.css`
3. Check backend code in `/main.py`

### Common Solutions
- Restart both servers (Ctrl+C, then run again)
- Clear browser cache (Cmd+Shift+R)
- Check file modifications were saved
- Verify no port conflicts (8000, 5174)

---

**Dashboard Version:** 1.0.0  
**Last Updated:** December 24, 2025  
**Status:** ✅ Production Ready
