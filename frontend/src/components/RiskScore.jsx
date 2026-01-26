import React from 'react';
import '../styles/RiskScore.css';

/**
 * RiskScore Component
 * 
 * Displays fraud verdict with risk percentage and confidence level
 * - Red for FRAUD detected
 * - Green for LEGITIMATE transaction
 */
const RiskScore = ({ 
  riskScore = 0.5, 
  isFraud = false, 
  confidence = 0.8,
  showDetails = true 
}) => {
  // Validate inputs
  const score = Math.max(0, Math.min(1, riskScore));
  const conf = Math.max(0, Math.min(1, confidence));
  const percentage = Math.round(score * 100);
  const confidencePercentage = Math.round(conf * 100);

  // Determine risk level
  const getRiskLevel = () => {
    if (score < 0.33) return 'LOW';
    if (score < 0.67) return 'MEDIUM';
    return 'HIGH';
  };

  // Determine color
  const getColor = () => {
    if (isFraud) return '#e74c3c'; // Red
    return '#27ae60'; // Green
  };

  // Determine verdict text
  const getVerdict = () => {
    return isFraud ? '⚠️ FRAUD DETECTED' : '✓ LEGITIMATE';
  };

  // Determine confidence interpretation
  const getConfidenceText = () => {
    if (conf >= 0.9) return 'Very High';
    if (conf >= 0.75) return 'High';
    if (conf >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`risk-score-container ${isFraud ? 'fraud' : 'legitimate'}`}>
      {/* Main Risk Display */}
      <div className="risk-score-display">
        <div 
          className="risk-circle"
          style={{
            borderColor: getColor(),
            backgroundColor: isFraud ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)'
          }}
        >
          <div className="percentage" style={{ color: getColor() }}>
            {percentage}%
          </div>
          <div className="risk-label">Risk Score</div>
        </div>
      </div>

      {/* Verdict */}
      <div 
        className="verdict"
        style={{ backgroundColor: getColor() }}
      >
        <h2>{getVerdict()}</h2>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="risk-details">
          {/* Risk Level */}
          <div className="detail-item">
            <span className="detail-label">Risk Level:</span>
            <span className={`detail-value risk-${getRiskLevel().toLowerCase()}`}>
              {getRiskLevel()}
            </span>
          </div>

          {/* Confidence */}
          <div className="detail-item">
            <span className="detail-label">Confidence:</span>
            <span className="detail-value">
              {confidencePercentage}% ({getConfidenceText()})
            </span>
          </div>

          {/* Recommendation */}
          <div className="detail-item recommendation">
            <span className="detail-label">Recommendation:</span>
            <span className="detail-value">
              {isFraud ? (
                <>
                  🚫 <strong>BLOCK</strong> this transaction
                  <br />
                  <em>Contact customer to verify</em>
                </>
              ) : (
                <>
                  ✅ <strong>APPROVE</strong> this transaction
                  <br />
                  <em>Transaction appears legitimate</em>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Mini Progress Bar */}
      <div className="risk-bar">
        <div 
          className="risk-progress"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor()
          }}
        />
      </div>

      {/* Legend */}
      <div className="risk-legend">
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>Low Risk (0-33%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium"></span>
          <span>Medium Risk (33-67%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>High Risk (67-100%)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
