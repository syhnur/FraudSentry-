import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

# === 1. SETUP: CHANGE THIS TO YOUR DATA FILE NAME ===
DATA_FILE = "dataset/datasetkaggle.csv" # <--- MAKE SURE THIS MATCHES YOUR CSV NAME
# ===================================================

try:
    print("⏳ Loading data (this might take a moment)...")
    df = pd.read_csv(DATA_FILE)
    
    # Use the same columns you used for training
    X = df[['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']]
    y = df['isFraud']

    # Split (Standard 80/20 split usually)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("✅ Data loaded. Testing models now...")

    # --- TEST RANDOM FOREST ---
    rf_model = joblib.load('fraud_model.joblib')
    rf_preds = rf_model.predict(X_test)
    
    print("\n🌲 RANDOM FOREST RESULTS:")
    print(f"Accuracy:  {accuracy_score(y_test, rf_preds)*100:.2f}%")
    print(f"Precision: {precision_score(y_test, rf_preds)*100:.2f}%")
    print(f"Recall:    {recall_score(y_test, rf_preds)*100:.2f}%")

    # --- TEST XGBOOST ---
    xgb_model = joblib.load('fraud_model_xgboost.joblib')
    xgb_preds = xgb_model.predict(X_test)
    
    print("\n🚀 XGBOOST RESULTS:")
    print(f"Accuracy:  {accuracy_score(y_test, xgb_preds)*100:.2f}%")
    print(f"Precision: {precision_score(y_test, xgb_preds)*100:.2f}%")
    print(f"Recall:    {recall_score(y_test, xgb_preds)*100:.2f}%")

except FileNotFoundError:
    print("❌ Error: Could not find your dataset CSV file.")
    print("Please make sure the big csv file is in this folder and check the name in line 6.")