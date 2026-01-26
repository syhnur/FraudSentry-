/**
 * FraudSentry API Client
 * Handles all communication with backend fraud detection service
 * 
 * Features:
 * - Error handling with descriptive messages
 * - Request/response validation
 * - API configuration management
 * - Automatic error transformation for UI display
 */

// Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    ANALYZE: '/api/analyze',
    BATCH_ANALYZE: '/api/batch-analyze',
    MODELS_INFO: '/api/models/info',
    HEALTH: '/health'
  }
};

/**
 * Error messages mapping
 */
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. The server took too long to respond.',
  NOT_FOUND: 'API endpoint not found. Server may not be running.',
  BAD_REQUEST: 'Invalid request data.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN: 'An unknown error occurred.'
};

/**
 * Fetch wrapper with timeout and error handling
 */
const fetchWithTimeout = async (url, options = {}) => {
  const timeout = options.timeout || API_CONFIG.TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.error || ERROR_MESSAGES.BAD_REQUEST
      );
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT);
    }
    
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw error;
  }
};

/**
 * Validate transaction data
 */
const validateTransaction = (transaction) => {
  const requiredFields = [
    'amount',
    'oldbalanceOrg',
    'newbalanceOrig',
    'oldbalanceDest',
    'newbalanceDest',
    'type'
  ];

  for (const field of requiredFields) {
    if (!(field in transaction)) {
      throw new Error(`Missing required field: ${field}`);
    }

    if (typeof transaction[field] === 'string') {
      const num = parseFloat(transaction[field]);
      if (isNaN(num)) {
        throw new Error(`Invalid number for field: ${field}`);
      }
    }
  }

  return true;
};

/**
 * Analyze single transaction for fraud
 */
const analyzeSingle = async (transaction) => {
  try {
    validateTransaction(transaction);

    const response = await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      }
    );

    return response;
  } catch (error) {
    console.error('Analyze single transaction error:', error);
    throw {
      message: error.message || ERROR_MESSAGES.UNKNOWN,
      type: 'ANALYSIS_ERROR',
      originalError: error
    };
  }
};

/**
 * Analyze multiple transactions
 */
const analyzeBatch = async (transactions, limit = 1000) => {
  try {
    if (!Array.isArray(transactions)) {
      throw new Error('Transactions must be an array');
    }

    if (transactions.length === 0) {
      throw new Error('Transactions array cannot be empty');
    }

    if (transactions.length > limit) {
      throw new Error(`Maximum ${limit} transactions allowed per batch`);
    }

    // Validate each transaction
    transactions.forEach((t, index) => {
      try {
        validateTransaction(t);
      } catch (error) {
        throw new Error(`Transaction ${index}: ${error.message}`);
      }
    });

    const response = await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BATCH_ANALYZE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions })
      }
    );

    return response;
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw {
      message: error.message || ERROR_MESSAGES.UNKNOWN,
      type: 'BATCH_ERROR',
      originalError: error
    };
  }
};

/**
 * Get model information and configuration
 */
const getModelInfo = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS_INFO}`
    );

    return response;
  } catch (error) {
    console.error('Get model info error:', error);
    throw {
      message: error.message || ERROR_MESSAGES.UNKNOWN,
      type: 'MODEL_INFO_ERROR',
      originalError: error
    };
  }
};

/**
 * Health check - verify server is running
 */
const healthCheck = async () => {
  try {
    await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
      { timeout: 5000 }
    );
    return true;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
};

/**
 * Get API configuration
 */
const getConfig = () => ({
  baseURL: API_CONFIG.BASE_URL,
  endpoints: API_CONFIG.ENDPOINTS,
  timeout: API_CONFIG.TIMEOUT
});

/**
 * Export as default object
 */
export const fraudAPI = {
  analyzeSingle,
  analyzeBatch,
  getModelInfo,
  healthCheck,
  getConfig
};

export default fraudAPI;
