"""
Application Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application Configuration"""
    
    # Model paths
    MODELS_DIR = os.path.join(os.path.dirname(__file__), '../../')
    RF_MODEL_PATH = os.path.join(MODELS_DIR, 'fraud_model.joblib')
    XGB_MODEL_PATH = os.path.join(MODELS_DIR, 'fraud_model_xgboost.joblib')
    ISO_MODEL_PATH = os.path.join(MODELS_DIR, 'isolation_forest.joblib')
    
    # Database
    DATABASE_URL = 'sqlite:///fraud_history.db'
    
    # API Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    API_TIMEOUT = 30
    
    # Fraud detection settings
    FRAUD_THRESHOLD = 0.5
    ENSEMBLE_WEIGHTS = {
        'xgboost': 0.40,
        'random_forest': 0.40,
        'isolation_forest': 0.20
    }
    
    # Feature columns
    FEATURE_COLUMNS = [
        'amount', 
        'oldbalanceOrg', 
        'newbalanceOrig', 
        'oldbalanceDest', 
        'newbalanceDest'
    ]
    
    # Flask configuration
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    @classmethod
    def verify_models(cls):
        """Verify that all required model files exist"""
        required_files = [
            cls.RF_MODEL_PATH,
            cls.XGB_MODEL_PATH,
            cls.ISO_MODEL_PATH
        ]
        
        missing_files = [f for f in required_files if not os.path.exists(f)]
        
        if missing_files:
            raise FileNotFoundError(f"Missing model files: {missing_files}")
        
        return True
