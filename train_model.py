import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# 1. LOAD THE DATA
# We use Pandas to read the big CSV file.
print("Loading dataset... this might take a few seconds.")
# Make sure the filename matches exactly what is in your dataset folder!
df = pd.read_csv('dataset/datasetkaggle.csv')

# 2. PRE-PROCESSING (Cleaning)
# We need to filter the data. In PaySim, fraud only happens in 'TRANSFER' and 'CASH_OUT'.
# We drop other types to make the model sharper and faster.
print("Filtering data...")
df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])]

# The model only understands numbers, not words like 'PAYMENT'.
# So we drop columns that are text or IDs (like nameOrig) because they confuse the model.
# We are keeping: amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest
X = df[['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']]
y = df['isFraud']  # This is the "Answer Key" (0 = Legit, 1 = Fraud)

# 3. SPLITTING THE DATA
# We split the data: 80% for the model to study (Train), 20% for the 'Exam' (Test).
# stratify=y ensures we have a fair mix of fraud cases in both sets.
print("Splitting data into Training and Testing sets...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 4. TRAINING THE MODEL (The Learning Phase)
# We create the Random Forest.
# class_weight='balanced' is CRUCIAL. It tells the model:
# "Pay extra attention to Fraud (1) because it is rare!"
print("Training the Random Forest model... (Go grab a coffee, this takes a minute)")
model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 5. EVALUATION (The Exam Results)
print("Evaluating model performance...")
predictions = model.predict(X_test)

# This prints the Precision, Recall, and F1-Score
print("\n--- Model Performance Report ---")
print(classification_report(y_test, predictions))

# 6. SAVE THE BRAIN
# We save the trained model into a file so your Web App can use it later.
joblib.dump(model, 'fraud_model.joblib')
print("Model saved as 'fraud_model.joblib'!")

# Add this at the bottom of your script
print("\n--- Confusion Matrix (The Exact Counts) ---")
cm = confusion_matrix(y_test, predictions)
print(f"Legit Transactions Correctly Passed: {cm[0][0]}")
print(f"Legit Transactions Falsely Blocked:  {cm[0][1]}")
print(f"Fraud Transactions Missed (DANGER):  {cm[1][0]}")
print(f"Fraud Transactions Caught (SUCCESS): {cm[1][1]}")