import { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, ScanSearch, History, Settings, UserCircle, ShieldAlert, Menu, X } from 'lucide-react'; // Icons
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Add this import
function App() {
  const [activePage, setActivePage] = useState('detection'); // Default to Page 2
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state

  // --- RENDER CONTENT BASED ON ACTIVE PAGE ---
  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <ShieldAlert size={28} />
            <span>FraudSentry</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={20} /> 
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activePage === 'detection' ? 'active' : ''}`}
            onClick={() => setActivePage('detection')}
            title="Detection Engine"
          >
            <ScanSearch size={20} /> 
            <span>Detection Engine</span>
          </button>

          <button 
            className={`nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
            title="History Logs"
          >
            <History size={20} /> 
            <span>History Logs</span>
          </button>
        </nav>

        <div className="bottom-section">
          <button className="nav-item" title="Settings">
            <Settings size={20} /> 
            <span>Settings</span>
          </button>
          <button className="nav-item" title="Profile">
            <UserCircle size={20} /> 
            <span>Profile</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardView />}
        {activePage === 'detection' && <DetectionView />}
        {activePage === 'history' && <HistoryView />}
      </main>

    </div>
  );
}

// --- PAGE 1: DASHBOARD (Placeholder) ---
function DashboardView() {
  const [stats, setStats] = useState({ total_scans: 0, total_tx: 0, total_fraud: 0, trend_data: [] });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/dashboard-stats');
        setStats(res.data);
      } catch (error) { console.error("Error fetching stats"); }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* WELCOME SECTION */}
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting-title">Welcome back, Aisyah 👋</h1>
          <p className="greeting-subtitle">Your fraud detection system is running smoothly.</p>
        </div>
      </div>

      {/* 1. TOP METRICS ROW */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-content">
            <div className="metric-label">Total Scans</div>
            <div className="metric-value">{stats.total_scans}</div>
            <p className="metric-change">All-time transactions scanned</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-content">
            <div className="metric-label">Transactions Processed</div>
            <div className="metric-value" style={{color: 'var(--primary-teal)'}}>
              {stats.total_tx.toLocaleString()}
            </div>
            <p className="metric-change">In this period</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-content">
            <div className="metric-label">Threats Detected</div>
            <div className="metric-value" style={{color: 'var(--danger)'}}>
              {stats.total_fraud.toLocaleString()}
            </div>
            <p className="metric-change">Flagged for review</p>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS SECTION - 2 COLUMNS */}
      <div className="analytics-grid">
        
        {/* LEFT: TREND GRAPH */}
        <div className="card graph-card">
          <div className="card-header">
            <h3 className="card-title">Fraud Detection Trend</h3>
            <p className="card-subtitle">Last 7 scans comparison</p>
          </div>
          <div className="graph-container">
            {stats.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" style={{fontSize: '0.85rem'}} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{fontSize: '0.85rem'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#ffffff', border: '1px solid rgba(15, 118, 110, 0.2)', borderRadius: '8px', boxShadow: 'var(--shadow-md)'}} 
                    itemStyle={{color: 'var(--text-main)', fontSize: '0.9rem'}}
                    labelStyle={{color: 'var(--primary-teal)', fontWeight: '600'}}
                  />
                  <Line type="monotone" dataKey="XGBoost" stroke="var(--danger)" strokeWidth={3} activeDot={{ r: 8 }} name="XGBoost Flags" isAnimationActive={true} />
                  <Line type="monotone" dataKey="RandomForest" stroke="var(--primary-teal)" strokeWidth={3} name="RF Flags" isAnimationActive={true} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px', fontSize: '1rem'}}>No scan history yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT: MODEL PERFORMANCE SPECS */}
        <div className="card model-specs-card">
          <div className="card-header">
            <h3 className="card-title">Model Intelligence</h3>
            <p className="card-subtitle">Performance benchmarks on test dataset</p>
          </div>

          {/* XGBoost Stats (The Hero) */}
          <div className="model-stat">
            <div className="stat-header">
              <strong className="stat-name">XGBoost (Primary)</strong>
              <span className="badge badge-danger">Maximum Sensitivity</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '99.88%', background: 'linear-gradient(90deg, var(--danger), #dc2626)'}}></div>
            </div>
            <div className="stat-values">
              <span>Accuracy: <strong>96.66%</strong></span>
              <span>Recall: <strong style={{color: 'var(--danger)'}}>99.88%</strong></span>
            </div>
          </div>

          {/* RF Stats */}
          <div className="model-stat">
            <div className="stat-header">
              <strong className="stat-name">Random Forest</strong>
              <span className="badge badge-teal">Secondary Validator</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '96.11%', background: 'linear-gradient(90deg, var(--primary-teal), #0d9488)'}}></div>
            </div>
            <div className="stat-values">
              <span>Accuracy: <strong>98.03%</strong></span>
              <span>Recall: <strong style={{color: 'var(--primary-teal)'}}>96.11%</strong></span>
            </div>
          </div>

          {/* AI Status Badge */}
          <div className="ai-status">
            <div className="status-indicator"></div>
            <div>
              <strong style={{color: 'var(--primary-teal)'}}>Gemini AI: ONLINE</strong>
              <p className="status-description">Explainable AI module is active to filter false positives.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react'; // Add this to your top imports if missing!

// ... existing code ...

function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when this page loads
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/history');
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to load history");
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <h1 style={{marginBottom: '20px'}}>Audit Logs</h1>
      <p style={{color: 'var(--text-muted)', marginBottom: '30px'}}>Archive of all past batch scans and generated reports.</p>

      {loading ? <p>Loading records...</p> : (
        <div className="card" style={{padding: '0'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid var(--border-color)'}}>
                <th style={{padding: '15px', textAlign: 'left'}}>Date</th>
                <th style={{padding: '15px', textAlign: 'left'}}>Filename</th>
                <th style={{padding: '15px', textAlign: 'left'}}>Total Rows</th>
                <th style={{padding: '15px', textAlign: 'left'}}>Frauds Found</th>
                <th style={{padding: '15px', textAlign: 'left'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                  <td style={{padding: '15px'}}>{item.scan_date}</td>
                  <td style={{padding: '15px', color: 'var(--primary-teal)'}}>{item.filename}</td>
                  <td style={{padding: '15px'}}>{item.total_scanned}</td>
                  <td style={{padding: '15px'}}>
                    <span style={{color: 'var(--danger)', fontWeight: 'bold'}}>{item.fraud_found_xgb}</span>
                  </td>
                  <td style={{padding: '15px'}}>
                    <span style={{background: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>COMPLETED</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" style={{padding: '30px', textAlign: 'center'}}>No history found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- PAGE 2: DETECTION ENGINE (Your Original Logic) ---
// I wrapped your previous "Single/Batch" logic into this component
function DetectionView() {
  const [mode, setMode] = useState('single'); 
  const [batchTab, setBatchTab] = useState('table');
  const [tableFilter, setTableFilter] = useState('all'); // Filter for transactions: 'all', 'fraud', 'false-alarm', 'safe'
  const [filename, setFilename] = useState(""); 
  
  // FORM & STATE
  const [formData, setFormData] = useState({ amount: '', oldbalanceOrg: '', newbalanceOrig: '', oldbalanceDest: '', newbalanceDest: '' });
  const [singleResult, setSingleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [batchStats, setBatchStats] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [falseAlarms, setFalseAlarms] = useState(new Set()); // Track false alarms by index

  // LOGIC
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });

  const handleSinglePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict?model_type=RF', formData);
      setSingleResult(res.data);
    } catch (e) { alert("Connection Error"); }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    }
  };

  const handleBatchUpload = async () => {
    if (!file) return alert("Select CSV first");
    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/upload-batch', fd);
      setBatchResults(res.data.top_risky_transactions);
      setBatchStats(res.data.stats);
      setBatchTab('table');
    } catch (e) { alert("Upload Failed"); }
    setLoading(false);
  };

  const analyzeRow = async (tx, rowIndex) => {
    setModalData({ loading: true, rowIndex: rowIndex, tx: tx });
    const modelType = tx.XGB_Prediction === 1 ? "XGB" : "RF";
    try {
      const res = await axios.post(`http://127.0.0.1:8000/predict?model_type=${modelType}`, {
        amount: tx.amount, oldbalanceOrg: tx.oldbalanceOrg, newbalanceOrig: tx.newbalanceOrig, oldbalanceDest: tx.oldbalanceDest, newbalanceDest: tx.newbalanceDest
      });
      setModalData({ loading: false, ai_text: res.data.ai_analysis, features: res.data.explanation, is_fraud: res.data.is_fraud, model: modelType, rowIndex: rowIndex, tx: tx });
    } catch (e) { setModalData({ loading: false, error: "Error", rowIndex: rowIndex, tx: tx }); }
  };

  // Determine priority level based on model agreement
  const getPriorityLevel = (row) => {
    const bothAgree = row.XGB_Prediction === row.RF_Prediction;
    const xgbOnly = row.XGB_Prediction === 1 && row.RF_Prediction === 0;
    
    if (bothAgree && row.XGB_Prediction === 1) {
      return { level: 'high-priority', label: 'HIGH PRIORITY', color: '#dc2626', icon: '🚨' };
    } else if (xgbOnly) {
      return { level: 'warning', label: 'WARNING', color: '#f59e0b', icon: '⚠️' };
    } else {
      return { level: 'safe', label: 'SAFE', color: '#059669', icon: '✅' };
    }
  };

  // Mark transaction as false alarm
  const handleMarkFalseAlarm = (rowIndex) => {
    const newFalseAlarms = new Set(falseAlarms);
    newFalseAlarms.add(rowIndex);
    setFalseAlarms(newFalseAlarms);
    
    // Update stats - reduce XGBoost false flags
    setBatchStats({
      ...batchStats,
      xgb_flags: Math.max(0, batchStats.xgb_flags - 1)
    });
    
    setModalData(null);
  };

  const handleDownloadReport = async () => {
    if (!batchStats) return;
    try {
      // Separate confirmed frauds and false alarms
      const confirmedFrauds = batchResults.filter((_, i) => !falseAlarms.has(i));
      const falseAlarmTransactions = batchResults.filter((_, i) => falseAlarms.has(i));
      
      const res = await axios.post('http://127.0.0.1:8000/save-report', {
        filename: filename, 
        total: batchStats.total_scanned, 
        xgb_fraud: batchStats.xgb_flags, 
        rf_fraud: batchStats.rf_flags, 
        confirmed_frauds: confirmedFrauds.slice(0, 20),
        false_alarms: falseAlarmTransactions.slice(0, 20)
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FraudSentry_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) { alert("Error downloading PDF"); }
  };

  return (
    <div className="detection-container">
      {/* HEADER SECTION */}
      <div className="detection-header">
        <h1 className="detection-title">Detection Engine</h1>
        <p className="detection-subtitle">
          Check individual transactions in real-time or upload batch files for bulk analysis. Choose the method that works best for you.
        </p>
      </div>

      {/* MODE TABS */}
      <div className="detection-tabs">
        <button 
          className={`detection-tab ${mode === 'single' ? 'active' : ''}`} 
          onClick={() => setMode('single')}
        >
          <span className="tab-icon">✓</span>
          <span className="tab-label">Manual Check</span>
          <span className="tab-description">Single transaction analysis</span>
        </button>
        <button 
          className={`detection-tab ${mode === 'batch' ? 'active' : ''}`} 
          onClick={() => setMode('batch')}
        >
          <span className="tab-icon">📁</span>
          <span className="tab-label">Batch Upload</span>
          <span className="tab-description">Process multiple transactions</span>
        </button>
      </div>

      {/* SINGLE MODE */}
      {mode === 'single' && (
        <div className="detection-mode">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Enter Transaction Details</h2>
              <p className="form-description">Provide transaction information to run a fraud analysis</p>
            </div>

            <div className="form-grid-modern">
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input 
                  name="amount" 
                  type="number" 
                  placeholder="0.00" 
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender Old Balance</label>
                <input 
                  name="oldbalanceOrg" 
                  type="number" 
                  placeholder="0.00" 
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender New Balance</label>
                <input 
                  name="newbalanceOrig" 
                  type="number" 
                  placeholder="0.00" 
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Receiver Old Balance</label>
                <input 
                  name="oldbalanceDest" 
                  type="number" 
                  placeholder="0.00" 
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Receiver New Balance</label>
                <input 
                  name="newbalanceDest" 
                  type="number" 
                  placeholder="0.00" 
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <button 
              className="primary-btn btn-large" 
              onClick={handleSinglePredict} 
              disabled={loading}
              style={{marginTop: '30px'}}
            >
              {loading ? "🔍 Analyzing..." : "Run Fraud Analysis"}
            </button>

            {singleResult && (
              <div className={`result-card ${singleResult.is_fraud ? 'fraud' : 'safe'}`}>
                <div className="result-header">
                  <h3 className="result-title">
                    {singleResult.is_fraud ? "🚨 Fraud Detected" : "Transaction Safe"}
                  </h3>
                </div>
                <div className="result-content">
                  <p className="result-status">
                    <strong>Status:</strong> {singleResult.is_fraud ? "HIGH RISK" : "LOW RISK"}
                  </p>
                  {singleResult.is_fraud === 1 && (
                    <div className="result-analysis">
                      <strong>Analysis:</strong>
                      <p>{singleResult.ai_analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BATCH MODE */}
      {mode === 'batch' && (
        <div className="detection-mode">
          <div className="upload-container">
            <div className="upload-zone card">
              <div className="upload-content">
                <div className="upload-icon">📂</div>
                <h2 className="upload-title">Upload CSV File</h2>
                <p className="upload-description">Drag and drop your CSV file or click to select</p>
                
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  style={{display: 'none'}} 
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" className="upload-button">
                  Choose File
                </label>

                {file && (
                  <div className="file-selected">
                    <p className="file-name">✓ {file.name}</p>
                  </div>
                )}

                <button 
                  className="primary-btn btn-large" 
                  onClick={handleBatchUpload} 
                  disabled={loading || !file}
                  style={{marginTop: '20px'}}
                >
                  {loading ? "⏳ Processing..." : "Start Batch Scan"}
                </button>
              </div>
            </div>

            {batchResults && (
              <div className="batch-results">
                <div className="results-tabs">
                  <button 
                    className={`results-tab ${batchTab === 'table' ? 'active' : ''}`}
                    onClick={() => setBatchTab('table')}
                  >
                    Live Transactions
                  </button>
                  <button 
                    className={`results-tab ${batchTab === 'comparison' ? 'active' : ''}`}
                    onClick={() => setBatchTab('comparison')}
                  >
                    Model Consensus
                  </button>
                </div>

                {batchTab === 'table' && (
                  <div className="results-table-container">
                    {/* Filter Dropdown */}
                    <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <label style={{fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem'}}>Filter by Status:</label>
                      <select 
                        value={tableFilter}
                        onChange={(e) => setTableFilter(e.target.value)}
                        style={{
                          padding: '10px 16px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          background: 'var(--bg-dark)',
                          color: 'var(--text-main)',
                          fontSize: '0.95rem',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--primary-teal)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(15, 118, 110, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-color)';
                          e.target.style.boxShadow = 'var(--shadow-sm)';
                        }}
                      >
                        <option value="all">All Transactions ({batchResults.length})</option>
                        <option value="fraud">🚨 Confirmed Frauds ({batchResults.filter((_, i) => !falseAlarms.has(i) && (getPriorityLevel(batchResults[i]).level === 'high-priority' || getPriorityLevel(batchResults[i]).level === 'warning')).length})</option>
                        <option value="false-alarm">⚠️ False Alarms ({batchResults.filter((_, i) => falseAlarms.has(i)).length})</option>
                        <option value="safe">✅ Safe ({batchResults.filter((_, i) => !falseAlarms.has(i) && getPriorityLevel(batchResults[i]).level === 'safe').length})</option>
                      </select>
                    </div>

                    {/* Table */}
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>Sender Balance</th>
                          <th>Risk Score</th>
                          <th>Priority Level</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchResults.map((row, i) => {
                          const priority = getPriorityLevel(row);
                          const isFalseAlarm = falseAlarms.has(i);
                          
                          // Determine if row should be shown based on filter
                          let showRow = false;
                          if (tableFilter === 'all') showRow = true;
                          else if (tableFilter === 'fraud' && !isFalseAlarm && (priority.level === 'high-priority' || priority.level === 'warning')) showRow = true;
                          else if (tableFilter === 'false-alarm' && isFalseAlarm) showRow = true;
                          else if (tableFilter === 'safe' && !isFalseAlarm && priority.level === 'safe') showRow = true;
                          
                          if (!showRow) return null;
                          
                          return (
                            <tr key={i} className={isFalseAlarm ? 'row-false-alarm' : priority.level === 'high-priority' ? 'row-fraud' : priority.level === 'warning' ? 'row-warning' : 'row-safe'}>
                              <td>${row.amount.toFixed(2)}</td>
                              <td>${row.oldbalanceOrg.toFixed(2)}</td>
                              <td>{row.XGB_Risk_Score?.toFixed(2)}</td>
                              <td>
                                <span className={`status-${priority.level}`} style={{color: priority.color}}>
                                  {priority.icon} {isFalseAlarm ? 'FALSE ALARM' : priority.label}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="action-btn"
                                  onClick={() => analyzeRow(row, i)}
                                >
                                  {isFalseAlarm ? '✓ Cleared' : 'Review'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {batchTab === 'comparison' && (
                  <div className="model-comparison">
                    <div className="comparison-card">
                      <h3>🌲 Random Forest</h3>
                      <p className="comparison-stat">{batchStats.rf_flags}</p>
                      <p className="comparison-label">Fraud Flags</p>
                    </div>
                    <div className="comparison-card">
                      <h3>🚀 XGBoost</h3>
                      <p className="comparison-stat">{batchStats.xgb_flags}</p>
                      <p className="comparison-label">Fraud Flags</p>
                    </div>
                    <div className="comparison-card">
                      <h3>✓ Total Scanned</h3>
                      <p className="comparison-stat">{batchStats.total_scanned}</p>
                      <p className="comparison-label">Transactions</p>
                    </div>
                  </div>
                )}

                <button 
                  className="primary-btn btn-large"
                  onClick={handleDownloadReport}
                  style={{marginTop: '30px', width: '100%'}}
                >
                  📄 Download Audit PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)} style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000}}>
          <div className="card" onClick={e => e.stopPropagation()} style={{width: '520px', maxHeight: '85vh', overflow: 'auto', padding: '0', position: 'relative', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'}}>
            
            {/* Modal Header */}
            <div style={{background: 'linear-gradient(135deg, var(--primary-teal) 0%, #0d9488 100%)', padding: '28px', borderRadius: '12px 12px 0 0', color: 'white', borderBottom: '3px solid rgba(185, 104, 104, 0.1)'}}>
              <h2 style={{margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '700'}}>AI Analysis Report</h2>
              <p style={{margin: '0', fontSize: '0.9rem', opacity: 0.95}}>Detailed fraud assessment & risk factors</p>
            </div>

            {/* Modal Content */}
            <div style={{padding: '28px'}}>
              {modalData.loading ? (
                <div style={{textAlign: 'center', padding: '40px'}}>
                  <p style={{fontSize: '1rem', color: 'var(--text-main)'}}>🔍 Analyzing transaction...</p>
                </div>
              ) : (
                 <>
                  {/* AI Analysis Section */}
                  <div style={{marginBottom: '28px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '1.2rem'}}>💡</span> Expert Assessment
                    </h3>
                    <div style={{background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(13, 148, 136, 0.04) 100%)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--primary-teal)', lineHeight: '1.8', color: 'var(--text-main)', fontSize: '0.95rem'}}>
                      <p style={{margin: '0', whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                        {modalData.ai_text}
                      </p>
                    </div>
                  </div>

                  {/* Risk Contributors Section */}
                  <div style={{marginBottom: '28px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '1.2rem'}}>📊</span> Risk Factors (SHAP Analysis)
                    </h3>
                    <div style={{background: 'var(--bg-panel)', padding: '14px', borderRadius: '8px', marginBottom: '14px', borderLeft: '3px solid #f59e0b', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted)'}}>
                      <strong style={{color: 'var(--text-main)'}}>What is SHAP?</strong> SHAP values measure how much each transaction detail (like amount, balance changes) contributes to the fraud prediction. Positive values increase fraud risk, negative values decrease it.
                    </div>
                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                      {modalData.features?.map((f, i) => (
                        <li key={i} style={{marginBottom: '10px', padding: '14px', background: 'var(--bg-panel)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid rgba(15, 118, 110, 0.1)', transition: 'all 200ms ease'}}>
                          <div style={{flex: 1}}>
                            <div style={{color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px'}}>{f.feature}</div>
                            <div style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                              {f.impact > 0 ? '⬆️ Increases fraud risk' : '⬇️ Decreases fraud risk'}
                            </div>
                          </div>
                          <span style={{color: f.impact > 0 ? '#ef4444' : '#22c55e', fontWeight: '700', fontSize: '1rem', padding: '6px 12px', background: f.impact > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)', borderRadius: '6px', whiteSpace: 'nowrap', marginLeft: '12px'}}>
                            {f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Confidence Section */}
                  {modalData.is_fraud === 1 ? (
                    <div style={{background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--danger)', marginBottom: '24px'}}>
                      <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)'}}>⚠️ Assessment Result</h4>
                      <p style={{margin: '0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6'}}>
                        This transaction has been flagged as <strong>HIGH RISK</strong> based on multiple suspicious indicators. Immediate review and customer verification are recommended.
                      </p>
                    </div>
                  ) : (
                    <div style={{background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--success)', marginBottom: '24px'}}>
                      <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)'}}>✅ Assessment Result</h4>
                      <p style={{margin: '0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6'}}>
                        This transaction appears <strong>SAFE</strong> and shows normal behavior patterns. No suspicious indicators detected. You can proceed with confidence.
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <div style={{display: 'flex', gap: '12px'}}>
                    {/* Show "Mark as False Alarm" button for WARNING level transactions (XGBoost only) */}
                    {modalData.tx && modalData.tx.XGB_Prediction === 1 && modalData.tx.RF_Prediction === 0 && (
                      <button 
                        className="primary-btn" 
                        onClick={() => handleMarkFalseAlarm(modalData.rowIndex)}
                        style={{flex: 1, padding: '12px', fontSize: '0.95rem', fontWeight: '600', background: '#f59e0b'}}
                      >
                        ✓ Mark as False Alarm
                      </button>
                    )}
                    <button 
                      className="primary-btn" 
                      onClick={() => setModalData(null)} 
                      style={{flex: 1, padding: '12px', fontSize: '0.95rem', fontWeight: '600'}}
                    >
                      Close
                    </button>
                  </div>
                 </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;