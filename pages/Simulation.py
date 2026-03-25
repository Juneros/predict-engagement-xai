import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path

# 导入服务
from services.simulation_service import apply_pedagogy_strategy, load_simulation_base_data
from services.explainer_service import get_explanation
from services.advice_service import generate_advice
from utils.formatter import format_feature_name

st.set_page_config(page_title="Simulation", layout="wide")

st.title("🧪 Intervention Simulation")
st.caption("Test different teaching strategies and compare their impact on student engagement.")

# =========================
# 0. 获取当前学生数据 (核心修复)
# =========================

if "selected_student" not in st.session_state:
    st.warning("⚠️ Please select a student from the Dashboard first.")
    st.stop()

student_input = st.session_state["selected_student"]
original_data = None

# 尝试解析 student_input
# 情况 A: 已经是 DataFrame 或 Series (完美)
if isinstance(student_input, (pd.DataFrame, pd.Series)):
    original_data = student_input
    
# 情况 B: 是整数 (可能是行号，因为你说没有 ID 列)
elif isinstance(student_input, (int, np.integer)):
    st.info(f"ℹ️ Detected integer input ({student_input}). Attempting to load data by row index...")
    
    base_df = load_simulation_base_data()
    
    if base_df is None:
        st.error("❌ Failed to load base dataset. Cannot simulate without data.")
        st.stop()
    
    # 检查行号是否越界
    if student_input < 0 or student_input >= len(base_df):
        st.error(f"❌ Row index {student_input} is out of range (0 to {len(base_df)-1}).")
        st.stop()
    
    # 提取该行数据 (转为 DataFrame 以保持格式一致)
    original_data = base_df.iloc[student_input:student_input+1].copy()
    st.success(f"✅ Loaded data for Row Index {student_input}.")

# 情况 C: 是字符串 (尝试作为 ID 查找，虽然你说没有 ID 列，但以防万一)
elif isinstance(student_input, str):
    base_df = load_simulation_base_data()
    if base_df is not None:
        if student_input in base_df.index:
            original_data = base_df.loc[student_input:student_input].copy()
        else:
            # 尝试转换为整数再查
            try:
                idx = int(student_input)
                if 0 <= idx < len(base_df):
                    original_data = base_df.iloc[idx:idx+1].copy()
                else:
                    st.error(f"❌ Student '{student_input}' not found.")
                    st.stop()
            except ValueError:
                st.error(f"❌ Student '{student_input}' not found and cannot be converted to index.")
                st.stop()
    else:
        st.error("❌ Could not load data to find student.")
        st.stop()
else:
    st.error(f"❌ Unsupported student data format: {type(student_input)}")
    st.stop()

if original_data is None or len(original_data) == 0:
    st.error("❌ Final student data is empty. Cannot proceed.")
    st.stop()

# =========================
# 1. 生成原始解释 (基于提取到的真实数据)
# =========================
try:
    orig_exp = get_explanation(original_data)
except Exception as e:
    st.error(f"❌ Error generating original explanation: {e}")
    st.stop()

orig_pred = orig_exp["predicted_class"]
orig_probs = orig_exp["predicted_probs"]
orig_shap = orig_exp["shap_values"]
feature_names = orig_exp["feature_names"]

# =========================
# 2. 模式选择
# =========================
mode = st.radio(
    "Select Simulation Mode",
    ["Single Strategy", "Compare Strategies"],
    horizontal=True
)

st.divider()

# =========================
# 3. Strategy Builder (配置构建器)
# =========================
def strategy_builder(key_prefix=""):
    st.markdown("### ⚙️ Configure Strategy")

    flipped = st.checkbox("Flipped Classroom", key=f"{key_prefix}_flip")
    flipped_int = st.slider(
        "Intensity", 0.0, 1.0, 0.5,
        key=f"{key_prefix}_fint"
    ) if flipped else 0.0

    peer = st.checkbox("Peer Instruction", key=f"{key_prefix}_peer")
    peer_int = st.slider(
        "Frequency", 0.0, 1.0, 0.5,
        key=f"{key_prefix}_pint"
    ) if peer else 0.0

    project = st.checkbox("Project-Based Learning", key=f"{key_prefix}_proj")
    proj_int = st.slider(
        "Complexity", 0.0, 1.0, 0.5,
        key=f"{key_prefix}_print"
    ) if project else 0.0

    return {
        "flipped_classroom": flipped,
        "flipped_intensity": flipped_int,
        "peer_instruction": peer,
        "peer_intensity": peer_int,
        "project_based": project,
        "project_intensity": proj_int
    }

# =========================
# 4. 单策略模式
# =========================
if mode == "Single Strategy":

    config = strategy_builder("single")

    if st.button("🚀 Run Simulation", use_container_width=True):
        with st.spinner("Running simulation..."):
            try:
                # 传入的是 DataFrame (original_data)
                new_data = apply_pedagogy_strategy(original_data, config)
                new_exp = get_explanation(new_data)

                new_pred = new_exp["predicted_class"]
                new_probs = new_exp["predicted_probs"]
                new_shap = new_exp["shap_values"]

                st.divider()
                st.subheader("📊 Simulation Result")

                # ===== 结果卡片 =====
                col1, col2 = st.columns(2)

                with col1:
                    st.metric("Before", orig_pred)

                with col2:
                    delta_symbol = "↗️" if new_pred != orig_pred else "➖"
                    st.metric("After", new_pred, delta=f"{delta_symbol} {orig_pred} → {new_pred}")

                # ===== 概率变化 =====
                st.subheader("📈 Confidence Change")

                try:
                    classes = new_exp.get("classes", list(range(len(new_probs))))
                except:
                    classes = list(range(len(new_probs)))

                prob_df = pd.DataFrame({
                    "Before": orig_probs,
                    "After": new_probs
                }, index=classes)

                st.bar_chart(prob_df, use_container_width=True)

                # ===== SHAP变化 =====
                st.subheader("🔍 Key Impact Changes")

                shap_delta = new_shap - orig_shap

                delta_df = pd.DataFrame({
                    "Feature": [format_feature_name(f) for f in feature_names],
                    "Change": shap_delta
                }).sort_values(by="Change", ascending=False)

                st.bar_chart(delta_df.set_index("Feature"), use_container_width=True)

                # ===== AI建议 =====
                st.subheader("💡 AI Insight")

                advice = generate_advice(
                    orig_pred,
                    new_pred,
                    config,
                    shap_delta,
                    feature_names,
                    orig_shap
                )

                st.markdown(advice)
                
            except Exception as e:
                st.error(f"❌ Simulation failed: {e}")
                st.exception(e) # 显示详细 traceback


# =========================
# 5. 对比模式
# =========================
else:
    st.subheader("⚔️ Strategy Comparison")

    colA, colB, colC = st.columns(3)

    with colA:
        st.markdown("#### Strategy A")
        config_A = strategy_builder("A")

    with colB:
        st.markdown("#### Strategy B")
        config_B = strategy_builder("B")

    with colC:
        st.markdown("#### Strategy C")
        config_C = strategy_builder("C")

    if st.button("🚀 Run Comparison", use_container_width=True):
        with st.spinner("Running comparisons..."):
            try:
                results = []

                for name, cfg in zip(
                    ["A", "B", "C"],
                    [config_A, config_B, config_C]
                ):
                    new_data = apply_pedagogy_strategy(original_data, cfg)
                    new_exp = get_explanation(new_data)

                    results.append({
                        "Strategy": name,
                        "Prediction": new_exp["predicted_class"],
                        "Confidence": float(np.max(new_exp["predicted_probs"]))
                    })

                df = pd.DataFrame(results)

                st.divider()
                st.subheader("🏆 Comparison Results")

                st.dataframe(df, use_container_width=True)

                # ===== 最优策略 =====
                best = df.sort_values(by="Confidence", ascending=False).iloc[0]

                st.success(
                    f"✅ Best Strategy: Strategy {best['Strategy']} "
                    f"(Confidence: {best['Confidence']:.2f})"
                )

                # ===== 可视化对比 =====
                st.subheader("📊 Strategy Performance")

                chart_df = df.set_index("Strategy")[["Confidence"]]
                st.bar_chart(chart_df, use_container_width=True)
                
            except Exception as e:
                st.error(f"❌ Comparison failed: {e}")
                st.exception(e)