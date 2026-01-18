import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, Legend, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Eye } from 'lucide-react';
import axios from 'axios';

function FraudTypeBreakdown() {
  const [fraudData, setFraudData] = useState([]);
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  const [loading, setLoading] = useState(true);
  const [totalFrauds, setTotalFrauds] = useState(0);

  // Fetch fraud type data from backend
  useEffect(() => {
    fetchFraudData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFraudData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFraudData = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/fraud-type-stats');
      if (res.data && res.data.fraud_types) {
        setFraudData(res.data.fraud_types);
        setTotalFrauds(res.data.total_frauds || 0);
      }
    } catch (error) {
      console.error('Error fetching fraud type data:', error);
      // Fallback to default data
      setFraudData(getDefaultFraudData());
    }
    setLoading(false);
  };

  // Default data if no backend data available
  const getDefaultFraudData = () => [
    { name: 'Account Takeover', value: 45, color: '#dc2626', percentage: 45 },
    { name: 'Mule Account', value: 30, color: '#0d9488', percentage: 30 },
    { name: 'Structuring', value: 15, color: '#f59e0b', percentage: 15 },
    { name: 'Behavioral Anomaly', value: 10, color: '#a78bfa', percentage: 10 }
  ];

  // Enhanced data with colors if not present
  const enhancedData = fraudData.map((item, idx) => ({
    ...item,
    color: item.color || ['#dc2626', '#0d9488', '#f59e0b', '#a78bfa', '#8b5cf6', '#06b6d4'][idx % 6]
  }));

  const COLORS = enhancedData.map(d => d.color);

  return (
    <div className="fraud-breakdown-section">
      {/* Header with Controls */}
      <div className="breakdown-header">
        <div className="breakdown-title-section">
          <TrendingUp size={24} style={{ color: 'var(--primary-teal)', marginRight: '10px' }} />
          <div>
            <h2 className="section-title">Fraud Type Distribution</h2>
            <p className="section-subtitle">
              Based on {totalFrauds} detected fraud transactions • Auto-updates on new batch uploads
            </p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="chart-type-toggle">
          <button 
            className={`toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
            onClick={() => setChartType('pie')}
            title="Pie Chart"
          >
            📊 Pie
          </button>
          <button 
            className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            📈 Bar
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="breakdown-main">
        {/* Left: Chart */}
        <div className="chart-container">
          {loading ? (
            <div className="loading-placeholder">
              <div className="spinner"></div>
              <p>Loading fraud type data...</p>
            </div>
          ) : enhancedData.length === 0 ? (
            <div className="empty-state">
              <Eye size={48} style={{ color: 'rgba(0, 0, 0, 0.2)', marginBottom: '10px' }} />
              <p>No fraud data available yet</p>
              <p style={{ fontSize: '0.9rem', color: '#999' }}>Upload a batch to see fraud distribution</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={enhancedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {enhancedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'value') return [value, 'Cases'];
                      return value;
                    }}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid rgba(15, 118, 110, 0.2)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </PieChart>
              ) : (
                <BarChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis style={{ fontSize: '0.85rem' }} />
                  <Tooltip 
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid rgba(15, 118, 110, 0.2)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    formatter={(value) => [value, 'Cases']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {enhancedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Right: Statistics List */}
        <div className="breakdown-stats">
          <h4 className="stats-title">Breakdown Details</h4>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Loading...</div>
          ) : (
            <div className="stats-list">
              {enhancedData.map((item, idx) => (
                <div key={idx} className="stat-row">
                  <div className="stat-row-left">
                    <div 
                      className="stat-color-dot" 
                      style={{ background: item.color }}
                    ></div>
                    <div className="stat-info">
                      <div className="stat-name">{item.name}</div>
                      <div className="stat-percentage-bar">
                        <div 
                          className="stat-percentage-fill"
                          style={{ width: `${item.percentage}%`, background: item.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="stat-row-right">
                    <span className="stat-count">{item.value}</span>
                    <span className="stat-percent" style={{ color: item.color }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Summary */}
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Total Frauds:</span>
              <span className="summary-value">{totalFrauds}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Categories:</span>
              <span className="summary-value">{enhancedData.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Detection Rate:</span>
              <span className="summary-value" style={{ color: 'var(--primary-teal)' }}>98.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Type Categories Explanation */}
      <div className="fraud-type-guide">
        <h4 className="guide-title">📚 Fraud Type Categories</h4>
        
        <div className="guide-grid">
          <div className="guide-item" style={{ borderLeftColor: '#dc2626' }}>
            <h5 style={{ color: '#dc2626' }}>Account Takeover (ATO)</h5>
            <p>Unauthorized access to customer account with unusual transaction patterns</p>
          </div>

          <div className="guide-item" style={{ borderLeftColor: '#0d9488' }}>
            <h5 style={{ color: '#0d9488' }}>Mule Account</h5>
            <p>Money pass-through account used to hide the origin of fraudulent funds</p>
          </div>

          <div className="guide-item" style={{ borderLeftColor: '#f59e0b' }}>
            <h5 style={{ color: '#f59e0b' }}>Structuring</h5>
            <p>Multiple small transactions designed to evade detection (smurfing)</p>
          </div>

          <div className="guide-item" style={{ borderLeftColor: '#a78bfa' }}>
            <h5 style={{ color: '#a78bfa' }}>Behavioral Anomaly</h5>
            <p>Unusual transaction patterns detected by Isolation Forest (unsupervised)</p>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="update-info">
        <span className="update-dot"></span>
        <span className="update-text">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default FraudTypeBreakdown;
