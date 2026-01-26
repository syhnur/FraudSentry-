"""
Fraud Detector - Main fraud detection model
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple, List

class FraudDetector:
    """
    Main Fraud Detection Engine
    Handles data preprocessing and fraud detection logic
    """
    
    # Feature columns
    FEATURES = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                'oldbalanceDest', 'newbalanceDest']
    
    # Threshold for fraud classification
    FRAUD_THRESHOLD = 0.5
    
    def __init__(self, ensemble_model):
        """
        Initialize Fraud Detector
        
        Args:
            ensemble_model: EnsembleModel instance for predictions
        """
        self.ensemble_model = ensemble_model
    
    def preprocess_transaction(self, transaction: Dict) -> pd.DataFrame:
        """
        Preprocess a single transaction
        
        Args:
            transaction: Dictionary with transaction data
            
        Returns:
            Preprocessed DataFrame
        """
        # Create DataFrame with required features
        df = pd.DataFrame([transaction])
        df = df[self.FEATURES]
        
        # Handle missing values
        df = df.fillna(0)
        
        return df
    
    def analyze_transaction(self, transaction: Dict) -> Dict:
        """
        Analyze a single transaction for fraud
        
        Args:
            transaction: Dictionary with transaction data
            
        Returns:
            Dictionary with analysis results
        """
        # Preprocess
        X = self.preprocess_transaction(transaction)
        
        # Get ensemble prediction
        predictions, risk_scores = self.ensemble_model.predict(X.values)
        
        # Get individual model predictions
        model_preds = self.ensemble_model.get_model_predictions(X.values)
        
        # Determine verdict
        is_fraud = predictions[0] == 1
        risk_score = risk_scores[0]
        
        return {
            'is_fraud': bool(is_fraud),
            'risk_score': float(risk_score),
            'risk_percentage': float(risk_score * 100),
            'threshold': self.FRAUD_THRESHOLD,
            'decision': 'FRAUD' if is_fraud else 'LEGITIMATE',
            'confidence': float(abs(risk_score - 0.5) * 2 * 100),  # 0-100%
            'model_predictions': {
                'random_forest': float(model_preds['random_forest'][0]),
                'xgboost': float(model_preds['xgboost'][0]),
                'isolation_forest': float(model_preds['isolation_forest'][0])
            }
        }
    
    def batch_analyze(self, transactions: List[Dict]) -> List[Dict]:
        """
        Analyze multiple transactions
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            List of analysis results
        """
        results = []
        for transaction in transactions:
            result = self.analyze_transaction(transaction)
            results.append(result)
        return results
