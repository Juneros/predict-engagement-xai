import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

warnings.filterwarnings('ignore')

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
EVAL_DIR = Path("evaluation")
EVAL_DIR.mkdir(exist_ok=True)

print("=" * 70)
print("🏆 COMPREHENSIVE MODEL EVALUATION - 5 MODELS COMPARISON")
print("=" * 70)

# Define models to evaluate
models_config = {
    "Decision Tree": "decision_tree_model.pkl",
    "Logistic Regression": "logistic_regression_model.pkl",
    "Random Forest": "random_forest_model.pkl",
    "XGBoost": "xgboost_model.pkl",
    "Neural Network": "neural_network_model.pkl"
}

# Class labels for 5-level engagement
class_labels = ["Very Low", "Low", "Medium", "High", "Very High"]

# ==========================================
# 2. Load Test Data
# ==========================================
print("\n1️⃣  Loading Test Data...")
try:
    X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")
    y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()
    print(f"   ✅ Test Set Size: {len(X_test)} samples")
    print(f"   📊 Class Distribution:\n{y_test.value_counts().sort_index()}")
except FileNotFoundError as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# ==========================================
# 3. Load Models & Make Predictions
# ==========================================
print("\n2️⃣  Loading Models & Generating Predictions...")

results_data = []
loaded_models = []

for name, filename in models_config.items():
    model_path = MODEL_DIR / filename
    if model_path.exists():
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            
            # Predict
            y_pred = model.predict(X_test)
            
            # Try to get probabilities (for AUC if needed, though not strictly required for this script)
            try:
                y_proba = model.predict_proba(X_test)
            except AttributeError:
                y_proba = None
            
            results_data.append({
                "name": name,
                "y_pred": y_pred,
                "y_proba": y_proba,
                "model_obj": model
            })
            loaded_models.append(name)
            print(f"   ✅ Loaded: {name}")
        except Exception as e:
            print(f"   ⚠️  Failed to load {name}: {e}")
    else:
        print(f"   ⚠️  Model file not found: {filename} (Skipping {name})")

if not results_data:
    print("   ❌ No models loaded. Exiting.")
    exit(1)

# ==========================================
# 4. Calculate Metrics
# ==========================================
print("\n3️⃣  Calculating Metrics...")

metrics_list = []

for res in results_data:
    name = res["name"]
    y_pred = res["y_pred"]
    
    # Basic Metrics (Weighted for multi-class imbalance)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    # Macro Metrics (Treat all classes equally)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    
    metrics_list.append({
        "Model": name,
        "Accuracy": acc,
        "Precision (W)": prec,
        "Recall (W)": rec,
        "F1-Score (W)": f1,
        "F1-Score (Macro)": f1_macro
    })

# Create DataFrame
metrics_df = pd.DataFrame(metrics_list)
# Sort by Weighted F1-Score (Primary Metric)
metrics_df = metrics_df.sort_values(by="F1-Score (W)", ascending=False).reset_index(drop=True)

print("\n📊 Model Ranking (by Weighted F1-Score):")
print(metrics_df.to_string(index=False))

# Save to CSV
metrics_df.to_csv(EVAL_DIR / "model_comparison_metrics.csv", index=False)
print(f"\n   💾 Metrics saved to: {EVAL_DIR / 'model_comparison_metrics.csv'}")

# ==========================================
# 5. Visualizations
# ==========================================
print("\n4️⃣  Generating Visualizations...")
sns.set_style("whitegrid")
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans', 'SimHei'] # Support Chinese if needed
plt.rcParams['axes.unicode_minus'] = False

# 5.1 Bar Chart Comparison
plt.figure(figsize=(12, 8))
x = np.arange(len(metrics_df))
width = 0.15

metrics_to_plot = ["Accuracy", "F1-Score (W)", "F1-Score (Macro)", "Recall (W)"]
colors = plt.cm.Set2(np.linspace(0, 1, len(metrics_to_plot)))

for i, metric in enumerate(metrics_to_plot):
    plt.bar(x + i * width, metrics_df[metric], width, label=metric, color=colors[i])

plt.xlabel("Model")
plt.ylabel("Score")
plt.title("Model Performance Comparison")
plt.xticks(x + width * 1.5, metrics_df["Model"], rotation=15)
plt.ylim(0, 1.05)
plt.legend()
plt.tight_layout()
plt.savefig(EVAL_DIR / "performance_bar_chart.png", dpi=300)
plt.close()
print("   📈 Saved: performance_bar_chart.png")

# 5.2 Confusion Matrices
fig, axes = plt.subplots(2, 3, figsize=(18, 12))
axes = axes.flatten()

for idx, res in enumerate(results_data):
    cm = confusion_matrix(y_test, res["y_pred"], labels=range(5)) # Use integer labels 0-4
    
    # Plot heatmap
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_labels, yticklabels=class_labels, 
                ax=axes[idx], cbar_kws={'label': 'Count'})
    
    axes[idx].set_title(f"{res['name']}\nConfusion Matrix", fontsize=14, fontweight='bold')
    axes[idx].set_xlabel("Predicted Label")
    axes[idx].set_ylabel("True Label")
    # Rotate labels for readability
    axes[idx].set_xticklabels(class_labels, rotation=45, ha='right')
    axes[idx].set_yticklabels(class_labels, rotation=0)

# Hide the last unused subplot if only 5 models
if len(results_data) < 6:
    axes[5].axis('off')

plt.tight_layout()
plt.savefig(EVAL_DIR / "confusion_matrices.png", dpi=300)
plt.close()
print("   📉 Saved: confusion_matrices.png")

# ==========================================
# 6. Select Best Model (With Preference Logic)
# ==========================================
print("\n5️⃣  Final Verdict")
print("=" * 50)

# 🎯 配置：你偏好的模型列表 (按优先级排序)
PREFERRED_MODELS = [
    "Neural Network",   # 第一优先：你想用神经网络
    "XGBoost",          # 第二优先：其次是 XGBoost
    "Random Forest"     # 第三优先：然后是随机森林
]

# 1. 过滤出偏好列表中的模型
preferred_df = metrics_df[metrics_df["Model"].isin(PREFERRED_MODELS)]

if not preferred_df.empty:
    # 在偏好模型中选分数最高的
    best_row = preferred_df.iloc[0] # 因为 metrics_df 已经按分数降序排列，所以取第一个即可
    best_model_name = best_row["Model"]
    best_f1_score = best_row["F1-Score (W)"]
    
    print(f"🌟 Using Preferred Model Selection Strategy...")
    print(f"   Preferred List: {', '.join(PREFERRED_MODELS)}")
    print(f"   Available in list: {', '.join(preferred_df['Model'].tolist())}")
else:
    # 如果偏好列表里的模型都不可用，则回退到全局第一
    print(f"⚠️  Warning: None of the preferred models were found/loaded.")
    print(f"   Fallback to global best model...")
    best_row = metrics_df.iloc[0]
    best_model_name = best_row["Model"]
    best_f1_score = best_row["F1-Score (W)"]

# 2. 打印结果
print(f"\n🏆 SELECTED BEST MODEL: {best_model_name}")
print(f"   Weighted F1-Score: {best_f1_score:.4f}")
print(f"   Accuracy: {best_row['Accuracy']:.4f}")
print(f"   (Note: Logistic Regression scored {metrics_df[metrics_df['Model']=='Logistic Regression']['F1-Score (W)'].values[0]:.4f} but was excluded by preference)")
print("=" * 50)

# 3. 保存最佳模型名称供 Streamlit 使用
with open(EVAL_DIR / "best_model_name.txt", "w") as f:
    f.write(best_model_name)

print(f"\n💾 Best model name saved to: {EVAL_DIR / 'best_model_name.txt'}")
print("\n✨ Evaluation Complete! Check the 'evaluation' folder for reports.")