import streamlit as st


# =========================
# 1. 主入口
# =========================
def render_advice_box(advice_text: str, success: bool = True):
    """
    将 advice_service 输出转为结构化UI
    """

    if not advice_text:
        st.info("No advice available.")
        return

    # 拆分段落
    blocks = [b.strip("- ").strip() for b in advice_text.split("\n\n") if b.strip()]

    for block in blocks:
        _render_block(block, success)


# =========================
# 2. 单块渲染逻辑
# =========================
def _render_block(text: str, success: bool):

    # =========================
    # 分类识别（核心逻辑）
    # =========================
    if "Successful Intervention" in text or "Improved" in text:
        _success_block("🎉 Outcome", text)

    elif "Limited Impact" in text:
        _warning_block("⚠️ Outcome", text)

    elif "Key Drivers" in text:
        _info_block("✅ Key Drivers", text)

    elif "Side Effect" in text:
        _warning_block("⚠️ Side Effect", text)

    elif "Bottleneck" in text:
        _danger_block("🚧 Bottleneck", text)

    elif "Flipped Classroom" in text or "Peer Instruction" in text or "Project-Based" in text:
        _strategy_block("📘 Strategy Insight", text)

    else:
        # fallback
        if success:
            _info_block("💡 Insight", text)
        else:
            _warning_block("💡 Insight", text)


# =========================
# 3. 不同类型卡片
# =========================
def _success_block(title, content):
    st.markdown(f"""
    <div style="
        background:#ECFDF5;
        border-left:5px solid #10B981;
        padding:16px;
        border-radius:12px;
        margin-bottom:10px;
    ">
        <div style="font-weight:600; margin-bottom:6px;">{title}</div>
        <div>{content}</div>
    </div>
    """, unsafe_allow_html=True)


def _warning_block(title, content):
    st.markdown(f"""
    <div style="
        background:#FFFBEB;
        border-left:5px solid #F59E0B;
        padding:16px;
        border-radius:12px;
        margin-bottom:10px;
    ">
        <div style="font-weight:600; margin-bottom:6px;">{title}</div>
        <div>{content}</div>
    </div>
    """, unsafe_allow_html=True)


def _danger_block(title, content):
    st.markdown(f"""
    <div style="
        background:#FEF2F2;
        border-left:5px solid #EF4444;
        padding:16px;
        border-radius:12px;
        margin-bottom:10px;
    ">
        <div style="font-weight:600; margin-bottom:6px;">{title}</div>
        <div>{content}</div>
    </div>
    """, unsafe_allow_html=True)


def _info_block(title, content):
    st.markdown(f"""
    <div style="
        background:#F3E8FF;
        border-left:5px solid #8B5CF6;
        padding:16px;
        border-radius:12px;
        margin-bottom:10px;
    ">
        <div style="font-weight:600; margin-bottom:6px;">{title}</div>
        <div>{content}</div>
    </div>
    """, unsafe_allow_html=True)


def _strategy_block(title, content):
    st.markdown(f"""
    <div style="
        background:linear-gradient(135deg, #8B5CF6, #7C3AED);
        color:white;
        padding:16px;
        border-radius:12px;
        margin-bottom:10px;
    ">
        <div style="font-weight:600; margin-bottom:6px;">{title}</div>
        <div style="opacity:0.95;">{content}</div>
    </div>
    """, unsafe_allow_html=True)