from http.client import HTTPException
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
            You are a Senior Fraud Analyst at a major bank. A transaction has been flagged as HIGH RISK.
            
            Technical Indicators (SHAP values): {factors_str}
            
            Based on these indicators, provide a structured response in plain English:
            1. **Suspicious Pattern:** Briefly explain what behavior this looks like (e.g., "Account draining," "Structuring," "Rapid transfer").
            2. **Recommended Action:** What should the bank manager do immediately? (e.g., "Call customer," "Freeze account").
            
            Keep it under 3 sentences. Be direct and professional.
            """
            
            response = model.generate_content(prompt)
            gemini_response = response.text
        except Exception as e:
            gemini_response = f"AI Error: {str(e)}"

    # This return MUST be indented inside the function!
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
    top_frauds: List[dict]

# --- THE FIXED ENDPOINT ---
@app.post("/save-report")
async def save_report(request: ReportRequest):
    # 1. SAVE TO DATABASE
    conn = sqlite3.connect('fraud_history.db')
    c = conn.cursor()
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # We access data using request.variable_name
    c.execute("INSERT INTO history (scan_date, filename, total_scanned, fraud_found_xgb, fraud_found_rf) VALUES (?, ?, ?, ?, ?)",
              (date_str, request.filename, request.total, request.xgb_fraud, request.rf_fraud))
    conn.commit()
    conn.close()

    # 2. GENERATE PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Title
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="FraudSentry Audit Report", ln=True, align='C')
    pdf.ln(10)
    
    # Summary Section
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Scan Date: {date_str}", ln=True)
    pdf.cell(200, 10, txt=f"File Name: {request.filename}", ln=True)
    pdf.cell(200, 10, txt=f"Total Transactions Scanned: {request.total}", ln=True)
    pdf.cell(200, 10, txt=f"High Risk Detected (XGB): {request.xgb_fraud}", ln=True)
    
    pdf.ln(10)
    
    # Table of Top Risks
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, txt="Top High-Risk Transactions Detected:", ln=True)
    
    pdf.set_font("Arial", size=10)
    # Header
    pdf.cell(40, 10, "Amount ($)", 1)
    pdf.cell(50, 10, "Sender Bal", 1)
    pdf.cell(30, 10, "Risk Score", 1)
    pdf.ln()
    
    # Rows (Loop through the list inside the request)
    for row in request.top_frauds[:10]: 
        pdf.cell(40, 10, str(row['amount']), 1)
        pdf.cell(50, 10, str(row['oldbalanceOrg']), 1)
        # Handle cases where Risk Score might be missing or 0
        score = row.get('XGB_Risk_Score', 0)
        pdf.cell(30, 10, f"{score:.2f}", 1)
        pdf.ln()

    # Save PDF
    report_filename = f"report_{date_str.replace(':', '-').replace(' ', '_')}.pdf"
    pdf.output(report_filename)
    
    return FileResponse(report_filename, media_type='application/pdf', filename=report_filename)