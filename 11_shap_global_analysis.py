import pandas as pd
import numpy as np
import pickle
import shap
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
import os

warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TF warnings if using Keras/TF

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
EVAL_DIR = Path("evaluation")
XAI_DIR = EVAL_DIR / "xai_global_analysis"
XAI_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("🔍 TASK 3.1 & 3.2: Global SHAP Analysis")
print("=" * 70)

# ==========================================
# 2. Load Best Model & Data
# ==========================================
print("\n1️⃣  Loading Best Model and Test Data...")

# 2.1 Identify Best Model
best_model_file = EVAL_DIR / "best_model_name.txt"
if best_model_file.exists():
    with open(best_model_file, "r") as f:
        best_model_name = f.read().strip()
    print(f"   🏆 Selected Best Model: {best_model_name}")
else:
    print("   ⚠️  Best model name not found. Defaulting to 'Neural Network'.")
    best_model_name = "Neural Network"

# Map model name to filename
model_mapping = {
    "Decision Tree": "decision_tree_model.pkl",
    "Logistic Regression": "logistic_regression_model.pkl",
    "Random Forest": "random_forest_model.pkl",
    "XGBoost": "xgboost_model.pkl",
    "Neural Network": "neural_network_model.pkl"
}

model_filename = model_mapping.get(best_model_name)
if not model_filename:
    print(f"   ❌ Error: Unknown model name '{best_model_name}'")
    exit(1)

model_path = MODEL_DIR / model_filename

# 2.2 Load Model
try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print(f"   ✅ Model loaded from: {model_path}")
except FileNotFoundError:
    print(f"   ❌ Error: Model file not found at {model_path}")
    exit(1)

# 2.3 Load Test Data
try:
    X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")
    y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()
    print(f"   📊 Data Loaded: Total Test Samples={len(X_test)}")
except FileNotFoundError as e:
    print(f"   ❌ Error: Data file not found - {e}")
    print("   Please ensure 04_prepare_model_data.py has been run.")
    exit(1)

# Sampling for SHAP (Crucial for speed with KernelExplainer)
background_sample_size = 100  # Reduced for speed
explain_sample_size = 500     # Reduced for speed

if len(X_test) > background_sample_size:
    X_background = X_test.sample(n=background_sample_size, random_state=42)
    X_explain = X_test.sample(n=explain_sample_size, random_state=42)
else:
    X_background = X_test
    X_explain = X_test

print(f"   ⚡ Using Background Sample: {len(X_background)}, Explain Subset: {len(X_explain)}")

# ==========================================
# 3. Initialize SHAP Explainer
# ==========================================
print("\n2️⃣  Initializing SHAP Explainer...")

def model_predict(data):
    return model.predict(data)

try:
    if best_model_name in ["Random Forest", "XGBoost", "Decision Tree"]:
        explainer = shap.TreeExplainer(model)
        print(f"   🌲 Using TreeExplainer (Optimized for {best_model_name})")
        shap_values = explainer.shap_values(X_explain)
    else:
        # Neural Network / Logistic Regression
        explainer = shap.KernelExplainer(model_predict, X_background)
        print(f"   🧠 Using KernelExplainer (For {best_model_name})")
        # nsamples='auto' or a fixed number for speed
        shap_values = explainer.shap_values(X_explain, nsamples=150) 
    print("   ✅ SHAP values calculated successfully.")
except Exception as e:
    print(f"   ❌ Error during SHAP calculation: {e}")
    exit(1)

# Handle Multi-class Output
# For multi-class, shap_values is often a list of arrays [class_0, class_1, ...]
is_multi_class_list = isinstance(shap_values, list)

if is_multi_class_list:
    print(f"   ℹ️  Detected multi-class output (List of {len(shap_values)} classes).")
    # Calculate Mean Absolute SHAP across all classes for global ranking
    # Shape: (n_samples, n_features) -> Average over samples and classes
    mean_abs_shap = np.mean([np.abs(sv).mean(axis=0) for sv in shap_values], axis=0)
    # For plotting, we can pass the list directly to shap.summary_plot
    shap_for_plot = shap_values
else:
    # Single array (Binary or Regression)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_for_plot = shap_values

# ==========================================
# 4. Global Feature Importance Analysis
# ==========================================
print("\n3️⃣  Generating Global Feature Importance...")

feature_names = X_explain.columns.tolist()

importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': mean_abs_shap
}).sort_values(by='Importance', ascending=False).reset_index(drop=True)

print("\n📊 Top 15 Most Important Features:")
print(importance_df.head(15).to_string(index=False))

# 💾 SAVE TO CSV (Key Fix: Save to XAI_DIR, but also copy to PROCESSED_DIR for Notebook ease if needed)
output_csv_path = XAI_DIR / "global_feature_importance.csv"
importance_df.to_csv(output_csv_path, index=False)
print(f"   💾 Saved importance ranking to: {output_csv_path}")

# Optional: Also save to PROCESSED_DIR root if your Notebook looks there directly
# Uncomment next line if your Notebook strictly looks in data/processed/
# importance_df.to_csv(PROCESSED_DIR / "global_feature_importance.csv", index=False)

# ==========================================
# 5. Visualization
# ==========================================
print("\n4️⃣  Generating Visualizations...")

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

# 5.1 SHAP Summary Plot (Beeswarm)
plt.figure(figsize=(12, 10))
try:
    shap.summary_plot(shap_for_plot, X_explain, plot_type="dot", show=False, max_display=20, color=plt.cm.viridis)
except Exception as e:
    print(f"   ⚠️  Dot plot failed, trying bar plot: {e}")
    shap.summary_plot(shap_for_plot, X_explain, plot_type="bar", show=False, max_display=20)

plt.title(f"SHAP Summary Plot ({best_model_name})\nFeature Impact on Engagement Prediction", fontsize=14, pad=20)
plt.savefig(XAI_DIR / "shap_summary_beeswarm.png", dpi=300, bbox_inches='tight')
plt.close()
print("   📈 Saved: shap_summary_beeswarm.png")

# 5.2 Bar Plot of Top Features
plt.figure(figsize=(10, 8))
top_n = 15
sns.barplot(data=importance_df.head(top_n), x='Importance', y='Feature', palette='mako')
plt.title(f"Top {top_n} Global Feature Importances ({best_model_name})", fontsize=14)
plt.xlabel("Mean |SHAP Value|")
plt.ylabel("")
plt.tight_layout()
plt.savefig(XAI_DIR / "shap_importance_bar.png", dpi=300, bbox_inches='tight')
plt.close()
print("   📊 Saved: shap_importance_bar.png")

# ==========================================
# 6. Pedagogy-Specific Analysis
# ==========================================
print("\n5️⃣  Analyzing Active Learning Method Impacts...")

pedagogy_groups = {
    "Flipped Classroom": [
        "video_completion_rate", "resource_downloads", "days_accessed", 
        "flipped_classroom_adoption", "total_clicks"
    ],
    "Peer Instruction": [
        "forum_posts", "total_clicks", "days_accessed",
        "peer_instruction_adoption"
    ],
    "Project-Based Learning": [
        "on_time_rate", "days_accessed", "resource_downloads",
        "project_based_learning_adoption"
    ]
}

group_impact = {}
for group, features in pedagogy_groups.items():
    valid_features = [f for f in features if f in importance_df['Feature'].values]
    if valid_features:
        total_imp = importance_df[importance_df['Feature'].isin(valid_features)]['Importance'].sum()
        group_impact[group] = total_imp
    else:
        group_impact[group] = 0.0

group_df = pd.DataFrame(list(group_impact.items()), columns=['Pedagogy', 'Aggregate Importance'])
group_df = group_df.sort_values(by='Aggregate Importance', ascending=False)

print("\n🎓 Aggregate Importance by Active Learning Method:")
print(group_df.to_string(index=False))

# Save Pedagogy Report
report_path = XAI_DIR / "pedagogy_impact_report.txt"
with open(report_path, "w") as f:
    f.write("ACTIVE LEARNING METHOD IMPACT ANALYSIS (SHAP)\n")
    f.write("="*50 + "\n\n")
    f.write(f"Model Analyzed: {best_model_name}\n")
    f.write(f"Data Samples: {len(X_explain)}\n\n")
    f.write("Aggregate Importance by Method:\n")
    f.write("-" * 30 + "\n")
    for _, row in group_df.iterrows():
        f.write(f"{row['Pedagogy']:<25}: {row['Aggregate Importance']:.4f}\n")
    
    f.write("\n\nTop 10 Individual Features Driving Predictions:\n")
    f.write("-" * 30 + "\n")
    for i, row in importance_df.head(10).iterrows():
        f.write(f"{i+1}. {row['Feature']:<25}: {row['Importance']:.4f}\n")

print(f"   💾 Saved pedagogy report to: {report_path}")

# Visualize Pedagogy Impact
plt.figure(figsize=(8, 6))
sns.barplot(data=group_df, x='Aggregate Importance', y='Pedagogy', palette='coolwarm')
plt.title("Aggregate SHAP Importance by Active Learning Method", fontsize=14)
plt.xlabel("Sum of Feature Importances in Group")
plt.tight_layout()
plt.savefig(XAI_DIR / "pedagogy_method_impact.png", dpi=300, bbox_inches='tight')
plt.close()
print("   📊 Saved: pedagogy_method_impact.png")

print("\n" + "=" * 70)
print("✅ Global SHAP Analysis Complete!")
print(f"📂 All results saved to: {XAI_DIR}")
print("=" * 70)