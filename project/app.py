import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

from biomaterial_engine import (
    evaluate_material_for_all_applications,
    build_material_profile_from_decision_matrix,
    generate_turkish_explanation,
    APPLICATIONS
)

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="BioMat DSS — Biomaterial Decision Support",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Language system ──────────────────────────────────────────────────────────
LANG = {
    "tr": {
        "title": "BioMat DSS",
        "subtitle": "Açıklanabilir Biyomalzeme Uygulama Uygunluk Karar Destek Sistemi",
        "desc": "Biyomalzemenizin beş biyomedikal uygulama alanı için uygunluk skorunu hesaplayın. Fuzzy performans değerleri, veri kapsama oranı ve açıklanabilir kriter katkıları ile desteklenen güvenilir sonuçlar.",
        "upload": "📂 Excel veri tabanını yükle",
        "mode": "Giriş Modu",
        "mode_db": "Veri tabanındaki malzemeyi seç",
        "mode_manual": "Yeni malzeme / manuel kriter girişi",
        "select_mat": "Malzeme seç",
        "mat_loaded": "profili veri tabanından çekildi.",
        "mat_name": "Malzeme adı",
        "criteria_scores": "Kriter Skorları",
        "criteria_tip": "0 = çok zayıf, 1 = ideal. Bilmediğin kriterleri boş bırak.",
        "criteria_for": "kriterleri",
        "has_data": "verisi var",
        "btn_calc": "🔬 Uygulama Uygunluğunu Hesapla",
        "results_title": "Genel Uygulama Uygunluk Sonuçları",
        "best_app": "En Uygun Uygulama Alanı",
        "score_label": "Uygunluk Skoru",
        "coverage_label": "Veri Kapsama",
        "gate_label": "Zorunlu Kriter Kapısı",
        "radar_title": "Uygulama Karşılaştırma Radarı",
        "bar_title": "için uygulama uygunluk skorları",
        "report_title": "Açıklanabilir Karar Raporu",
        "positive": "Pozitif Faktörler",
        "limiting": "Sınırlayıcı Faktörler",
        "missing": "Eksik Veriler",
        "no_missing": "Eksik veri bulunmadı.",
        "all_detail": "Tüm Kriter Ayrıntısı",
        "score_dist": "Skor Dağılımı",
        "hero_s1": "Akıllı Analiz",
        "hero_s2": "Çoklu Kriter",
        "hero_s3": "Açıklanabilir",
        "hero_d1": "Fuzzy tabanlı skor hesaplama",
        "hero_d2": "5 farklı uygulama alanı",
        "hero_d3": "Şeffaf karar mekanizması",
        "app_names": {
            "Wound Dressing": "Yara Örtüsü",
            "Drug Delivery System": "İlaç Taşıma Sistemi",
            "Bone Tissue Scaffold": "Kemik Doku İskelesi",
            "Dental Implant": "Dental İmplant",
            "Implant Coating": "İmplant Kaplama"
        },
        "interpretation": {
            "Highly suitable": "Yüksek Uygunluk",
            "Suitable": "Uygun",
            "Conditionally suitable": "Koşullu Uygun",
            "Weak suitability": "Zayıf Uygunluk",
            "Not recommended / insufficient evidence": "Önerilmez / Yetersiz Kanıt"
        },
        "footer": "MCDM Tabanlı Karar Destek Sistemi"
    },
    "en": {
        "title": "BioMat DSS",
        "subtitle": "Explainable Biomaterial Application Suitability Decision Support System",
        "desc": "Calculate your biomaterial's suitability score for five biomedical application areas. Reliable results backed by fuzzy performance values, data coverage, and explainable criterion contributions.",
        "upload": "📂 Upload Excel database",
        "mode": "Input Mode",
        "mode_db": "Select material from database",
        "mode_manual": "New material / manual criterion entry",
        "select_mat": "Select material",
        "mat_loaded": "profile loaded from database.",
        "mat_name": "Material name",
        "criteria_scores": "Criterion Scores",
        "criteria_tip": "0 = very weak, 1 = ideal. Leave unknown criteria blank.",
        "criteria_for": "criteria",
        "has_data": "has data",
        "btn_calc": "🔬 Calculate Application Suitability",
        "results_title": "Overall Application Suitability Results",
        "best_app": "Most Suitable Application Area",
        "score_label": "Suitability Score",
        "coverage_label": "Data Coverage",
        "gate_label": "Mandatory Gate",
        "radar_title": "Application Comparison Radar",
        "bar_title": "Application Suitability Scores for",
        "report_title": "Explainable Decision Report",
        "positive": "Positive Factors",
        "limiting": "Limiting Factors",
        "missing": "Missing Data",
        "no_missing": "No missing data found.",
        "all_detail": "Full Criterion Details",
        "score_dist": "Score Distribution",
        "hero_s1": "Smart Analysis",
        "hero_s2": "Multi-Criteria",
        "hero_s3": "Explainable",
        "hero_d1": "Fuzzy-based score computation",
        "hero_d2": "5 different application areas",
        "hero_d3": "Transparent decision mechanism",
        "app_names": {
            "Wound Dressing": "Wound Dressing",
            "Drug Delivery System": "Drug Delivery System",
            "Bone Tissue Scaffold": "Bone Tissue Scaffold",
            "Dental Implant": "Dental Implant",
            "Implant Coating": "Implant Coating"
        },
        "interpretation": {
            "Highly suitable": "Highly Suitable",
            "Suitable": "Suitable",
            "Conditionally suitable": "Conditionally Suitable",
            "Weak suitability": "Weak Suitability",
            "Not recommended / insufficient evidence": "Not Recommended"
        },
        "footer": "MCDM-Based Decision Support System"
    }
}

# ── Premium CSS injection ────────────────────────────────────────────────────
st.markdown("""
<style>
/* ── Import Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Root Variables ── */
:root {
    --bg-primary: #0a0e1a;
    --bg-secondary: #111827;
    --bg-card: rgba(17, 24, 39, 0.7);
    --bg-glass: rgba(255, 255, 255, 0.03);
    --border-glass: rgba(255, 255, 255, 0.08);
    --accent-1: #6366f1;
    --accent-2: #8b5cf6;
    --accent-3: #a78bfa;
    --accent-4: #06b6d4;
    --accent-5: #10b981;
    --accent-6: #f59e0b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --gradient-1: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
    --gradient-2: linear-gradient(135deg, #06b6d4, #10b981);
    --gradient-3: linear-gradient(135deg, #f59e0b, #ef4444);
    --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.15);
    --shadow-card: 0 4px 30px rgba(0, 0, 0, 0.3);
}

/* ── Global Styles ── */
.stApp {
    background: var(--bg-primary) !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    color: var(--text-primary) !important;
}

/* Animated gradient background */
.stApp::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
    animation: bgPulse 8s ease-in-out infinite alternate;
}

@keyframes bgPulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0f1629 0%, #111827 100%) !important;
    border-right: 1px solid var(--border-glass) !important;
}

section[data-testid="stSidebar"] .stMarkdown,
section[data-testid="stSidebar"] label,
section[data-testid="stSidebar"] .stRadio label,
section[data-testid="stSidebar"] span {
    color: var(--text-secondary) !important;
}

/* ── Headers ── */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', sans-serif !important;
    color: var(--text-primary) !important;
}

/* ── Buttons ── */
.stButton > button {
    background: var(--gradient-1) !important;
    color: white !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 0.75rem 2rem !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    letter-spacing: 0.02em !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important;
}

.stButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5) !important;
}

.stButton > button[kind="primary"] {
    background: var(--gradient-1) !important;
}

/* ── Expanders ── */
.streamlit-expanderHeader {
    background: var(--bg-glass) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 12px !important;
    color: var(--text-primary) !important;
    font-weight: 500 !important;
    backdrop-filter: blur(10px) !important;
}

details {
    background: var(--bg-glass) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(10px) !important;
}

/* ── DataFrames ── */
.stDataFrame {
    border-radius: 12px !important;
    overflow: hidden !important;
}

[data-testid="stDataFrame"] > div {
    border-radius: 12px !important;
    border: 1px solid var(--border-glass) !important;
}

/* ── Metrics ── */
[data-testid="stMetric"] {
    background: var(--bg-glass) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 16px !important;
    padding: 1.2rem !important;
    backdrop-filter: blur(12px) !important;
    transition: all 0.3s ease !important;
}

[data-testid="stMetric"]:hover {
    border-color: rgba(99, 102, 241, 0.3) !important;
    box-shadow: var(--shadow-glow) !important;
    transform: translateY(-2px);
}

[data-testid="stMetricLabel"] {
    color: var(--text-secondary) !important;
    font-weight: 500 !important;
}

[data-testid="stMetricValue"] {
    color: var(--text-primary) !important;
    font-weight: 700 !important;
}

/* ── Tabs ── */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px !important;
    background: var(--bg-glass) !important;
    border-radius: 12px !important;
    padding: 4px !important;
    border: 1px solid var(--border-glass) !important;
}

.stTabs [data-baseweb="tab"] {
    border-radius: 8px !important;
    color: var(--text-secondary) !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
    transition: all 0.2s ease !important;
}

.stTabs [aria-selected="true"] {
    background: var(--gradient-1) !important;
    color: white !important;
}

/* ── Dividers ── */
hr {
    border-color: var(--border-glass) !important;
    margin: 2rem 0 !important;
}

/* ── Select boxes & inputs ── */
.stSelectbox > div > div,
.stTextInput > div > div > input,
.stNumberInput > div > div > input {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 10px !important;
}

/* ── File uploader ── */
[data-testid="stFileUploader"] {
    border: 2px dashed var(--border-glass) !important;
    border-radius: 12px !important;
    background: var(--bg-glass) !important;
}

/* ── Success / Info / Warning boxes ── */
.stSuccess, .stAlert, [data-testid="stAlert"] {
    border-radius: 12px !important;
    border: none !important;
}

/* ── Plotly charts background ── */
.js-plotly-plot .plotly .main-svg {
    border-radius: 16px !important;
}

/* ── Custom components ── */
.glass-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: var(--shadow-card);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: var(--shadow-glow);
    transform: translateY(-3px);
}

.hero-section {
    text-align: center;
    padding: 2rem 0 1rem 0;
    position: relative;
}

.hero-title {
    font-size: 3.2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4, #10b981);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease-in-out infinite;
    margin-bottom: 0.3rem;
    line-height: 1.1;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.hero-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 400;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 50px;
    padding: 6px 16px;
    font-size: 0.82rem;
    color: var(--accent-3);
    font-weight: 500;
    margin-bottom: 1.2rem;
    letter-spacing: 0.02em;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.8rem 0;
}

.feature-item {
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.feature-item:hover {
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
}

.feature-icon {
    font-size: 2rem;
    margin-bottom: 0.6rem;
}

.feature-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.3rem;
}

.feature-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.4;
}

.result-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    padding: 1.8rem;
    backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
}

.result-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-1);
    border-radius: 20px 20px 0 0;
}

.score-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
}

.score-high { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.score-good { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
.score-mid { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.score-low { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

.stat-row {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
}

.stat-item {
    flex: 1;
    min-width: 140px;
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    border-radius: 14px;
    padding: 1rem 1.2rem;
    text-align: center;
    backdrop-filter: blur(10px);
}

.stat-value {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--accent-3);
    font-family: 'JetBrains Mono', monospace;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
}

.section-header {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 2rem 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--border-glass), transparent);
}

.lang-toggle {
    display: inline-flex;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 50px;
    padding: 3px;
    gap: 2px;
}

.footer {
    text-align: center;
    padding: 3rem 0 2rem 0;
    color: var(--text-muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-glass);
    margin-top: 4rem;
}

.footer-brand {
    font-weight: 600;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* ── Animations ── */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb {
    background: var(--accent-1);
    border-radius: 3px;
}

/* ── Hide Streamlit branding ── */
#MainMenu { visibility: hidden; }
footer { visibility: hidden; }
header[data-testid="stHeader"] {
    background: rgba(10, 14, 26, 0.8) !important;
    backdrop-filter: blur(12px) !important;
}
</style>
""", unsafe_allow_html=True)

# ── Sidebar — Language toggle ────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="text-align:center; margin-bottom:1.5rem;">
        <div style="font-size:2rem; margin-bottom:0.3rem;">🧬</div>
        <div style="font-size:1.1rem; font-weight:800; color:#a78bfa; letter-spacing:-0.02em;">BioMat DSS</div>
        <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; letter-spacing:0.1em;">Decision Support</div>
    </div>
    """, unsafe_allow_html=True)

    lang_key = st.radio(
        "🌐 Language / Dil",
        ["Türkçe", "English"],
        horizontal=True,
        label_visibility="visible"
    )
    lang = "tr" if lang_key == "Türkçe" else "en"
    L = LANG[lang]

    st.markdown("---")

# ── Data loading ─────────────────────────────────────────────────────────────
DATA_PATH = "mcdm_input_template_filled_fuzzy.xlsx"

@st.cache_data
def load_data(path):
    decision_df = pd.read_excel(path, sheet_name="DECISION_MATRIX")
    criteria_meta = pd.read_excel(path, sheet_name="CRITERIA_META")

    try:
        material_map_df = pd.read_excel(path, sheet_name="CLEAN_MATERIALS")
    except Exception:
        material_map_df = pd.DataFrame()

    decision_df.columns = decision_df.columns.astype(str).str.strip()
    criteria_meta.columns = criteria_meta.columns.astype(str).str.strip()

    if not material_map_df.empty:
        material_map_df.columns = material_map_df.columns.astype(str).str.strip()

    return decision_df, criteria_meta, material_map_df


with st.sidebar:
    uploaded_file = st.file_uploader(
        L["upload"],
        type=["xlsx"]
    )

if uploaded_file is not None:
    decision_df, criteria_meta, material_map_df = load_data(uploaded_file)
else:
    decision_df, criteria_meta, material_map_df = load_data(DATA_PATH)

# ── Sidebar — Mode selection ─────────────────────────────────────────────────
with st.sidebar:
    st.markdown("---")
    mode = st.radio(
        L["mode"],
        [L["mode_db"], L["mode_manual"]]
    )

reserved_cols = {"Application", "Material", "Class"}
all_criteria = [col for col in decision_df.columns if col not in reserved_cols]

if mode == L["mode_db"]:
    with st.sidebar:
        material_list = sorted(
            decision_df["Material"].dropna().astype(str).unique().tolist()
        )
        material_name = st.selectbox(L["select_mat"], material_list)
        material_profile = build_material_profile_from_decision_matrix(
            decision_df=decision_df,
            material_name=material_name
        )
        st.success(f"✅ {material_name} {L['mat_loaded']}")
else:
    with st.sidebar:
        material_name = st.text_input(L["mat_name"], value="New Biomaterial")
        st.markdown(f"### {L['criteria_scores']}")
        st.caption(L["criteria_tip"])

    material_profile = {}

    tabs = st.tabs([L["app_names"].get(a, a) for a in APPLICATIONS])

    for tab, app in zip(tabs, APPLICATIONS):
        with tab:
            st.subheader(f"{L['app_names'].get(app, app)} {L['criteria_for']}")

            app_meta = criteria_meta[
                criteria_meta["Application"].astype(str) == app
            ].copy()
            criteria = app_meta["Criterion"].dropna().astype(str).tolist()

            for criterion in criteria:
                use_value = st.checkbox(
                    f"{criterion} {L['has_data']}",
                    key=f"use_{app}_{criterion}"
                )
                if use_value:
                    value = st.slider(
                        criterion,
                        min_value=0.0,
                        max_value=1.0,
                        value=0.70,
                        step=0.01,
                        key=f"value_{app}_{criterion}"
                    )
                    material_profile[criterion] = value


# ── Hero Section ─────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="hero-section animate-in">
    <div class="hero-badge">🧬 MCDM-Based Explainable AI</div>
    <div class="hero-title">{L['title']}</div>
    <div class="hero-subtitle">{L['desc']}</div>
</div>
""", unsafe_allow_html=True)

# ── Feature cards ────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="feature-grid animate-in">
    <div class="feature-item">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">{L['hero_s1']}</div>
        <div class="feature-desc">{L['hero_d1']}</div>
    </div>
    <div class="feature-item">
        <div class="feature-icon">📊</div>
        <div class="feature-title">{L['hero_s2']}</div>
        <div class="feature-desc">{L['hero_d2']}</div>
    </div>
    <div class="feature-item">
        <div class="feature-icon">🔍</div>
        <div class="feature-title">{L['hero_s3']}</div>
        <div class="feature-desc">{L['hero_d3']}</div>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ── Calculate button ─────────────────────────────────────────────────────────
col_btn = st.columns([1, 2, 1])
with col_btn[1]:
    calc_pressed = st.button(L["btn_calc"], type="primary", use_container_width=True)


# ── Helper: Plotly dark template ─────────────────────────────────────────────
def dark_layout(fig, title=""):
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter, sans-serif", color="#94a3b8"),
        title=dict(
            text=title,
            font=dict(size=16, color="#f1f5f9", family="Inter, sans-serif"),
            x=0.5
        ),
        margin=dict(l=40, r=40, t=60, b=40),
        legend=dict(
            bgcolor="rgba(0,0,0,0)",
            bordercolor="rgba(255,255,255,0.05)",
            font=dict(color="#94a3b8")
        )
    )
    return fig


def score_color(score):
    if score >= 85:
        return "#10b981"
    elif score >= 70:
        return "#06b6d4"
    elif score >= 55:
        return "#f59e0b"
    elif score >= 40:
        return "#f97316"
    return "#ef4444"


def score_css_class(score):
    if score >= 85:
        return "score-high"
    elif score >= 70:
        return "score-good"
    elif score >= 55:
        return "score-mid"
    return "score-low"


def make_gauge(score, label, size=200):
    color = score_color(score)
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=score,
        number=dict(suffix="%", font=dict(size=28, color="#f1f5f9", family="JetBrains Mono")),
        gauge=dict(
            axis=dict(range=[0, 100], tickwidth=0, tickcolor="rgba(0,0,0,0)",
                      tickfont=dict(size=1, color="rgba(0,0,0,0)")),
            bar=dict(color=color, thickness=0.7),
            bgcolor="rgba(255,255,255,0.03)",
            borderwidth=0,
            steps=[
                dict(range=[0, 40], color="rgba(239,68,68,0.07)"),
                dict(range=[40, 55], color="rgba(249,115,22,0.05)"),
                dict(range=[55, 70], color="rgba(245,158,11,0.05)"),
                dict(range=[70, 85], color="rgba(6,182,212,0.05)"),
                dict(range=[85, 100], color="rgba(16,185,129,0.05)"),
            ],
            threshold=dict(
                line=dict(color=color, width=3),
                thickness=0.8,
                value=score
            )
        ),
        title=dict(text=label, font=dict(size=13, color="#94a3b8")),
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=size,
        margin=dict(l=20, r=20, t=40, b=10),
        font=dict(family="Inter, sans-serif")
    )
    return fig


# ── Results ──────────────────────────────────────────────────────────────────
if calc_pressed:

    results_df, detailed_outputs = evaluate_material_for_all_applications(
        material_name=material_name,
        material_profile=material_profile,
        criteria_meta=criteria_meta,
        material_map_df=material_map_df
    )

    st.markdown(f"""
    <div class="section-header animate-in">📊 {L['results_title']}</div>
    """, unsafe_allow_html=True)

    # ── Best result highlight ────────────────────────────────────────────────
    best_app = results_df.iloc[0]["Application"]
    best_score = results_df.iloc[0]["SuitabilityScore"]
    best_label = results_df.iloc[0]["Interpretation"]
    best_coverage = results_df.iloc[0]["DataCoverage"]

    st.markdown(f"""
    <div class="result-card animate-in">
        <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
            <div style="flex:1; min-width:250px;">
                <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.5rem;">
                    🏆 {L['best_app']}
                </div>
                <div style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.3rem;">
                    {L['app_names'].get(best_app, best_app)}
                </div>
                <span class="{score_css_class(best_score)} score-badge">
                    {L['interpretation'].get(best_label, best_label)}
                </span>
            </div>
            <div class="stat-row" style="flex:2; margin:0;">
                <div class="stat-item">
                    <div class="stat-value" style="color:{score_color(best_score)};">{best_score:.1f}%</div>
                    <div class="stat-label">{L['score_label']}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color:#06b6d4;">{best_coverage:.1f}%</div>
                    <div class="stat-label">{L['coverage_label']}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color:#10b981;">{'✅' if results_df.iloc[0]['MandatoryGate'] == 1.0 else '❌'}</div>
                    <div class="stat-label">{L['gate_label']}</div>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Charts row ───────────────────────────────────────────────────────────
    col_chart1, col_chart2 = st.columns([3, 2])

    with col_chart1:
        # Bar chart
        display_df = results_df.copy()
        display_df["DisplayApp"] = display_df["Application"].map(
            lambda x: L["app_names"].get(x, x)
        )
        display_df["Color"] = display_df["SuitabilityScore"].apply(score_color)

        fig_bar = go.Figure()
        for _, row in display_df.iterrows():
            fig_bar.add_trace(go.Bar(
                x=[row["DisplayApp"]],
                y=[row["SuitabilityScore"]],
                marker_color=row["Color"],
                marker_line_width=0,
                text=[f"{row['SuitabilityScore']:.1f}%"],
                textposition="outside",
                textfont=dict(color=row["Color"], size=13, family="JetBrains Mono"),
                showlegend=False,
                hovertemplate=f"<b>{row['DisplayApp']}</b><br>Skor: {row['SuitabilityScore']:.1f}%<extra></extra>"
            ))

        fig_bar = dark_layout(fig_bar, f"{material_name} — {L['bar_title']}")
        fig_bar.update_layout(
            yaxis=dict(range=[0, 110], gridcolor="rgba(255,255,255,0.04)"),
            xaxis=dict(tickangle=-15),
            bargap=0.35,
            height=420
        )
        fig_bar.update_traces(
            marker_line_width=0,
            marker_cornerradius=8,
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_chart2:
        # Radar chart
        radar_apps = display_df["DisplayApp"].tolist()
        radar_scores = display_df["SuitabilityScore"].tolist()

        # Close the polygon
        radar_apps_closed = radar_apps + [radar_apps[0]]
        radar_scores_closed = radar_scores + [radar_scores[0]]

        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(
            r=radar_scores_closed,
            theta=radar_apps_closed,
            fill="toself",
            fillcolor="rgba(99, 102, 241, 0.15)",
            line=dict(color="#8b5cf6", width=2.5),
            marker=dict(size=7, color="#a78bfa"),
            name=material_name,
            hovertemplate="%{theta}: %{r:.1f}%<extra></extra>"
        ))
        fig_radar = dark_layout(fig_radar, L["radar_title"])
        fig_radar.update_layout(
            polar=dict(
                bgcolor="rgba(0,0,0,0)",
                radialaxis=dict(
                    visible=True, range=[0, 100],
                    gridcolor="rgba(255,255,255,0.06)",
                    linecolor="rgba(255,255,255,0.06)",
                    tickfont=dict(size=9, color="#64748b")
                ),
                angularaxis=dict(
                    gridcolor="rgba(255,255,255,0.06)",
                    linecolor="rgba(255,255,255,0.06)",
                    tickfont=dict(size=10, color="#94a3b8")
                )
            ),
            height=420,
            showlegend=False
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    # ── Mini gauges row ──────────────────────────────────────────────────────
    gauge_cols = st.columns(len(results_df))
    for idx, (_, row) in enumerate(results_df.iterrows()):
        with gauge_cols[idx]:
            fig_g = make_gauge(
                row["SuitabilityScore"],
                L["app_names"].get(row["Application"], row["Application"]),
                size=200
            )
            st.plotly_chart(fig_g, use_container_width=True)

    # ── Score distribution ───────────────────────────────────────────────────
    st.markdown(f"""
    <div class="section-header animate-in">📋 {L['score_dist']}</div>
    """, unsafe_allow_html=True)

    # Display styled dataframe
    display_results = results_df.copy()
    if lang == "tr":
        display_results["Application"] = display_results["Application"].map(
            lambda x: L["app_names"].get(x, x)
        )
        display_results["Interpretation"] = display_results["Interpretation"].map(
            lambda x: L["interpretation"].get(x, x)
        )

    st.dataframe(
        display_results[["Application", "SuitabilityScore", "Interpretation",
                         "BaseScoreWithoutPenalty", "DataCoverage", "MandatoryGate"]],
        use_container_width=True,
        hide_index=True
    )

    # ── Detailed Report ──────────────────────────────────────────────────────
    st.markdown(f"""
    <div class="section-header animate-in">🔬 {L['report_title']}</div>
    """, unsafe_allow_html=True)

    for _, row in results_df.iterrows():
        app = row["Application"]
        result = detailed_outputs[app]
        app_display = L["app_names"].get(app, app)
        s = row["SuitabilityScore"]
        interp = L["interpretation"].get(row["Interpretation"], row["Interpretation"])

        with st.expander(f"{'🟢' if s >= 70 else '🟡' if s >= 55 else '🔴'} {app_display} — {s:.1f}% — {interp}"):

            # Explanation text
            st.markdown(f"""
            <div class="glass-card" style="margin-bottom:1rem;">
                <div style="color:var(--text-secondary); line-height:1.7; font-size:0.92rem;">
                    {generate_turkish_explanation(app, result) if lang == "tr" else generate_turkish_explanation(app, result)}
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Metrics row
            mc1, mc2, mc3 = st.columns(3)
            with mc1:
                st.metric(L["score_label"], f"{row['SuitabilityScore']:.1f}%")
            with mc2:
                st.metric(L["coverage_label"], f"{row['DataCoverage']:.1f}%")
            with mc3:
                st.metric(L["gate_label"], "✅ Pass" if row["MandatoryGate"] == 1.0 else "❌ Fail")

            # Factors columns
            fc1, fc2 = st.columns(2)

            with fc1:
                st.markdown(f"#### ✅ {L['positive']}")
                pos_df = result["positive_factors"][
                    ["Criterion", "RawValue", "Suitability", "Weight", "Contribution"]
                ].copy()
                st.dataframe(pos_df, use_container_width=True, hide_index=True)

            with fc2:
                st.markdown(f"#### ⚠️ {L['limiting']}")
                lim_df = result["limiting_factors"][
                    ["Criterion", "RawValue", "Suitability", "Weight", "Gap"]
                ].copy()
                st.dataframe(lim_df, use_container_width=True, hide_index=True)

            # Missing data
            st.markdown(f"#### 📭 {L['missing']}")
            if result["missing_criteria"]:
                st.dataframe(
                    pd.DataFrame(result["missing_criteria"]),
                    use_container_width=True,
                    hide_index=True
                )
            else:
                st.info(L["no_missing"])

            # Full details
            with st.expander(f"📋 {L['all_detail']}"):
                st.dataframe(result["detail_df"], use_container_width=True, hide_index=True)


# ── Footer ───────────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="footer">
    <span class="footer-brand">BioMat DSS</span> &nbsp;•&nbsp; {L['footer']}
    <div style="margin-top:0.5rem; font-size:0.75rem; color:var(--text-muted);">
        © 2025 — Multi-Criteria Decision Making &nbsp;|&nbsp; Fuzzy Logic &nbsp;|&nbsp; Explainable AI
    </div>
</div>
""", unsafe_allow_html=True)