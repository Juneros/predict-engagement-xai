import numpy as np
import pandas as pd
from typing import Dict, List


# =========================
# 1. 工具函数
# =========================
def _to_series(values, feature_names):
    """
    保证 shap_delta 转为 Series
    """
    if isinstance(values, dict):
        return pd.Series(values)

    if isinstance(values, np.ndarray):
        return pd.Series(values, index=feature_names)

    return pd.Series(values, index=feature_names[:len(values)])


def _get_significant_changes(delta_series: pd.Series) -> pd.Series:
    """
    过滤显著变化（自适应阈值）
    """
    std = delta_series.abs().std()
    threshold = std * 0.5 if std > 0 else 0.05
    return delta_series[delta_series.abs() > threshold]


def _map_feature_to_strategy(feature_name: str) -> str:
    """
    把特征映射到教学策略（用于解释）
    """
    name = feature_name.lower()

    if "video" in name or "resource" in name:
        return "Flipped Classroom"
    elif "forum" in name or "peer" in name:
        return "Peer Instruction"
    elif "on_time" in name or "project" in name:
        return "Project-Based Learning"
    else:
        return feature_name.replace("_", " ").title()


def _level_to_score(level: str) -> int:
    """
    engagement level → 数值（用于判断提升幅度）
    """
    mapping = {
        "Very Low": 0,
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Very High": 4
    }
    return mapping.get(level, 0)


# =========================
# 2. 核心函数
# =========================
def generate_advice(
    orig_pred: str,
    new_pred: str,
    strategy_config: Dict,
    shap_delta,
    feature_names: List[str],
    orig_shap_values
) -> str:
    """
    Generate human-readable teaching insights
    """

    advice_blocks = []

    # =========================
    # 1️⃣ Outcome 分析
    # =========================
    if orig_pred == new_pred:
        advice_blocks.append(
            "⚠️ **Limited Impact**: The intervention did not change the predicted engagement level."
        )

        if not any(strategy_config.values()):
            advice_blocks.append(
                "💡 No strategy was applied. Try enabling at least one intervention."
            )
        else:
            advice_blocks.append(
                "💡 The selected strategy may not be strong enough or does not target the student's main weaknesses."
            )

    else:
        advice_blocks.append(
            f"🎉 **Successful Intervention**: Engagement improved from **{orig_pred} → {new_pred}**."
        )

        improvement = _level_to_score(new_pred) - _level_to_score(orig_pred)

        if improvement >= 2:
            advice_blocks.append(
                "🚀 **High Impact**: This student is highly responsive to the selected strategy."
            )
        else:
            advice_blocks.append(
                "✅ **Moderate Improvement**: The strategy has a positive but incremental effect."
            )

    # =========================
    # 2️⃣ SHAP变化分析
    # =========================
    delta_series = _to_series(shap_delta, feature_names)
    significant = _get_significant_changes(delta_series)

    if not significant.empty:

        # 正向驱动
        top_positive = significant.sort_values(ascending=False).head(2)

        drivers = []
        for feat, val in top_positive.items():
            strategy_name = _map_feature_to_strategy(feat)
            drivers.append(f"{strategy_name} (+{val:.2f})")

        advice_blocks.append(
            f"✅ **Key Drivers**: Improvement mainly comes from **{', '.join(drivers)}**."
        )

        # 负向影响
        top_negative = significant.sort_values().head(1)

        for feat, val in top_negative.items():
            strategy_name = _map_feature_to_strategy(feat)

            advice_blocks.append(
                f"⚠️ **Side Effect**: {strategy_name} slightly reduced engagement impact ({val:.2f})."
            )

    else:
        advice_blocks.append(
            "ℹ️ **Minimal Change**: The intervention caused only minor changes in model attribution."
        )

    # =========================
    # 3️⃣ 原始瓶颈分析（非常关键）
    # =========================
    orig_series = pd.Series(orig_shap_values, index=feature_names)

    bottlenecks = orig_series[orig_series < -0.1]

    if not bottlenecks.empty:
        worst_feat = bottlenecks.idxmin()

        advice_blocks.append(
            f"🚧 **Remaining Bottleneck**: {worst_feat.replace('_', ' ').title()} is still limiting engagement."
        )

    # =========================
    # 4️⃣ 策略级建议（产品化关键）
    # =========================
    if strategy_config.get("flipped_classroom"):
        advice_blocks.append(
            "📘 Flipped Classroom helps improve pre-class preparation through video and resources."
        )

    if strategy_config.get("peer_instruction"):
        advice_blocks.append(
            "🗣️ Peer Instruction enhances interaction and collaborative learning."
        )

    if strategy_config.get("project_based"):
        advice_blocks.append(
            "🛠️ Project-Based Learning strengthens time management and practical engagement."
        )

    # =========================
    # 5️⃣ 输出格式
    # =========================
    return "\n\n".join([f"- {item}" for item in advice_blocks])


# =========================
# 3. 推荐策略（给Dashboard用）
# =========================
def recommend_strategy(shap_values, feature_names) -> str:
    """
    根据最弱特征自动推荐策略
    """

    shap_series = pd.Series(shap_values, index=feature_names)

    worst_feature = shap_series.idxmin()

    name = worst_feature.lower()

    if "forum" in name:
        return "Peer Instruction"
    elif "video" in name or "resource" in name:
        return "Flipped Classroom"
    elif "on_time" in name:
        return "Project-Based Learning"
    else:
        return "Balanced Strategy"