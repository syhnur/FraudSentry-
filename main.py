
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import shap
import io
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import sqlite3
from datetime import datetime
from fpdf import FPDF
from fastapi.responses import FileResponse
from typing import List


# 1. Initialize App
load_dotenv() # Load environment variables from .env file
app = FastAPI(title="FraudSentry API")

# ... app = FastAPI(...)

# INITIALIZE DATABASE
def init_db():
    conn = sqlite3.connect('fraud_history.db')
    c = conn.cursor()
    # Create table if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_date TEXT,
            filename TEXT,
            total_scanned INTEGER,
            fraud_found_xgb INTEGER,
            fraud_found_rf INTEGER
        )
    ''')
    conn.commit()
    conn.close()

init_db() # <--- Run this immediately when app starts

# CONFIGURING GEMINI
api_key = os.getenv("GEMINI_API_KEY") # <--- SECURELY READS THE KEY
if not api_key:
    raise ValueError("No API key found. Please check your .env file.")

genai.configure(api_key=api_key)

# CHANGED TO GEMINI 2.5 FLASH (Faster & Cheaper)
model = genai.GenerativeModel('gemini-2.5-flash')
# 2. CORS (So React can talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load Models
print("Loading models...")
rf_model = joblib.load('fraud_model.joblib')
xgb_model = joblib.load('fraud_model_xgboost.joblib')
print("Models loaded!")

# 4. Prepare SHAP (The Explainer)
explainer = shap.TreeExplainer(xgb_model)

class Transaction(BaseModel):
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float

@app.post("/predict")
def predict_fraud(transaction: Transaction, model_type: str = "RF"):
    # Create DataFrame
    data = [[
        transaction.amount, 
        transaction.oldbalanceOrg, 
        transaction.newbalanceOrig, 
        transaction.oldbalanceDest, 
        transaction.newbalanceDest
    ]]
    columns = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    df = pd.DataFrame(data, columns=columns)

    # Prediction
    if model_type == "XGB":
        prediction = xgb_model.predict(df)[0]
        probability = xgb_model.predict_proba(df)[0][1]
    else:
        prediction = rf_model.predict(df)[0]
        probability = rf_model.predict_proba(df)[0][1]

    # --- SHAP EXPLANATION (The "Why") ---
    shap_values = explainer.shap_values(df)
    
    # Organize the explanation
    feature_importance = list(zip(columns, shap_values[0]))
    feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
    
    # Format for Frontend
    top_factors = [
        {"feature": name, "impact": float(score)} 
        for name, score in feature_importance
    ]

    # --- ASK GEMINI FOR A SUMMARY ---
    gemini_response = "Analysis not available."
    
    # We only ask Gemini if the prediction is FRAUD (1)
    if prediction == 1:
        try:
            # We convert the top factors to a string for the prompt
            factors_str = ", ".join([f"{f['feature']}: {f['impact']:.2f}" for f in top_factors[:3]])

            prompt = f"""
            You are a friendly fraud analyst explaining a risky transaction to a bank manager.
            
            Key Risk Factors (SHAP Impact Values): {factors_str}
            (Note: Higher positive values mean more likely fraud. Negative values reduce fraud likelihood.)
            
            Please explain in simple, easy-to-understand language:
            
            1. **What's happening?** Describe the suspicious behavior pattern in simple terms (avoid jargon). For example: Is the account being drained? Are there unusual transfer patterns? Is the account doing something it normally doesn't?
            
            2. **Why is this risky?** Explain in 1-2 sentences how this pattern indicates potential fraud. You can briefly mention how the risk factors (account balance changes, transaction amount) contribute to the fraud probability.
            
            3. **What should we do?** Give a clear, actionable next step (e.g., "Contact the customer immediately to verify", "Flag for manual review", "Freeze account temporarily").
            
            Keep your response under 150 words. Use simple, direct language that anyone can understand. Avoid technical terms like "SHAP" or "machine learning" - just explain what the data shows.
            """
            
            response = model.generate_content(prompt)
            gemini_response = response.text
        except Exception as e:
            gemini_response = f"AI Error: {str(e)}"    # This return MUST be indented inside the function!
    return {
        "is_fraud": int(prediction),
        "risk_score": float(probability),
        "model_used": model_type,
        "message": "Transaction flagged as suspicious!" if prediction == 1 else "Transaction appears safe.",
        "explanation": top_factors,
        "ai_analysis": gemini_response
    }

# ... (After your single /predict function) ...

@app.post("/upload-batch")
async def upload_batch(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    feature_cols = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    if not all(col in df.columns for col in feature_cols):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {feature_cols}")

    # 1. Predict with BOTH models
    input_data = df[feature_cols]
    
    rf_preds = rf_model.predict(input_data)      
    rf_probs = rf_model.predict_proba(input_data)[:, 1]
    
    xgb_preds = xgb_model.predict(input_data)    
    xgb_probs = xgb_model.predict_proba(input_data)[:, 1]

    # 2. Calculate Stats (The Fix is Here!)
    total_tx = len(df)
    rf_count = int(sum(rf_preds))
    xgb_count = int(sum(xgb_preds))
    
    # Calculate Agreement (Both models said "1")
    agreement_count = sum([1 for r, x in zip(rf_preds, xgb_preds) if r == 1 and x == 1])

    comparison_stats = {
        "total_scanned": total_tx,
        "rf_flags": rf_count,
        "xgb_flags": xgb_count,
        "both_agreed": agreement_count
    }

    # 3. Prepare Table Data
    df['RF_Prediction'] = rf_preds
    df['RF_Risk_Score'] = rf_probs
    df['XGB_Prediction'] = xgb_preds
    df['XGB_Risk_Score'] = xgb_probs 
    
    # Sort by XGB score
    df_sorted = df.sort_values(by='XGB_Risk_Score', ascending=False).head(100)
    results = df_sorted.to_dict(orient="records")

    # RETURN "stats", NOT "metrics"
    return {
        "stats": comparison_stats, 
        "top_risky_transactions": results
    }
# --- DEFINE THE DATA STRUCTURE ---
class ReportRequest(BaseModel):
    filename: str
    total: int
    xgb_fraud: int
    rf_fraud: int
    confirmed_frauds: List[dict]
    false_alarms: List[dict]

# --- THE FIXED ENDPOINT ---
@app.post("/save-report")
async def save_report(request: ReportRequest):
    # 1. SAVE TO DATABASE
    conn = sqlite3.connect('fraud_history.db')
    c = conn.cursor()
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    c.execute("INSERT INTO history (scan_date, filename, total_scanned, fraud_found_xgb, fraud_found_rf) VALUES (?, ?, ?, ?, ?)",
              (date_str, request.filename, request.total, request.xgb_fraud, request.rf_fraud))
    conn.commit()
    conn.close()

    # 2. GENERATE PROFESSIONAL PDF REPORT
    pdf = FPDF()
    pdf.add_page()
    pdf.set_left_margin(10)
    pdf.set_right_margin(10)
    pdf.set_font("Arial", size=11)
    
    # --- HEADER WITH DATE ---
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(190, 10, txt="FraudSentry Audit Report", ln=True, align='C')
    
    # Date at top
    pdf.set_font("Arial", size=9)
    date_formatted = datetime.now().strftime("%A, %d %b %Y")  # e.g., "Thursday, 18 Dec 2025"
    pdf.cell(190, 6, txt=date_formatted, ln=True, align='C')
    pdf.ln(3)
    
    # --- SUMMARY BOX - COMPACT ---
    pdf.set_font("Arial", 'B', 10)
    pdf.set_fill_color(200, 220, 240)  # Light blue background
    pdf.cell(190, 7, txt="SCAN SUMMARY", ln=True, align='L', fill=True, border=1)
    
    pdf.set_font("Arial", size=9)
    pdf.set_fill_color(245, 245, 245)  # Light gray background
    confirmed_count = len(request.confirmed_frauds)
    pdf.cell(190, 6, txt=f"  Confirmed Frauds: {confirmed_count}  |  Total Scanned: {request.total}  |  File: {request.filename[:25]}", ln=True, fill=True, border=1)
    pdf.ln(4)
    
    # --- TABLE 1: CONFIRMED FRAUDS (RED TITLE) ---
    if request.confirmed_frauds:
        pdf.set_font("Arial", 'B', 12)
        pdf.set_text_color(220, 20, 20)  # Red color
        pdf.cell(200, 10, txt="TABLE 1: CONFIRMED FRAUD TRANSACTIONS", ln=True)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        
        # Table headers - optimized column widths
        pdf.set_font("Arial", 'B', 8)
        pdf.set_fill_color(220, 20, 20)  # Red background
        pdf.set_text_color(255, 255, 255)  # White text
        
        col_widths = [20, 20, 18, 22, 30]  # Tighter widths, reduced Reason column
        headers = ["Amount", "Sender Bal", "Risk", "Status", "Reason"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 7, txt=header, border=1, align='C', fill=True)
        pdf.ln()
        
        # Table rows
        pdf.set_font("Arial", size=7)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.set_fill_color(255, 240, 240)  # Light red background
        
        for row in request.confirmed_frauds[:20]:
            amount = f"${row.get('amount', 0):.0f}"
            sender_bal = f"${row.get('oldbalanceOrg', 0):.0f}"
            risk_score = f"{row.get('XGB_Risk_Score', 0):.2f}"
            status = "HIGH PRIORITY" if row.get('RF_Prediction') == 1 else "WARNING"
            reason = generate_fraud_reason(row)[:15]  # Truncate to 15 chars
            
            pdf.cell(col_widths[0], 6, txt=amount, border=1, fill=True, align='R')
            pdf.cell(col_widths[1], 6, txt=sender_bal, border=1, fill=True, align='R')
            pdf.cell(col_widths[2], 6, txt=risk_score, border=1, fill=True, align='C')
            pdf.cell(col_widths[3], 6, txt=status, border=1, fill=True, align='C')
            pdf.cell(col_widths[4], 6, txt=reason, border=1, fill=True, align='L')
            pdf.ln()
        
        pdf.ln(4)
    
    # --- TABLE 2: FALSE ALARMS (ORANGE TITLE) ---
    if request.false_alarms:
        pdf.set_font("Arial", 'B', 12)
        pdf.set_text_color(245, 130, 0)  # Orange color
        pdf.cell(200, 10, txt="TABLE 2: FALSE ALARM CANDIDATES (ANALYST REVIEWED)", ln=True)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        
        # Table headers - optimized column widths
        pdf.set_font("Arial", 'B', 8)
        pdf.set_fill_color(245, 130, 0)  # Orange background
        pdf.set_text_color(255, 255, 255)  # White text
        
        col_widths = [20, 20, 18, 18, 34]  # Tighter widths
        headers = ["Amount", "Sender Bal", "Risk", "XGB", "Analyst Notes"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 7, txt=header, border=1, align='C', fill=True)
        pdf.ln()
        
        # Table rows
        pdf.set_font("Arial", size=7)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.set_fill_color(255, 250, 240)  # Light orange background
        
        for row in request.false_alarms[:20]:
            amount = f"${row.get('amount', 0):.0f}"
            sender_bal = f"${row.get('oldbalanceOrg', 0):.0f}"
            risk_score = f"{row.get('XGB_Risk_Score', 0):.2f}"
            xgb_flag = "Yes" if row.get('XGB_Prediction') == 1 else "No"
            notes = "Reviewed & Cleared"
            
            pdf.cell(col_widths[0], 6, txt=amount, border=1, fill=True, align='R')
            pdf.cell(col_widths[1], 6, txt=sender_bal, border=1, fill=True, align='R')
            pdf.cell(col_widths[2], 6, txt=risk_score, border=1, fill=True, align='C')
            pdf.cell(col_widths[3], 6, txt=xgb_flag, border=1, fill=True, align='C')
            pdf.cell(col_widths[4], 6, txt=notes, border=1, fill=True, align='L')
            pdf.ln()
        
        pdf.ln(4)
    
    # --- FOOTER ---
    pdf.set_font("Arial", 'I', 8)
    pdf.set_text_color(128, 128, 128)
    pdf.ln(10)
    pdf.cell(190, 6, txt="Generated by FraudSentry - Intelligent Fraud Detection System", ln=True, align='C')
    pdf.cell(190, 4, txt=f"Report ID: {timestamp}  |  Status: AUDIT REPORT", ln=True, align='C')
    
    # Save PDF
    report_filename = f"FraudSentry_Report_{timestamp}.pdf"
    pdf.output(report_filename)
    
    return FileResponse(report_filename, media_type='application/pdf', filename=report_filename)


def generate_fraud_reason(row):
    """Generate a user-friendly fraud reason based on transaction patterns"""
    reasons = []
    
    # Check for account draining (high amount, low remaining balance)
    if row.get('amount', 0) > 50000:
        new_balance = row.get('newbalanceOrig', 0)
        if new_balance < 1000:
            return "Account Draining"
    
    # Check for rapid transfers (high balance change)
    balance_change = abs(row.get('newbalanceOrig', 0) - row.get('oldbalanceOrg', 0))
    if balance_change > 100000:
        return "Rapid Transfer"
    
    # Check for unusual patterns (receiver balance spike)
    dest_balance_change = abs(row.get('newbalanceDest', 0) - row.get('oldbalanceDest', 0))
    if dest_balance_change > 150000:
        return "Unusual Recipient"
    
    # Check for structuring (multiple moderate transfers)
    if 10000 < row.get('amount', 0) < 50000:
        if row.get('oldbalanceOrg', 0) > row.get('newbalanceOrig', 0):
            return "Structuring Pattern"
    
    # Default reason
    return "Anomalous Activity"
    # --- GET HISTORY ENDPOINT ---
@app.get("/history")
async def get_history():
    conn = sqlite3.connect('fraud_history.db')
    conn.row_factory = sqlite3.Row # Allows accessing columns by name
    c = conn.cursor()
    
    # Fetch all records, newest first
    c.execute("SELECT * FROM history ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    
    return rows
    # --- DASHBOARD STATS ENDPOINT ---
@app.get("/dashboard-stats")
async def get_dashboard_stats():
    conn = sqlite3.connect('fraud_history.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # 1. Basic Counts
    c.execute("SELECT COUNT(*) FROM history")
    row = c.fetchone()
    total_scans = row[0] if row else 0
    
    c.execute("SELECT SUM(total_scanned) FROM history")
    row = c.fetchone()
    total_tx = row[0] if row and row[0] else 0
    
    c.execute("SELECT SUM(fraud_found_xgb) FROM history")
    row = c.fetchone()
    total_fraud = row[0] if row and row[0] else 0
    
    # 2. Graph Data: Group by Date (Take the last 7 scans/entries)
    c.execute("SELECT scan_date, fraud_found_xgb, fraud_found_rf FROM history ORDER BY id DESC LIMIT 7")
    rows = c.fetchall()
    
    # Convert to list of dicts and reverse (so it goes Old -> New)
    graph_data = []
    for row in rows:
        # Simplify date to just the YYYY-MM-DD part
        short_date = row['scan_date'].split(' ')[0] 
        graph_data.append({
            "name": short_date,
            "XGBoost": row['fraud_found_xgb'],
            "RandomForest": row['fraud_found_rf']
        })
    
    conn.close()
    
    return {
        "total_scans": total_scans,
        "total_tx": total_tx,
        "total_fraud": total_fraud,
        "trend_data": graph_data[::-1] # Reverse so graph reads left-to-right
    }