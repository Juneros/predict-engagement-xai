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
from shap_local_explainer import LocalExplainer, get_explainer

st.set_page_config(
    page_title="Active Learning Intervention System",
    page_icon="🎓",
    layout="wide"
)

# ==========================================
# 2. Load Resources
# ==========================================
@st.cache_resource
def load_explainer():
    return get_explainer()

@st.cache_data
def load_data():
    X_test = pd.read_csv("data/processed/X_test.csv")
    y_test = pd.read_csv("data/processed/y_test.csv").squeeze()
    # 加载原始数据（如果有）用于显示真实姓名等，这里假设用 ID
    return X_test, y_test

try:
    explainer = load_explainer()
    X_test, y_test = load_data()
except Exception as e:
    st.error(f"❌ 系统初始化失败：{e}")
    st.stop()

# ==========================================
# 3. Helper: Strategy to Feature Mapping
# ==========================================
def apply_pedagogy_strategy(original_data, strategy_config):
    """
    核心逻辑：将教学法策略映射为特征值的改变。
    使用 Pandas 的 clip 方法来限制上下界，避免 Series 比较错误。
    """
    modified_data = original_data.copy()
    
    # 策略 1: 翻转课堂 (Flipped Classroom)
    if strategy_config['flipped_classroom']:
        intensity = strategy_config['flipped_intensity']
        # 模拟提升 (针对标准化数据的经验增量)
        boost_video = (0.2 + (intensity * 0.5)) * 2.0 
        boost_resource = (0.1 + (intensity * 0.3)) * 1.5
        
        # ✅ 修复：使用 .clip() 代替 min()
        # upper=2.0 (因为标准化数据可能超过1)，lower=-3.0
        modified_data['video_completion_rate'] = (modified_data['video_completion_rate'] + boost_video).clip(lower=-3.0, upper=3.0)
        modified_data['resource_downloads'] = (modified_data['resource_downloads'] + boost_resource).clip(lower=-3.0, upper=3.0)

    # 策略 2: 同伴教学 (Peer Instruction)
    if strategy_config['peer_instruction']:
        intensity = strategy_config['peer_intensity']
        boost_forum = (0.3 + (intensity * 0.7)) * 1.5
        modified_data['forum_posts'] = (modified_data['forum_posts'] + boost_forum).clip(lower=-3.0, upper=3.0)
        
    # 策略 3: 项目式学习 (Project-Based)
    if strategy_config['project_based']:
        intensity = strategy_config['project_intensity']
        boost_ontime = (0.2 + (intensity * 0.6)) * 1.5
        modified_data['on_time_rate'] = (modified_data['on_time_rate'] + boost_ontime).clip(lower=-3.0, upper=3.0)

    return modified_data

def generate_advice(orig_pred, new_pred, strategy_config, shap_delta, feature_names, orig_shap_values):
    """
    生成动态、数据驱动的自然语言建议。
    
    参数:
    - orig_pred, new_pred: 原始和新的预测类别
    - strategy_config: 用户选择的策略配置
    - shap_delta: 每个特征的 SHAP 值变化量 (Series 或 dict)
    - feature_names: 特征名称列表
    - orig_shap_values: 原始的 SHAP 值 (用于分析残留的负面因素)
    """
    advice = []
    
    # 1. 强制将 shap_delta 转换为 Pandas Series
    # 无论是 dict, list, 还是 numpy.ndarray，都能统一处理
    if isinstance(shap_delta, dict):
        delta_series = pd.Series(shap_delta)
    elif isinstance(shap_delta, np.ndarray):
        # 如果是 numpy 数组，必须配合 feature_names 创建带索引的 Series
        delta_series = pd.Series(shap_delta, index=feature_names)
    else:
        # 如果已经是 Series 或其他，尝试直接转换
        delta_series = pd.Series(shap_delta, index=feature_names if hasattr(shap_delta, '__len__') and len(shap_delta) == len(feature_names) else None)
        
    # 找出变化最显著的特征 (Top Positive & Top Negative)
    # 设定一个动态阈值：变化量绝对值大于所有变化量标准差的 0.5 倍，或者取 Top 3
    threshold = delta_series.abs().std() * 0.5 if delta_series.abs().std() > 0 else 0.05
    significant_changes = delta_series[delta_series.abs() > threshold]
    
    top_positive = significant_changes.sort_values(ascending=False).head(2)
    top_negative = significant_changes.sort_values(ascending=True).head(2) # 变化量为负，意味着贡献度下降

    # ---------------------------------------------------------
    # 第一部分：总体结果评估
    # ---------------------------------------------------------
    if orig_pred == new_pred:
        advice.append(f"⚠️ **预测结果未变**：参与度仍为 **{new_pred}**。\n")
        
        if len(significant_changes) == 0:
            advice.append("🔍 **诊断**：当前策略带来的行为改变幅度较小，不足以触动模型决策边界。建议尝试**提高实施强度**或**组合多种策略**。")
        else:
            advice.append("🔍 **诊断**：虽然部分行为指标有所改善，但可能受到其他未改变因素的制约（如基础学习习惯）。")
    else:
        advice.append(f"🎉 **干预有效**！预测参与度从 **{orig_pred}** 提升至 **{new_pred}**。\n")
        
        # 额外鼓励：如果跨越了较大等级 (如 Low -> High)
        level_map = {"Very Low": 0, "Low": 1, "Medium": 2, "High": 3, "Very High": 4}
        if level_map.get(new_pred, 0) - level_map.get(orig_pred, 0) >= 2:
            advice.append("🚀 **重大突破**：这是一个显著的等级跨越，说明该学生对所选策略非常敏感！")

    # ---------------------------------------------------------
    # 第二部分：关键驱动因素分析 (动态生成)
    # ---------------------------------------------------------
    if not top_positive.empty:
        drivers = []
        for feat, val in top_positive.items():
            # 映射特征名到人类可读的策略名
            if "video" in feat.lower() or "resource" in feat.lower():
                strategy_name = "翻转课堂 (视频/资源)"
            elif "forum" in feat.lower() or "peer" in feat.lower():
                strategy_name = "同伴教学 (论坛互动)"
            elif "on_time" in feat.lower() or "project" in feat.lower():
                strategy_name = "项目式学习 (按时提交)"
            else:
                strategy_name = feat.replace("_", " ")
            
            drivers.append(f"`{strategy_name}` (贡献度 +{val:.3f})")
        
        advice.append(f"💡 **成功关键**：主要得益于 {', '.join(drivers)} 的正向贡献显著提升。")

    # ---------------------------------------------------------
    # 第三部分：潜在阻碍或改进点 (如果存在负向变化或未改善的特征)
    # ---------------------------------------------------------
    # 检查原始 SHAP 值中仍然为负且绝对值很大的特征 (即“短板”)
    current_weaknesses = pd.Series(orig_shap_values, index=feature_names)
    # 找出那些原始贡献度很低 (负值大) 且这次干预没有改善 (delta 接近 0 或为负) 的特征
    persistent_issues = current_weaknesses[current_weaknesses < -0.1]
    
    # 排除掉那些这次已经显著改善的特征
    improved_feats = top_positive.index.tolist()
    persistent_issues = persistent_issues.drop(labels=[f for f in improved_feats if f in persistent_issues.index], errors='ignore')
    
    if not persistent_issues.empty:
        worst_feat = persistent_issues.idxmin()
        worst_val = persistent_issues.min()
        
        issue_name = worst_feat.replace("_", " ").title()
        advice.append(f"⚠️ **潜在短板**：尽管有提升，但 `{issue_name}` 仍然是主要的负面拖累因素 (当前贡献 {worst_val:.3f})。下一步可针对性加强此方面。")

    # ---------------------------------------------------------
    # 第四部分：策略特异性建议 (基于用户选择)
    # ---------------------------------------------------------
    active_strategies = [k for k, v in strategy_config.items() if 'classroom' in k or 'instruction' in k or 'based' in k]
    enabled_strategies = [k.replace('_', ' ').title() for k, v in strategy_config.items() if v is True and isinstance(v, bool)]
    
    if not enabled_strategies:
         advice.append("💡 **提示**：请在左侧开启至少一种教学策略（如翻转课堂）来模拟干预效果。")
    elif orig_pred == new_pred and len(enabled_strategies) == 1:
        advice.append(f"💡 **建议**：单独使用 **{enabled_strategies[0]}** 效果有限，尝试勾选其他策略形成**组合拳**（例如同时开启翻转课堂和同伴教学）。")

    return "\n\n".join(advice)

# ==========================================
# 4. UI Layout
# ==========================================
st.title("🎓 主动学习干预模拟系统")
st.markdown("""
帮助教师通过调整教学策略，预测并提升学生的课程参与度。
""")

# --- 侧边栏：选择学生 ---
st.sidebar.header("1️⃣ 选择学生")
student_id = st.sidebar.selectbox("输入或选择学生 ID", X_test.index.astype(str))
selected_student = X_test.loc[[int(student_id)]] # 保持 DataFrame 格式
true_label = y_test.loc[int(student_id)]

st.sidebar.info(f"**参与度**: {true_label}")

# --- 主界面：两栏布局 ---
col_current, col_sim = st.columns(2)

with col_current:
    st.subheader("📊 当前状态诊断")
    
    # 1. 原始预测
    orig_exp = explainer.explain_student(selected_student)
    orig_pred = orig_exp['predicted_class']
    orig_probs = orig_exp['predicted_probs']
    
    st.metric("当前预测参与度", orig_pred)
    
    # 显示概率分布
    st.write("**参与度概率分布:**")
    prob_df = pd.DataFrame({
        'Level': explainer._model.classes_,
        'Probability': orig_probs
    })
    st.bar_chart(prob_df.set_index('Level'))
    
    # 简要归因
    st.write("**主要阻碍因素 (Top 3):**")
    shap_vals = orig_exp['shap_values']
    features = orig_exp['feature_names']
    # 找负向贡献最大的
    neg_idx = np.argsort(shap_vals)[:3]
    for i in neg_idx:
        if shap_vals[i] < 0:
            st.write(f"🔻 {features[i]}: {shap_vals[i]:.3f}")

with col_sim:
    st.subheader("⚙️ 2️⃣ 调整教学策略")
    st.markdown("如果引入以下主动学习方法，结果会如何？")
    
    with st.form("strategy_form"):
        # 策略 1
        use_flipped = st.checkbox("🔄 引入翻转课堂 (Flipped Classroom)", value=False)
        if use_flipped:
            flipped_int = st.slider("实施强度", 0.0, 1.0, 0.5, key="f_int")
        else:
            flipped_int = 0.0
            
        # 策略 2
        use_peer = st.checkbox("🗣️ 引入同伴教学 (Peer Instruction)", value=False)
        if use_peer:
            peer_int = st.slider("互动频率", 0.0, 1.0, 0.5, key="p_int")
        else:
            peer_int = 0.0
            
        # 策略 3
        use_project = st.checkbox("🛠️ 引入项目式学习 (Project-Based)", value=False)
        if use_project:
            proj_int = st.slider("项目复杂度", 0.0, 1.0, 0.5, key="pr_int")
        else:
            proj_int = 0.0
            
        submitted = st.form_submit_button("🚀 模拟干预效果")
    
    if submitted:
        config = {
            'flipped_classroom': use_flipped,
            'flipped_intensity': flipped_int,
            'peer_instruction': use_peer,
            'peer_intensity': peer_int,
            'project_based': use_project,
            'project_intensity': proj_int
        }
        
        # 1. 执行模拟
        simulated_data = apply_pedagogy_strategy(selected_student, config)
        new_exp = explainer.explain_student(simulated_data)
        new_pred = new_exp['predicted_class']
        
        # 2. 准备数据
        shap_delta = new_exp['shap_values'] - orig_exp['shap_values']
        feature_names = orig_exp['feature_names']
        orig_shap_values = orig_exp['shap_values']
        
        # 3. ✅ 生成智能建议 (只调用一次，传入完整参数)
        advice_text = generate_advice(
            orig_pred, 
            new_pred, 
            config, 
            shap_delta, 
            feature_names, 
            orig_shap_values
        )
        
        # --- 显示结果 ---
        st.divider()
        st.subheader("📈 3️⃣ 模拟结果")
        
        # 核心指标对比
        c1, c2 = st.columns(2)
        c1.metric("干预前", orig_pred)
        c2.metric("干预后", new_pred, delta=f"{orig_pred}→{new_pred}")
        
        # 4. ✅ 显示建议 (直接使用上面生成的 advice_text)
        st.success(advice_text)
        
        # 5. 详细归因变化
        with st.expander("🔍 查看详细归因变化 (SHAP Delta)"):
            delta_df = pd.DataFrame({
                'Feature': feature_names,
                'Change': shap_delta
            }).sort_values(by='Change', ascending=False)
            
            # 过滤显著变化 (动态阈值或固定阈值均可)
            sig_delta = delta_df[abs(delta_df['Change']) > 0.05]
            
            if not sig_delta.empty:
                st.bar_chart(sig_delta.set_index('Feature'), color="#FFAA00")
                st.caption("黄色条形表示该特征的贡献度因干预而显著提升。")
            else:
                st.info("干预带来的特征变化较小，未显著改变模型归因。")

# ==========================================
# Footer
# ==========================================
st.markdown("---")
st.caption("系统基于机器学习模型与 SHAP 可解释性技术构建。模拟结果仅供参考，实际教学效果受多种因素影响。")