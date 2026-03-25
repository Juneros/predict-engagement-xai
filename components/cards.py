import streamlit as st


# =========================
# 1. 核心指标卡片（最重要）
# =========================
def metric_card(title, value, subtitle=None, icon=None):
    st.markdown(f"""
    <div class="metric-card">
        <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:0.9rem; color:#6B7280;">
                {icon or ""} {title}
            </span>
        </div>

        <div style="font-size:2.2rem; font-weight:700; margin-top:8px; color:#4F46E5;">
            {value}
        </div>

        <div style="font-size:0.85rem; color:#9CA3AF; margin-top:4px;">
            {subtitle or ""}
        </div>
    </div>
    """, unsafe_allow_html=True)


# =========================
# 2. Insight 卡片（用于AI解释）
# =========================
def insight_card(title, content, type="info"):
    color_map = {
        "success": "#10B981",
        "warning": "#F59E0B",
        "danger": "#EF4444",
        "info": "#8B5CF6"
    }

    bg_map = {
        "success": "#ECFDF5",
        "warning": "#FFFBEB",
        "danger": "#FEF2F2",
        "info": "#F3E8FF"
    }

    color = color_map.get(type, "#8B5CF6")
    bg = bg_map.get(type, "#F3E8FF")

    st.markdown(f"""
    <div style="
        background:{bg};
        border-left:5px solid {color};
        padding:16px;
        border-radius:12px;
        margin-bottom:12px;
        box-shadow:0 1px 3px rgba(0,0,0,0.05);
    ">
        <div style="font-weight:600; margin-bottom:6px;">
            {title}
        </div>
        <div style="font-size:0.95rem; line-height:1.5;">
            {content}
        </div>
    </div>
    """, unsafe_allow_html=True)


# =========================
# 3. 对比卡片（Before vs After）
# =========================
def comparison_card(before, after):
    improved = before != after

    color = "#10B981" if improved else "#F59E0B"
    symbol = "↗️" if improved else "➖"

    st.markdown(f"""
    <div class="metric-card">
        <div style="font-size:0.9rem; color:#6B7280;">
            Intervention Result
        </div>

        <div style="font-size:2rem; font-weight:700; margin-top:8px;">
            {before} → {after} {symbol}
        </div>

        <div style="color:{color}; font-size:0.9rem; margin-top:6px;">
            {"Improved engagement level" if improved else "No significant change"}
        </div>
    </div>
    """, unsafe_allow_html=True)


# =========================
# 4. Feature 列表卡片（用于Explainability）
# =========================
def feature_list_card(title, features, values):
    st.markdown(f"""
    <div class="metric-card">
        <div style="font-weight:600; margin-bottom:10px;">
            {title}
        </div>
    """, unsafe_allow_html=True)

    for f, v in zip(features, values):
        st.markdown(f"""
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>{f}</span>
            <span style="color:#6B7280;">{v:.2f}</span>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)


# =========================
# 5. 策略推荐卡片（Dashboard核心）
# =========================
def strategy_card(strategy_name, description=None):
    st.markdown(f"""
    <div style="
        background:linear-gradient(135deg, #8B5CF6, #7C3AED);
        color:white;
        padding:20px;
        border-radius:14px;
        margin-bottom:16px;
        box-shadow:0 6px 16px rgba(139,92,246,0.3);
    ">
        <div style="font-size:0.9rem; opacity:0.9;">
            Recommended Strategy
        </div>

        <div style="font-size:1.6rem; font-weight:700; margin-top:6px;">
            🚀 {strategy_name}
        </div>

        <div style="margin-top:8px; font-size:0.9rem; opacity:0.9;">
            {description or ""}
        </div>
    </div>
    """, unsafe_allow_html=True)


# =========================
# 6. 小标签（用于特征解释）
# =========================
def tag(text):
    st.markdown(f"""
    <span style="
        background:#F3E8FF;
        color:#7C3AED;
        padding:4px 10px;
        border-radius:999px;
        font-size:0.8rem;
        margin-right:6px;
    ">
        {text}
    </span>
    """, unsafe_allow_html=True)


# =========================
# 7. 空状态（用户体验优化）
# =========================
def empty_state(message="No data available"):
    st.markdown(f"""
    <div style="
        text-align:center;
        padding:40px;
        color:#9CA3AF;
    ">
        {message}
    </div>
    """, unsafe_allow_html=True)