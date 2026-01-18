import React from 'react';
import { TrendingUp, Award, Zap, AlertCircle } from 'lucide-react';

function ModelComparisonCards() {
  // Static model data - these are your real metrics from the system
  const models = [
    {
      id: 'xgboost',
      name: 'XGBoost',
      role: 'Primary Detector',
      color: '#dc2626', // Red
      colorLight: '#fee2e2',
      auc: 0.9986,
      recall: 77.18,
      precision: 88.61,
      f1: 0.8250,
      weight: 0.4,
      strength: 'High Sensitivity',
      approach: 'Supervised',
      type: 'Gradient Boosting',
      status: 'online',
      badge: '99.86% AUC',
      badgeColor: '#dc2626'
    },
    {
      id: 'rf',
      name: 'Random Forest',
      role: 'Precision Validator',
      color: '#0d9488', // Teal
      colorLight: '#ccfbf1',
      auc: 0.9952,
      recall: 72,
      precision: 85,
      f1: 0.7843,
      weight: 0.4,
      strength: 'High Precision',
      approach: 'Supervised',
      type: 'Parallel Ensemble',
      status: 'online',
      badge: '99.52% AUC',
      badgeColor: '#0d9488'
    },
    {
      id: 'iso',
      name: 'Isolation Forest',
      role: 'Anomaly Detector',
      color: '#a78bfa', // Purple
      colorLight: '#ede9fe',
      auc: null,
      recall: 82,
      precision: 65,
      f1: 0.7268,
      weight: 0.2,
      strength: 'Behavioral Patterns',
      approach: 'Unsupervised',
      type: 'Anomaly Detection',
      status: 'online',
      badge: '82% Recall',
      badgeColor: '#a78bfa'
    }
  ];

  return (
    <div className="model-comparison-section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Award size={24} style={{ marginRight: '10px', color: 'var(--primary-teal)' }} />
            Model Comparison
          </h2>
          <p className="section-subtitle">3-Model Ensemble Performance Benchmarks</p>
        </div>
        <div className="ensemble-badge">
          <span className="badge-dot" style={{ background: 'linear-gradient(135deg, #dc2626, #0d9488, #a78bfa)' }}></span>
          <span className="badge-text">Weighted Ensemble Active</span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="model-cards-grid">
        {models.map((model) => (
          <div key={model.id} className="model-card" style={{ borderTopColor: model.color }}>
            {/* Card Header */}
            <div className="model-card-header" style={{ borderBottomColor: model.colorLight }}>
              <div>
                <h3 className="model-name">{model.name}</h3>
                <p className="model-role" style={{ color: model.color }}>{model.role}</p>
              </div>
              <div className="model-weight" style={{ background: model.colorLight, color: model.color }}>
                {Math.round(model.weight * 100)}%
              </div>
            </div>

            {/* Card Body */}
            <div className="model-card-body">
              {/* AUC Score */}
              <div className="metric-item">
                <div className="metric-label">AUC Score</div>
                {model.auc ? (
                  <div className="metric-value" style={{ color: model.color }}>
                    {model.auc.toFixed(4)}
                  </div>
                ) : (
                  <div className="metric-value" style={{ color: '#666', fontSize: '0.9rem' }}>
                    N/A (Unsupervised)
                  </div>
                )}
              </div>

              {/* Recall */}
              <div className="metric-item">
                <div className="metric-label">Recall</div>
                <div className="metric-with-bar">
                  <div className="mini-bar-container">
                    <div 
                      className="mini-bar-fill" 
                      style={{ width: `${model.recall}%`, background: model.color }}
                    ></div>
                  </div>
                  <span className="metric-value-small" style={{ color: model.color }}>
                    {model.recall.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Precision */}
              <div className="metric-item">
                <div className="metric-label">Precision</div>
                <div className="metric-with-bar">
                  <div className="mini-bar-container">
                    <div 
                      className="mini-bar-fill" 
                      style={{ width: `${model.precision}%`, background: model.color }}
                    ></div>
                  </div>
                  <span className="metric-value-small" style={{ color: model.color }}>
                    {model.precision.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* F1 Score */}
              <div className="metric-item">
                <div className="metric-label">F1 Score</div>
                <div className="metric-value-small" style={{ color: model.color }}>
                  {model.f1.toFixed(4)}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: model.colorLight, margin: '12px 0' }}></div>

              {/* Approach & Type */}
              <div className="approach-info">
                <div className="approach-item">
                  <span className="approach-label">Learning:</span>
                  <span className="approach-value">{model.approach}</span>
                </div>
                <div className="approach-item">
                  <span className="approach-label">Type:</span>
                  <span className="approach-value">{model.type}</span>
                </div>
              </div>

              {/* Status */}
              <div className="model-status">
                <span className="status-indicator" style={{ background: model.color }}></span>
                <span className="status-text">{model.status.toUpperCase()}</span>
              </div>
            </div>

            {/* Card Footer - Strength Badge */}
            <div className="model-card-footer" style={{ background: model.colorLight }}>
              <Zap size={16} style={{ color: model.color }} />
              <span style={{ color: model.color, fontWeight: '600', fontSize: '0.9rem' }}>
                {model.strength}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ensemble Formula Section */}
      <div className="ensemble-formula-card">
        <div className="formula-header">
          <AlertCircle size={20} style={{ color: 'var(--primary-teal)' }} />
          <h4 style={{ color: 'var(--primary-teal)', margin: '0 0 0 8px' }}>Ensemble Risk Fusion Formula</h4>
        </div>
        
        <div className="formula-content">
          <div className="formula-line">
            <span className="formula-text">Final Risk Score =</span>
          </div>
          
          <div className="formula-calculation">
            <div className="formula-component" style={{ borderLeftColor: '#dc2626' }}>
              <span className="component-value">XGBoost × 0.4</span>
              <span className="component-desc">Primary Detector</span>
            </div>
            
            <span className="formula-plus">+</span>
            
            <div className="formula-component" style={{ borderLeftColor: '#0d9488' }}>
              <span className="component-value">RF × 0.4</span>
              <span className="component-desc">Validator</span>
            </div>
            
            <span className="formula-plus">+</span>
            
            <div className="formula-component" style={{ borderLeftColor: '#a78bfa' }}>
              <span className="component-value">ISO × 0.2</span>
              <span className="component-desc">Anomaly Detector</span>
            </div>
            
            <span className="formula-equals">=</span>
            
            <div className="formula-result">
              <span className="result-value">0.0 - 1.0</span>
              <span className="result-desc">Ensemble Risk</span>
            </div>
          </div>

          <div className="formula-threshold">
            <TrendingUp size={18} style={{ color: 'var(--primary-teal)' }} />
            <span className="threshold-text">Decision: If Score <strong>&gt; 0.5</strong> → Flag as Potential Fraud</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon" style={{ background: '#fee2e2' }}>
            <span style={{ color: '#dc2626', fontSize: '1.5rem' }}>🎯</span>
          </div>
          <div className="insight-text">
            <h4 className="insight-title">Balanced Approach</h4>
            <p className="insight-desc">Combines supervised learning (40%+40%) with unsupervised anomaly detection (20%)</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: '#ccfbf1' }}>
            <span style={{ color: '#0d9488', fontSize: '1.5rem' }}>✓</span>
          </div>
          <div className="insight-text">
            <h4 className="insight-title">High Confidence</h4>
            <p className="insight-desc">99%+ AUC scores ensure accurate fraud detection with minimal false alarms</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: '#ede9fe' }}>
            <span style={{ color: '#a78bfa', fontSize: '1.5rem' }}>⚡</span>
          </div>
          <div className="insight-text">
            <h4 className="insight-title">Complementary Strengths</h4>
            <p className="insight-desc">Each model's weakness is offset by the others' strengths</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelComparisonCards;
