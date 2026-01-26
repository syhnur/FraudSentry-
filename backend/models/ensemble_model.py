"""
Ensemble Model - Combines three ML models for fraud detection
"""

import joblib
import numpy as np
from typing import Tuple

class EnsembleModel:
    """
    Ensemble Model for Fraud Detection
    Combines Random Forest, XGBoost, and Isolation Forest predictions
    """
    
    def __init__(self, rf_path: str, xgb_path: str, iso_path: str):
        """
        Initialize ensemble model with three pre-trained models
        
        Args:
            rf_path: Path to Random Forest model
            xgb_path: Path to XGBoost model
            iso_path: Path to Isolation Forest model
        """
        self.rf_model = joblib.load(rf_path)
        self.xgb_model = joblib.load(xgb_path)
        self.iso_model = joblib.load(iso_path)
        
        # Ensemble weights (40%, 40%, 20%)
        self.weights = {
            'xgb': 0.40,
            'rf': 0.40,
            'iso': 0.20
        }
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict fraud probability using ensemble voting
        
        Args:
            X: Feature matrix
            
        Returns:
            Tuple of (predictions, risk_scores)
        """
        # Get individual predictions
        rf_probs = self.rf_model.predict_proba(X)[:, 1]
        xgb_probs = self.xgb_model.predict_proba(X)[:, 1]
        iso_preds = self.iso_model.predict(X)
        iso_scores = np.array([1.0 if pred == -1 else 0.0 for pred in iso_preds])
        
        # Calculate weighted risk score
        risk_scores = (
            (xgb_probs * self.weights['xgb']) +
            (rf_probs * self.weights['rf']) +
            (iso_scores * self.weights['iso'])
        )
        
        # Apply threshold (0.5)
        predictions = (risk_scores > 0.5).astype(int)
        
        return predictions, risk_scores
    
    def get_model_predictions(self, X: np.ndarray) -> dict:
        """
        Get individual model predictions for transparency
        
        Args:
            X: Feature matrix
            
        Returns:
            Dictionary with individual model predictions
        """
        rf_probs = self.rf_model.predict_proba(X)[:, 1]
        xgb_probs = self.xgb_model.predict_proba(X)[:, 1]
        iso_preds = self.iso_model.predict(X)
        iso_scores = np.array([1.0 if pred == -1 else 0.0 for pred in iso_preds])
        
        return {
            'random_forest': rf_probs,
            'xgboost': xgb_probs,
            'isolation_forest': iso_scores
        }
