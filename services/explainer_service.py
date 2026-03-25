import numpy as np
import pandas as pd
import streamlit as st
from pathlib import Path
import sys

# =========================
# 1. 导入你的本地 explainer
# =========================
sys.path.append(str(Path(__file__).resolve().parent.parent))

try:
    from shap_local_explainer import get_explainer
except ImportError as e:
    raise ImportError(f"Failed to import explainer: {e}")


# =========================
# 2. 缓存模型（重要）
# =========================
@st.cache_resource
def load_explainer():
    return get_explainer()

# =========================
# 2.5 缓存数据加载 (新增)
# =========================
@st.cache_data
def load_test_data():
    """加载 X_test 数据，用于通过 ID 查找学生"""
    data_path = Path(__file__).resolve().parent.parent / "data" / "processed"
    try:
        df = pd.read_csv(data_path / "X_test.csv")
        # 确保索引是整数，且没有多余的 id 列干扰（如果第一列是 id，可能需要 set_index）
        # 根据你的情况，如果 csv 没有 studentid 列，index 就是 0,1,2...
        df = df.reset_index(drop=True) 
        return df
    except Exception as e:
        st.error(f"Failed to load X_test.csv: {e}")
        return None


# =========================
# 3. 核心解释函数 (修复版)
# =========================
def get_explanation(student_input) -> dict:
    """
    Unified interface for model prediction + SHAP explanation.
    
    参数:
        student_input: 可以是 整数(ID) 或者 DataFrame/Series(数据行)
    
    Returns:
    --------
    {
        "predicted_class": str,
        "predicted_probs": np.array,
        "shap_values": np.array,
        "feature_names": list,
        "classes": list
    }
    """
    
    # --- 步骤 1: 解析输入，获取真正的数据 DataFrame (单行) ---
    data = None
    
    if isinstance(student_input, int):
        # 如果传入的是 ID (int)，则加载数据并提取该行
        X_test = load_test_data()
        if X_test is None:
            raise ValueError("Could not load dataset to find student ID.")
        
        if student_input not in X_test.index:
            raise ValueError(f"Student ID {student_input} not found in dataset. Index range: {X_test.index.min()}-{X_test.index.max()}")
        
        # 提取单行数据 (Series)
        data_series = X_test.loc[student_input]
        # 转换为 DataFrame (1行)，因为 SHAP 通常期望二维输入
        data = data_series.to_frame().T
        
    elif isinstance(student_input, pd.DataFrame):
        # 如果传入已经是 DataFrame，直接使用
        if len(student_input) == 0:
            raise ValueError("Input DataFrame is empty.")
        data = student_input
        
    elif isinstance(student_input, pd.Series):
        # 如果传入是 Series，转为 DataFrame
        data = student_input.to_frame().T
        
    else:
        raise TypeError(f"Invalid input type: {type(student_input)}. Expected int, pd.DataFrame, or pd.Series.")

    # --- 步骤 2: 安全检查 ---
    if data is None or len(data) == 0:
        raise ValueError("No valid data available for explanation.")

    # --- 步骤 3: 调用解释器 ---
    explainer = load_explainer()

    try:
        # 注意：这里传入的是 DataFrame (1行)
        # 确保你的 shap_local_explainer.explain_student 能接受 DataFrame
        result = explainer.explain_student(data)
    except Exception as e:
        raise RuntimeError(f"Explainer failed: {e}")

    # =========================
    # 4. 提取预测结果
    # =========================
    predicted_class = result.get("predicted_class", "Unknown")
    predicted_probs = np.array(result.get("predicted_probs", []))

    # =========================
    # 5. 处理 SHAP 值
    # =========================
    shap_values = result.get("shap_values")

    if shap_values is None:
        # 如果解释器没返回 SHAP 值，尝试自己计算 (可选，视情况而定)
        # 这里暂时保持原逻辑，假设 result 里一定有
        pass

    # 可能是 list / ndarray / 多分类
    if isinstance(shap_values, list):
        try:
            class_idx = np.argmax(predicted_probs)
            shap_values = np.array(shap_values[class_idx])
        except:
            shap_values = np.array(shap_values[0])

    shap_values = np.array(shap_values).flatten()

    # =========================
    # 6. 特征名
    # =========================
    feature_names = result.get("feature_names")

    if feature_names is None:
        # 从输入数据中获取列名
        feature_names = list(data.columns)

    # =========================
    # 7. 类别标签
    # =========================
    classes = None
    try:
        classes = explainer._model.classes_
    except:
        classes = list(range(len(predicted_probs)))

    # =========================
    # 8. 对齐检查
    # =========================
    if len(shap_values) != len(feature_names):
        min_len = min(len(shap_values), len(feature_names))
        shap_values = shap_values[:min_len]
        feature_names = feature_names[:min_len]

    # =========================
    # 9. 返回统一结构
    # =========================
    return {
        "predicted_class": predicted_class,
        "predicted_probs": predicted_probs,
        "shap_values": shap_values,
        "feature_names": feature_names,
        "classes": classes
    }