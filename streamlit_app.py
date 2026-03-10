import streamlit as st
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
import sys
import warnings

warnings.filterwarnings('ignore')

# ==========================================
# 1. Import & Setup
# ==========================================
sys.path.append(str(Path(__file__).parent))
try:
    from shap_local_explainer import LocalExplainer, get_explainer
except ImportError as e:
    st.error(f"Failed to import explainer module: {e}")
    st.stop()

st.set_page_config(
    page_title="AI-Driven Intervention Simulator",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 2. Custom CSS for Modern "Clean & Glass" UI
# ==========================================
def local_css():
    st.markdown("""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    :root {
        --primary-color: #4F46E5; /* Indigo */
        --secondary-color: #10B981; /* Emerald */
        --warning-color: #F59E0B; /* Amber */
        --danger-color: #EF4444; /* Red */
        --bg-color: #F3F4F6;
        --card-bg: #FFFFFF;
        --text-main: #1F2937;
        --text-muted: #6B7280;
    }

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-color);
        color: var(--text-main);
    }

    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Smooth Animations */
    .stButton>button {
        transition: all 0.3s ease;
        border-radius: 8px;
        font-weight: 600;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    /* Custom Cards */
    .metric-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border-top: 4px solid var(--primary-color);
        margin-bottom: 20px;
        transition: transform 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-2px);
    }

    .success-card {
        background: #ECFDF5;
        border-radius: 12px;
        padding: 24px;
        border-left: 5px solid var(--secondary-color);
        color: #065F46;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .warning-card {
        background: #FFFBEB;
        border-radius: 12px;
        padding: 24px;
        border-left: 5px solid var(--warning-color);
        color: #92400E;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    /* Typography */
    h1, h2, h3 {
        color: #111827;
        font-weight: 700;
        letter-spacing: -0.025em;
    }
    
    .subtitle {
        font-size: 1.1rem;
        color: var(--text-muted);
        margin-bottom: 2rem;
        font-weight: 400;
    }

    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: #FFFFFF;
        border-right: 1px solid #E5E7EB;
    }
    
    /* Form Styling */
    .stForm {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
    }

    /* Metric Label Color */
    [data-testid="stMetricValue"] {
        color: var(--primary-color);
    }
    </style>
    """, unsafe_allow_html=True)

local_css()

# ==========================================
# 3. Load Resources
# ==========================================
@st.cache_resource
def load_explainer():
    return get_explainer()

@st.cache_data
def load_data():
    try:
        X_test = pd.read_csv("data/processed/X_test.csv")
        y_test = pd.read_csv("data/processed/y_test.csv").squeeze()
        return X_test, y_test
    except Exception as e:
        st.error(f"Failed to load data: {e}")
        return None, None

# Initialize
explainer = load_explainer()
X_test, y_test = load_data()

if X_test is None or y_test is None:
    st.stop()

# ==========================================
# 4. Helper Functions
# ==========================================
def apply_pedagogy_strategy(original_data, strategy_config):
    modified_data = original_data.copy()
    
    if strategy_config['flipped_classroom']:
        intensity = strategy_config['flipped_intensity']
        boost_video = (0.2 + (intensity * 0.5)) * 2.0 
        boost_resource = (0.1 + (intensity * 0.3)) * 1.5
        modified_data['video_completion_rate'] = (modified_data['video_completion_rate'] + boost_video).clip(lower=-3.0, upper=3.0)
        modified_data['resource_downloads'] = (modified_data['resource_downloads'] + boost_resource).clip(lower=-3.0, upper=3.0)

    if strategy_config['peer_instruction']:
        intensity = strategy_config['peer_intensity']
        boost_forum = (0.3 + (intensity * 0.7)) * 1.5
        modified_data['forum_posts'] = (modified_data['forum_posts'] + boost_forum).clip(lower=-3.0, upper=3.0)
        
    if strategy_config['project_based']:
        intensity = strategy_config['project_intensity']
        boost_ontime = (0.2 + (intensity * 0.6)) * 1.5
        modified_data['on_time_rate'] = (modified_data['on_time_rate'] + boost_ontime).clip(lower=-3.0, upper=3.0)

    return modified_data

def generate_advice(orig_pred, new_pred, strategy_config, shap_delta, feature_names, orig_shap_values):
    advice = []
    
    if isinstance(shap_delta, dict):
        delta_series = pd.Series(shap_delta)
    elif isinstance(shap_delta, np.ndarray):
        delta_series = pd.Series(shap_delta, index=feature_names)
    else:
        delta_series = pd.Series(shap_delta, index=feature_names if hasattr(shap_delta, '__len__') and len(shap_delta) == len(feature_names) else None)
        
    threshold = delta_series.abs().std() * 0.5 if delta_series.abs().std() > 0 else 0.05
    significant_changes = delta_series[delta_series.abs() > threshold]
    
    top_positive = significant_changes.sort_values(ascending=False).head(2)
    top_negative = significant_changes.sort_values(ascending=True).head(2)

    # 1. Overall Outcome
    if orig_pred == new_pred:
        advice.append(f"⚠️ **Prediction Unchanged**: Engagement remains at **{new_pred}**.")
        if len(significant_changes) == 0:
            advice.append("💡 **Diagnosis**: The current strategy adjustments are too subtle to cross the model's decision boundary. Consider **increasing intensity** or **combining multiple strategies**.")
        else:
            advice.append("💡 **Diagnosis**: While some metrics improved, they were likely offset by other constraining factors (e.g., baseline habits).")
    else:
        advice.append(f"🎉 **Intervention Successful!** Predicted engagement lifted from **{orig_pred}** to **{new_pred}**.")
        level_map = {"Very Low": 0, "Low": 1, "Medium": 2, "High": 3, "Very High": 4}
        if level_map.get(new_pred, 0) - level_map.get(orig_pred, 0) >= 2:
            advice.append("🚀 **Major Breakthrough**: A significant tier jump detected! This student is highly responsive to the selected strategy.")

    # 2. Key Drivers
    if not top_positive.empty:
        drivers = []
        for feat, val in top_positive.items():
            if "video" in feat.lower() or "resource" in feat.lower(): strategy_name = "Flipped Classroom (Video/Resources)"
            elif "forum" in feat.lower() or "peer" in feat.lower(): strategy_name = "Peer Instruction (Interaction)"
            elif "on_time" in feat.lower() or "project" in feat.lower(): strategy_name = "Project-Based Learning (Timeliness)"
            else: strategy_name = feat.replace("_", " ").title()
            drivers.append(f"`{strategy_name}` (+{val:.2f})")
        advice.append(f"✅ **Key Drivers**: The improvement is primarily driven by increased contributions from {', '.join(drivers)}.")

    # 3. Persistent Weaknesses
    current_weaknesses = pd.Series(orig_shap_values, index=feature_names)
    persistent_issues = current_weaknesses[current_weaknesses < -0.1]
    improved_feats = top_positive.index.tolist()
    persistent_issues = persistent_issues.drop(labels=[f for f in improved_feats if f in persistent_issues.index], errors='ignore')
    
    if not persistent_issues.empty:
        worst_feat = persistent_issues.idxmin()
        advice.append(f"⚠️ **Remaining Bottleneck**: Despite improvements, `{worst_feat.replace('_', ' ').title()}` remains a significant negative factor (Score: {persistent_issues.min():.2f}). Targeted support here is recommended.")

    return "\n\n".join([f"- {item}" for item in advice])

# ==========================================
# 5. UI Layout
# ==========================================

# Header Section
st.title("🎓 AI-Driven Intervention Simulator")
st.markdown('<p class="subtitle">Empower educators to quantify the potential impact of active learning strategies on student engagement using explainable AI.</p>', unsafe_allow_html=True)

# --- Sidebar: Student Profile ---
with st.sidebar:
    st.header("👤 Student Profile")
    student_id = st.selectbox("Select Student ID", X_test.index.astype(str), index=0)
    selected_student = X_test.loc[[int(student_id)]]
    true_label = y_test.loc[int(student_id)]
    
    st.divider()
    
    st.metric("🏷️ Actual Engagement Label", true_label)
    
    st.info("""
    **How to use:**
    1. Review the student's current diagnostic status.
    2. Adjust pedagogical strategy parameters on the right.
    3. Click **Simulate Intervention** to predict outcomes.
    """)

# --- Main Content: Two Columns ---
col_status, col_config = st.columns([1, 1])

# Left Column: Current Status
with col_status:
    st.subheader("📊 Current Diagnostic")
    
    # Calculate Original Explanation
    orig_exp = explainer.explain_student(selected_student)
    orig_pred = orig_exp['predicted_class']
    orig_probs = orig_exp['predicted_probs']
    
    # Custom Metric Card
    st.markdown(f"""
    <div class="metric-card">
        <h4 style="margin:0; color:#6B7280; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">Predicted Engagement</h4>
        <h2 style="margin:10px 0; color:#4F46E5; font-size: 2.5rem;">{orig_pred}</h2>
        <small style="color:#9CA3AF">Based on current behavioral features</small>
    </div>
    """, unsafe_allow_html=True)
    
    # Probability Distribution
    with st.expander("📈 View Probability Distribution"):
        prob_df = pd.DataFrame({
            'Probability': orig_probs
        }, index=explainer._model.classes_)
        st.bar_chart(prob_df, color="#4F46E5", use_container_width=True)
    
    # Top Negative Factors
    st.markdown("**🔻 Top 3 Inhibiting Factors:**")
    shap_vals = orig_exp['shap_values']
    features = orig_exp['feature_names']
    neg_indices = np.argsort(shap_vals)[:3]
    
    neg_df = pd.DataFrame({
        'Feature': [features[i].replace('_', ' ').title() for i in neg_indices],
        'Impact Score': [f"{shap_vals[i]:.3f}" for i in neg_indices]
    })
    st.dataframe(neg_df, use_container_width=True, hide_index=True, height=160)

# Right Column: Strategy Configuration
with col_config:
    st.subheader("⚙️ Configure Intervention")
    st.markdown("Select and tune active learning strategies to simulate their impact:")
    
    with st.form("strategy_form"):
        # Strategy 1: Flipped Classroom
        c1, c2 = st.columns([3, 1])
        use_flipped = c1.checkbox("🔄 Flipped Classroom", value=False)
        if use_flipped:
            flipped_int = c2.slider("Intensity", 0.0, 1.0, 0.5, key="f_int", label_visibility="collapsed")
        else:
            flipped_int = 0.0
            
        st.divider()
        
        # Strategy 2: Peer Instruction
        c3, c4 = st.columns([3, 1])
        use_peer = c3.checkbox("🗣️ Peer Instruction", value=False)
        if use_peer:
            peer_int = c4.slider("Frequency", 0.0, 1.0, 0.5, key="p_int", label_visibility="collapsed")
        else:
            peer_int = 0.0
            
        st.divider()
        
        # Strategy 3: Project-Based Learning
        c5, c6 = st.columns([3, 1])
        use_project = c5.checkbox("🛠️ Project-Based Learning", value=False)
        if use_project:
            proj_int = c6.slider("Complexity", 0.0, 1.0, 0.5, key="pr_int", label_visibility="collapsed")
        else:
            proj_int = 0.0
        
        st.divider()
        submitted = st.form_submit_button("🚀 Simulate Intervention", use_container_width=True, type="primary")

# --- Results Section (Conditional) ---
if submitted:
    config = {
        'flipped_classroom': use_flipped, 'flipped_intensity': flipped_int,
        'peer_instruction': use_peer, 'peer_intensity': peer_int,
        'project_based': use_project, 'project_intensity': proj_int
    }
    
    # 1. Run Simulation
    simulated_data = apply_pedagogy_strategy(selected_student, config)
    new_exp = explainer.explain_student(simulated_data)
    new_pred = new_exp['predicted_class']
    
    # 2. Calculations
    shap_delta = new_exp['shap_values'] - orig_exp['shap_values']
    feature_names = orig_exp['feature_names']
    orig_shap_values = orig_exp['shap_values']
    
    advice_text = generate_advice(orig_pred, new_pred, config, shap_delta, feature_names, orig_shap_values)
    
    st.divider()
    
    # 3. Dashboard Results
    st.subheader("📈 Simulation Results")
    
    res_col1, res_col2 = st.columns([1, 2])
    
    with res_col1:
        # Comparison Metrics
        delta_symbol = "↗️" if new_pred != orig_pred else "➖"
        st.metric("Before Intervention", orig_pred)
        st.metric("After Intervention", new_pred, delta=f"{delta_symbol} {orig_pred} → {new_pred}")
        
        if orig_pred != new_pred:
            st.success("**✅ Effective Strategy**: Predicted engagement tier improved!")
        else:
            st.warning("**⚠️ Limited Impact**: Predicted engagement tier unchanged.")

    with res_col2:
        # Advice Box with Custom HTML
        if orig_pred != new_pred:
            st.markdown(f'<div class="success-card"><h4 style="margin-top:0">💡 Strategic Insights</h4>{advice_text.replace(chr(10), "<br>")}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="warning-card"><h4 style="margin-top:0">💡 Optimization Tips</h4>{advice_text.replace(chr(10), "<br>")}</div>', unsafe_allow_html=True)

    # 4. Detailed SHAP Delta Chart
    with st.expander("🔍 Explore Detailed Attribution Changes (SHAP Delta)"):
        delta_df = pd.DataFrame({
            'Feature': [f.replace('_', ' ').title() for f in feature_names],
            'Change': shap_delta
        }).sort_values(by='Change', ascending=False)
        
        # Filter for clarity
        sig_delta = delta_df[abs(delta_df['Change']) > 0.01]
        
        if not sig_delta.empty:
            st.bar_chart(sig_delta.set_index('Feature'), color="#F59E0B", use_container_width=True)
            st.caption("*Positive bars indicate an increase in contribution towards higher engagement.*")
        else:
            st.info("The intervention resulted in negligible changes to feature attributions.")

# Footer
st.markdown("---")
st.caption("🔒 **Disclaimer**: This system is based on machine learning models trained on historical data. Simulation results are predictive estimates and should be used as a reference alongside professional pedagogical judgment.")