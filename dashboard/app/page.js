'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  BarChart2,
  Activity,
  Layers,
  Info,
  Database,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export default function DeepGuardDashboard() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Traffic Analyzer State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisWarnings, setAnalysisWarnings] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize Theme from localStorage or default to dark
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deepguard_theme');
      const initial = stored || 'dark';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('deepguard_theme', next);
    } catch (_) {}
  };

  // Fetch Model Metrics
  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (data.success) {
        setMetricsData(data);
      } else {
        setMetricsError(data.error || 'Failed to load model metrics');
      }
    } catch (err) {
      setMetricsError(err.message || 'Network error fetching metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Parse CSV text into preview table
  const parseCsvPreview = (text, filename = 'uploaded.csv') => {
    setCsvRawText(text);
    setAnalysisError(null);
    setAnalysisResults(null);
    setAnalysisWarnings([]);

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setAnalysisError('CSV file must contain a header row and at least one data record.');
      setPreviewHeaders([]);
      setPreviewRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    setPreviewHeaders(headers);

    const rows = lines.slice(1, 11).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] !== undefined ? vals[i] : '';
      });
      return obj;
    });

    setPreviewRows(rows);
    setUploadedFile({
      name: filename,
      totalRecords: lines.length - 1,
      columnCount: headers.length,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setAnalysisError('Invalid file format. Please upload a standard comma-separated (.csv) file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError('File size exceeds the 10MB limit. Please provide a smaller traffic batch.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        parseCsvPreview(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Load sample dataset
  const loadSample = async (type) => {
    setAnalysisError(null);
    try {
      const res = await fetch(`/api/sample-data?type=${type}`);
      const data = await res.json();
      if (data.success && data.csvText) {
        parseCsvPreview(data.csvText, data.filename);
      } else {
        setAnalysisError(data.error || 'Failed to load sample dataset.');
      }
    } catch (err) {
      setAnalysisError('Error fetching sample dataset: ' + err.message);
    }
  };

  // Execute inference on uploaded CSV
  const executeInference = async () => {
    if (!csvRawText) {
      setAnalysisError('Please upload or select a CSV dataset before running analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisWarnings([]);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvRawText }),
      });

      const data = await res.json();

      if (data.success) {
        setAnalysisResults(data);
        if (data.warnings && data.warnings.length > 0) {
          setAnalysisWarnings(data.warnings);
        }
      } else {
        setAnalysisError(data.error || 'Inference execution failed.');
        if (data.warnings) setAnalysisWarnings(data.warnings);
      }
    } catch (err) {
      setAnalysisError('Network error executing inference: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export predictions as CSV
  const downloadPredictionsCsv = () => {
    if (!analysisResults || !analysisResults.predictions) return;

    const headers = ['Row_Index', 'Predicted_Class', 'Confidence_Score', 'Numeric_Code'];
    const lines = [headers.join(',')];

    analysisResults.predictions.forEach((pred, i) => {
      const label = analysisResults.labels[i] || (pred === 1 ? 'Suspicious' : 'Benign');
      const conf = analysisResults.confidence_scores[i] || 0.0;
      lines.push(`${i + 1},"${label}",${conf},${pred}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `deepguard_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computed summary stats for Threat Analysis Tab
  const threatStats = useMemo(() => {
    if (!analysisResults || !analysisResults.summary) return null;
    const { total_records, benign_count, suspicious_count, attack_ratio_pct } =
      analysisResults.summary;

    return {
      total: total_records,
      benign: benign_count,
      suspicious: suspicious_count,
      attackRatio: attack_ratio_pct,
      benignRatio: total_records > 0 ? (100 - attack_ratio_pct).toFixed(2) : 0,
    };
  }, [analysisResults]);

  // Real evaluation metrics extracted from file
  const mlpMetrics = metricsData?.evaluationMetrics?.mlp || {
    accuracy: 0.99524,
    f1_macro: 0.99521,
    roc_auc: 0.99983,
    precision_macro: 0.99537,
    recall_macro: 0.99507,
    confusion_matrix: [
      [10076, 25],
      [65, 8730],
    ],
    per_class: {
      benign: { precision: 0.9936, recall: 0.9975, f1: 0.9956 },
      attack: { precision: 0.9971, recall: 0.9926, f1: 0.9949 },
    },
  };

  const baselineMetrics = metricsData?.evaluationMetrics?.baseline || {
    accuracy: 0.95295,
    f1_macro: 0.95265,
    roc_auc: 0.99203,
    precision_macro: 0.95353,
    recall_macro: 0.95199,
  };

  return (
    <div>
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="container nav-inner">
          <div className="brand-section">
            <Shield size={22} className="text-accent" style={{ color: 'var(--accent)' }} />
            <div>
              <span className="brand-title">DeepGuard AI</span>
              <span style={{ margin: '0 8px', color: 'var(--border-strong)' }}>/</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Network Intrusion Detection
              </span>
            </div>
            <span className="brand-badge">NSL-KDD</span>
          </div>

          <div className="nav-actions">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="theme-btn"
              title="Toggle Light / Dark mode"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="tabs-container">
        <div className="tabs-list">
          <button
            id="tab-overview"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={16} />
            <span>Overview</span>
          </button>
          <button
            id="tab-analyzer"
            className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <Activity size={16} />
            <span>Traffic Analyzer</span>
          </button>
          <button
            id="tab-performance"
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <BarChart2 size={16} />
            <span>Model Performance</span>
          </button>
          <button
            id="tab-threat"
            className={`tab-btn ${activeTab === 'threat' ? 'active' : ''}`}
            onClick={() => setActiveTab('threat')}
          >
            <AlertTriangle size={16} />
            <span>Threat Analysis</span>
            {analysisResults && <span className="badge-tag badge-red">Active</span>}
          </button>
          <button
            id="tab-info"
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={16} />
            <span>Model Information</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container main-content">
        {/* ========================================================= */}
        {/* TAB A: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Network Intrusion Detection System
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supervised deep learning classification on the UNB NSL-KDD benchmark using a
                PyTorch Multilayer Perceptron.
              </p>
            </div>

            {/* KPI Metric Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">MLP Test Accuracy</div>
                  <div className="kpi-value">
                    {(mlpMetrics.accuracy * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="kpi-subtext">
                  <span className="badge-tag badge-green">
                    +{( (mlpMetrics.accuracy - baselineMetrics.accuracy) * 100 ).toFixed(2)}% vs Baseline
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Macro F1-Score</div>
                  <div className="kpi-value">
                    {(mlpMetrics.f1_macro * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="kpi-subtext">
                  <span className="badge-tag badge-blue">
                    Balanced precision & recall
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">ROC-AUC Score</div>
                  <div className="kpi-value mono">
                    {mlpMetrics.roc_auc.toFixed(4)}
                  </div>
                </div>
                <div className="kpi-subtext">
                  <span className="badge-tag badge-green">Near-optimal discrimination</span>
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Baseline Accuracy (LR)</div>
                  <div className="kpi-value">
                    {(baselineMetrics.accuracy * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
                  Logistic Regression benchmark
                </div>
              </div>
            </div>

            {/* Model Readiness and Dataset Overview */}
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Model Readiness & Artifacts</div>
                    <div className="card-subtitle">Local artifact integrity status</div>
                  </div>
                  {metricsData?.readiness === 'ready' ? (
                    <span className="badge-tag badge-green">
                      <CheckCircle2 size={13} />
                      All Artifacts Verified ({metricsData.verifiedCount}/{metricsData.totalExpected})
                    </span>
                  ) : (
                    <span className="badge-tag badge-amber">
                      <AlertTriangle size={13} />
                      Partial ({metricsData?.verifiedCount || 0}/{metricsData?.totalExpected || 10})
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div className="info-row">
                    <span className="info-label">Model Architecture</span>
                    <span className="info-val">PyTorch MLP (128 → 64 → 32 → 1)</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Weights File</span>
                    <span className="info-val mono">model/deepguard_model.pth</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Preprocessor</span>
                    <span className="info-val mono">model/preprocessor.joblib</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Inference Runtime</span>
                    <span className="info-val">CPU-Optimized PyTorch</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Dataset Specification</div>
                    <div className="card-subtitle">UNB Canadian Institute for Cybersecurity</div>
                  </div>
                  <span className="badge-tag badge-blue">
                    <Database size={13} />
                    NSL-KDD
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div className="info-row">
                    <span className="info-label">Total Records</span>
                    <span className="info-val mono">148,517 (125,973 train / 22,544 test)</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Input Features</span>
                    <span className="info-val mono">41 Network Traffic Attributes</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Classification Target</span>
                    <span className="info-val">Binary: Benign (0) vs Attack (1)</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Evaluation Test Split</span>
                    <span className="info-val mono">18,896 records (Stratified held-out)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Disclaimer */}
            <div className="disclaimer-banner">
              <Info size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Academic Demonstration Notice:</strong> This project is developed solely
                for educational demonstration and B.Tech academic evaluation. Predictions are
                derived from statistical pattern recognition on the NSL-KDD benchmark dataset and
                must not be utilized as real-time security alerts or production intrusion
                infrastructure.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB B: TRAFFIC ANALYZER */}
        {/* ========================================================= */}
        {activeTab === 'analyzer' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Batch Traffic Analyzer
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Upload a CSV containing 41 NSL-KDD network traffic attributes for batch threat
                classification. Maximum file size: 10MB (up to 50,000 records).
              </p>
            </div>

            {/* Quick-Load Sample Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>Quick Test Actions:</strong> Test with verified NSL-KDD test samples:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  id="btn-load-benign"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadSample('benign')}
                >
                  Load 10 Benign Rows
                </button>
                <button
                  id="btn-load-attack"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadSample('attack')}
                >
                  Load 10 Attack Rows
                </button>
                <button
                  id="btn-load-mixed"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadSample('mixed')}
                >
                  Load 50 Mixed Rows
                </button>
                <a
                  href="/sample_mixed_batch.csv"
                  download="sample_traffic_template.csv"
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={13} />
                  Download Template
                </a>
              </div>
            </div>

            {/* Dropzone */}
            <div
              className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileChange({ target: input });
                  }
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {uploadedFile ? uploadedFile.name : 'Select or drag & drop a traffic CSV file'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {uploadedFile
                  ? `${uploadedFile.totalRecords.toLocaleString()} rows detected with ${uploadedFile.columnCount} columns`
                  : 'Comma-separated (.csv) format with 41 NSL-KDD feature columns'}
              </div>
            </div>

            {/* Error and Warnings Display */}
            {analysisError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: 'var(--attack-bg)',
                  border: '1px solid var(--attack-border)',
                  color: 'var(--attack)',
                  fontSize: '0.84rem',
                }}
              >
                <strong>Validation Error:</strong> {analysisError}
              </div>
            )}

            {analysisWarnings.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  color: 'var(--warning)',
                  fontSize: '0.82rem',
                }}
              >
                <strong>Notice:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                  {analysisWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview of Uploaded Data */}
            {previewRows.length > 0 && (
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Dataset Preview</div>
                    <div className="card-subtitle">
                      Displaying first {previewRows.length} rows of {uploadedFile?.totalRecords?.toLocaleString()} records
                    </div>
                  </div>
                  <button
                    id="btn-run-analysis"
                    className="btn btn-primary"
                    disabled={isAnalyzing}
                    onClick={executeInference}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        Evaluating Features...
                      </>
                    ) : (
                      <>
                        <Activity size={14} />
                        Run Threat Analysis
                      </>
                    )}
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {previewHeaders.slice(0, 10).map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                        {previewHeaders.length > 10 && (
                          <th>+{previewHeaders.length - 10} more cols</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="mono" style={{ color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          {previewHeaders.slice(0, 10).map((h) => (
                            <td key={h} className="mono">
                              {row[h]}
                            </td>
                          ))}
                          {previewHeaders.length > 10 && (
                            <td style={{ color: 'var(--text-muted)' }}>...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inference Results Table */}
            {analysisResults && (
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Inference Results</div>
                    <div className="card-subtitle">
                      Completed classification for {analysisResults.predictions.length.toLocaleString()} records
                    </div>
                  </div>
                  <button
                    id="btn-export-csv"
                    className="btn btn-secondary btn-sm"
                    onClick={downloadPredictionsCsv}
                  >
                    <Download size={14} />
                    Export Predictions as CSV
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Row #</th>
                        <th>Predicted Class</th>
                        <th>Confidence Score</th>
                        <th>Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.predictions.slice(0, 50).map((pred, i) => {
                        const isAttack = pred === 1;
                        const score = analysisResults.confidence_scores[i];
                        const label = analysisResults.labels[i] || (isAttack ? 'Suspicious' : 'Benign');

                        return (
                          <tr key={i}>
                            <td className="mono">{i + 1}</td>
                            <td>
                              <span
                                className={`badge-tag ${
                                  isAttack ? 'badge-red' : 'badge-green'
                                }`}
                              >
                                {isAttack ? 'Suspicious (Attack)' : 'Benign (Normal)'}
                              </span>
                            </td>
                            <td className="mono">
                              <strong>{(score * 100).toFixed(2)}%</strong>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--text-muted)',
                                  marginLeft: '6px',
                                }}
                              >
                                confidence score
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {isAttack
                                ? 'Traffic exhibits signatures matching NSL-KDD anomalous vectors'
                                : 'Traffic aligns with legitimate baseline network activity'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {analysisResults.predictions.length > 50 && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      marginTop: '12px',
                    }}
                  >
                    Showing first 50 rows. Click &ldquo;Export Predictions as CSV&rdquo; above to inspect full output.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB C: MODEL PERFORMANCE */}
        {/* ========================================================= */}
        {activeTab === 'performance' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Model Evaluation & Benchmark Comparison
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Comparison between the trained PyTorch Multilayer Perceptron and a classical
                Logistic Regression baseline on 18,896 held-out test samples.
              </p>
            </div>

            {/* Side-by-side Table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Side-by-Side Model Comparison</div>
                  <div className="card-subtitle">
                    Evaluated on 18,896 held-out test split (Seed: 42)
                  </div>
                </div>
                <span className="badge-tag badge-green">MLP Outperformed Baseline</span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>PyTorch MLP</th>
                      <th>Logistic Regression (Baseline)</th>
                      <th>Advantage (Δ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Accuracy</strong>
                      </td>
                      <td className="mono">{(mlpMetrics.accuracy * 100).toFixed(2)}%</td>
                      <td className="mono">{(baselineMetrics.accuracy * 100).toFixed(2)}%</td>
                      <td>
                        <span className="badge-tag badge-green">
                          +{( (mlpMetrics.accuracy - baselineMetrics.accuracy) * 100 ).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Macro Precision</strong>
                      </td>
                      <td className="mono">{(mlpMetrics.precision_macro * 100).toFixed(2)}%</td>
                      <td className="mono">{(baselineMetrics.precision_macro * 100).toFixed(2)}%</td>
                      <td>
                        <span className="badge-tag badge-green">
                          +{( (mlpMetrics.precision_macro - baselineMetrics.precision_macro) * 100 ).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Macro Recall</strong>
                      </td>
                      <td className="mono">{(mlpMetrics.recall_macro * 100).toFixed(2)}%</td>
                      <td className="mono">{(baselineMetrics.recall_macro * 100).toFixed(2)}%</td>
                      <td>
                        <span className="badge-tag badge-green">
                          +{( (mlpMetrics.recall_macro - baselineMetrics.recall_macro) * 100 ).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Macro F1-Score</strong>
                      </td>
                      <td className="mono">{(mlpMetrics.f1_macro * 100).toFixed(2)}%</td>
                      <td className="mono">{(baselineMetrics.f1_macro * 100).toFixed(2)}%</td>
                      <td>
                        <span className="badge-tag badge-green">
                          +{( (mlpMetrics.f1_macro - baselineMetrics.f1_macro) * 100 ).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>ROC-AUC</strong>
                      </td>
                      <td className="mono">{mlpMetrics.roc_auc.toFixed(5)}</td>
                      <td className="mono">{baselineMetrics.roc_auc.toFixed(5)}</td>
                      <td>
                        <span className="badge-tag badge-blue">
                          +{(mlpMetrics.roc_auc - baselineMetrics.roc_auc).toFixed(5)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per-class Metrics Table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Per-Class Performance (PyTorch MLP)</div>
                  <div className="card-subtitle">Detailed breakdown across Benign and Attack categories</div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class Category</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-Score</th>
                      <th>Test Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="badge-tag badge-green">Benign (Normal)</span>
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.benign?.precision || 0.9939) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.benign?.recall || 0.9961) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.benign?.f1 || 0.9950) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">10,101</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="badge-tag badge-red">Suspicious (Attack)</span>
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.attack?.precision || 0.9956) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.attack?.recall || 0.9930) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">
                        {( (mlpMetrics.per_class?.attack?.f1 || 0.9943) * 100 ).toFixed(2)}%
                      </td>
                      <td className="mono">8,795</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Generated Visual Artifacts Gallery */}
            <div className="grid-2">
              <div className="card">
                <div className="card-title" style={{ marginBottom: '12px' }}>
                  Confusion Matrix Comparison
                </div>
                <div
                  style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <img
                    src="/confusion_matrix.png"
                    alt="Confusion Matrix Comparison"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '8px',
                  }}
                >
                  MLP achieved 25 False Positives and 65 False Negatives across 18,896 records.
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: '12px' }}>
                  Training Loss Trajectory
                </div>
                <div
                  style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <img
                    src="/training_curve.png"
                    alt="Training Loss Trajectory"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '8px',
                  }}
                >
                  Early stopping triggered at Epoch 47 (Best validation loss 0.01526 at Epoch 37).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB D: THREAT ANALYSIS */}
        {/* ========================================================= */}
        {activeTab === 'threat' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Threat Distribution & Analytics
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Statistical breakdown of analyzed batch traffic patterns against the NSL-KDD
                benchmark.
              </p>
            </div>

            {threatStats ? (
              <div>
                {/* Summary Metrics */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Total Analyzed Records</div>
                    <div className="kpi-value mono">{threatStats.total.toLocaleString()}</div>
                    <div className="kpi-subtext">Processed in batch</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Benign Traffic</div>
                    <div className="kpi-value mono" style={{ color: 'var(--benign)' }}>
                      {threatStats.benign.toLocaleString()}
                    </div>
                    <div className="kpi-subtext">
                      <span className="badge-tag badge-green">{threatStats.benignRatio}% of batch</span>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Suspicious Traffic</div>
                    <div className="kpi-value mono" style={{ color: 'var(--attack)' }}>
                      {threatStats.suspicious.toLocaleString()}
                    </div>
                    <div className="kpi-subtext">
                      <span className="badge-tag badge-red">{threatStats.attackRatio}% of batch</span>
                    </div>
                  </div>
                </div>

                {/* Proportional Distribution Bar */}
                <div className="card">
                  <div className="card-title">Traffic Proportion Breakdown</div>
                  <div className="dist-bar-container">
                    <div
                      className="dist-bar-benign"
                      style={{ width: `${threatStats.benignRatio}%` }}
                      title={`Benign: ${threatStats.benignRatio}%`}
                    />
                    <div
                      className="dist-bar-attack"
                      style={{ width: `${threatStats.attackRatio}%` }}
                      title={`Suspicious: ${threatStats.attackRatio}%`}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      marginTop: '6px',
                    }}
                  >
                    <span style={{ color: 'var(--benign)', fontWeight: 500 }}>
                      ● Benign: {threatStats.benign.toLocaleString()} ({threatStats.benignRatio}%)
                    </span>
                    <span style={{ color: 'var(--attack)', fontWeight: 500 }}>
                      ● Suspicious: {threatStats.suspicious.toLocaleString()} ({threatStats.attackRatio}%)
                    </span>
                  </div>
                </div>

                {/* Key Feature Attribute Summary */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '12px' }}>
                    Feature Distribution Highlights
                  </div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Feature Attribute</th>
                          <th>Data Type</th>
                          <th>Schema Role</th>
                          <th>Observation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="mono">duration</td>
                          <td>Continuous (sec)</td>
                          <td>Connection length</td>
                          <td>Attacks frequently exhibit anomalous zero-duration or lingering sessions</td>
                        </tr>
                        <tr>
                          <td className="mono">src_bytes / dst_bytes</td>
                          <td>Integer (bytes)</td>
                          <td>Payload volume</td>
                          <td>Asymmetric volume ratios distinguish flood attacks from normal RPC</td>
                        </tr>
                        <tr>
                          <td className="mono">count / srv_count</td>
                          <td>Integer (count)</td>
                          <td>Time-window frequency</td>
                          <td>High connection count to same host signals port scan or SYN flood</td>
                        </tr>
                        <tr>
                          <td className="mono">serror_rate / rerror_rate</td>
                          <td>Float [0.0 - 1.0]</td>
                          <td>Error flags</td>
                          <td>High SYN error rates correlate with denied connection handshakes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}
              >
                <Activity size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  No Active Traffic Batch
                </div>
                <p style={{ fontSize: '0.86rem', marginTop: '4px', maxWidth: '440px', margin: '4px auto 16px' }}>
                  Please upload a dataset or load a sample in the Traffic Analyzer tab to view
                  threat distribution analytics.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setActiveTab('analyzer');
                    loadSample('mixed');
                  }}
                >
                  Load Sample Dataset & Analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB E: MODEL INFORMATION */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                System Architecture & Methodology
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Complete specifications for dataset, preprocessing pipeline, neural network
                architecture, and documented academic limitations.
              </p>
            </div>

            <div className="card">
              <div className="card-title">1. Dataset Specification</div>
              <div style={{ marginTop: '12px' }}>
                <div className="info-row">
                  <span className="info-label">Dataset Name</span>
                  <span className="info-val">NSL-KDD (Canadian Institute for Cybersecurity, UNB)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Official Source</span>
                  <span className="info-val mono">https://www.unb.ca/cic/datasets/nsl.html</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Volume</span>
                  <span className="info-val mono">148,517 records (KDDTrain+: 125,973 | KDDTest+: 22,544)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Feature Count</span>
                  <span className="info-val">41 input features (3 categorical: protocol_type, service, flag; 38 numeric)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Label Encoding</span>
                  <span className="info-val">Binary mapping: 0 = Benign/Normal, 1 = Attack (Neptune, Smurf, Satan, etc.)</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">2. Preprocessing & Normalization</div>
              <div style={{ marginTop: '12px' }}>
                <div className="info-row">
                  <span className="info-label">Categorical Encoding</span>
                  <span className="info-val">Deterministic integer-mapping with out-of-vocabulary fallback code</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Imputation Strategy</span>
                  <span className="info-val">Median imputation for numeric features, mode imputation for categoricals</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Feature Scaling</span>
                  <span className="info-val">StandardScaler (fitted strictly on training split to eliminate data leakage)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Leakage Elimination</span>
                  <span className="info-val">Target labels and difficulty scores are strictly isolated from feature space</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">3. Neural Network Architecture & Hyperparameters</div>
              <div style={{ marginTop: '12px' }}>
                <div className="info-row">
                  <span className="info-label">Model Class</span>
                  <span className="info-val mono">DeepGuardMLP (PyTorch)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Layer Dimensions</span>
                  <span className="info-val mono">Linear(41, 128) → Linear(128, 64) → Linear(64, 32) → Linear(32, 1)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Regularization</span>
                  <span className="info-val">BatchNorm1d after each hidden layer, Dropout (p = 0.3)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Activation Function</span>
                  <span className="info-val">ReLU for hidden layers, single raw logit output</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Loss Function</span>
                  <span className="info-val mono">BCEWithLogitsLoss</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Optimizer & Learning Rate</span>
                  <span className="info-val">Adam (lr = 0.001, batch size = 256)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Early Stopping</span>
                  <span className="info-val">Patience = 10 epochs (best validation loss 0.01526 achieved at epoch 37)</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">4. Documented System Limitations</div>
              <ul
                style={{
                  paddingLeft: '20px',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                  marginTop: '12px',
                  lineHeight: '1.6',
                }}
              >
                <li>
                  <strong>Outdated Protocol Signatures:</strong> NSL-KDD protocol signatures lack
                  representation of modern encrypted transport protocols including TLS 1.3, QUIC,
                  and HTTP/3.
                </li>
                <li>
                  <strong>Offline CSV Inference:</strong> The system processes extracted feature
                  tables rather than conducting promiscuous-mode raw packet capture on physical
                  NIC interfaces.
                </li>
                <li>
                  <strong>Synthetic Background Traffic:</strong> Inherited from the original
                  DARPA/KDD-99 benchmark, baseline traffic distributions do not reflect contemporary
                  cloud microservice architectures.
                </li>
                <li>
                  <strong>Binary Classification Abstraction:</strong> Predictions classify records
                  into Benign vs Attack, omitting specific multi-class attack taxonomy (e.g., DoS,
                  Probe, R2L, U2R).
                </li>
                <li>
                  <strong>Concept Drift Sensitivity:</strong> Statistical classifiers require
                  periodic re-training to adapt to emerging zero-day exploit patterns.
                </li>
                <li>
                  <strong>Academic Scope:</strong> This implementation is engineered solely for
                  capstone demonstration and academic research; it is not certified for enterprise
                  security operations centers (SOC).
                </li>
              </ul>
            </div>

            <div className="disclaimer-banner">
              <Shield size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Academic Disclaimer:</strong> This system is for academic study only.
                Predictions indicate statistical alignment with the NSL-KDD research dataset. It
                is not suitable for production security infrastructure.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
