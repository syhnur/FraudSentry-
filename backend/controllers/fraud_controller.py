"""
Fraud Controller - Handles fraud detection API logic
"""

import json
from typing import Dict, List
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

class FraudController:
    """
    Fraud Detection Controller
    Orchestrates fraud detection workflow
    """
    
    def __init__(self, fraud_detector):
        """
        Initialize controller
        
        Args:
            fraud_detector: FraudDetector instance
        """
        self.fraud_detector = fraud_detector
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash-lite')
        else:
            self.gemini_model = None
    
    def analyze_fraud(self, transaction: Dict) -> Dict:
        """
        Analyze transaction and generate explanation
        
        Args:
            transaction: Transaction data
            
        Returns:
            Complete analysis with AI explanation
        """
        # Analyze with ensemble
        analysis = self.fraud_detector.analyze_transaction(transaction)
        
        # Generate AI explanation
        explanation = self._generate_explanation(analysis, transaction)
        
        # Combine results
        result = {
            **analysis,
            'explanation': explanation,
            'timestamp': datetime.now().isoformat(),
            'transaction_summary': {
                'amount': transaction.get('amount'),
                'type': transaction.get('type'),
                'sender_balance_change': {
                    'from': transaction.get('oldbalanceOrg'),
                    'to': transaction.get('newbalanceOrig')
                },
                'receiver_balance_change': {
                    'from': transaction.get('oldbalanceDest'),
                    'to': transaction.get('newbalanceDest')
                }
            }
        }
        
        return result
    
    def _generate_explanation(self, analysis: Dict, transaction: Dict) -> str:
        """
        Generate AI explanation for fraud decision
        
        Args:
            analysis: Fraud analysis results
            transaction: Original transaction data
            
        Returns:
            Explanation string
        """
        if not self.gemini_model:
            return self._fallback_explanation(analysis, transaction)
        
        # Build prompt
        if analysis['is_fraud']:
            prompt = f"""Transaction flagged as SUSPICIOUS: 
Amount: ${transaction.get('amount', 0)}, 
Sender balance change: ${transaction.get('oldbalanceOrg', 0)} → ${transaction.get('newbalanceOrig', 0)}.
Risk Score: {analysis['risk_percentage']:.1f}%
Models consensus: FRAUD with {analysis['confidence']:.1f}% confidence.

Provide a brief, customer-friendly explanation (2-3 sentences) about why this transaction looks suspicious."""
        else:
            prompt = f"""Transaction flagged as CLEAN: 
Amount: ${transaction.get('amount', 0)}, 
Normal sender balance progression: ${transaction.get('oldbalanceOrg', 0)} → ${transaction.get('newbalanceOrig', 0)}.
Risk Score: {analysis['risk_percentage']:.1f}%
Models consensus: LEGITIMATE with {analysis['confidence']:.1f}% confidence.

Provide a brief, customer-friendly explanation (2-3 sentences) about why this transaction looks safe."""
        
        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            return self._fallback_explanation(analysis, transaction)
    
    def _fallback_explanation(self, analysis: Dict, transaction: Dict) -> str:
        """
        Fallback explanation without Gemini API
        
        Args:
            analysis: Fraud analysis results
            transaction: Original transaction data
            
        Returns:
            Fallback explanation
        """
        if analysis['is_fraud']:
            return (f"This transaction has been flagged as suspicious with a risk score of "
                   f"{analysis['risk_percentage']:.1f}%. The AI models detected patterns matching fraud cases. "
                   f"Please verify this transaction or contact support.")
        else:
            return (f"This transaction appears legitimate with a risk score of "
                   f"{analysis['risk_percentage']:.1f}%. All security checks passed successfully. "
                   f"Transaction approved.")
    
    def batch_analyze_fraud(self, transactions: List[Dict]) -> List[Dict]:
        """
        Analyze multiple transactions
        
        Args:
            transactions: List of transactions
            
        Returns:
            List of analysis results
        """
        results = []
        for transaction in transactions:
            result = self.analyze_fraud(transaction)
            results.append(result)
        return results
    
    def get_statistics(self, results: List[Dict]) -> Dict:
        """
        Generate statistics from analysis results
        
        Args:
            results: List of analysis results
            
        Returns:
            Statistics dictionary
        """
        fraud_count = sum(1 for r in results if r['is_fraud'])
        legit_count = len(results) - fraud_count
        avg_risk = sum(r['risk_score'] for r in results) / len(results) if results else 0
        
        return {
            'total_transactions': len(results),
            'fraud_detected': fraud_count,
            'legitimate': legit_count,
            'fraud_rate': (fraud_count / len(results) * 100) if results else 0,
            'average_risk_score': avg_risk,
            'high_risk_count': sum(1 for r in results if r['risk_score'] > 0.7),
            'medium_risk_count': sum(1 for r in results if 0.4 <= r['risk_score'] <= 0.7),
            'low_risk_count': sum(1 for r in results if r['risk_score'] < 0.4)
        }
