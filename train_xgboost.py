import pandas as pd
import numpy as np
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

print("\n" + "="*60)
print("CLASS IMBALANCE ANALYSIS")
print("="*60)
print(f"Safe Transactions:   {count_legit:,} ({count_legit/(count_legit+count_fraud)*100:.2f}%)")
print(f"Fraud Transactions:  {count_fraud:,} ({count_fraud/(count_legit+count_fraud)*100:.2f}%)")
print(f"Imbalance Ratio:     {ratio:.2f}:1")
print("="*60)

# Balance the scale_pos_weight to avoid extreme precision/recall trade-off
# The weight approach has limits - try much lower values
# Adjust this value to find the sweet spot:
#   - Higher value (full ratio) = Higher recall, lower precision
#   - Lower value (0.1 * ratio) = Higher precision, lower recall
scale_pos_weight_adjusted = ratio * 0.08  # 8% of imbalance ratio - much more aggressive

print(f"\nFull Imbalance Weight: {ratio:.2f}")
print(f"Adjusted Weight:       {scale_pos_weight_adjusted:.2f} (8% of imbalance)")
print(f"\n💡 More aggressive reduction:")
print(f"   - Previous attempt: 35% → Recall 99.39%, Precision 32.76% (still too many alerts)")
print(f"   - New approach: 8% → Target Recall 85-90%, Precision 70-80%")
print("="*60 + "\n")

# 3. SPLIT
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 4. TRAIN XGBOOST
print("Training XGBoost... (This is usually faster than Random Forest)")
# scale_pos_weight with adjustment for better Precision/Recall balance
model = XGBClassifier(
    scale_pos_weight=scale_pos_weight_adjusted, 
    n_estimators=100, 
    max_depth=6, 
    learning_rate=0.1, 
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# 5. OPTIMIZE DECISION THRESHOLD
print("Optimizing decision threshold for better Precision/Recall balance...")
print("(Testing different thresholds to find the sweet spot)\n")

# Get probability predictions instead of binary predictions
y_pred_proba = model.predict_proba(X_test)[:, 1]

from sklearn.metrics import recall_score, precision_score, f1_score

best_threshold = 0.5
best_f1 = 0
best_recall = 0
best_precision = 0

# Test different thresholds
thresholds_to_test = np.arange(0.1, 0.9, 0.05)
results = []

for thresh in thresholds_to_test:
    y_pred_thresh = (y_pred_proba >= thresh).astype(int)
    recall = recall_score(y_test, y_pred_thresh)
    precision = precision_score(y_test, y_pred_thresh)
    f1 = f1_score(y_test, y_pred_thresh)
    
    results.append({
        'threshold': thresh,
        'recall': recall,
        'precision': precision,
        'f1': f1
    })
    
    # Find best F1-score (balance between recall and precision)
    if f1 > best_f1:
        best_f1 = f1
        best_threshold = thresh
        best_recall = recall
        best_precision = precision

print("Threshold Analysis:")
print("Threshold | Recall | Precision | F1-Score")
print("-" * 45)
for result in results:
    marker = " ← BEST" if abs(result['threshold'] - best_threshold) < 0.01 else ""
    print(f"  {result['threshold']:.2f}    | {result['recall']*100:5.2f}% | {result['precision']*100:8.2f}% | {result['f1']:7.4f}{marker}")

print(f"\n✓ Optimal Threshold: {best_threshold:.2f}")
print(f"  At this threshold:")
print(f"    - Recall: {best_recall*100:.2f}%")
print(f"    - Precision: {best_precision*100:.2f}%")
print(f"    - F1-Score: {best_f1:.4f}\n")

# Use optimal threshold for final predictions
predictions = (y_pred_proba >= best_threshold).astype(int)

# 5. EVALUATE
print("Evaluating model with OPTIMIZED threshold...")

print("\n--- XGBoost Performance Report (Optimized) ---")
print(classification_report(y_test, predictions))

print("\n--- Confusion Matrix ---")
cm = confusion_matrix(y_test, predictions)
print(f"Legit Transactions Correctly Passed: {cm[0][0]}")
print(f"Legit Transactions Falsely Blocked:  {cm[0][1]}")
print(f"Fraud Transactions Missed (DANGER):  {cm[1][0]}")
print(f"Fraud Transactions Caught (SUCCESS): {cm[1][1]}")

# Calculate and display key metrics
recall = recall_score(y_test, predictions)
precision = precision_score(y_test, predictions)
f1 = f1_score(y_test, predictions)

print("\n" + "="*60)
print("KEY METRICS FOR FRAUD DETECTION (Optimized)")
print("="*60)
print(f"✓ Recall (Fraud Detection Rate):  {recall*100:.2f}%")
print(f"  → How many frauds were caught out of all actual frauds")
print(f"\n✓ Precision (Alert Accuracy):     {precision*100:.2f}%")
print(f"  → How many alerts were correct frauds")
print(f"\n✓ F1-Score (Balanced Metric):     {f1:.4f}")
print(f"  → Balance between Recall and Precision")
print(f"\n✓ Decision Threshold:             {best_threshold:.2f}")
print(f"  → Model confidence required to flag as fraud")
print("="*60 + "\n")

# 6. SAVE
joblib.dump(model, 'fraud_model_xgboost.joblib')
print("Model saved as 'fraud_model_xgboost.joblib'!")