import pandas as pd
import numpy as np
import streamlit as st
from pathlib import Path
from typing import Dict, Union

# =========================
# 0. 数据加载辅助 (仅用于调试或备用)
# =========================
@st.cache_data
def load_simulation_base_data():
    """加载基础数据，主要用于当用户只选了 ID 但没传数据时的补救（如果可能）"""
    data_path = Path(__file__).resolve().parent.parent / "data" / "processed"
    csv_file = data_path / "X_test.csv"
    
    if not csv_file.exists():
        return None
    
    try:
        # 尝试读取，不强制设索引，因为用户说没有 ID 列
        df = pd.read_csv(csv_file)
        # 如果第一列其实是隐式索引，read_csv 可能会把它读成 'Unnamed: 0'
        if 'Unnamed: 0' in df.columns:
            df.set_index('Unnamed: 0', inplace=True)
        return df
    except Exception as e:
        return None

# ... (配置和工具函数保持不变) ...
STRATEGY_CONFIG = {
    "flipped_classroom": {
        "video": {"base": 0.2, "scale": 0.5, "multiplier": 2.0},
        "resource": {"base": 0.1, "scale": 0.3, "multiplier": 1.5}
    },
    "peer_instruction": {
        "forum": {"base": 0.3, "scale": 0.7, "multiplier": 1.5}
    },
    "project_based": {
        "ontime": {"base": 0.2, "scale": 0.6, "multiplier": 1.5}
    }
}

def _safe_update(series: pd.Series, value: float) -> pd.Series:
    return (series + value).clip(lower=-3.0, upper=3.0)

def _compute_boost(base: float, scale: float, multiplier: float, intensity: float) -> float:
    return (base + intensity * scale) * multiplier

# =========================
# 3. 主函数 (简化版：主要期望 DataFrame)
# =========================
def apply_pedagogy_strategy(
    student_input: Union[pd.DataFrame, pd.Series],
    strategy_config: Dict
) -> pd.DataFrame:
    """
    应用教学策略。
    
    【重要】由于数据集中没有唯一的 ID 列，本函数现在主要期望直接传入 
    pd.DataFrame 或 pd.Series (即学生的具体数据行)。
    如果传入整数，将尝试从缓存的全量数据中按【行号/位置】提取（风险操作）。
    """

    original_data = None
    
    # 情况 A: 传入的是整数 (可能是行号 index location，而不是 ID)
    if isinstance(student_input, int):
        st.warning("⚠️ 检测到传入的是整数，但数据无 ID 列。正在尝试按【行号位置】提取数据...")
        base_df = load_simulation_base_data()
        if base_df is None:
            raise ValueError("无法加载基础数据，且输入仅为整数。请确保传入 DataFrame。")
        
        # 尝试按位置iloc获取，防止越界
        if student_input < 0 or student_input >= len(base_df):
            raise ValueError(f"行号 {student_input} 超出数据范围 (0-{len(base_df)-1})。")
        
        # 取出一行转为 DataFrame
        original_data = base_df.iloc[student_input:student_input+1].copy()
        st.info(f"已按行号 {student_input} 提取数据。第一行数据预览: {original_data.columns.tolist()}")

    # 情况 B: 传入的是 DataFrame (推荐)
    elif isinstance(student_input, pd.DataFrame):
        if len(student_input) == 0:
            raise ValueError("输入的 DataFrame 为空。")
        original_data = student_input.copy()
        
    # 情况 C: 传入的是 Series
    elif isinstance(student_input, pd.Series):
        original_data = student_input.to_frame().T
        
    else:
        raise TypeError(f"不支持的输入类型: {type(student_input)}。由于数据无 ID 列，请传入 DataFrame 或 行号(int)。")

    if original_data is None or len(original_data) == 0:
        raise ValueError("处理后的数据为空。")

    data = original_data.copy()

    # =========================
    # 策略逻辑 (保持不变)
    # =========================
    if strategy_config.get("flipped_classroom", False):
        intensity = strategy_config.get("flipped_intensity", 0.0)
        cfg = STRATEGY_CONFIG["flipped_classroom"]
        video_boost = _compute_boost(cfg["video"]["base"], cfg["video"]["scale"], cfg["video"]["multiplier"], intensity)
        resource_boost = _compute_boost(cfg["resource"]["base"], cfg["resource"]["scale"], cfg["resource"]["multiplier"], intensity)
        if "video_completion_rate" in data.columns:
            data["video_completion_rate"] = _safe_update(data["video_completion_rate"], video_boost)
        if "resource_downloads" in data.columns:
            data["resource_downloads"] = _safe_update(data["resource_downloads"], resource_boost)

    if strategy_config.get("peer_instruction", False):
        intensity = strategy_config.get("peer_intensity", 0.0)
        cfg = STRATEGY_CONFIG["peer_instruction"]
        forum_boost = _compute_boost(cfg["forum"]["base"], cfg["forum"]["scale"], cfg["forum"]["multiplier"], intensity)
        if "forum_posts" in data.columns:
            data["forum_posts"] = _safe_update(data["forum_posts"], forum_boost)

    if strategy_config.get("project_based", False):
        intensity = strategy_config.get("project_intensity", 0.0)
        cfg = STRATEGY_CONFIG["project_based"]
        ontime_boost = _compute_boost(cfg["ontime"]["base"], cfg["ontime"]["scale"], cfg["ontime"]["multiplier"], intensity)
        if "on_time_rate" in data.columns:
            data["on_time_rate"] = _safe_update(data["on_time_rate"], ontime_boost)

    return data

def apply_multiple_strategies(student_input, configs: Dict[str, Dict]) -> Dict[str, pd.DataFrame]:
    results = {}
    for name, cfg in configs.items():
        results[name] = apply_pedagogy_strategy(student_input, cfg)
    return results