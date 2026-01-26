"""
FraudSentry Backend API
Main Flask application
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from config import Config
from models import EnsembleModel, FraudDetector
from controllers import FraudController
from utils import setup_logger, DataProcessor

# Setup logger
logger = setup_logger('fraudsentry_api', 'logs/api.log')

# Create Flask app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# Initialize models and controllers
try:
    logger.info("Loading ML models...")
    ensemble = EnsembleModel(
        Config.RF_MODEL_PATH,
        Config.XGB_MODEL_PATH,
        Config.ISO_MODEL_PATH
    )
    fraud_detector = FraudDetector(ensemble)
    fraud_controller = FraudController(fraud_detector)
    logger.info("✓ Models loaded successfully")
except Exception as e:
    logger.error(f"✗ Failed to load models: {str(e)}")
    sys.exit(1)


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'FraudSentry API',
        'version': '1.0.0'
    }), 200


# ============================================================================
# FRAUD DETECTION API
# ============================================================================

@app.route('/api/analyze', methods=['POST'])
def analyze_transaction():
    """
    Analyze a single transaction for fraud
    
    Request body:
    {
        "amount": 1000,
        "oldbalanceOrg": 5000,
        "newbalanceOrig": 4000,
        "oldbalanceDest": 0,
        "newbalanceDest": 1000,
        "type": "TRANSFER"
    }
    """
    try:
        transaction = request.get_json()
        
        if not transaction:
            return jsonify({'error': 'No transaction data provided'}), 400
        
        # Validate transaction
        is_valid, error_msg = DataProcessor.validate_transaction(
            transaction,
            Config.FEATURE_COLUMNS
        )
        
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Normalize
        transaction = DataProcessor.normalize_transaction(transaction)
        
        # Analyze
        result = fraud_controller.analyze_fraud(transaction)
        
        logger.info(f"Analyzed transaction - Risk: {result['risk_percentage']:.2f}%, "
                   f"Decision: {result['decision']}")
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error analyzing transaction: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple transactions
    
    Request body:
    {
        "transactions": [
            {...transaction1...},
            {...transaction2...}
        ]
    }
    """
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({'error': 'No transactions provided'}), 400
        
        if len(transactions) > 1000:
            return jsonify({'error': 'Maximum 1000 transactions per request'}), 400
        
        # Analyze
        results = fraud_controller.batch_analyze_fraud(transactions)
        
        # Get statistics
        stats = fraud_controller.get_statistics(results)
        
        logger.info(f"Batch analyzed {len(results)} transactions - "
                   f"{stats['fraud_detected']} fraud detected")
        
        return jsonify({
            'results': results,
            'statistics': stats
        }), 200
    
    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    return jsonify({
        'ensemble': {
            'weights': Config.ENSEMBLE_WEIGHTS,
            'threshold': Config.FRAUD_THRESHOLD,
            'models': ['Random Forest', 'XGBoost', 'Isolation Forest']
        },
        'feature_columns': Config.FEATURE_COLUMNS,
        'api_version': '1.0.0'
    }), 200


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("Starting FraudSentry API...")
    app.run(
        debug=Config.DEBUG,
        host='0.0.0.0',
        port=5000
    )
