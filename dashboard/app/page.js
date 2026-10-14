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
  Play,
  Eye,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sliders,
  Zap,
  Check,
  PieChart,
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import DeepGuardIcon from './components/DeepGuardIcon';

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
  const [fullParsedRecords, setFullParsedRecords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisWarnings, setAnalysisWarnings] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showSampleExplainer, setShowSampleExplainer] = useState(true);

  // Dynamic Controls State
  const [decisionThreshold, setDecisionThreshold] = useState(0.5);
  const [predictionFilter, setPredictionFilter] = useState('all'); // 'all', 'attack', 'benign', 'decisive'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedRow, setInspectedRow] = useState(null);

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

  // Parse CSV text into preview table and full records
  const parseCsvPreview = (text, filename = 'uploaded.csv') => {
    setCsvRawText(text);
    setAnalysisError(null);
    setAnalysisResults(null);
    setAnalysisWarnings([]);
    setInspectedRow(null);

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setAnalysisError('CSV file must contain a header row and at least one data record.');
      setPreviewHeaders([]);
      setPreviewRows([]);
      setFullParsedRecords([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    setPreviewHeaders(headers);

    const parsedAll = lines.slice(1).map((line, idx) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const obj = { _rowIndex: idx + 1 };
      headers.forEach((h, i) => {
        obj[h] = vals[i] !== undefined ? vals[i] : '';
      });
      return obj;
    });

    setFullParsedRecords(parsedAll);
    setPreviewRows(parsedAll.slice(0, 10));
    setUploadedFile({
      name: filename,
      totalRecords: parsedAll.length,
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
    reader.onerror = () => {
      setAnalysisError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setAnalysisError('Invalid file format. Please drop a .csv file.');
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
  const loadSampleDataset = async (type = 'mixed') => {
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

  // 1-Click: Load Sample AND Execute Inference directly
  const runSampleTestImmediate = async (type = 'mixed') => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/sample-data?type=${type}`);
      const data = await res.json();
      if (!data.success || !data.csvText) {
        setAnalysisError(data.error || 'Failed to load sample dataset.');
        setIsAnalyzing(false);
        return;
      }

      parseCsvPreview(data.csvText, data.filename);

      // Execute prediction immediately
      const predRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: data.csvText }),
      });
      const predData = await predRes.json();

      if (predData.success) {
        setAnalysisResults(predData);
        if (predData.warnings) setAnalysisWarnings(predData.warnings);
      } else {
        setAnalysisError(predData.error || 'Inference execution failed.');
      }
    } catch (err) {
      setAnalysisError('Error executing sample test: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute inference on current uploaded CSV
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

  // Export predictions as CSV (calibrated with current decision threshold)
  const downloadPredictionsCsv = () => {
    if (!analysisResults || !analysisResults.predictions) return;

    const headers = [
      'Row_Index',
      'Confidence_Score',
      'Threshold_Used',
      'Calibrated_Class',
      'Numeric_Code',
    ];
    const lines = [headers.join(',')];

    analysisResults.confidence_scores.forEach((score, i) => {
      const isAttack = score >= decisionThreshold;
      const label = isAttack ? 'Suspicious' : 'Benign';
      lines.push(`${i + 1},${score.toFixed(6)},${decisionThreshold.toFixed(2)},"${label}",${isAttack ? 1 : 0}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `deepguard_predictions_thresh${decisionThreshold}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Effective Predictions calibrated by Decision Threshold
  const effectivePredictions = useMemo(() => {
    if (!analysisResults || !analysisResults.confidence_scores) return [];
    return analysisResults.confidence_scores.map((score) => (score >= decisionThreshold ? 1 : 0));
  }, [analysisResults, decisionThreshold]);

  // Computed visual chart metrics from analysis results & dynamic threshold
  const visualChartData = useMemo(() => {
    if (!analysisResults || !analysisResults.confidence_scores || analysisResults.confidence_scores.length === 0) {
      return null;
    }

    const total = analysisResults.confidence_scores.length;
    const scores = analysisResults.confidence_scores;
    const suspicious = effectivePredictions.filter((p) => p === 1).length;
    const benign = total - suspicious;
    const benignPct = parseFloat(((benign / total) * 100).toFixed(1));
    const suspiciousPct = parseFloat(((suspicious / total) * 100).toFixed(1));

    const tierHigh = scores.filter((s) => s >= 0.99 || s <= 0.01).length;
    const tierStrong = scores.filter((s) => (s >= 0.95 && s < 0.99) || (s > 0.01 && s <= 0.05)).length;
    const tierModerate = scores.filter((s) => (s >= 0.90 && s < 0.95) || (s > 0.05 && s <= 0.1)).length;
    const tierLower = total - tierHigh - tierStrong - tierModerate;

    const avgConf =
      scores.length > 0
        ? ((scores.reduce((a, b) => a + (b >= 0.5 ? b : 1 - b), 0) / scores.length) * 100).toFixed(1)
        : '0.0';

    // SVG Donut calculation: radius = 60, circumference = 2 * PI * 60 = 376.99
    const circumference = 376.99;
    const benignStroke = (benignPct / 100) * circumference;
    const attackStroke = (suspiciousPct / 100) * circumference;
    const attackOffset = -benignStroke;

    let threatLevel = 'BENIGN / NORMAL';
    let threatBadgeClass = 'badge-green';
    if (suspiciousPct > 50) {
      threatLevel = 'CRITICAL THREAT INFLUX';
      threatBadgeClass = 'badge-red';
    } else if (suspiciousPct > 15) {
      threatLevel = 'ELEVATED SUSPICION';
      threatBadgeClass = 'badge-amber';
    } else if (suspiciousPct > 0) {
      threatLevel = 'LOW EXPOSURE';
      threatBadgeClass = 'badge-blue';
    }

    return {
      total,
      benign,
      suspicious,
      benignPct,
      suspiciousPct,
      tierHigh,
      tierStrong,
      tierModerate,
      tierLower,
      avgConf,
      circumference,
      benignStroke,
      attackStroke,
      attackOffset,
      threatLevel,
      threatBadgeClass,
    };
  }, [analysisResults, effectivePredictions]);

  // Dynamic Telemetry across Analyzed Batch (for Tab D Threat Analysis)
  const batchTelemetry = useMemo(() => {
    if (!fullParsedRecords || fullParsedRecords.length === 0 || !effectivePredictions.length) {
      return null;
    }

    const protoCounts = { tcp: 0, udp: 0, icmp: 0, other: 0 };
    const protoAttacks = { tcp: 0, udp: 0, icmp: 0, other: 0 };
    const serviceCounts = {};

    fullParsedRecords.forEach((rec, idx) => {
      const isAttack = effectivePredictions[idx] === 1;
      const proto = (rec.protocol_type || '').toLowerCase();
      if (proto.includes('tcp')) {
        protoCounts.tcp++;
        if (isAttack) protoAttacks.tcp++;
      } else if (proto.includes('udp')) {
        protoCounts.udp++;
        if (isAttack) protoAttacks.udp++;
      } else if (proto.includes('icmp')) {
        protoCounts.icmp++;
        if (isAttack) protoAttacks.icmp++;
      } else {
        protoCounts.other++;
        if (isAttack) protoAttacks.other++;
      }

      const srv = rec.service || 'unknown';
      serviceCounts[srv] = (serviceCounts[srv] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      protoCounts,
      protoAttacks,
      topServices,
      total: fullParsedRecords.length,
    };
  }, [fullParsedRecords, effectivePredictions]);

  // Dynamic Filtered Rows for Prediction Results Table
  const filteredPredictionRows = useMemo(() => {
    if (!analysisResults || !analysisResults.confidence_scores) return [];

    return analysisResults.confidence_scores
      .map((score, index) => {
        const isAttack = effectivePredictions[index] === 1;
        const rawRec = fullParsedRecords[index] || {};
        return {
          index: index + 1,
          score,
          isAttack,
          label: isAttack ? 'Suspicious' : 'Benign',
          rawRec,
        };
      })
      .filter((row) => {
        // Filter by class
        if (predictionFilter === 'attack' && !row.isAttack) return false;
        if (predictionFilter === 'benign' && row.isAttack) return false;
        if (predictionFilter === 'decisive' && row.score > 0.1 && row.score < 0.9) return false;

        // Filter by search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchIndex = String(row.index).includes(q);
          const matchScore = (row.score * 100).toFixed(2).includes(q);
          const matchProto = (row.rawRec.protocol_type || '').toLowerCase().includes(q);
          const matchService = (row.rawRec.service || '').toLowerCase().includes(q);
          const matchFlag = (row.rawRec.flag || '').toLowerCase().includes(q);
          return matchIndex || matchScore || matchProto || matchService || matchFlag;
        }

        return true;
      });
  }, [analysisResults, effectivePredictions, fullParsedRecords, predictionFilter, searchQuery]);

  // Real evaluation metrics extracted from file
  const mlpMetrics = metricsData?.evaluationMetrics?.mlp || {
    accuracy: 0.99465,
    f1_macro: 0.99463,
    roc_auc: 0.9999,
    precision_macro: 0.99471,
    recall_macro: 0.99454,
    confusion_matrix: [
      [10062, 39],
      [62, 8733],
    ],
    per_class: {
      benign: { precision: 0.99388, recall: 0.99614, f1: 0.99501 },
      attack: { precision: 0.99555, recall: 0.99295, f1: 0.99425 },
    },
  };

  const baselineMetrics = metricsData?.evaluationMetrics?.baseline || {
    accuracy: 0.95295,
    f1_macro: 0.95265,
    roc_auc: 0.99201,
    precision_macro: 0.95355,
    recall_macro: 0.95198,
  };

  // Dynamically calculate False Positive Rate from actual confusion matrix
  const fpCount = mlpMetrics.confusion_matrix ? mlpMetrics.confusion_matrix[0][1] : 39;
  const tnCount = mlpMetrics.confusion_matrix ? mlpMetrics.confusion_matrix[0][0] : 10062;
  const fnCount = mlpMetrics.confusion_matrix ? mlpMetrics.confusion_matrix[1][0] : 62;
  const tpCount = mlpMetrics.confusion_matrix ? mlpMetrics.confusion_matrix[1][1] : 8733;
  const totalBenignTest = tnCount + fpCount;
  const dynamicFpr = totalBenignTest > 0 ? ((fpCount / totalBenignTest) * 100).toFixed(2) : '0.25';

  return (
    <div>
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="container nav-inner">
          <div className="brand-section">
            <DeepGuardIcon size={26} status="idle" />
            <div>
              <span className="brand-title">DeepGuard AI</span>
              <span style={{ margin: '0 8px', color: 'var(--border-strong)' }}>/</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Network Intrusion Detection System
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
            {visualChartData && <span className="badge-tag badge-red">Active</span>}
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
            {/* Header Title */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DeepGuardIcon size={24} status="idle" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Deep Learning Network Intrusion Detection System
                </h1>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Automated threat classification across 41 network traffic dimensions on the UNB NSL-KDD benchmark.
              </p>
            </div>

            {/* What is DeepGuard AI? Executive Card */}
            <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DeepGuardIcon size={20} status="idle" />
                What is DeepGuard AI?
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                <strong>DeepGuard AI</strong> is a deep-learning-based Network Intrusion Detection System (NIDS) designed
                to analyze multidimensional connection records and differentiate legitimate network sessions from malicious attacks
                (such as DoS floods, port sweeps, and unauthorized privilege escalation). Built using <strong>PyTorch</strong> and trained
                on the verified Canadian Institute for Cybersecurity <strong>NSL-KDD benchmark</strong>, it evaluates 41 flow attributes
                with calibrated confidence scoring, achieving <strong>99.47% accuracy</strong> with near-zero false alarms.
              </p>
            </div>

            {/* Interactive Detection Pipeline Flowchart */}
            <div className="card">
              <div className="card-title">Detection Pipeline Architecture</div>
              <div className="card-subtitle">
                How an incoming network packet log is transformed, evaluated, and classified
              </div>

              <div className="pipeline-grid">
                <div className="pipeline-step">
                  <div className="pipeline-num">
                    <DeepGuardIcon size={16} status="idle" showRadar={false} />
                  </div>
                  <div className="pipeline-title">1. Feature Ingestion</div>
                  <div className="pipeline-desc">
                    41 traffic attributes are extracted: transport protocols (TCP/UDP), services, payload byte counts, and connection rate counters.
                  </div>
                </div>

                <div className="pipeline-step">
                  <div className="pipeline-num">
                    <DeepGuardIcon size={16} status="idle" showRadar={false} />
                  </div>
                  <div className="pipeline-title">2. StandardScaler Preprocessing</div>
                  <div className="pipeline-desc">
                    Categoricals are encoded deterministically. Numeric dimensions are normalized via fitted StandardScaler with strict zero-leakage isolation.
                  </div>
                </div>

                <div className="pipeline-step">
                  <div className="pipeline-num">
                    <DeepGuardIcon size={16} status="scanning" />
                  </div>
                  <div className="pipeline-title">3. PyTorch MLP Forward Pass</div>
                  <div className="pipeline-desc">
                    4-layer neural network (41 → 128 → 64 → 32 → 1) with BatchNorm1d and Dropout (p=0.3) evaluates non-linear attack interactions.
                  </div>
                </div>

                <div className="pipeline-step">
                  <div className="pipeline-num">
                    <DeepGuardIcon size={16} status="secure" />
                  </div>
                  <div className="pipeline-title">4. Calibrated Decision & Alert</div>
                  <div className="pipeline-desc">
                    Sigmoid activation computes calibrated confidence score. The connection is tagged as Benign or Suspicious with threshold certainty.
                  </div>
                </div>
              </div>
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
                    +{( (mlpMetrics.accuracy - baselineMetrics.accuracy) * 100 ).toFixed(2)}% vs Baseline LR
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
                    Balanced on both Normal & Attack
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">ROC-AUC Discrimination</div>
                  <div className="kpi-value mono">
                    {mlpMetrics.roc_auc.toFixed(4)}
                  </div>
                </div>
                <div className="kpi-subtext">
                  <span className="badge-tag badge-green">Near-optimal diagnostic score</span>
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">False Positive Rate (Dynamic)</div>
                  <div className="kpi-value mono" style={{ color: 'var(--benign)' }}>
                    {dynamicFpr}%
                  </div>
                </div>
                <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
                  Only {fpCount} false alarms out of {totalBenignTest.toLocaleString()} test rows
                </div>
              </div>
            </div>

            {/* Why These Metrics Matter: Engineering Guide */}
            <div className="card">
              <div className="card-title">Why These Performance Metrics Matter</div>
              <div className="card-subtitle">
                Engineering context for academic evaluation and real-world security assessment
              </div>

              <div className="concept-grid">
                <div className="concept-box">
                  <div className="concept-title">
                    <CheckCircle2 size={16} style={{ color: 'var(--benign)' }} />
                    99.47% Accuracy on 18,896 Test Records
                  </div>
                  <div className="concept-text">
                    Evaluated on an uncorrupted held-out test split that was never shown to the network during training or early stopping. It represents genuine generalization.
                  </div>
                </div>

                <div className="concept-box">
                  <div className="concept-title">
                    <Sliders size={16} style={{ color: 'var(--accent)' }} />
                    +4.17% Margin Over Classical Baseline
                  </div>
                  <div className="concept-text">
                    Logistic Regression achieves 95.30%. The +4.17% advantage confirms that high-dimensional attacks require the non-linear feature interactions learned by the MLP.
                  </div>
                </div>

                <div className="concept-box">
                  <div className="concept-title">
                    <Zap size={16} style={{ color: 'var(--warning)' }} />
                    Near-Zero False Positive Rate ({dynamicFpr}%)
                  </div>
                  <div className="concept-text">
                    In enterprise security, false alarms cause alert fatigue. DeepGuard AI misclassified only {fpCount} out of {totalBenignTest.toLocaleString()} benign connections.
                  </div>
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

            {/* Quick Action CTA Box */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: '4px solid var(--accent)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <DeepGuardIcon size={32} status="scanning" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                    Ready to test the model with sample traffic data?
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Run instant batch inference on verified NSL-KDD sample records and inspect visual predictions.
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setActiveTab('analyzer');
                  runSampleTestImmediate('mixed');
                }}
              >
                <Play size={14} />
                Launch 1-Click Test Drive (50 Mixed Records)
              </button>
            </div>

            {/* Academic Disclaimer */}
            <div className="disclaimer-banner">
              <DeepGuardIcon size={18} status="idle" />
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
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DeepGuardIcon size={24} status="idle" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Batch Traffic Analyzer & Threat Classifier
                </h2>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Run deep learning threat classification on network traffic batches or test instantly using pre-verified samples.
              </p>
            </div>

            {/* Dedicated Sample Dataset Test Suite (Requirement 3) */}
            <div className="sample-box">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <DeepGuardIcon size={26} status="idle" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                        Interactive Sample Dataset Test Suite
                      </span>
                      <span className="badge-tag badge-blue">Ready to Run</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Execute immediate inference on authentic NSL-KDD test traffic without needing external CSV files.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => runSampleTestImmediate('mixed')}
                    disabled={isAnalyzing}
                  >
                    <Play size={13} />
                    Run 1-Click Test (50 Mixed Records)
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => runSampleTestImmediate('benign')}
                    disabled={isAnalyzing}
                  >
                    <Check size={13} style={{ color: 'var(--benign)' }} />
                    Test 10 Benign Records
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => runSampleTestImmediate('attack')}
                    disabled={isAnalyzing}
                  >
                    <AlertTriangle size={13} style={{ color: 'var(--attack)' }} />
                    Test 10 Attack Records
                  </button>
                  <a
                    href="/sample_mixed_batch.csv"
                    download="sample_traffic_batch.csv"
                    className="btn btn-secondary btn-sm"
                    title="Download raw sample CSV template"
                  >
                    <Download size={13} />
                    CSV Template
                  </a>
                </div>
              </div>

              {/* Explainer: What does this sample data contain? */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSampleExplainer(!showSampleExplainer)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0,
                  }}
                >
                  <Info size={14} />
                  <span>What does this sample dataset contain? (41 NSL-KDD Features Explained)</span>
                  {showSampleExplainer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showSampleExplainer && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Each sample packet record encapsulates <strong>41 network traffic measurements</strong> standardized
                      by the Canadian Institute for Cybersecurity, spanning four operational security domains:
                    </p>

                    <div className="sample-feature-grid">
                      <div className="feature-pill">
                        <div className="feature-pill-name">
                          <span>1. Basic TCP/IP Connections</span>
                          <span className="mono font-semibold" style={{ fontSize: '0.7rem' }}>9 Features</span>
                        </div>
                        <div className="feature-pill-desc">
                          `duration`, `protocol_type` (tcp/udp/icmp), `service` (http, ftp, etc.), `flag` (SF, REJ, S0), `src_bytes`, `dst_bytes`, `land`, `wrong_fragment`, `urgent`.
                        </div>
                      </div>

                      <div className="feature-pill">
                        <div className="feature-pill-name">
                          <span>2. Content Specifications</span>
                          <span className="mono font-semibold" style={{ fontSize: '0.7rem' }}>13 Features</span>
                        </div>
                        <div className="feature-pill-desc">
                          Payload indicators: `hot`, `num_failed_logins`, `logged_in`, `num_compromised`, `root_shell`, `su_attempted`, `num_file_creations`, `num_shells`, `num_access_files`.
                        </div>
                      </div>

                      <div className="feature-pill">
                        <div className="feature-pill-name">
                          <span>3. Time-based Traffic Patterns</span>
                          <span className="mono font-semibold" style={{ fontSize: '0.7rem' }}>9 Features</span>
                        </div>
                        <div className="feature-pill-desc">
                          Window metrics: `count` (connections to same host in 2s), `srv_count`, `serror_rate`, `srv_serror_rate`, `rerror_rate`, `same_srv_rate`, `diff_srv_rate`.
                        </div>
                      </div>

                      <div className="feature-pill">
                        <div className="feature-pill-name">
                          <span>4. Host-based Machine Traffic</span>
                          <span className="mono font-semibold" style={{ fontSize: '0.7rem' }}>10 Features</span>
                        </div>
                        <div className="feature-pill-desc">
                          Destination profile: `dst_host_count`, `dst_host_srv_count`, `dst_host_same_srv_rate`, `dst_host_diff_srv_rate`, `dst_host_serror_rate`, `dst_host_rerror_rate`.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Scanning / Radar Animation Overlay when isAnalyzing === true */}
            {isAnalyzing && (
              <div className="scan-overlay-card">
                <DeepGuardIcon size={64} status="scanning" />
                <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '1.08rem', color: 'var(--text-primary)' }}>
                  DeepGuard Neural Engine Analyzing Traffic...
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Evaluating 41 dimensions through PyTorch DeepGuardMLP with calibrated sigmoid certainty
                </div>
                <div className="scan-progress-track">
                  <div className="scan-progress-bar" />
                </div>
              </div>
            )}

            {/* Upload Area / Dropzone */}
            <div
              className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <DeepGuardIcon size={52} status={isDragActive ? 'scanning' : 'idle'} showPulse />
              <div style={{ marginTop: '14px', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {uploadedFile ? uploadedFile.name : 'Upload or Drag & Drop Custom Network CSV'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                {uploadedFile
                  ? `Loaded ${uploadedFile.totalRecords.toLocaleString()} rows (${uploadedFile.columnCount} columns)`
                  : 'Accepts standard comma-separated (.csv) files formatted with the 41 NSL-KDD traffic attributes'}
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <span className="btn btn-secondary btn-sm">
                  <Upload size={13} />
                  Browse Files
                </span>
                {uploadedFile && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeInference();
                    }}
                    disabled={isAnalyzing}
                  >
                    <Play size={13} />
                    Run Analysis
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {analysisError && (
              <div className="error-banner" style={{ marginTop: '16px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Warnings */}
            {analysisWarnings.length > 0 && (
              <div className="warning-banner" style={{ marginTop: '16px' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Traffic Ingestion Notice:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {analysisWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* File Ingestion Preview */}
            {previewRows.length > 0 && (
              <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Ingested Traffic Preview</div>
                    <div className="card-subtitle">
                      Displaying first {previewRows.length} rows of {uploadedFile?.totalRecords} parsed records
                    </div>
                  </div>
                  <span className="badge-tag badge-blue">
                    {previewHeaders.length} Schema Columns
                  </span>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {previewHeaders.slice(0, 10).map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                        {previewHeaders.length > 10 && <th>+{previewHeaders.length - 10} more</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="mono">{idx + 1}</td>
                          {previewHeaders.slice(0, 10).map((h, i) => (
                            <td key={i} className="mono" style={{ fontSize: '0.78rem' }}>
                              {String(row[h]).slice(0, 18)}
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

            {/* VISUAL CHARTS & ANALYSIS OUTPUT */}
            {visualChartData && (
              <div style={{ marginTop: '28px' }}>
                {/* Visual Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DeepGuardIcon
                      size={24}
                      status={visualChartData.suspicious > 0 ? 'threat' : 'secure'}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                        Threat Analytics & Visual Breakdown
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Visual distribution of classified network sessions and model certainty metrics
                      </p>
                    </div>
                  </div>
                  <span className={`badge-tag ${visualChartData.threatBadgeClass}`} style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DeepGuardIcon
                      size={14}
                      status={visualChartData.threatBadgeClass === 'badge-red' ? 'threat' : 'secure'}
                      showRadar={false}
                    />
                    Assessment: {visualChartData.threatLevel}
                  </span>
                </div>

                {/* 2 Visual Charts Side-by-Side: Donut + Confidence Spectrum */}
                <div className="chart-grid">
                  {/* Chart 1: SVG Donut Visualizer */}
                  <div className="donut-card">
                    <div className="card-title" style={{ fontSize: '0.96rem' }}>
                      Session Threat Proportion
                    </div>
                    <div className="card-subtitle">
                      Distribution of normal vs anomalous sessions
                    </div>

                    <div className="donut-body">
                      {/* SVG Donut Circle */}
                      <div className="donut-svg-wrap">
                        <svg width="150" height="150" viewBox="0 0 150 150">
                          {/* Background Track */}
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="transparent"
                            stroke="var(--bg-subtle)"
                            strokeWidth="18"
                          />
                          {/* Benign Segment (Green) */}
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="transparent"
                            stroke="var(--benign)"
                            strokeWidth="18"
                            strokeDasharray={`${visualChartData.benignStroke} ${visualChartData.circumference}`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 75 75)"
                          />
                          {/* Attack Segment (Red) */}
                          {visualChartData.suspicious > 0 && (
                            <circle
                              cx="75"
                              cy="75"
                              r="60"
                              fill="transparent"
                              stroke="var(--attack)"
                              strokeWidth="18"
                              strokeDasharray={`${visualChartData.attackStroke} ${visualChartData.circumference}`}
                              strokeDashoffset={visualChartData.attackOffset}
                              strokeLinecap="round"
                              transform="rotate(-90 75 75)"
                            />
                          )}
                        </svg>

                        {/* Center Readout with Animated Status Emblem */}
                        <div className="donut-center-text">
                          <DeepGuardIcon
                            size={22}
                            status={visualChartData.suspicious > 0 ? 'threat' : 'secure'}
                            showPulse={false}
                          />
                          <span className="donut-center-pct">
                            {visualChartData.suspiciousPct}%
                          </span>
                          <span className="donut-center-label">
                            Attack Ratio
                          </span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="donut-legend">
                        <div className="legend-item">
                          <div>
                            <span className="legend-indicator" style={{ background: 'var(--benign)' }} />
                            <span>Benign (Normal)</span>
                          </div>
                          <span className="mono" style={{ fontWeight: 600 }}>
                            {visualChartData.benign} ({visualChartData.benignPct}%)
                          </span>
                        </div>

                        <div className="legend-item">
                          <div>
                            <span className="legend-indicator" style={{ background: 'var(--attack)' }} />
                            <span>Suspicious (Attack)</span>
                          </div>
                          <span className="mono" style={{ fontWeight: 600 }}>
                            {visualChartData.suspicious} ({visualChartData.suspiciousPct}%)
                          </span>
                        </div>

                        <div className="legend-item" style={{ background: 'transparent', border: 'none', padding: '4px 0' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Total Records</span>
                          <span className="mono" style={{ fontWeight: 700 }}>
                            {visualChartData.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Confidence Score Decisiveness Spectrum */}
                  <div className="spectrum-card">
                    <div>
                      <div className="card-title" style={{ fontSize: '0.96rem' }}>
                        Model Decisiveness Spectrum
                      </div>
                      <div className="card-subtitle">
                        Certainty distribution across analyzed records (Average Certainty: {visualChartData.avgConf}%)
                      </div>
                    </div>

                    <div className="spectrum-bars">
                      {/* Tier 1: High Certainty (99% - 100%) */}
                      <div className="spectrum-row">
                        <div className="spectrum-meta">
                          <span>High Certainty (&gt;99% Certain)</span>
                          <span className="mono font-semibold">
                            {visualChartData.tierHigh} rows ({((visualChartData.tierHigh / visualChartData.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="spectrum-bar-track">
                          <div
                            className="spectrum-bar-fill"
                            style={{
                              width: `${(visualChartData.tierHigh / visualChartData.total) * 100}%`,
                              background: 'var(--accent)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Tier 2: Strong Certainty (95% - 99%) */}
                      <div className="spectrum-row">
                        <div className="spectrum-meta">
                          <span>Strong Certainty (95% - 99%)</span>
                          <span className="mono font-semibold">
                            {visualChartData.tierStrong} rows ({((visualChartData.tierStrong / visualChartData.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="spectrum-bar-track">
                          <div
                            className="spectrum-bar-fill"
                            style={{
                              width: `${(visualChartData.tierStrong / visualChartData.total) * 100}%`,
                              background: 'var(--benign)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Tier 3: Moderate Certainty (90% - 95%) */}
                      <div className="spectrum-row">
                        <div className="spectrum-meta">
                          <span>Moderate Certainty (90% - 95%)</span>
                          <span className="mono font-semibold">
                            {visualChartData.tierModerate} rows ({((visualChartData.tierModerate / visualChartData.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="spectrum-bar-track">
                          <div
                            className="spectrum-bar-fill"
                            style={{
                              width: `${(visualChartData.tierModerate / visualChartData.total) * 100}%`,
                              background: 'var(--warning)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Tier 4: Boundary / Ambiguous (<90%) */}
                      <div className="spectrum-row">
                        <div className="spectrum-meta">
                          <span>Boundary Cases (&lt;90%)</span>
                          <span className="mono font-semibold">
                            {visualChartData.tierLower} rows ({((visualChartData.tierLower / visualChartData.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="spectrum-bar-track">
                          <div
                            className="spectrum-bar-fill"
                            style={{
                              width: `${(visualChartData.tierLower / visualChartData.total) * 100}%`,
                              background: 'var(--border-strong)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SENSITIVITY / DECISION THRESHOLD CONTROLLER */}
                <div className="threshold-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SlidersHorizontal size={18} style={{ color: 'var(--accent)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Dynamic Decision Sensitivity Threshold: <span className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{decisionThreshold.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        Adjust detection sensitivity in real-time. Signals $\ge$ {decisionThreshold.toFixed(2)} trigger threat classification.
                      </div>
                    </div>
                  </div>

                  <div className="threshold-slider-wrap">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.10 (High Sensitivity)</span>
                    <input
                      type="range"
                      min="0.10"
                      max="0.90"
                      step="0.01"
                      value={decisionThreshold}
                      onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
                      className="threshold-slider"
                      title="Adjust decision threshold"
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.90 (Strict)</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDecisionThreshold(0.5)}
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      title="Reset threshold to default 0.50"
                    >
                      Reset (0.50)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inference Results Table with Dynamic Search & Filters */}
            {analysisResults && (
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div className="card-title">Per-Flow Classification Records</div>
                    <div className="card-subtitle">
                      Evaluated {analysisResults.predictions.length.toLocaleString()} network sessions with DeepGuardMLP
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      id="btn-export-csv"
                      className="btn btn-secondary btn-sm"
                      onClick={downloadPredictionsCsv}
                    >
                      <Download size={14} />
                      Export Predictions as CSV
                    </button>
                  </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="table-filter-toolbar">
                  <div className="filter-pills-group">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '4px' }}>Filter:</span>
                    <button
                      className={`filter-pill-btn ${predictionFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setPredictionFilter('all')}
                    >
                      All ({analysisResults.predictions.length})
                    </button>
                    <button
                      className={`filter-pill-btn ${predictionFilter === 'attack' ? 'active' : ''}`}
                      onClick={() => setPredictionFilter('attack')}
                    >
                      Threats Only ({visualChartData?.suspicious})
                    </button>
                    <button
                      className={`filter-pill-btn ${predictionFilter === 'benign' ? 'active' : ''}`}
                      onClick={() => setPredictionFilter('benign')}
                    >
                      Benign Only ({visualChartData?.benign})
                    </button>
                    <button
                      className={`filter-pill-btn ${predictionFilter === 'decisive' ? 'active' : ''}`}
                      onClick={() => setPredictionFilter('decisive')}
                    >
                      High Certainty (&ge;90%)
                    </button>
                  </div>

                  <div className="search-input-box">
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search row #, protocol, service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <X
                        size={14}
                        style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                        onClick={() => setSearchQuery('')}
                      />
                    )}
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Row #</th>
                        <th>Protocol / Service</th>
                        <th>Predicted Class</th>
                        <th>Confidence Score</th>
                        <th>Assessment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPredictionRows.slice(0, 50).map((row) => {
                        const score = row.score;
                        const isAttack = row.isAttack;
                        const proto = row.rawRec.protocol_type || 'tcp';
                        const service = row.rawRec.service || '-';

                        return (
                          <tr key={row.index}>
                            <td className="mono">{row.index}</td>
                            <td className="mono" style={{ fontSize: '0.8rem' }}>
                              <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {proto}
                              </span>
                              <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{service}</span>
                            </td>
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
                                {score >= decisionThreshold ? 'threat' : 'benign'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {isAttack
                                ? 'Traffic exhibits signatures matching NSL-KDD anomalous vectors'
                                : 'Traffic aligns with legitimate baseline network activity'}
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                                onClick={() => setInspectedRow(row)}
                              >
                                <Eye size={12} />
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredPredictionRows.length > 50 && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      marginTop: '12px',
                    }}
                  >
                    Showing first 50 of {filteredPredictionRows.length} filtered rows. Click &ldquo;Export Predictions as CSV&rdquo; above to inspect full output.
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC ROW INSPECTOR MODAL */}
            {inspectedRow && (
              <div className="modal-backdrop" onClick={() => setInspectedRow(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DeepGuardIcon
                        size={22}
                        status={inspectedRow.isAttack ? 'threat' : 'secure'}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          Network Flow #{inspectedRow.index} Inspection
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Raw NSL-KDD Feature Attributes & Neural Confidence
                        </span>
                      </div>
                    </div>
                    <button className="modal-close-btn" onClick={() => setInspectedRow(null)}>
                      Close &times;
                    </button>
                  </div>

                  {/* Summary Header */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div className="flow-feature-item" style={{ flex: 1 }}>
                      <div className="flow-feature-key">Classification</div>
                      <div className="flow-feature-val" style={{ color: inspectedRow.isAttack ? 'var(--attack)' : 'var(--benign)' }}>
                        {inspectedRow.isAttack ? 'Suspicious (Threat)' : 'Benign (Clean)'}
                      </div>
                    </div>
                    <div className="flow-feature-item" style={{ flex: 1 }}>
                      <div className="flow-feature-key">Raw Confidence Score</div>
                      <div className="flow-feature-val mono">
                        {(inspectedRow.score * 100).toFixed(4)}%
                      </div>
                    </div>
                    <div className="flow-feature-item" style={{ flex: 1 }}>
                      <div className="flow-feature-key">Active Decision Threshold</div>
                      <div className="flow-feature-val mono">
                        {decisionThreshold.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="card-title" style={{ fontSize: '0.88rem', marginBottom: '8px' }}>
                    41 Connection Feature Values:
                  </div>

                  <div className="flow-features-grid">
                    {Object.entries(inspectedRow.rawRec)
                      .filter(([k]) => !k.startsWith('_'))
                      .map(([key, val]) => (
                        <div key={key} className="flow-feature-item">
                          <div className="flow-feature-key">{key}</div>
                          <div className="flow-feature-val">{val !== '' ? String(val) : '0'}</div>
                        </div>
                      ))}
                  </div>
                </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DeepGuardIcon size={24} status="secure" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Model Evaluation & Benchmark Comparison
                </h2>
              </div>
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
                      <td className="mono">{totalBenignTest.toLocaleString()}</td>
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
                      <td className="mono">{(fnCount + tpCount).toLocaleString()}</td>
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
                  MLP achieved {fpCount} False Positives and {fnCount} False Negatives across 18,896 records.
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
                  Early stopping triggered at Epoch 47 (Best validation loss 0.01526 achieved at Epoch 37).
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DeepGuardIcon
                  size={24}
                  status={visualChartData?.suspicious > 0 ? 'threat' : 'idle'}
                />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Threat Distribution & Telemetry Analytics
                </h2>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Statistical breakdown of analyzed batch traffic patterns against the NSL-KDD benchmark.
              </p>
            </div>

            {visualChartData ? (
              <div>
                {/* Summary Metrics */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Total Analyzed Records</div>
                    <div className="kpi-value mono">{visualChartData.total.toLocaleString()}</div>
                    <div className="kpi-subtext">Processed in batch</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Benign Traffic</div>
                    <div className="kpi-value mono" style={{ color: 'var(--benign)' }}>
                      {visualChartData.benign.toLocaleString()}
                    </div>
                    <div className="kpi-subtext">
                      <span className="badge-tag badge-green">{visualChartData.benignPct}% of batch</span>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Suspicious Traffic</div>
                    <div className="kpi-value mono" style={{ color: 'var(--attack)' }}>
                      {visualChartData.suspicious.toLocaleString()}
                    </div>
                    <div className="kpi-subtext">
                      <span className="badge-tag badge-red">{visualChartData.suspiciousPct}% of batch</span>
                    </div>
                  </div>
                </div>

                {/* Proportional Distribution Bar */}
                <div className="card">
                  <div className="card-title">Traffic Proportion Breakdown</div>
                  <div className="dist-bar-container">
                    <div
                      className="dist-bar-benign"
                      style={{ width: `${visualChartData.benignPct}%` }}
                      title={`Benign: ${visualChartData.benignPct}%`}
                    />
                    <div
                      className="dist-bar-attack"
                      style={{ width: `${visualChartData.suspiciousPct}%` }}
                      title={`Suspicious: ${visualChartData.suspiciousPct}%`}
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
                      ● Benign: {visualChartData.benign.toLocaleString()} ({visualChartData.benignPct}%)
                    </span>
                    <span style={{ color: 'var(--attack)', fontWeight: 500 }}>
                      ● Suspicious: {visualChartData.suspicious.toLocaleString()} ({visualChartData.suspiciousPct}%)
                    </span>
                  </div>
                </div>

                {/* DYNAMIC TELEMETRY BREAKDOWN: PROTOCOL & SERVICE ATTACKS */}
                {batchTelemetry && (
                  <div className="grid-2" style={{ marginTop: '20px' }}>
                    <div className="card">
                      <div className="card-title">Dynamic Protocol Breakdown</div>
                      <div className="card-subtitle">Distribution of transport layer protocols in active batch</div>
                      <div style={{ marginTop: '14px' }}>
                        {['tcp', 'udp', 'icmp'].map((proto) => {
                          const totalProto = batchTelemetry.protoCounts[proto] || 0;
                          const attackProto = batchTelemetry.protoAttacks[proto] || 0;
                          const pct = batchTelemetry.total > 0 ? ((totalProto / batchTelemetry.total) * 100).toFixed(1) : 0;
                          return (
                            <div key={proto} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                                <span className="mono" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                  {proto}
                                </span>
                                <span>
                                  {totalProto} flows ({pct}%) • <span style={{ color: attackProto > 0 ? 'var(--attack)' : 'var(--text-muted)' }}>{attackProto} anomalous</span>
                                </span>
                              </div>
                              <div className="dist-bar-container" style={{ height: '6px', margin: 0 }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    background: proto === 'tcp' ? 'var(--accent)' : proto === 'udp' ? 'var(--warning)' : 'var(--benign)',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-title">Top Active Services in Batch</div>
                      <div className="card-subtitle">Highest volume service ports detected in session flow</div>
                      <div style={{ marginTop: '14px' }}>
                        {batchTelemetry.topServices.map(([srv, count]) => (
                          <div key={srv} className="info-row">
                            <span className="info-label mono">{srv}</span>
                            <span className="info-val mono">
                              {count} sessions ({((count / batchTelemetry.total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Feature Attribute Summary */}
                <div className="card" style={{ marginTop: '20px' }}>
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
                <DeepGuardIcon size={48} status="idle" showPulse />
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '16px' }}>
                  No Active Traffic Batch Loaded
                </div>
                <p style={{ fontSize: '0.86rem', marginTop: '4px', maxWidth: '440px', margin: '4px auto 16px' }}>
                  Please upload a dataset or load a sample in the Traffic Analyzer tab to view
                  threat distribution analytics.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setActiveTab('analyzer');
                    runSampleTestImmediate('mixed');
                  }}
                >
                  <Play size={13} />
                  Run 1-Click Test On Sample Dataset
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DeepGuardIcon size={24} status="idle" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  System Architecture & Model Registry
                </h2>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Complete specifications for dataset, preprocessing pipeline, neural network
                architecture, and live verified model artifacts.
              </p>
            </div>

            {/* DYNAMIC MODEL ARTIFACTS REGISTRY TABLE */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Live Model Artifacts Integrity Registry</div>
                  <div className="card-subtitle">Verified files in local model directory loaded via backend API</div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchMetrics}
                  disabled={metricsLoading}
                >
                  <RefreshCw size={13} className={metricsLoading ? 'spin' : ''} />
                  Refresh Integrity Check
                </button>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Artifact Name</th>
                      <th>Filesystem Status</th>
                      <th>File Size</th>
                      <th>Role in DeepGuard System</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metricsData?.artifacts || []).map((art) => (
                      <tr key={art.name}>
                        <td className="mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {art.name}
                        </td>
                        <td>
                          {art.status === 'verified' ? (
                            <span className="badge-tag badge-green">
                              <CheckCircle2 size={12} />
                              Verified
                            </span>
                          ) : (
                            <span className="badge-tag badge-red">Missing</span>
                          )}
                        </td>
                        <td className="mono" style={{ fontSize: '0.8rem' }}>
                          {(art.sizeBytes / 1024).toFixed(1)} KB
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {art.name.endsWith('.pth')
                            ? 'PyTorch trained state dictionary weights'
                            : art.name.endsWith('.joblib')
                            ? 'Scikit-learn fitted preprocessor / baseline estimator'
                            : art.name.endsWith('.json')
                            ? 'Exported schema, labels, or test evaluation metrics'
                            : 'Generated visual evaluation figure'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <DeepGuardIcon size={18} status="idle" />
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
