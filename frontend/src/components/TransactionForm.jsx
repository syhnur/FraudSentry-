import React, { useState } from 'react';
import '../styles/TransactionForm.css';

/**
 * TransactionForm Component
 * 
 * Collects transaction data from user and submits for fraud analysis
 * This is a presentational component - all API calls handled by parent
 */
const TransactionForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    amount: '',
    oldbalanceOrg: '',
    newbalanceOrig: '',
    oldbalanceDest: '',
    newbalanceDest: '',
    type: 'TRANSFER'
  });

  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Validate transaction data before submission
   */
  const validateForm = () => {
    const errors = {};

    // Check all fields are filled
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        errors[key] = 'This field is required';
      }
    });

    // Check amounts are positive numbers
    ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'].forEach(key => {
      if (formData[key] !== '' && isNaN(formData[key])) {
        errors[key] = 'Must be a number';
      } else if (formData[key] !== '' && parseFloat(formData[key]) < 0) {
        errors[key] = 'Must be positive';
      }
    });

    // Check balance consistency
    if (formData[key] !== '' && formData.newbalanceOrig !== '') {
      const oldBal = parseFloat(formData.oldbalanceOrg);
      const newBal = parseFloat(formData.newbalanceOrig);
      const amount = parseFloat(formData.amount);
      
      if (newBal !== oldBal - amount) {
        errors.newbalanceOrig = 'New balance should be old balance - amount';
      }
    }

    return errors;
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Convert strings to numbers
    const transactionData = {
      amount: parseFloat(formData.amount),
      oldbalanceOrg: parseFloat(formData.oldbalanceOrg),
      newbalanceOrig: parseFloat(formData.newbalanceOrig),
      oldbalanceDest: parseFloat(formData.oldbalanceDest),
      newbalanceDest: parseFloat(formData.newbalanceDest),
      type: formData.type
    };

    // Call parent callback with data
    onSubmit(transactionData);
  };

  /**
   * Render form field with error display
   */
  const renderInput = (name, label, type = 'number', step = '0.01') => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        step={step}
        placeholder={`Enter ${label.toLowerCase()}`}
        disabled={loading}
        className={validationErrors[name] ? 'input-error' : ''}
      />
      {validationErrors[name] && (
        <span className="error-message">{validationErrors[name]}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h2>Analyze Transaction</h2>
      
      {/* General error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Transaction Type */}
      <div className="form-group">
        <label htmlFor="type">Transaction Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="TRANSFER">Transfer</option>
          <option value="CASH_OUT">Cash Out</option>
        </select>
      </div>

      {/* Sender Information */}
      <fieldset>
        <legend>Sender Information</legend>
        {renderInput('amount', 'Transfer Amount', 'number')}
        {renderInput('oldbalanceOrg', 'Sender Initial Balance', 'number')}
        {renderInput('newbalanceOrig', 'Sender Final Balance', 'number')}
      </fieldset>

      {/* Recipient Information */}
      <fieldset>
        <legend>Recipient Information</legend>
        {renderInput('oldbalanceDest', 'Recipient Initial Balance', 'number')}
        {renderInput('newbalanceDest', 'Recipient Final Balance', 'number')}
      </fieldset>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading}
        className={`btn btn-primary ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing...
          </>
        ) : (
          'Analyze Transaction'
        )}
      </button>

      {/* Example Data Button (for testing) */}
      <button
        type="button"
        onClick={() => setFormData({
          amount: '500.50',
          oldbalanceOrg: '5000',
          newbalanceOrig: '4499.50',
          oldbalanceDest: '1000',
          newbalanceDest: '1500.50',
          type: 'TRANSFER'
        })}
        disabled={loading}
        className="btn btn-secondary"
      >
        Load Example
      </button>
    </form>
  );
};

export default TransactionForm;
