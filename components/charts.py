import streamlit as st
import pandas as pd
import altair as alt


# =========================
# 1. 概率分布图（预测置信度）
# =========================
def probability_chart(probs, classes):
    df = pd.DataFrame({
        "Class": classes,
        "Probability": probs
    })

    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X("Class:N", title="Engagement Level"),
        y=alt.Y("Probability:Q", scale=alt.Scale(domain=[0, 1])),
        color=alt.value("#8B5CF6"),
        tooltip=["Class", alt.Tooltip("Probability", format=".2f")]
    ).properties(height=300)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 2. Before vs After 概率对比
# =========================
def probability_comparison_chart(before_probs, after_probs, classes):
    df = pd.DataFrame({
        "Class": classes,
        "Before": before_probs,
        "After": after_probs
    })

    df_melt = df.melt(id_vars="Class", var_name="Type", value_name="Probability")

    chart = alt.Chart(df_melt).mark_bar().encode(
        x=alt.X("Class:N", title="Engagement Level"),
        y=alt.Y("Probability:Q"),
        color=alt.Color(
            "Type:N",
            scale=alt.Scale(range=["#A78BFA", "#4F46E5"])
        ),
        column="Type:N",
        tooltip=["Class", "Type", alt.Tooltip("Probability", format=".2f")]
    ).properties(height=250)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 3. SHAP 影响图（核心解释）
# =========================
def shap_bar_chart(feature_names, shap_values, top_n=10):
    df = pd.DataFrame({
        "Feature": feature_names,
        "Impact": shap_values
    })

    df = df.sort_values(by="Impact", ascending=False).head(top_n)

    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X("Impact:Q", title="Impact on Prediction"),
        y=alt.Y("Feature:N", sort="-x"),
        color=alt.condition(
            alt.datum.Impact > 0,
            alt.value("#10B981"),  # 正向
            alt.value("#EF4444")   # 负向
        ),
        tooltip=["Feature", alt.Tooltip("Impact", format=".2f")]
    ).properties(height=350)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 4. SHAP Delta（变化对比）⭐
# =========================
def shap_delta_chart(feature_names, shap_delta, threshold=0.01):
    df = pd.DataFrame({
        "Feature": feature_names,
        "Change": shap_delta
    })

    # 过滤微小变化
    df = df[abs(df["Change"]) > threshold]
    df = df.sort_values(by="Change", ascending=False)

    if df.empty:
        st.info("No significant feature impact changes.")
        return

    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X("Change:Q", title="Change in Impact"),
        y=alt.Y("Feature:N", sort="-x"),
        color=alt.condition(
            alt.datum.Change > 0,
            alt.value("#8B5CF6"),
            alt.value("#F59E0B")
        ),
        tooltip=["Feature", alt.Tooltip("Change", format=".2f")]
    ).properties(height=350)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 5. 正负因素分布（Explainability用）
# =========================
def positive_negative_chart(feature_names, shap_values):
    df = pd.DataFrame({
        "Feature": feature_names,
        "Impact": shap_values
    })

    df["Type"] = df["Impact"].apply(lambda x: "Positive" if x > 0 else "Negative")

    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X("Impact:Q"),
        y=alt.Y("Feature:N", sort="-x"),
        color=alt.Color(
            "Type:N",
            scale=alt.Scale(
                domain=["Positive", "Negative"],
                range=["#10B981", "#EF4444"]
            )
        ),
        tooltip=["Feature", alt.Tooltip("Impact", format=".2f")]
    ).properties(height=400)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 6. 策略对比图（非常关键 ⭐）
# =========================
def strategy_comparison_chart(df):
    """
    df:
    Strategy | Confidence
    """

    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X("Strategy:N"),
        y=alt.Y("Confidence:Q"),
        color=alt.Color(
            "Confidence:Q",
            scale=alt.Scale(scheme="purples")
        ),
        tooltip=["Strategy", alt.Tooltip("Confidence", format=".2f")]
    ).properties(height=300)

    st.altair_chart(chart, use_container_width=True)


# =========================
# 7. 趋势或强度模拟（可扩展）
# =========================
def intensity_curve_chart(intensities, outcomes):
    df = pd.DataFrame({
        "Intensity": intensities,
        "Outcome": outcomes
    })

    chart = alt.Chart(df).mark_line(point=True).encode(
        x=alt.X("Intensity:Q"),
        y=alt.Y("Outcome:Q"),
        color=alt.value("#8B5CF6"),
        tooltip=["Intensity", "Outcome"]
    ).properties(height=300)

    st.altair_chart(chart, use_container_width=True)