import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [mode, setMode] = useState('single'); // 'single' or 'batch'
  const [batchTab, setBatchTab] = useState('table'); // 'table' or 'comparison'
  
  // 1. MOVED THIS INSIDE THE COMPONENT
  const [filename, setFilename] = useState(""); 

  // SINGLE MODE STATE
  const [formData, setFormData] = useState({
    amount: '', oldbalanceOrg: '', newbalanceOrig: '', oldbalanceDest: '', newbalanceDest: ''
  });
  const [singleResult, setSingleResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // BATCH MODE STATE
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [batchStats, setBatchStats] = useState(null); // Stores the counts (RF vs XGB)
   
  // POPUP STATE
  const [modalData, setModalData] = useState(null); // Stores the Gemini Analysis

  // --- SINGLE MODE FUNCTIONS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSinglePredict = async () => {
    setLoading(true);
    setSingleResult(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict?model_type=RF', formData);
      setSingleResult(response.data);
    } catch (error) {
      alert("Error connecting to backend");
    }
    setLoading(false);
  };

  // --- BATCH MODE FUNCTIONS ---
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name); // <--- Store the name
    }
  };

  const handleBatchUpload = async () => {
    if (!file) return alert("Please select a CSV file first!");
    const formData = new FormData();
    formData.append("file", file);
    
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload-batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update state with Backend Data
      setBatchResults(response.data.top_risky_transactions);
      setBatchStats(response.data.stats); // <--- This powers the Comparison Tab
      
      setBatchTab('table'); // Switch to table view on success
    } catch (error) {
      alert("Error uploading file. Make sure columns match.");
      console.error(error);
    }
    setLoading(false);
  };

  // 2. MOVED THIS FUNCTION INSIDE THE COMPONENT
  const handleDownloadReport = async () => {
    if (!batchStats || !batchResults) return;
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/save-report', {
        filename: filename,
        total: batchStats.total_scanned,
        xgb_fraud: batchStats.xgb_flags,
        rf_fraud: batchStats.rf_flags,
        top_frauds: batchResults.slice(0, 10) // Send top 10 for the PDF
      }, {
        responseType: 'blob' // Important: This tells Axios we expect a binary file (PDF)
      });
      
      // Create a link to download the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fraud_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      alert("Report saved to database & downloaded!");
    } catch (error) {
      console.error(error);
      alert("Error generating report");
    }
  };

  // ANALYZE ROW (Populate Modal with Gemini + SHAP)
  const analyzeRow = async (transaction) => {
    setModalData({ loading: true });
    
    // Check which model flagged it to ask the right "expert"
    const modelType = transaction.XGB_Prediction === 1 ? "XGB" : "RF";

    try {
      const response = await axios.post(`http://127.0.0.1:8000/predict?model_type=${modelType}`, {
        amount: transaction.amount,
        oldbalanceOrg: transaction.oldbalanceOrg,
        newbalanceOrig: transaction.newbalanceOrig,
        oldbalanceDest: transaction.oldbalanceDest,
        newbalanceDest: transaction.newbalanceDest
      });
      
      setModalData({
        loading: false,
        ai_text: response.data.ai_analysis,
        features: response.data.explanation, // SHAP VALUES
        is_fraud: response.data.is_fraud,
        model: modelType
      });

    } catch (error) {
      setModalData({ loading: false, error: "Failed to fetch analysis." });
    }
  };

  return (
    <div className="container">
      <h1>🛡️ FraudSentry Dashboard</h1>
      
      {/* MAIN TABS */}
      <div className="tabs">
        <button className={mode === 'single' ? 'active' : ''} onClick={() => setMode('single')}>Single Check</button>
        <button className={mode === 'batch' ? 'active' : ''} onClick={() => setMode('batch')}>Batch File Upload</button>
      </div>

      {/* === SINGLE CHECK VIEW === */}
      {mode === 'single' && (
        <div className="card">
          <h3>Manual Entry</h3>
          <div className="form-grid">
            <input name="amount" placeholder="Amount" onChange={handleChange} />
            <input name="oldbalanceOrg" placeholder="Old Balance (Sender)" onChange={handleChange} />
            <input name="newbalanceOrig" placeholder="New Balance (Sender)" onChange={handleChange} />
            <input name="oldbalanceDest" placeholder="Old Balance (Receiver)" onChange={handleChange} />
            <input name="newbalanceDest" placeholder="New Balance (Receiver)" onChange={handleChange} />
          </div>
          <button onClick={handleSinglePredict} disabled={loading}>
            {loading ? "Analyzing..." : "Check Transaction"}
          </button>

          {singleResult && (
            <div className={`result-box ${singleResult.is_fraud ? 'fraud' : 'safe'}`}>
              <h3>{singleResult.is_fraud ? "🚨 FRAUD DETECTED" : "✅ Transaction Safe"}</h3>
              {singleResult.is_fraud === 1 && (
                <div className="ai-box">
                  <strong>🤖 Gemini AI Analysis:</strong>
                  <p>{singleResult.ai_analysis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* === BATCH UPLOAD VIEW === */}
      {mode === 'batch' && (
        <div className="card">
          <h3>Upload Daily Transactions (CSV)</h3>
          <div className="upload-zone">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleBatchUpload} disabled={loading}>
              {loading ? "Scanning File..." : "Scan File"}
            </button>
          </div>

          {/* RESULTS AREA */}
          {batchResults && (
            <div>
              <div className="sub-tabs">
                <button className={batchTab === 'table' ? 'active-sub' : ''} onClick={() => setBatchTab('table')}>📋 Transactions</button>
                <button className={batchTab === 'comparison' ? 'active-sub' : ''} onClick={() => setBatchTab('comparison')}>📊 Model Comparison</button>
              </div>

              {/* SUB-TAB 1: TABLE */}
              {batchTab === 'table' && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Sender Bal</th>
                        <th>XGB Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((row, index) => (
                        <tr key={index} className={row.XGB_Prediction === 1 ? 'row-fraud' : 'row-safe'}>
                          <td>${row.amount}</td>
                          <td>${row.oldbalanceOrg}</td>
                          <td>{row.XGB_Risk_Score ? row.XGB_Risk_Score.toFixed(2) : '0.00'}</td>
                          <td>
                            {row.XGB_Prediction === 1 ? <span className="badge-fraud">High Risk</span> : <span className="badge-safe">Safe</span>}
                          </td>
                          <td>
                            <button className="btn-small" onClick={() => analyzeRow(row)}>
                              🔍 Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUB-TAB 2: COMPARISON DASHBOARD */}
              {/* 3. ADDED THE <> WRAPPER HERE TO FIX THE JSX ERROR */}
              {batchTab === 'comparison' && batchStats && (
                <>
                  <div className="comparison-grid">
                    
                    {/* Card 1: Random Forest */}
                    <div className="model-card rf">
                      <h4>🌲 Random Forest</h4>
                      <div className="stat-number">{batchStats.rf_flags}</div>
                      <p>Transactions Flagged</p>
                    </div>

                    {/* Card 2: XGBoost */}
                    <div className="model-card xgb">
                      <h4>🚀 XGBoost</h4>
                      <div className="stat-number">{batchStats.xgb_flags}</div>
                      <p>Transactions Flagged</p>
                    </div>

                    {/* Card 3: Consensus */}
                    <div className="model-card consensus">
                      <h4>🤝 High Confidence</h4>
                      <div className="stat-number">{batchStats.both_agreed}</div>
                      <p>Both models agree</p>
                    </div>

                    {/* Card 4: Total */}
                    <div className="model-card info">
                      <h4>📊 Total Scanned</h4>
                      <div className="stat-number">{batchStats.total_scanned}</div>
                      <p>Rows processed</p>
                    </div>
                    
                  </div>

                  {/* NEW BUTTON */}
                  <div style={{marginTop: '20px', textAlign: 'center'}}>
                    <button onClick={handleDownloadReport} style={{
                      padding: '15px 30px', 
                      fontSize: '1.2em', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      💾 Save History & Download PDF
                    </button>
                  </div> 
                </>
              )}

            </div>
          )}

          {/* MODAL FOR AI + SHAP */}
          {modalData && (
            <div className="modal-overlay" onClick={() => setModalData(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {modalData.loading ? <p>Loading Intelligence...</p> : (
                  <>
                    <h3>Analysis Report ({modalData.model})</h3>
                    
                    <div className="ai-section">
                      <h4>🤖 Gemini Action Plan</h4>
                      <p>{modalData.ai_text || "No explanation available (Transaction likely safe)."}</p>
                    </div>

                    {modalData.features && (
                      <div className="shap-section">
                        <h4>🔍 Top Risk Factors (SHAP)</h4>
                        <ul>
                          {modalData.features.map((f, i) => (
                            <li key={i}>
                              <strong>{f.feature}</strong>: 
                              <span style={{color: f.impact > 0 ? 'red' : 'green'}}>
                                {f.impact > 0 ? ` +${f.impact.toFixed(2)}` : ` ${f.impact.toFixed(2)}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button className="close-btn" onClick={() => setModalData(null)}>Close</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;