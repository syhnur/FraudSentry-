"""
Data Processor - Utility for data preprocessing
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple

class DataProcessor:
    """Data processing utilities for FraudSentry"""
    
    @staticmethod
    def validate_transaction(transaction: Dict, required_fields: List[str]) -> Tuple[bool, str]:
        """
        Validate transaction data
        
        Args:
            transaction: Transaction dictionary
            required_fields: List of required field names
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        missing_fields = [f for f in required_fields if f not in transaction]
        
        if missing_fields:
            return False, f"Missing fields: {', '.join(missing_fields)}"
        
        # Validate data types and values
        for field in required_fields:
            value = transaction[field]
            
            # Check if numeric
            try:
                float(value)
            except (TypeError, ValueError):
                return False, f"Field '{field}' must be numeric"
            
            # Check if non-negative (for financial data)
            if float(value) < 0:
                return False, f"Field '{field}' cannot be negative"
        
        return True, ""
    
    @staticmethod
    def normalize_transaction(transaction: Dict) -> Dict:
        """
        Normalize transaction values
        
        Args:
            transaction: Raw transaction dictionary
            
        Returns:
            Normalized transaction dictionary
        """
        normalized = transaction.copy()
        
        # Convert to float
        numeric_fields = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                         'oldbalanceDest', 'newbalanceDest']
        
        for field in numeric_fields:
            if field in normalized:
                normalized[field] = float(normalized[field])
        
        return normalized
    
    @staticmethod
    def calculate_statistics(transactions: List[Dict]) -> Dict:
        """
        Calculate statistics from transactions
        
        Args:
            transactions: List of transactions
            
        Returns:
            Statistics dictionary
        """
        if not transactions:
            return {}
        
        df = pd.DataFrame(transactions)
        numeric_cols = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                       'oldbalanceDest', 'newbalanceDest']
        
        stats = {}
        for col in numeric_cols:
            if col in df.columns:
                stats[col] = {
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max())
                }
        
        return stats
    
    @staticmethod
    def filter_transactions(transactions: List[Dict], filters: Dict) -> List[Dict]:
        """
        Filter transactions based on criteria
        
        Args:
            transactions: List of transactions
            filters: Dictionary of filters (e.g., {'min_amount': 1000, 'is_fraud': True})
            
        Returns:
            Filtered transactions
        """
        filtered = transactions.copy()
        
        if 'min_amount' in filters:
            filtered = [t for t in filtered if t.get('amount', 0) >= filters['min_amount']]
        
        if 'max_amount' in filters:
            filtered = [t for t in filtered if t.get('amount', 0) <= filters['max_amount']]
        
        if 'transaction_type' in filters:
            filtered = [t for t in filtered if t.get('type') == filters['transaction_type']]
        
        if 'is_fraud' in filters:
            filtered = [t for t in filtered if t.get('is_fraud') == filters['is_fraud']]
        
        return filtered
