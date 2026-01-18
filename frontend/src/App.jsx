import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, ScanSearch, History, Settings, UserCircle, ShieldAlert, Menu, X, Activity, Database, Zap, Clock } from 'lucide-react'; // Icons
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Add this import
import InventoryLogin from './InventoryLogin';
import ModelComparisonCards from './ModelComparisonCards';
import FraudTypeBreakdown from './FraudTypeBreakdown';

function App() {
  const [activePage, setActivePage] = useState('detection'); // Default to Page 2
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state
  const [userEmail, setUserEmail] = useState(''); // Store user email

  // Check if user is already logged in on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('is_logged_in');
    const email = localStorage.getItem('user_email');
    
    if (loggedIn === 'true' && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    setUserEmail('');
  };

  // Handle login success
  const handleLoginSuccess = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <InventoryLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // --- RENDER CONTENT BASED ON ACTIVE PAGE ---
  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div 
            className="logo"
            onClick={() => !sidebarOpen && setSidebarOpen(true)}
            style={{cursor: !sidebarOpen ? 'pointer' : 'default', transition: 'all 300ms ease'}}
          >
            <img 
              src="/FraudSentryLogo.png" 
              alt="FraudSentry Logo" 
              style={{
                height: '40px', 
                width: 'auto', 
                objectFit: 'contain',
                display: 'flex',
                alignItems: 'center'
              }} 
            />
            <span style={{fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.5px'}}>FraudSentry</span>
          </div>
          {sidebarOpen && (
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
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
          <ProfileDropdown userEmail={userEmail} onLogout={handleLogout} />
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        <SystemHealthStatus />
        {activePage === 'dashboard' && <DashboardView />}
        {activePage === 'detection' && <DetectionView />}
        {activePage === 'history' && <HistoryView />}
      </main>

    </div>
  );
}

// --- SYSTEM HEALTH STATUS COMPONENT ---
function SystemHealthStatus() {
  const [health, setHealth] = useState({
    api_latency: 0,
    database: 'Connecting...',
    ai_engine: 'Connecting...',
    last_sync: 'Never'
  });

  const [loading, setLoading] = useState(true);

  // Fetch health status
  const fetchHealthStatus = async () => {
    const startTime = performance.now();
    try {
      const res = await axios.get('http://127.0.0.1:8000/health');
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setHealth({
        api_latency: latency,
        database: res.data.database_status || 'Connected',
        ai_engine: res.data.ai_engine_status || 'Online',
        last_sync: res.data.last_sync || new Date().toLocaleTimeString()
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching health status:", error);
      setHealth({
        api_latency: 0,
        database: 'Disconnected',
        ai_engine: 'Offline',
        last_sync: 'Error'
      });
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchHealthStatus();
    // Refresh health status every 10 seconds
    const interval = setInterval(fetchHealthStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status) => {
    if (typeof status === 'number') {
      if (status < 50) return '#059669'; // Green
      if (status < 100) return '#f59e0b'; // Amber
      return '#dc2626'; // Red
    }
    return status === 'Connected' || status === 'Online' ? '#059669' : '#dc2626';
  };

  return (
    <div className="system-health-status">
      <div className="health-item">
        <div className="health-icon" style={{borderColor: getHealthColor(health.api_latency)}}>
          <Activity size={14} color={getHealthColor(health.api_latency)} />
        </div>
        <div className="health-info">
          <span className="health-label">API Latency</span>
          <span className="health-value">{health.api_latency}ms</span>
        </div>
      </div>

      <div className="health-item">
        <div className="health-icon" style={{borderColor: getHealthColor(health.database)}}>
          <Database size={14} color={getHealthColor(health.database)} />
        </div>
        <div className="health-info">
          <span className="health-label">Database</span>
          <span className="health-value">{health.database}</span>
        </div>
      </div>

      <div className="health-item">
        <div className="health-icon" style={{borderColor: getHealthColor(health.ai_engine)}}>
          <Zap size={14} color={getHealthColor(health.ai_engine)} />
        </div>
        <div className="health-info">
          <span className="health-label">AI Engine</span>
          <span className="health-value">{health.ai_engine}</span>
        </div>
      </div>

      <div className="health-item">
        <div className="health-icon" style={{borderColor: getHealthColor(health.last_sync)}}>
          <Clock size={14} color={getHealthColor(health.last_sync)} />
        </div>
        <div className="health-info">
          <span className="health-label">Last Sync</span>
          <span className="health-value">{health.last_sync}</span>
        </div>
      </div>
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
          <h1 className="greeting-title-small">Welcome, Aisyah 👋</h1>
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

          {/* Isolation Forest Stats */}
          <div className="model-stat">
            <div className="stat-header">
              <strong className="stat-name">Isolation Forest</strong>
              <span className="badge" style={{background: '#a78bfa', color: '#fff'}}>Anomaly Detection</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '92%', background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)'}}></div>
            </div>
            <div className="stat-values">
              <span>Approach: <strong>Unsupervised Learning</strong></span>
              <span>Detection: <strong style={{color: '#a78bfa'}}>Behavioral Anomalies</strong></span>
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

      {/* NEW: MODEL COMPARISON CARDS */}
      <ModelComparisonCards />

      {/* NEW: FRAUD TYPE BREAKDOWN CHART */}
      <FraudTypeBreakdown />
    </div>
  );
}

// --- PAGE 3: HISTORY VIEW ---
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [filename, setFilename] = useState(""); 
  
  // FORM & STATE
  const [formData, setFormData] = useState({ amount: '', oldbalanceOrg: '', newbalanceOrig: '', oldbalanceDest: '', newbalanceDest: '' });
  const [singleResult, setSingleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [batchStats, setBatchStats] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [expandShapInfo, setExpandShapInfo] = useState(false);
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
      setModalData({ 
        loading: false, 
        ai_text: res.data.ai_analysis, 
        features: res.data.explanation, 
        is_fraud: res.data.is_fraud,
        xgb_prediction: res.data.xgb_prediction,
        rf_prediction: res.data.rf_prediction,
        model_consensus: res.data.model_consensus,
        model: modelType, 
        rowIndex: rowIndex, 
        tx: tx 
      });
    } catch (e) { setModalData({ loading: false, error: "Error", rowIndex: rowIndex, tx: tx }); }
  };

  // Determine priority level based on model agreement
  const getPriorityLevel = (row) => {
    const bothAgree = row.XGB_Prediction === row.RF_Prediction;
    const xgbOnly = row.XGB_Prediction === 1 && row.RF_Prediction === 0;
    
    if (bothAgree && row.XGB_Prediction === 1) {
      return { level: 'high-priority', label: 'HIGH PRIORITY', color: '#dc2626' };
    } else if (xgbOnly) {
      return { level: 'warning', label: 'WARNING', color: '#f59e0b' };
    } else {
      return { level: 'safe', label: 'SAFE', color: '#059669' };
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
              style={{marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            >
              {loading && <span className="mini-spinner"></span>}
              {loading ? "Processing Transaction" : "Run Fraud Analysis"}
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
                  style={{marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                  {loading && <span className="mini-spinner"></span>}
                  {loading ? "Processing CSV File" : "Start Batch Scan"}
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
                    {/* Filter & Pagination Header */}
                    <div style={{marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap'}}>
                      {/* Filter Section */}
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <label style={{fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem', whiteSpace: 'nowrap'}}>Filter by Status:</label>
                        <select 
                          value={tableFilter}
                          onChange={(e) => {
                            setTableFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          style={{
                            padding: '11px 14px',
                            border: '2px solid var(--primary-teal)',
                            borderRadius: '8px',
                            background: 'var(--bg-dark)',
                            color: 'var(--text-main)',
                            fontSize: '0.95rem',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.1)',
                            minWidth: '240px'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary-teal)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--primary-teal)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(15, 118, 110, 0.1)';
                          }}
                        >
                          <option value="all">All Transactions ({batchResults.length})</option>
                          <option value="fraud">Confirmed Frauds ({batchResults.filter((_, i) => !falseAlarms.has(i) && (getPriorityLevel(batchResults[i]).level === 'high-priority' || getPriorityLevel(batchResults[i]).level === 'warning')).length})</option>
                          <option value="false-alarm">False Alarms ({batchResults.filter((_, i) => falseAlarms.has(i)).length})</option>
                          <option value="safe">Safe ({batchResults.filter((_, i) => !falseAlarms.has(i) && getPriorityLevel(batchResults[i]).level === 'safe').length})</option>
                        </select>
                      </div>

                      {/* Results Info */}
                      <div style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500'}}>
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, batchResults.length)} - {Math.min(currentPage * itemsPerPage, batchResults.length)} of {batchResults.length}
                      </div>
                    </div>

                    {/* Table */}
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>Sender Balance</th>
                          <th>Risk Score</th>
                          <th>Fraud Type</th>
                          <th>Priority Level</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchResults
                          .map((row, i) => ({ row, i }))
                          .filter(({ row, i }) => {
                            const priority = getPriorityLevel(row);
                            const isFalseAlarm = falseAlarms.has(i);
                            
                            if (tableFilter === 'all') return true;
                            if (tableFilter === 'fraud' && !isFalseAlarm && (priority.level === 'high-priority' || priority.level === 'warning')) return true;
                            if (tableFilter === 'false-alarm' && isFalseAlarm) return true;
                            if (tableFilter === 'safe' && !isFalseAlarm && priority.level === 'safe') return true;
                            return false;
                          })
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map(({ row, i }) => {
                            const priority = getPriorityLevel(row);
                            const isFalseAlarm = falseAlarms.has(i);
                            
                            return (
                              <tr key={i} className={isFalseAlarm ? 'row-false-alarm' : priority.level === 'high-priority' ? 'row-fraud' : priority.level === 'warning' ? 'row-warning' : 'row-safe'}>
                                <td>${row.amount.toFixed(2)}</td>
                                <td>${row.oldbalanceOrg.toFixed(2)}</td>
                                <td>{row.XGB_Risk_Score?.toFixed(2)}</td>
                                <td><strong>{row.Fraud_Type || 'Anomalous Activity'}</strong></td>
                                <td>
                                  <span className={`status-${priority.level}`} style={{color: priority.color}}>
                                    {isFalseAlarm ? 'FALSE ALARM' : priority.label}
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

                    {/* Pagination Controls */}
                    {(() => {
                      const filteredData = batchResults.filter(({ row }, i) => {
                        const priority = getPriorityLevel(batchResults[i]);
                        const isFalseAlarm = falseAlarms.has(i);
                        
                        if (tableFilter === 'all') return true;
                        if (tableFilter === 'fraud' && !isFalseAlarm && (priority.level === 'high-priority' || priority.level === 'warning')) return true;
                        if (tableFilter === 'false-alarm' && isFalseAlarm) return true;
                        if (tableFilter === 'safe' && !isFalseAlarm && priority.level === 'safe') return true;
                        return false;
                      }).length;
                      
                      const totalPages = Math.ceil(filteredData / itemsPerPage);
                      
                      return totalPages > 1 ? (
                        <div style={{marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                              padding: '10px 14px',
                              border: '2px solid var(--primary-teal)',
                              background: currentPage === 1 ? 'var(--bg-panel)' : 'var(--primary-teal)',
                              color: currentPage === 1 ? 'var(--text-muted)' : 'white',
                              borderRadius: '8px',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              transition: 'all 200ms ease'
                            }}
                          >
                            ← Previous
                          </button>

                          <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                              const pageNum = totalPages <= 7 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 6)) + i;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  style={{
                                    padding: '8px 12px',
                                    border: '2px solid var(--primary-teal)',
                                    background: pageNum === currentPage ? 'var(--primary-teal)' : 'var(--bg-dark)',
                                    color: pageNum === currentPage ? 'white' : 'var(--primary-teal)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: pageNum === currentPage ? '700' : '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 200ms ease'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                              padding: '10px 14px',
                              border: '2px solid var(--primary-teal)',
                              background: currentPage === totalPages ? 'var(--bg-panel)' : 'var(--primary-teal)',
                              color: currentPage === totalPages ? 'var(--text-muted)' : 'white',
                              borderRadius: '8px',
                              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              transition: 'all 200ms ease'
                            }}
                          >
                            Next →
                          </button>
                        </div>
                      ) : null;
                    })()}
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
                      <h3>🔮 Isolation Forest</h3>
                      <p className="comparison-stat">{batchStats.iso_anomalies}</p>
                      <p className="comparison-label">Anomalies Detected</p>
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
          <div className="card" onClick={e => e.stopPropagation()} style={{width: '750px', maxHeight: '90vh', overflow: 'auto', padding: '0', position: 'relative', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'}}>
            
            {/* Modal Header - Only show when NOT loading */}
            {!modalData.loading && (
              <div style={{background: 'linear-gradient(135deg, var(--primary-teal) 0%, #0d9488 100%)', padding: '32px', borderRadius: '12px 12px 0 0', color: 'white'}}>
                <h2 style={{margin: '0 0 4px 0', fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.5px'}}>Fraud Analysis Report</h2>
                <p style={{margin: '0', fontSize: '0.95rem', opacity: 0.9, fontWeight: '500'}}>Comprehensive transaction assessment</p>
              </div>
            )}

            {/* Modal Content */}
            <div style={{padding: modalData.loading ? '0' : '32px', borderRadius: modalData.loading ? '12px' : '0'}}>
              {modalData.loading ? (
                <div style={{borderRadius: '12px', overflow: 'hidden'}}>
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <div className="loader-text primary">Analyzing Transaction</div>
                    <div className="loader-text loader-pulse">Please wait while we process the fraud analysis</div>
                  </div>
                </div>
              ) : (
                 <>
                  {/* Assessment Result - HIGHLIGHTED & FIRST */}
                  <div style={{marginBottom: '32px', padding: '20px', background: modalData.model_consensus?.includes('CRITICAL') ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)' : modalData.model_consensus?.includes('POTENTIAL') ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)' : modalData.model_consensus === 'HIGH RISK' ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)' : 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)', borderRadius: '12px', borderLeft: `5px solid ${modalData.model_consensus?.includes('CRITICAL') || modalData.model_consensus === 'HIGH RISK' ? '#dc2626' : modalData.model_consensus?.includes('POTENTIAL') ? '#f59e0b' : '#059669'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{fontSize: '1.8rem'}}>{modalData.model_consensus?.includes('CRITICAL') || modalData.model_consensus === 'HIGH RISK' ? '🚨' : modalData.model_consensus?.includes('POTENTIAL') ? '⚠️' : '✅'}</div>
                      <h3 style={{margin: 0, fontSize: '1.1rem', fontWeight: '700', color: modalData.model_consensus?.includes('CRITICAL') || modalData.model_consensus === 'HIGH RISK' ? '#7f1d1d' : modalData.model_consensus?.includes('POTENTIAL') ? '#92400e' : '#064e3b'}}>
                        Assessment: {modalData.model_consensus}
                      </h3>
                    </div>
                    <p style={{margin: '0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '500'}}>
                      {modalData.model_consensus?.includes('CRITICAL') ? '✓ Both supervised models (XGBoost & Random Forest) confirmed fraud. Immediate investigation and customer verification are strongly recommended. Isolation Forest also detected behavioral anomalies.' : modalData.model_consensus?.includes('POTENTIAL') ? 'Models disagree. XGBoost flagged this but Random Forest marked it safe. This is likely a false alarm but warrants a quick review.' : modalData.model_consensus === 'HIGH RISK' ? 'Random Forest detected fraud that XGBoost missed. High-precision validator rarely makes mistakes. Investigate immediately.' : 'All models agree - XGBoost, Random Forest, and Isolation Forest confirm this transaction shows normal behavior patterns. No suspicious indicators detected. You can proceed with confidence.'}
                    </p>
                  </div>

                  {/* Expert Assessment Section */}
                  <div style={{marginBottom: '28px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px'}}>💡 Expert Assessment</h3>
                    <div style={{background: 'var(--bg-panel)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid var(--primary-teal)', lineHeight: '1.8', color: 'var(--text-main)', fontSize: '0.95rem'}}>
                      <p style={{margin: '0', whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                        {modalData.ai_text}
                      </p>
                    </div>
                  </div>

                  {/* Model Predictions Section */}
                  <div style={{marginBottom: '28px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px'}}>🔍 Model Predictions</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
                      <div style={{background: modalData.xgb_prediction === 1 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${modalData.xgb_prediction === 1 ? '#ef4444' : '#22c55e'}`}}>
                        <div style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px'}}>XGBoost (High Sensitivity)</div>
                        <div style={{fontSize: '1rem', fontWeight: '700', color: modalData.xgb_prediction === 1 ? '#ef4444' : '#22c55e'}}>
                          {modalData.xgb_prediction === 1 ? 'FLAGGED' : 'SAFE'}
                        </div>
                      </div>
                      <div style={{background: modalData.rf_prediction === 1 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${modalData.rf_prediction === 1 ? '#ef4444' : '#22c55e'}`}}>
                        <div style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px'}}>Random Forest (High Precision)</div>
                        <div style={{fontSize: '1rem', fontWeight: '700', color: modalData.rf_prediction === 1 ? '#ef4444' : '#22c55e'}}>
                          {modalData.rf_prediction === 1 ? 'FLAGGED' : 'SAFE'}
                        </div>
                      </div>
                      <div style={{background: modalData.iso_anomaly === 1 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(34, 197, 94, 0.12)', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${modalData.iso_anomaly === 1 ? '#a855f7' : '#22c55e'}`}}>
                        <div style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px'}}>Isolation Forest (Anomaly)</div>
                        <div style={{fontSize: '1rem', fontWeight: '700', color: modalData.iso_anomaly === 1 ? '#a855f7' : '#22c55e'}}>
                          {modalData.iso_anomaly === 1 ? 'ANOMALY' : 'NORMAL'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors Section - Now with Collapsible SHAP Info */}
                  <div style={{marginBottom: '28px'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px'}}>📊 Risk Factors (SHAP Analysis)</h3>
                    
                    {/* Collapsible SHAP Explanation */}
                    <button 
                      onClick={() => setExpandShapInfo(!expandShapInfo)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-color)',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        marginBottom: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        transition: 'all 200ms ease',
                        borderLeft: '3px solid #f59e0b'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(15, 118, 110, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--bg-panel)';
                      }}
                    >
                      <span>💡 What is SHAP Analysis? (Click to learn)</span>
                      <span style={{transition: 'transform 200ms ease', transform: expandShapInfo ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
                    </button>

                    {/* Expandable SHAP Info */}
                    {expandShapInfo && (
                      <div style={{background: 'var(--bg-panel)', padding: '14px', borderRadius: '8px', marginBottom: '14px', borderLeft: '3px solid #f59e0b', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted)'}}>
                        <strong style={{color: 'var(--text-main)', display: 'block', marginBottom: '8px'}}>Understanding SHAP Values:</strong>
                        SHAP (SHapley Additive exPlanations) values measure how much each transaction detail contributes to the fraud prediction.
                        <br/><br/>
                        <strong style={{color: 'var(--text-main)'}}>🔴 Red (Positive Values)</strong> - Increases fraud risk<br/>
                        <strong style={{color: 'var(--text-main)'}}>🟢 Green (Negative Values)</strong> - Decreases fraud risk / suggests legitimate activity
                        <br/><br/>
                        <strong style={{color: '#f59e0b', display: 'block', marginTop: '8px'}}>⚠️ Important:</strong> These are individual factor contributions. The final verdict depends on how both models agree (see Assessment above).
                      </div>
                    )}

                    {/* Risk Factors List */}
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

                  {/* Close Button */}
                  <div style={{display: 'flex', gap: '12px', marginTop: '28px'}}>
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

// --- PROFILE DROPDOWN COMPONENT ---
function ProfileDropdown({ userEmail, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="profile-dropdown-wrapper">
      <button 
        className="nav-item profile-button"
        title="Profile"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UserCircle size={20} /> 
        <span>Profile</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-avatar">
              <UserCircle size={32} />
            </div>
            <div className="profile-info">
              <p className="profile-email">{userEmail}</p>
              <p className="profile-status">Active</p>
            </div>
          </div>

          <div className="profile-dropdown-divider"></div>

          <button 
            className="profile-dropdown-item"
            onClick={() => {
              alert('Account settings coming soon!');
              setIsOpen(false);
            }}
          >
            <Settings size={18} />
            <span>Account Settings</span>
          </button>

          <button 
            className="profile-dropdown-item"
            onClick={() => {
              alert('Help & Support coming soon!');
              setIsOpen(false);
            }}
          >
            <ShieldAlert size={18} />
            <span>Help & Support</span>
          </button>

          <div className="profile-dropdown-divider"></div>

          <button 
            className="profile-dropdown-item logout-item"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <X size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;