import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path

from services.explainer_service import get_explanation
from utils.formatter import format_feature_name

st.set_page_config(page_title="Explainability", layout="wide")

st.title("🔍 Model Explainability")
st.caption("Understand why the model predicts this student's engagement level.")

# =========================
# 0. 数据加载辅助函数
# =========================
@st.cache_data
def load_test_data():
    """加载 X_test 数据，用于通过 ID 查找学生原始数据"""
    data_path = Path(__file__).resolve().parent.parent / "data" / "processed"
    csv_file = data_path / "X_test.csv"
    
    if not csv_file.exists():
        return None
    
    try:
        # 读取 CSV，假设第一列是索引 (student id)
        df = pd.read_csv(csv_file, index_col=0)
        return df
    except Exception as e:
        st.error(f"Failed to load data: {e}")
        return None

# =========================
# 1. 获取学生 ID
# =========================
if "selected_student" not in st.session_state:
    st.warning("⚠️ Please select a student from the **Dashboard** first.")
    st.stop()

student_id = st.session_state["selected_student"]

# =========================
# 2. 获取解释结果
# =========================
try:
    exp = get_explanation(student_id)
except Exception as e:
    st.error(f"❌ Error generating explanation: {str(e)}")
    st.stop()

pred = exp["predicted_class"]
probs = exp["predicted_probs"]
shap_vals = exp["shap_values"]
features = exp["feature_names"]

# =========================
# 3. 总体预测
# =========================
st.subheader("🎯 Prediction Overview")

col1, col2 = st.columns(2)

with col1:
    st.metric("Predicted Engagement", pred)

with col2:
    confidence = float(np.max(probs)) if len(probs) > 0 else 0.0
    st.metric("Confidence", f"{confidence:.2f}")

st.divider()

# =========================
# 4. SHAP 排序
# =========================
st.subheader("📊 Feature Impact Ranking")

df = pd.DataFrame({
    "Feature": [format_feature_name(f) for f in features],
    "Impact": shap_vals
}).sort_values(by="Impact", ascending=False)

st.bar_chart(df.set_index("Feature"), use_container_width=True)

st.divider()

# =========================
# 5. 正负因素拆分
# =========================
st.subheader("⚖️ What Helps vs What Hurts")

pos_df = df[df["Impact"] > 0].head(3)
neg_df = df[df["Impact"] < 0].tail(3)

col1, col2 = st.columns(2)

with col1:
    st.markdown("### ✅ Positive Drivers")
    if pos_df.empty:
        st.caption("No significant positive drivers found.")
    else:
        for _, row in pos_df.iterrows():
            st.markdown(f"- **{row['Feature']}** (+{row['Impact']:.2f})")

with col2:
    st.markdown("### ⚠️ Risk Factors")
    if neg_df.empty:
        st.caption("No significant risk factors found.")
    else:
        for _, row in neg_df.iterrows():
            st.markdown(f"- **{row['Feature']}** ({row['Impact']:.2f})")

st.divider()

# =========================
# 6. AI 解释
# =========================
st.subheader("🧠 AI Explanation")

# 自动生成一句话解释
top_neg = neg_df["Feature"].tolist() if not neg_df.empty else []
top_pos = pos_df["Feature"].tolist() if not pos_df.empty else []

if top_neg or top_pos:
    neg_part = f"low performance in **{', '.join(top_neg)}**" if top_neg else ""
    pos_part = f"strong contribution from **{', '.join(top_pos)}**" if top_pos else ""
    
    connectors = []
    if neg_part and pos_part:
        connectors.append("while showing ")
    elif pos_part:
        connectors.append("Driven by ")
    
    explanation_text = f"This prediction is mainly influenced by: \n\n"
    if neg_part:
        explanation_text += f"- Factors reducing engagement: {neg_part}\n"
    if pos_part:
        explanation_text += f"- Factors supporting engagement: {pos_part}\n"
    
    explanation_text += "\nOverall, the model identifies key behavioral patterns that drive engagement outcomes."
else:
    explanation_text = "The model considers multiple factors, but no single dominant driver was identified for this specific prediction."

st.info(explanation_text)

st.divider()

# =========================
# 7. 特征含义查询
# =========================
st.subheader("📘 What Do These Features Mean?")

FEATURE_DESC = {
    "Total Activity": "Total number of interactions with the learning platform.",
    "Learning Consistency": "Number of days the student actively accessed the course.",
    "Video Completion": "Proportion of course videos the student has watched.",
    "Resource Usage": "Frequency of accessing or downloading learning materials.",
    "Peer Interaction": "Level of participation in discussion forums.",
    "On-time Submission": "Proportion of assignments submitted on time.",
    "Flipped Learning Behavior": "Whether the student studies materials before assessments.",
    "Peer Engagement Level": "Relative interaction level compared to classmates.",
    "Project Completion Quality": "Performance and timeliness in project-based tasks."
}

# 尝试匹配原始特征名到描述，如果 format_feature_name 改变了名字，这里可能需要反向映射
# 这里简单使用用户看到的名称作为 Key
selected_feature = st.selectbox(
    "Select a feature to understand",
    df["Feature"].tolist()
)

st.markdown(f"**{selected_feature}**")
# 尝试从字典获取描述，如果没有完全匹配，显示通用提示
description = FEATURE_DESC.get(selected_feature, "Detailed description for this specific metric is currently unavailable.")
st.caption(description)

st.divider()

# =========================
# 8. 原始数据查看 (修复报错的关键部分)
# =========================
with st.expander("🔎 View Raw Feature Values"):
    # 检查 student_id 是整数还是已经是 DataFrame
    if isinstance(student_id, int):
        # 如果是整数 ID，需要加载数据并提取该行
        X_test = load_test_data()
        
        if X_test is not None and student_id in X_test.index:
            # 提取单行 Series 并转换为 DataFrame (1行)
            student_data_df = X_test.loc[student_id].to_frame().T
            st.dataframe(student_data_df, use_container_width=True)
        else:
            st.warning(f"Raw data for Student ID {student_id} not found or could not be loaded.")
            if X_test is None:
                st.error("Data file 'X_test.csv' not found in data/processed/.")
    elif isinstance(student_id, pd.DataFrame):
        # 如果 session_state 里存的直接就是 DataFrame (旧逻辑兼容)
        st.dataframe(student_id, use_container_width=True)
    else:
        st.error(f"Unexpected data type for student: {type(student_id)}")