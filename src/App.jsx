import React, { useState, useEffect } from 'react';
import { 
  Dna, Globe, Database, Edit3, Award, CheckCircle, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronUp, BarChart3, Radar as RadarIcon, 
  Sparkles, ShieldCheck, FileText, Activity, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const LANG = {
  tr: {
    title: "BioMat DSS",
    subtitle: "Açıklanabilir Biyomalzeme Uygulama Uygunluk Karar Destek Sistemi",
    desc: "Biyomalzemenizin beş biyomedikal uygulama alanı için uygunluk skorunu hesaplayın. Fuzzy performans değerleri ve açıklanabilir karar mekanizması.",
    mode: "Giriş Modu",
    mode_db: "Veri tabanındaki malzemeyi seç",
    mode_manual: "Yeni malzeme / manuel kriter girişi",
    select_mat: "Malzeme Seç",
    mat_name: "Malzeme Adı",
    btn_calc: "🔬 Uygulama Uygunluğunu Hesapla",
    loading: "Hesaplanıyor...",
    results_title: "Genel Uygulama Uygunluk Sonuçları",
    best_app: "En Uygun Uygulama Alanı",
    score_label: "Uygunluk Skoru",
    coverage_label: "Veri Kapsama",
    gate_label: "Zorunlu Kapı",
    bar_title: "Uygulama Skorları Karşılaştırması",
    radar_title: "Çoklu Kriter Karşılaştırma Radarı",
    report_title: "Açıklanabilir Karar Raporu",
    positive: "Pozitif Faktörler",
    limiting: "Sınırlayıcı Faktörler",
    missing: "Eksik Veriler",
    no_missing: "Eksik veri bulunmadı.",
    all_detail: "Tüm Kriter Ayrıntısı",
    app_names: {
      "Wound Dressing": "Yara Örtüsü",
      "Drug Delivery System": "İlaç Taşıma Sistemi",
      "Bone Tissue Scaffold": "Kemik Doku İskelesi",
      "Dental Implant": "Dental İmplant",
      "Implant Coating": "İmplant Kaplama"
    },
    interpretation: {
      "Highly suitable": "Yüksek Uygunluk",
      "Suitable": "Uygun",
      "Conditionally suitable": "Koşullu Uygun",
      "Weak suitability": "Zayıf Uygunluk",
      "Not recommended / insufficient evidence": "Önerilmez / Yetersiz Kanıt"
    },
    footer: "MCDM Tabanlı Karar Destek Sistemi"
  },
  en: {
    title: "BioMat DSS",
    subtitle: "Explainable Biomaterial Application Suitability Decision Support System",
    desc: "Calculate your biomaterial's suitability score for five biomedical application areas. Fuzzy performance values & transparent explainability.",
    mode: "Input Mode",
    mode_db: "Select material from database",
    mode_manual: "New material / manual criterion entry",
    select_mat: "Select Material",
    mat_name: "Material Name",
    btn_calc: "🔬 Calculate Application Suitability",
    loading: "Computing...",
    results_title: "Overall Application Suitability Results",
    best_app: "Most Suitable Application Area",
    score_label: "Suitability Score",
    coverage_label: "Data Coverage",
    gate_label: "Mandatory Gate",
    bar_title: "Application Suitability Comparison",
    radar_title: "Multi-Criteria Comparison Radar",
    report_title: "Explainable Decision Report",
    positive: "Positive Factors",
    limiting: "Limiting Factors",
    missing: "Missing Data",
    no_missing: "No missing data found.",
    all_detail: "Full Criterion Details",
    app_names: {
      "Wound Dressing": "Wound Dressing",
      "Drug Delivery System": "Drug Delivery System",
      "Bone Tissue Scaffold": "Bone Tissue Scaffold",
      "Dental Implant": "Dental Implant",
      "Implant Coating": "Implant Coating"
    },
    interpretation: {
      "Highly suitable": "Highly Suitable",
      "Suitable": "Suitable",
      "Conditionally suitable": "Conditionally Suitable",
      "Weak suitability": "Weak Suitability",
      "Not recommended / insufficient evidence": "Not Recommended"
    },
    footer: "MCDM-Based Decision Support System"
  }
};

function getScoreColor(score) {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#06b6d4";
  if (score >= 55) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreBadgeClass(score) {
  if (score >= 85) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score >= 70) return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  if (score >= 55) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border-rose-500/30";
}

export default function App() {
  const [lang, setLang] = useState('tr');
  const [materials, setMaterials] = useState([]);
  const [applications, setApplications] = useState([]);
  const [criteriaByApp, setCriteriaByApp] = useState({});
  
  const [mode, setMode] = useState('db'); // 'db' or 'manual'
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [customMaterialName, setCustomMaterialName] = useState('New Biomaterial');
  const [manualProfile, setManualProfile] = useState({});
  const [manualCheckboxes, setManualCheckboxes] = useState({});
  const [activeTab, setActiveTab] = useState('');

  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);

  const L = LANG[lang];

  // Fetch initial metadata
  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        if (data.materials) {
          setMaterials(data.materials);
          if (data.materials.length > 0) setSelectedMaterial(data.materials[0]);
        }
        if (data.applications) {
          setApplications(data.applications);
          if (data.applications.length > 0) setActiveTab(data.applications[0]);
        }
        if (data.criteria_by_app) {
          setCriteriaByApp(data.criteria_by_app);
        }
      })
      .catch(err => console.error('Error fetching materials:', err));
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      let profileToSend = {};
      let matName = customMaterialName;

      if (mode === 'db') {
        matName = selectedMaterial;
        const profRes = await fetch('/api/material-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ material_name: selectedMaterial })
        });
        const profData = await profRes.json();
        profileToSend = profData.profile || {};
      } else {
        profileToSend = manualProfile;
      }

      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_name: matName,
          material_profile: profileToSend
        })
      });
      const evalData = await evalRes.json();
      setEvalResult({
        materialName: matName,
        results: evalData.results || [],
        details: evalData.detailed_outputs || {}
      });
    } catch (err) {
      console.error('Error evaluating:', err);
    } finally {
      setLoading(false);
    }
  };

  const bestResult = evalResult?.results?.[0];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans">
      
      {/* ── Top Navigation / Header ── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              BioMat DSS <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">v2.0</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">MCDM Decision Support Engine</p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/10">
          <button
            onClick={() => setLang('tr')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${lang === 'tr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            🇹🇷 Türkçe
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            🇬🇧 English
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Sidebar Control Panel ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wide uppercase">
              <Layers className="w-4 h-4" /> {L.mode}
            </div>

            {/* Mode selection radio */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => setMode('db')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${mode === 'db' ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <Database className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{L.mode_db}</span>
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${mode === 'manual' ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <Edit3 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{L.mode_manual}</span>
              </button>
            </div>

            <hr className="border-white/10" />

            {/* DB Material Selector */}
            {mode === 'db' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{L.select_mat}</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  {materials.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ) : (
              /* Manual Input Form */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{L.mat_name}</label>
                  <input
                    type="text"
                    value={customMaterialName}
                    onChange={(e) => setCustomMaterialName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Application Tabs for criteria */}
                <div className="space-y-3 pt-2">
                  <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none">
                    {applications.map(app => (
                      <button
                        key={app}
                        onClick={() => setActiveTab(app)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === app ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {L.app_names[app] || app}
                      </button>
                    ))}
                  </div>

                  {/* Criteria Sliders */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(criteriaByApp[activeTab] || []).map(criterion => {
                      const hasData = manualCheckboxes[`${activeTab}_${criterion}`] || false;
                      const val = manualProfile[criterion] ?? 0.70;

                      return (
                        <div key={criterion} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-300">{criterion}</label>
                            <input
                              type="checkbox"
                              checked={hasData}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setManualCheckboxes(prev => ({ ...prev, [`${activeTab}_${criterion}`]: checked }));
                                setManualProfile(prev => {
                                  const copy = { ...prev };
                                  if (checked) copy[criterion] = val;
                                  else delete copy[criterion];
                                  return copy;
                                });
                              }}
                              className="accent-indigo-500 w-4 h-4 rounded"
                            />
                          </div>

                          {hasData && (
                            <div className="space-y-1">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={val}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  setManualProfile(prev => ({ ...prev, [criterion]: v }));
                                }}
                                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="text-right font-mono text-xs text-indigo-400 font-bold">{val.toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{L.btn_calc}</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* ── Right Results Dashboard ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {!evalResult ? (
            /* Empty State Hero Card */
            <div className="glass-panel p-8 sm:p-12 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Activity className="w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{L.title}</h2>
              <p className="text-slate-400 max-w-md text-sm leading-relaxed">{L.desc}</p>
              <div className="pt-4 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Fuzzy Logic</span>
                <span>•</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-cyan-400" /> Explainable AI</span>
              </div>
            </div>
          ) : (
            /* Results Active Dashboard */
            <div className="space-y-6 animate-fadeIn">
              
              {/* 🏆 Highlight Card for Best Application */}
              {bestResult && (
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-indigo-500 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-amber-400" /> {L.best_app}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {L.app_names[bestResult.Application] || bestResult.Application}
                      </h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeClass(bestResult.SuitabilityScore)}`}>
                        {L.interpretation[bestResult.Interpretation] || bestResult.Interpretation}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: getScoreColor(bestResult.SuitabilityScore) }}>
                          {bestResult.SuitabilityScore}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{L.score_label}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                          {bestResult.DataCoverage}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{L.coverage_label}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-xl sm:text-2xl font-black text-emerald-400">
                          {bestResult.MandatoryGate === 1.0 ? '✅' : '❌'}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{L.gate_label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📊 Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bar Chart */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> {L.bar_title}
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evalResult.results} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                        <XAxis 
                          dataKey="Application" 
                          tick={{ fill: '#94a3b8', fontSize: 10 }} 
                          tickFormatter={(val) => (L.app_names[val] || val).split(' ')[0]} 
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                          formatter={(value) => [`${value}%`, L.score_label]}
                          labelFormatter={(label) => L.app_names[label] || label}
                        />
                        <Bar dataKey="SuitabilityScore" radius={[6, 6, 0, 0]}>
                          {evalResult.results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(entry.SuitabilityScore)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <RadarIcon className="w-4 h-4 text-purple-400" /> {L.radar_title}
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={evalResult.results.map(r => ({ ...r, name: L.app_names[r.Application] || r.Application }))}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                        <Radar name={evalResult.materialName} dataKey="SuitabilityScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* 🔬 Explainable Decision Report Accordions */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> {L.report_title}
                </h3>

                <div className="space-y-3">
                  {evalResult.results.map((row) => {
                    const app = row.Application;
                    const detail = evalResult.details[app] || {};
                    const isExpanded = expandedApp === app;

                    return (
                      <div key={app} className="border border-white/10 rounded-xl bg-white/2 overflow-hidden transition-all">
                        <button
                          onClick={() => setExpandedApp(isExpanded ? null : app)}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getScoreColor(row.SuitabilityScore) }} />
                            <div>
                              <div className="text-sm font-bold text-white">{L.app_names[app] || app}</div>
                              <div className="text-xs text-slate-400">{L.interpretation[row.Interpretation] || row.Interpretation}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right font-mono font-bold text-sm" style={{ color: getScoreColor(row.SuitabilityScore) }}>
                              {row.SuitabilityScore}%
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-5 border-t border-white/10 bg-slate-900/50 space-y-4 text-xs text-slate-300">
                            {/* Explanation Paragraph */}
                            <p className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 leading-relaxed">
                              {detail.turkish_explanation}
                            </p>

                            {/* Factors Tables */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Positive Factors */}
                              <div className="space-y-2">
                                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {L.positive}</h4>
                                <div className="space-y-1.5">
                                  {(detail.positive_factors || []).map((pf, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex justify-between">
                                      <span className="font-medium">{pf.Criterion}</span>
                                      <span className="font-mono text-emerald-400 font-bold">+{pf.Contribution?.toFixed(3)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Limiting Factors */}
                              <div className="space-y-2">
                                <h4 className="font-bold text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {L.limiting}</h4>
                                <div className="space-y-1.5">
                                  {(detail.limiting_factors || []).map((lf, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 flex justify-between">
                                      <span className="font-medium">{lf.Criterion}</span>
                                      <span className="font-mono text-rose-400 font-bold">Gap: {lf.Gap?.toFixed(3)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p><span className="font-semibold text-slate-400">BioMat DSS</span> • {L.footer}</p>
      </footer>

    </div>
  );
}
