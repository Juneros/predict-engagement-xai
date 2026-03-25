# styles/theme.py

import streamlit as st


def apply_theme():
    st.set_page_config(
        page_title="AI Teaching Assistant",
        page_icon="🎓",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.markdown("""
    <style>
    /* =========================
       Global
    ========================= */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: #FAF5FF;
        color: #4C1D95;
    }

    /* Hide Streamlit UI */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* =========================
       Buttons
    ========================= */
    .stButton>button {
        background: #8B5CF6;
        color: white;
        border-radius: 10px;
        font-weight: 600;
        border: none;
        padding: 0.6rem 1rem;
        transition: all 0.25s ease;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
    }

    .stButton>button:hover {
        background: #7C3AED;
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(139, 92, 246, 0.4);
    }

    /* =========================
       Cards
    ========================= */
    .metric-card {
        background: white;
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 16px;
        border-top: 4px solid #8B5CF6;
        box-shadow: 0 4px 10px rgba(139, 92, 246, 0.08);
        transition: all 0.2s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(139, 92, 246, 0.15);
    }

    /* =========================
       Sidebar
    ========================= */
    [data-testid="stSidebar"] {
        background-color: #FFFFFF;
        border-right: 1px solid #E9D5FF;
    }

    /* =========================
       Typography
    ========================= */
    h1, h2, h3 {
        color: #4C1D95;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    .subtitle {
        color: #7C3AED;
        font-size: 1.05rem;
        margin-bottom: 20px;
    }

    /* =========================
       Tags
    ========================= */
    .tag {
        background: #F3E8FF;
        color: #7C3AED;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
    }

    </style>
    """, unsafe_allow_html=True)