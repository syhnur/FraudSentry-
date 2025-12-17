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
          <p className="greeting-subtitle">Your fraud detection system is running smoothly. Monitor security threats in real-time.</p>
        </div>
      </div>

      {/* 1. TOP METRICS ROW */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon" style={{background: 'rgba(15, 118, 110, 0.08)'}}>
            <span style={{fontSize: '1.8rem'}}>📊</span>
          </div>
          <div className="metric-content">
            <div className="metric-label">TOTAL SCANS</div>
            <div className="metric-value">{stats.total_scans}</div>
            <p className="metric-change">All-time transactions scanned</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{background: 'rgba(15, 118, 110, 0.1)'}}>
            <span style={{fontSize: '1.8rem'}}>✅</span>
          </div>
          <div className="metric-content">
            <div className="metric-label">TRANSACTIONS PROCESSED</div>
            <div className="metric-value" style={{color: 'var(--primary-teal)'}}>
              {stats.total_tx.toLocaleString()}
            </div>
            <p className="metric-change">In this period</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{background: 'rgba(220, 38, 38, 0.08)'}}>
            <span style={{fontSize: '1.8rem'}}>⚠️</span>
          </div>
          <div className="metric-content">
            <div className="metric-label">THREATS DETECTED</div>
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
            <h3 className="card-title">� Fraud Detection Trend</h3>
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
            <h3 className="card-title">🧠 Model Intelligence</h3>
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
  const [filename, setFilename] = useState(""); 
  
  // FORM & STATE
  const [formData, setFormData] = useState({ amount: '', oldbalanceOrg: '', newbalanceOrig: '', oldbalanceDest: '', newbalanceDest: '' });
  const [singleResult, setSingleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [batchStats, setBatchStats] = useState(null);
  const [modalData, setModalData] = useState(null);

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

  const analyzeRow = async (tx) => {
    setModalData({ loading: true });
    const modelType = tx.XGB_Prediction === 1 ? "XGB" : "RF";
    try {
      const res = await axios.post(`http://127.0.0.1:8000/predict?model_type=${modelType}`, {
        amount: tx.amount, oldbalanceOrg: tx.oldbalanceOrg, newbalanceOrig: tx.newbalanceOrig, oldbalanceDest: tx.oldbalanceDest, newbalanceDest: tx.newbalanceDest
      });
      setModalData({ loading: false, ai_text: res.data.ai_analysis, features: res.data.explanation, is_fraud: res.data.is_fraud, model: modelType });
    } catch (e) { setModalData({ loading: false, error: "Error" }); }
  };

  const handleDownloadReport = async () => {
    if (!batchStats) return;
    try {
      const res = await axios.post('http://127.0.0.1:8000/save-report', {
        filename: filename, total: batchStats.total_scanned, xgb_fraud: batchStats.xgb_flags, rf_fraud: batchStats.rf_flags, top_frauds: batchResults.slice(0, 10)
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) { alert("Error downloading PDF"); }
  };

  return (
    <div>
      <h1 style={{marginBottom: '30px'}}>Detection Engine</h1>
      
      {/* TOP TABS */}
      <div className="page-tabs">
        <button className={mode === 'single' ? 'active-tab' : ''} onClick={() => setMode('single')}>Single Check</button>
        <button className={mode === 'batch' ? 'active-tab' : ''} onClick={() => setMode('batch')}>Batch Upload</button>
      </div>

      {mode === 'single' && (
        <div className="card" style={{maxWidth: '600px', padding: '30px'}}>
          <h3 style={{marginTop: 0}}>Manual Entry</h3>
          <div className="form-grid">
            <input name="amount" placeholder="Amount ($)" onChange={handleChange} />
            <input name="oldbalanceOrg" placeholder="Sender Old Balance" onChange={handleChange} />
            <input name="newbalanceOrig" placeholder="Sender New Balance" onChange={handleChange} />
            <input name="oldbalanceDest" placeholder="Receiver Old Balance" onChange={handleChange} />
            <input name="newbalanceDest" placeholder="Receiver New Balance" onChange={handleChange} />
          </div>
          <button className="primary-btn" style={{marginTop: '20px', width: '100%'}} onClick={handleSinglePredict} disabled={loading}>
            {loading ? "Scanning..." : "Run Analysis"}
          </button>

          {singleResult && (
            <div style={{marginTop: '20px', padding: '15px', borderRadius: '8px', border: singleResult.is_fraud ? '1px solid var(--danger)' : '1px solid var(--success)', background: singleResult.is_fraud ? 'rgba(220,38,38,0.08)' : 'rgba(5,150,105,0.08)'}}>
              <h3 style={{margin: 0, color: singleResult.is_fraud ? 'var(--danger)' : 'var(--success)'}}>
                {singleResult.is_fraud ? "🚨 FRAUD DETECTED" : "✅ Safe Transaction"}
              </h3>
              {singleResult.is_fraud === 1 && <p style={{marginTop: '10px'}}>{singleResult.ai_analysis}</p>}
            </div>
          )}
        </div>
      )}

      {mode === 'batch' && (
        <div className="card" style={{padding: '30px'}}>
           <div className="upload-zone" style={{border: '2px dashed #262626', padding: '40px', textAlign: 'center', borderRadius: '8px'}}>
             <input type="file" accept=".csv" onChange={handleFileChange} style={{display: 'none'}} id="file-upload"/>
             <label htmlFor="file-upload" style={{cursor: 'pointer', display: 'block'}}>
                <span style={{fontSize: '3rem'}}>📂</span>
                <p>Click to upload transaction CSV</p>
             </label>
             {file && <p style={{color: 'var(--primary-teal)'}}>Selected: {file.name}</p>}
             <button className="primary-btn" onClick={handleBatchUpload} disabled={loading} style={{marginTop: '10px'}}>
               {loading ? "Processing..." : "Start Batch Scan"}
             </button>
           </div>

           {batchResults && (
             <div style={{marginTop: '30px'}}>
               <div className="page-tabs">
                 <button className={batchTab === 'table' ? 'active-tab' : ''} onClick={() => setBatchTab('table')}>Live Transactions</button>
                 <button className={batchTab === 'comparison' ? 'active-tab' : ''} onClick={() => setBatchTab('comparison')}>Model Consensus</button>
               </div>

               {batchTab === 'table' && (
                 <table style={{width: '100%', borderCollapse: 'collapse'}}>
                   <thead>
                     <tr>
                       <th style={{padding: '12px', textAlign: 'left'}}>Amount</th>
                       <th style={{padding: '12px', textAlign: 'left'}}>Sender Bal</th>
                       <th style={{padding: '12px', textAlign: 'left'}}>Risk Score</th>
                       <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                       <th style={{padding: '12px', textAlign: 'left'}}>Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {batchResults.map((row, i) => (
                       <tr key={i} className={row.XGB_Prediction === 1 ? 'row-fraud' : 'row-safe'}>
                         <td style={{padding: '12px'}}>${row.amount}</td>
                         <td style={{padding: '12px'}}>${row.oldbalanceOrg}</td>
                         <td style={{padding: '12px'}}>{row.XGB_Risk_Score?.toFixed(2)}</td>
                         <td style={{padding: '12px'}}>{row.XGB_Prediction === 1 ? <span style={{color: '#ef4444', fontWeight: 'bold'}}>High Risk</span> : <span style={{color: '#22c55e'}}>Safe</span>}</td>
                         <td style={{padding: '12px'}}><button onClick={() => analyzeRow(row)} style={{background: 'none', border: '1px solid var(--primary-teal)', color: 'var(--primary-teal)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Analyze</button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}

               {batchTab === 'comparison' && (
                 <>
                  <div className="comparison-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                    <div style={{background: '#171717', padding: '20px', borderRadius: '8px', border: '1px solid #262626'}}>
                      <h4>🌲 Random Forest</h4>
                      <h2 style={{fontSize: '2rem', color: 'var(--primary-teal)'}}>{batchStats.rf_flags}</h2>
                    </div>
                    <div style={{background: '#171717', padding: '20px', borderRadius: '8px', border: '1px solid #262626'}}>
                      <h4>🚀 XGBoost</h4>
                      <h2 style={{fontSize: '2rem', color: '#ef4444'}}>{batchStats.xgb_flags}</h2>
                    </div>
                  </div>
                  <button className="primary-btn" style={{marginTop: '20px', width: '100%'}} onClick={handleDownloadReport}>Download Audit PDF</button>
                 </>
               )}
             </div>
           )}
        </div>
      )}

      {/* MODAL */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)} style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" onClick={e => e.stopPropagation()} style={{width: '500px', padding: '30px', position: 'relative'}}>
            <h2>🤖 AI Analysis</h2>
            {modalData.loading ? <p>Thinking...</p> : (
               <>
                <div style={{background: '#262626', padding: '15px', borderRadius: '6px', borderLeft: '4px solid var(--primary-teal)', marginBottom: '20px'}}>
                  {modalData.ai_text}
                </div>
                <h4>Risk Contributors:</h4>
                <ul>
                  {modalData.features?.map((f, i) => (
                    <li key={i} style={{marginBottom: '5px'}}>
                      {f.feature}: <span style={{color: f.impact > 0 ? '#ef4444' : '#22c55e'}}>{f.impact.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <button className="primary-btn" onClick={() => setModalData(null)} style={{width: '100%', marginTop: '20px'}}>Close</button>
               </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;