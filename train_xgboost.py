import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# 1. LOAD AND PREP (Same as before)
print("Loading dataset...")
df = pd.read_csv('dataset/datasetkaggle.csv')

print("Filtering data...")
df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])]

X = df[['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']]
y = df['isFraud']

# 2. CALCULATE THE WEIGHT
# XGBoost doesn't automatically handle imbalance like Random Forest's "class_weight='balanced'".
# We have to calculate the ratio manually.
# Formula: Number of Legit Transactions / Number of Fraud Transactions
count_legit = (y == 0).sum()
count_fraud = (y == 1).sum()
ratio = count_legit / count_fraud
print(f"Legit/Fraud Ratio: {ratio:.2f}") 
# This tells the model: "Every 1 fraud is as important as X legit transactions."

# 3. SPLIT
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 4. TRAIN XGBOOST
print("Training XGBoost... (This is usually faster than Random Forest)")
# scale_pos_weight=ratio is the Magic Sauce here.
model = XGBClassifier(
    scale_pos_weight=ratio, 
    n_estimators=100, 
    max_depth=6, 
    learning_rate=0.1, 
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# 5. EVALUATE
print("Evaluating model...")
predictions = model.predict(X_test)

print("\n--- XGBoost Performance Report ---")
print(classification_report(y_test, predictions))

print("\n--- Confusion Matrix ---")
cm = confusion_matrix(y_test, predictions)
print(f"Legit Transactions Correctly Passed: {cm[0][0]}")
print(f"Legit Transactions Falsely Blocked:  {cm[0][1]}")
print(f"Fraud Transactions Missed (DANGER):  {cm[1][0]}")
print(f"Fraud Transactions Caught (SUCCESS): {cm[1][1]}")

# 6. SAVE
joblib.dump(model, 'fraud_model_xgboost.joblib')
print("Model saved as 'fraud_model_xgboost.joblib'!")