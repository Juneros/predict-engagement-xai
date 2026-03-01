import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path

# ==========================================
# 1. Configuration & Data Loading
# ==========================================
PROCESSED_DIR = Path("data/processed")
OUTPUT_FILE = PROCESSED_DIR / "engagement_label.csv"
INPUT_FILE = PROCESSED_DIR / "X_features.csv"

print(f"🚀 Building 5-Level Engagement Labels from: {INPUT_FILE}")

try:
    df = pd.read_csv(INPUT_FILE)
    print(f"✅ Loaded {len(df)} student records.")
except FileNotFoundError:
    print(f"❌ Error: File not found at {INPUT_FILE}")
    exit(1)

# ==========================================
# 2. Select Core Behavioral Features
# ==========================================
core_behavior_cols = [
    "total_clicks",
    "days_accessed",
    "video_completion_rate",
    "resource_downloads",
    "forum_posts",
    "on_time_rate"
]

# 检查列是否存在
missing_cols = [col for col in core_behavior_cols if col not in df.columns]
if missing_cols:
    print(f"❌ Error: Missing required columns: {missing_cols}")
    exit(1)

# 填充缺失值
df[core_behavior_cols] = df[core_behavior_cols].fillna(0)

print(f"Using {len(core_behavior_cols)} core behavioral features...")

# ==========================================
# 3. Normalize Features
# ==========================================
scaler = MinMaxScaler()
df_norm = df.copy()
df_norm[core_behavior_cols] = scaler.fit_transform(df[core_behavior_cols])

# ==========================================
# 4. Construct Weighted Engagement Index
# ==========================================
weights = {
    "total_clicks": 0.10,
    "days_accessed": 0.20,
    "video_completion_rate": 0.25,
    "resource_downloads": 0.10,
    "forum_posts": 0.15,
    "on_time_rate": 0.20
}

assert abs(sum(weights.values()) - 1.0) < 0.001, "Weights must sum to 1.0"

df_norm["engagement_index"] = sum(
    df_norm[col] * weight for col, weight in weights.items()
)

# ==========================================
# 5. Generate 5-Level Engagement Labels
# ==========================================
# 使用 20%, 40%, 60%, 80% 分位数进行切割
q20 = df_norm["engagement_index"].quantile(0.20)
q40 = df_norm["engagement_index"].quantile(0.40)
q60 = df_norm["engagement_index"].quantile(0.60)
q80 = df_norm["engagement_index"].quantile(0.80)

print(f"Calculated Thresholds:")
print(f"  Very Low / Low       : {q20:.4f}")
print(f"  Low / Medium         : {q40:.4f}")
print(f"  Medium / High        : {q60:.4f}")
print(f"  High / Very High     : {q80:.4f}")

def label_engagement_5level(x):
    if x <= q20:
        return "Very Low"
    elif x <= q40:
        return "Low"
    elif x <= q60:
        return "Medium"
    elif x <= q80:
        return "High"
    else:
        return "Very High"

df_norm["engagement_level"] = df_norm["engagement_index"].apply(label_engagement_5level)

# 为了方便模型训练，额外添加一个数字编码列 (0-4)
level_map = {
    "Very Low": 0,
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Very High": 4
}
df_norm["engagement_level_encoded"] = df_norm["engagement_level"].map(level_map)

# ==========================================
# 6. Prepare Final Output
# ==========================================
final_output = df_norm[[
    "id_student",
    "code_module",
    "code_presentation",
    "engagement_index",
    "engagement_level",
    "engagement_level_encoded"
]]

# 保存结果
final_output.to_csv(OUTPUT_FILE, index=False)

# ==========================================
# 7. Summary Report
# ==========================================
print("\n" + "="*60)
print(f"✅ 5-Level Engagement labels saved to: {OUTPUT_FILE}")
print("="*60)

print("\n📊 Engagement Level Distribution:")
distribution = final_output["engagement_level"].value_counts()
# 按照自定义顺序排序显示
order = ["Very Low", "Low", "Medium", "High", "Very High"]
distribution = distribution.reindex(order)
print(distribution)

print("\n📈 Percentage Distribution:")
print((distribution / len(final_output) * 100).round(2))

# 检查类别平衡
min_pct = (distribution / len(final_output) * 100).min()
if min_pct < 15:
    print(f"\n⚠️  Warning: The smallest class has only {min_pct:.1f}% of data. Consider checking data distribution.")
else:
    print(f"\n✅ Class distribution is well balanced (Min: {min_pct:.1f}%).")

print("\n🔍 Sample Data:")
print(final_output.head(10))

print("\n✨ Process Complete! Ready for Model Training (Multi-Class Classification).")