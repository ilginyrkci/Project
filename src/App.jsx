import React, { useState, useEffect } from 'react';
import { 
  Dna, Globe, Database, Edit3, Award, CheckCircle2, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronUp, BarChart3, Radar as RadarIcon, 
  Sparkles, ShieldCheck, FileText, Activity, Layers, Zap, ArrowRight, Table,
  User, Lock, Mail, UserPlus, LogOut, X, Sliders, Check, LayoutDashboard
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
    nav_dss: "Karar Destek Sistemi",
    nav_auth: "Giriş Yap / Kayıt Ol",
    hero_s1: "Akıllı Analiz",
    hero_s2: "Çoklu Kriter",
    hero_s3: "Açıklanabilir AI",
    hero_d1: "Fuzzy tabanlı skor hesaplama",
    hero_d2: "5 farklı uygulama alanı",
    hero_d3: "Şeffaf karar mekanizması",
    mode: "Giriş Modu",
    mode_db: "Veri tabanındaki malzemeyi seç",
    mode_manual: "Yeni malzeme / manuel kriter girişi",
    select_mat: "Malzeme Seç",
    mat_loaded: "profili veri tabanından çekildi.",
    mat_name: "Malzeme Adı",
    criteria_scores: "Kriter Skorları",
    criteria_tip: "0 = çok zayıf, 1 = ideal. Bilmediğin kriterleri boş bırak.",
    btn_calc: "🔬 Uygulama Uygunluğunu Hesapla",
    loading: "Hesaplanıyor...",
    results_title: "Genel Uygulama Uygunluk Sonuçları",
    best_app: "En Uygun Uygulama Alanı",
    score_label: "Uygunluk Skoru",
    coverage_label: "Veri Kapsama",
    gate_label: "Zorunlu Kapı",
    bar_title: "için uygulama uygunluk skorları",
    radar_title: "Uygulama Karşılaştırma Radarı",
    gauges_title: "Uygulama Skoru Göstergeleri",
    score_dist: "Skor Dağılımı Tablosu",
    report_title: "Açıklanabilir Karar Raporu",
    positive: "Pozitif Faktörler",
    limiting: "Sınırlayıcı Faktörler",
    missing: "Eksik Veriler",
    no_missing: "Eksik veri bulunmadı.",
    all_detail: "Tüm Kriter Ayrıntısı",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    logout: "Çıkış Yap",
    email: "E-Posta Adresi",
    password: "Şifre",
    fullname: "Ad Soyad",
    welcome: "Hoş Geldiniz",
    auth_title: "Üyelik ve Hesap Yönetimi",
    auth_subtitle: "BioMat DSS sistemine kaydolun veya mevcut hesabınızla giriş yapın.",
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
    footer: "MCDM Tabanlı Karar Destek Sistemi • © 2026 Multi-Criteria Decision Making & Fuzzy Logic"
  },
  en: {
    title: "BioMat DSS",
    subtitle: "Explainable Biomaterial Application Suitability Decision Support System",
    desc: "Calculate your biomaterial's suitability score for five biomedical application areas. Fuzzy performance values & transparent decision engine.",
    nav_dss: "Decision Support System",
    nav_auth: "Sign In / Register",
    hero_s1: "Smart Analysis",
    hero_s2: "Multi-Criteria",
    hero_s3: "Explainable AI",
    hero_d1: "Fuzzy-based score computation",
    hero_d2: "5 biomedical application areas",
    hero_d3: "Transparent decision mechanism",
    mode: "Input Mode",
    mode_db: "Select material from database",
    mode_manual: "New material / manual criterion entry",
    select_mat: "Select Material",
    mat_loaded: "profile loaded from database.",
    mat_name: "Material Name",
    criteria_scores: "Criterion Scores",
    criteria_tip: "0 = very weak, 1 = ideal. Leave unknown criteria blank.",
    btn_calc: "🔬 Calculate Application Suitability",
    loading: "Computing...",
    results_title: "Overall Application Suitability Results",
    best_app: "Most Suitable Application Area",
    score_label: "Suitability Score",
    coverage_label: "Data Coverage",
    gate_label: "Mandatory Gate",
    bar_title: "Application Suitability Scores for",
    radar_title: "Application Comparison Radar",
    gauges_title: "Application Score Gauges",
    score_dist: "Score Distribution Table",
    report_title: "Explainable Decision Report",
    positive: "Positive Factors",
    limiting: "Limiting Factors",
    missing: "Missing Data",
    no_missing: "No missing data found.",
    all_detail: "Full Criterion Details",
    login: "Sign In",
    register: "Sign Up",
    logout: "Sign Out",
    email: "Email Address",
    password: "Password",
    fullname: "Full Name",
    welcome: "Welcome",
    auth_title: "Membership & Account Management",
    auth_subtitle: "Sign in to your BioMat DSS account or create a free account.",
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
    footer: "MCDM-Based Decision Support System • © 2026 Multi-Criteria Decision Making & Fuzzy Logic"
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

/* Custom Circular Gauge Component */
function CircularGauge({ value, label, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-md hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-800/80 stroke-current"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black font-mono tracking-tight text-white">{value.toFixed(1)}%</span>
        </div>
      </div>
      <span className="mt-3 text-xs font-bold text-slate-300 text-center line-clamp-1">{label}</span>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('tr');
  const [activePage, setActivePage] = useState('auth'); // 'dss' or 'auth' - defaults to compulsory auth on load!
  
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

  // Auth state
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const L = LANG[lang];

  // Fetch initial metadata
  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        if (data.materials) {
          setMaterials(data.materials);
          if (data.materials.length > 0) {
            const firstMat = data.materials[0];
            setSelectedMaterial(firstMat);
            triggerCalculation('db', firstMat, {});
          }
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

  const triggerCalculation = async (currentMode, matNameInput, profileInput) => {
    setLoading(true);
    try {
      let profileToSend = profileInput;
      let matName = matNameInput;

      if (currentMode === 'db') {
        const profRes = await fetch('/api/material-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ material_name: matNameInput })
        });
        const profData = await profRes.json();
        profileToSend = profData.profile || {};
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

  const handleCalculate = () => {
    triggerCalculation(mode, mode === 'db' ? selectedMaterial : customMaterialName, manualProfile);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authTab === 'register') {
      setAuthTab('login');
      setAuthSuccessMsg(lang === 'tr' ? '✅ Kayıt başarılı! Lütfen oluşturduğunuz hesapla giriş yapın.' : '✅ Registration successful! Please sign in with your account.');
      setAuthForm(prev => ({ ...prev, password: '' }));
    } else {
      setUser({
        name: authForm.name || (authForm.email.split('@')[0] || 'Researcher'),
        email: authForm.email
      });
      setAuthSuccessMsg('');
      setActivePage('dss');
    }
  };

  const bestResult = evalResult?.results?.[0];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Animated Gradient Blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* ── Top Navigation Header ── */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              BioMat DSS <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">MCDM AI</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">{L.subtitle}</p>
          </div>
        </div>

        {/* Auth User Profile & Lang Switcher */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user.name}</span>
              <button 
                onClick={() => { setUser(null); setActivePage('auth'); }}
                title={L.logout}
                className="text-slate-400 hover:text-rose-400 transition-all p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Language switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-white/10">
            <button
              onClick={() => setLang('tr')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'tr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE 2: Dedicated Auth Page ── */}
      {!user || activePage === 'auth' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 my-8 animate-fadeIn">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">{user ? `${L.welcome}, ${user.name}!` : L.auth_title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{L.auth_subtitle}</p>
            </div>

            {user ? (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                  ✓ {user.email} ile oturum açıldı.
                </div>
                <button
                  onClick={() => setUser(null)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {L.logout}
                </button>
              </div>
            ) : (
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/15 shadow-2xl space-y-6">
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${authTab === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {L.login}
                  </button>
                  <button
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${authTab === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {L.register}
                  </button>
                </div>

                {authSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center animate-fadeIn">
                    {authSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authTab === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">{L.fullname}</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="Dr. Alex Vance"
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">{L.email}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="researcher@biomat.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">{L.password}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs tracking-wide shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    {authTab === 'login' ? L.login : L.register}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── PAGE 1: Main DSS Application Page ── */
        <>

          {/* Main Dashboard Grid */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Left Control Sidebar (Contains both DB and Manual Criteria Sliders!) ── */}
            <aside className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="glass-panel p-6 rounded-2xl space-y-6 border border-white/10 shadow-2xl">
                
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-wider uppercase">
                  <Layers className="w-4 h-4" /> {L.mode}
                </div>

                {/* Input Mode Selector */}
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => { setMode('db'); triggerCalculation('db', selectedMaterial, {}); }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${mode === 'db' ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500 text-indigo-200 font-semibold shadow-md shadow-indigo-500/10' : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    <Database className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{L.mode_db}</span>
                  </button>
                  <button
                    onClick={() => setMode('manual')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${mode === 'manual' ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500 text-indigo-200 font-semibold shadow-md shadow-indigo-500/10' : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    <Edit3 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{L.mode_manual}</span>
                  </button>
                </div>

                <hr className="border-white/10" />

                {/* Mode Content strictly inside Left Sidebar! */}
                {mode === 'db' ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{L.select_mat}</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        setSelectedMaterial(e.target.value);
                        triggerCalculation('db', e.target.value, {});
                      }}
                      className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                    >
                      {materials.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{selectedMaterial} {L.mat_loaded}</span>
                    </div>
                  </div>
                ) : (
                  /* Manual Input Form strictly inside Left Sidebar! */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{L.mat_name}</label>
                      <input
                        type="text"
                        value={customMaterialName}
                        onChange={(e) => setCustomMaterialName(e.target.value)}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">{L.criteria_scores}</div>
                      <p className="text-[11px] text-slate-400">{L.criteria_tip}</p>
                    </div>

                    {/* Tabs for Applications inside Left Sidebar */}
                    <div className="space-y-3 pt-1">
                      <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none">
                        {applications.map(app => (
                          <button
                            key={app}
                            onClick={() => setActiveTab(app)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === app ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                            {L.app_names[app] || app}
                          </button>
                        ))}
                      </div>

                      {/* Criteria Sliders list inside Left Sidebar */}
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {(criteriaByApp[activeTab] || []).map(criterion => {
                          const hasData = manualCheckboxes[`${activeTab}_${criterion}`] || false;
                          const val = manualProfile[criterion] ?? 0.70;

                          return (
                            <div key={criterion} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-300">{criterion}</label>
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
                                  className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                                />
                              </div>

                              {hasData && (
                                <div className="space-y-1 pt-1">
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

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm tracking-wide shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </aside>

            {/* ── Right Results Dashboard ── */}
            <section className="lg:col-span-8 space-y-8">
              
              {loading ? (
                <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center min-h-[400px] space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-slate-400 animate-pulse">{L.loading}</p>
                </div>
              ) : evalResult && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* 🏆 Best Application Highlight Card */}
                  {bestResult && (
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-indigo-500 relative overflow-hidden shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                            <Award className="w-4 h-4" /> {L.best_app}
                          </div>
                          <h3 className="text-3xl font-black text-white tracking-tight">
                            {L.app_names[bestResult.Application] || bestResult.Application}
                          </h3>
                          <div>
                            <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold border ${getScoreBadgeClass(bestResult.SuitabilityScore)}`}>
                              {L.interpretation[bestResult.Interpretation] || bestResult.Interpretation}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="text-2xl sm:text-3xl font-black font-mono" style={{ color: getScoreColor(bestResult.SuitabilityScore) }}>
                              {bestResult.SuitabilityScore}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{L.score_label}</div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                              {bestResult.DataCoverage}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{L.coverage_label}</div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                              {bestResult.MandatoryGate === 1.0 ? '✅' : '❌'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{L.gate_label}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 📊 Side-by-side Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Bar Chart */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl border border-white/10">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" /> {L.bar_title}
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={evalResult.results} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                            <XAxis 
                              dataKey="Application" 
                              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                              tickFormatter={(val) => (L.app_names[val] || val).split(' ')[0]} 
                              angle={-20}
                              textAnchor="end"
                            />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
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
                    <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-xl border border-white/10">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <RadarIcon className="w-4 h-4 text-purple-400" /> {L.radar_title}
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={evalResult.results.map(r => ({ ...r, name: L.app_names[r.Application] || r.Application }))}>
                            <PolarGrid stroke="rgba(255,255,255,0.15)" />
                            <PolarAngleAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                            <Radar name={evalResult.materialName} dataKey="SuitabilityScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* 🎯 Application Score Gauges Row */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10 shadow-xl">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> {L.gauges_title}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {evalResult.results.map((row) => (
                        <CircularGauge
                          key={row.Application}
                          value={row.SuitabilityScore}
                          label={L.app_names[row.Application] || row.Application}
                          color={getScoreColor(row.SuitabilityScore)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 📋 Score Distribution Table */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10 shadow-xl overflow-hidden">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Table className="w-4 h-4 text-cyan-400" /> {L.score_dist}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                          <tr>
                            <th className="p-3">Uygulama Alanı</th>
                            <th className="p-3">Uygunluk Skoru</th>
                            <th className="p-3">Yorum</th>
                            <th className="p-3">Veri Kapsama</th>
                            <th className="p-3">Zorunlu Kapı</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                          {evalResult.results.map((row) => (
                            <tr key={row.Application} className="hover:bg-white/3 transition-all">
                              <td className="p-3 font-bold text-white">{L.app_names[row.Application] || row.Application}</td>
                              <td className="p-3 font-mono font-bold" style={{ color: getScoreColor(row.SuitabilityScore) }}>{row.SuitabilityScore}%</td>
                              <td className="p-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getScoreBadgeClass(row.SuitabilityScore)}`}>
                                  {L.interpretation[row.Interpretation] || row.Interpretation}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-cyan-400 font-bold">{row.DataCoverage}%</td>
                              <td className="p-3">{row.MandatoryGate === 1.0 ? '✅ Pass' : '❌ Fail'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🔬 Explainable Decision Report Accordions */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10 shadow-xl">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" /> {L.report_title}
                    </h4>

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
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getScoreColor(row.SuitabilityScore) }} />
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
                              <div className="p-5 border-t border-white/10 bg-slate-900/60 space-y-4 text-xs text-slate-300">
                                {/* Explanation Paragraph */}
                                <p className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 leading-relaxed font-medium">
                                  {detail.turkish_explanation}
                                </p>

                                {/* Factors Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Positive Factors */}
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {L.positive}</h5>
                                    <div className="space-y-1.5">
                                      {(detail.positive_factors || []).map((pf, idx) => (
                                        <div key={idx} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                                          <span className="font-semibold text-slate-200">{pf.Criterion}</span>
                                          <span className="font-mono text-emerald-400 font-bold">+{pf.Contribution?.toFixed(3)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Limiting Factors */}
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {L.limiting}</h5>
                                    <div className="space-y-1.5">
                                      {(detail.limiting_factors || []).map((lf, idx) => (
                                        <div key={idx} className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 flex justify-between items-center">
                                          <span className="font-semibold text-slate-200">{lf.Criterion}</span>
                                          <span className="font-mono text-rose-400 font-bold">Gap: {lf.Gap?.toFixed(3)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Missing Data */}
                                <div className="space-y-2 pt-2">
                                  <h5 className="font-bold text-slate-300">{L.missing}</h5>
                                  {(detail.missing_criteria || []).length > 0 ? (
                                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-300 font-medium">
                                      {detail.missing_criteria.map(m => m.criterion).join(', ')}
                                    </div>
                                  ) : (
                                    <div className="text-slate-500 italic">{L.no_missing}</div>
                                  )}
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

            </section>

          </main>
        </>
      )}

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>{L.footer}</p>
      </footer>

    </div>
  );
}
