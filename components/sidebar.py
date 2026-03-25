import streamlit as st
import pandas as pd


# =========================
# 1. Sidebar 主入口
# =========================
def render_sidebar(X_test: pd.DataFrame, y_test: pd.Series):
    """
    渲染整个侧边栏，并返回当前选中的学生数据
    """

    with st.sidebar:

        # =========================
        # 标题
        # =========================
        st.markdown("## 🎓 AI Teaching Assistant")

        st.markdown(
            "<div style='font-size:0.9rem; color:#6B7280;'>"
            "Simulate and optimize teaching strategies with explainable AI."
            "</div>",
            unsafe_allow_html=True
        )

        st.divider()

        # =========================
        # 学生选择 (修复版)
        # =========================
        st.markdown("### 👤 Student Selection")

        # Get all student IDs as strings for the dropdown display
        all_indices = X_test.index.tolist() 
        student_ids_str = [str(i) for i in all_indices]

        # Determine default selection index based on session state
        default_index_pos = 0
        if "selected_student_id" in st.session_state:
            try:
                # Find position of the previously selected ID in the list
                default_index_pos = student_ids_str.index(str(st.session_state["selected_student_id"]))
            except ValueError:
                default_index_pos = 0

        # Render the dropdown
        selected_id_str = st.selectbox(
            "Select Student ID",
            student_ids_str,
            index=default_index_pos,
            help="Choose a student ID to view their engagement dashboard."
        )

        # Convert selected string ID back to integer for data querying
        try:
            selected_student = int(selected_id_str)
        except ValueError:
            st.error("Invalid Student ID format.")
            st.stop()

        # Update Session State (store as integer)
        st.session_state["selected_student_id"] = selected_student
        
        # Retrieve true label
        true_label = None
        if selected_student in y_test.index:
            true_label = y_test.loc[selected_student]
            
            # Display status in sidebar
            if true_label == 1:
                st.markdown("**Status**: :red[⚠️ At Risk of Dropping Out]")
            else:
                st.markdown("**Status**: :green[✅ On Track]")
        else:
            st.warning("Label data not found for this student.")

        # Return values
        return selected_student, true_label

        # =========================
        # 学生标签卡片
        # =========================
        st.markdown("#### 🏷️ Actual Engagement")

        st.markdown(f"""
        <div style="
            background:#F3E8FF;
            padding:12px;
            border-radius:10px;
            text-align:center;
            font-weight:600;
            color:#7C3AED;
        ">
            {true_label}
        </div>
        """, unsafe_allow_html=True)

        st.divider()

        # =========================
        # 页面导航（核心）
        # =========================
        st.markdown("### 🧭 Navigation")

        page = st.radio(
            "",
            ["Dashboard", "Simulation", "Explainability"],
            index=_get_default_page_index(),
            label_visibility="collapsed"
        )

        st.session_state["current_page"] = page

        st.divider()

        # =========================
        # 使用说明
        # =========================
        with st.expander("📘 How to Use"):
            st.markdown("""
            1. Select a student  
            2. Review current engagement  
            3. Simulate teaching strategies  
            4. Analyze model explanations  
            """)

        # =========================
        # 系统说明（增强产品感）
        # =========================
        with st.expander("⚙️ About System"):
            st.markdown("""
            - Based on machine learning models  
            - Uses SHAP for explainability  
            - Designed for teaching strategy optimization  
            """)

    return selected_student, true_label


# =========================
# 2. 默认页面逻辑
# =========================
def _get_default_page_index():
    """
    控制默认页面（记住用户行为）
    """
    if "current_page" not in st.session_state:
        return 0

    page_map = {
        "Dashboard": 0,
        "Simulation": 1,
        "Explainability": 2
    }

    return page_map.get(st.session_state["current_page"], 0)


# =========================
# 3. 获取当前页面（供 app.py 使用）
# =========================
def get_current_page():
    return st.session_state.get("current_page", "Dashboard")