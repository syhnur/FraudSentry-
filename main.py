from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import shap
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# 1. Initialize App
load_dotenv() # Load environment variables from .env file
app = FastAPI(title="FraudSentry API")

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
            prompt = f"""
            You are a fraud analyst at a bank. A transaction was flagged as High Risk (Fraud).
            Here are the top technical factors contributing to this risk (SHAP values):
            {top_factors[:3]} 
            
            (Note: Positive impact means it pushed the risk score UP. Negative means it pushed it DOWN).
            
            Write a clear, 2-sentence explanation for a non-technical bank manager explaining why this is suspicious.
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