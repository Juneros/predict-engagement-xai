import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import StandardScaler
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
CV_DIR = EVAL_DIR / "cross_validation"
CV_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("🔄 TASK 4.1: K-Fold Cross-Validation & Robustness Testing")
print("=" * 70)

# ==========================================
# 2. Load Data & Best Model
# ==========================================
print("\n1️⃣  Loading Data and Best Model...")

# Load full dataset (before split) to perform CV on the whole distribution
# Note: We need the raw features before the specific train/val/test split used in training
# However, for simplicity and consistency with our pipeline, we will reload the original merged data
# and re-apply preprocessing inside the CV loop to prevent leakage.
# BUT, to keep it simple and fast, we will load the preprocessed X and y from the original files 
# IF they represent the full dataset. 
# Since our pipeline split them already, let's load the original merged dataset and re-preprocess.

try:
    merged_df = pd.read_csv(PROCESSED_DIR / "merged_dataset.csv")
    print(f"   ✅ Loaded merged dataset: {merged_df.shape}")
except FileNotFoundError:
    print("   ❌ Error: merged_dataset.csv not found. Please run 04_prepare_model_data.py first.")
    exit(1)

# Identify Target
target_col = "engagement_level_encoded"
y = merged_df[target_col].values

# Identify Features (Drop IDs and Target)
id_cols = ["id_student", "code_module", "code_presentation"]
drop_cols = id_cols + [target_col, "engagement_level"]
X_raw = merged_df.drop(columns=drop_cols)

# Identify Categorical and Numeric columns
categorical_cols = X_raw.select_dtypes(include=["object", "category"]).columns.tolist()
numeric_cols = X_raw.select_dtypes(include=["int64", "float64"]).columns.tolist()

print(f"   📊 Features: {X_raw.shape[1]} ({len(numeric_cols)} numeric, {len(categorical_cols)} categorical)")
print(f"   🎯 Classes: {np.unique(y)}")

# Load Best Model to confirm which one to validate
best_model_file = EVAL_DIR / "best_model_name.txt"
if best_model_file.exists():
    with open(best_model_file, "r") as f:
        best_model_name = f.read().strip()
else:
    best_model_name = "Neural Network" # Default

model_mapping = {
    "Decision Tree": "decision_tree_model.pkl",
    "Logistic Regression": "logistic_regression_model.pkl",
    "Random Forest": "random_forest_model.pkl",
    "XGBoost": "xgboost_model.pkl",
    "Neural Network": "neural_network_model.pkl"
}

# We will re-initialize the model class to ensure fresh instances for each fold
# Import necessary classes
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
try:
    import xgboost as xgb
except ImportError:
    xgb = None

def get_model_instance(name):
    if name == "Neural Network":
        return MLPClassifier(hidden_layer_sizes=(100, 50), activation='relu', solver='adam', max_iter=500, random_state=42)
    elif name == "Random Forest":
        return RandomForestClassifier(n_estimators=100, random_state=42)
    elif name == "XGBoost":
        if xgb is None: raise ImportError("XGBoost not installed")
        return xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    elif name == "Logistic Regression":
        return LogisticRegression(max_iter=1000, random_state=42)
    elif name == "Decision Tree":
        return DecisionTreeClassifier(random_state=42)
    else:
        raise ValueError(f"Unknown model: {name}")

print(f"   🏆 Validating Model: {best_model_name}")

# ==========================================
# 3. K-Fold Cross-Validation Setup
# ==========================================
print("\n2️⃣  Setting up Stratified K-Fold Cross-Validation...")

k_folds = 5
skf = StratifiedKFold(n_splits=k_folds, shuffle=True, random_state=42)

# Metrics storage
metrics = {
    'Fold': [],
    'Accuracy': [],
    'Precision (W)': [],
    'Recall (W)': [],
    'F1-Score (W)': [],
    'F1-Score (Macro)': []
}

fold_predictions = []
fold_true_labels = []

print(f"\n🚀 Starting {k_folds}-Fold Cross-Validation...")
print("-" * 50)

for fold, (train_idx, test_idx) in enumerate(skf.split(X_raw, y)):
    print(f"Processing Fold {fold + 1}/{k_folds}...", end=" ")
    
    # 1. Split Data
    X_train_fold = X_raw.iloc[train_idx]
    X_test_fold = X_raw.iloc[test_idx]
    y_train_fold = y[train_idx]
    y_test_fold = y[test_idx]
    
    # 2. Preprocessing (Inside Loop to Prevent Leakage)
    # One-Hot Encoding
    X_train_enc = pd.get_dummies(X_train_fold, columns=categorical_cols, drop_first=False)
    X_test_enc = pd.get_dummies(X_test_fold, columns=categorical_cols, drop_first=False)
    
    # Align columns (ensure test set has same columns as train set)
    X_test_enc = X_test_enc.reindex(columns=X_train_enc.columns, fill_value=0)
    
    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_enc)
    X_test_scaled = scaler.transform(X_test_enc)
    
    # 3. Train Model
    model = get_model_instance(best_model_name)
    model.fit(X_train_scaled, y_train_fold)
    
    # 4. Predict
    y_pred = model.predict(X_test_scaled)
    
    # 5. Calculate Metrics
    acc = accuracy_score(y_test_fold, y_pred)
    prec_w = precision_score(y_test_fold, y_pred, average='weighted')
    rec_w = recall_score(y_test_fold, y_pred, average='weighted')
    f1_w = f1_score(y_test_fold, y_pred, average='weighted')
    f1_macro = f1_score(y_test_fold, y_pred, average='macro')
    
    # Store
    metrics['Fold'].append(fold + 1)
    metrics['Accuracy'].append(acc)
    metrics['Precision (W)'].append(prec_w)
    metrics['Recall (W)'].append(rec_w)
    metrics['F1-Score (W)'].append(f1_w)
    metrics['F1-Score (Macro)'].append(f1_macro)
    
    fold_predictions.extend(y_pred)
    fold_true_labels.extend(y_test_fold)
    
    print(f"Acc: {acc:.4f}, F1(W): {f1_w:.4f}")

print("-" * 50)

# ==========================================
# 4. Statistical Analysis
# ==========================================
print("\n3️⃣  Statistical Analysis & Robustness Check...")

metrics_df = pd.DataFrame(metrics)
summary_stats = metrics_df.describe()

# Calculate Mean ± Std Dev
results_summary = {}
for col in ['Accuracy', 'Precision (W)', 'Recall (W)', 'F1-Score (W)', 'F1-Score (Macro)']:
    mean_val = metrics_df[col].mean()
    std_val = metrics_df[col].std()
    results_summary[col] = f"{mean_val:.4f} ± {std_val:.4f}"
    print(f"   {col:<15}: {results_summary[col]}")

# Stability Check
f1_std = metrics_df['F1-Score (W)'].std()
if f1_std < 0.01:
    stability_verdict = "✅ Excellent Stability (Std Dev < 0.01)"
elif f1_std < 0.03:
    stability_verdict = "✅ Good Stability (Std Dev < 0.03)"
else:
    stability_verdict = "⚠️ Moderate Variance (Std Dev >= 0.03)"

print(f"\n🛡️  Robustness Verdict: {stability_verdict}")

# ==========================================
# 5. Visualization
# ==========================================
print("\n4️⃣  Generating Visualizations...")

sns.set_style("whitegrid")
plt.figure(figsize=(10, 6))

# Boxplot of F1-Scores across folds
melted_df = metrics_df.melt(id_vars=['Fold'], value_vars=['Accuracy', 'F1-Score (W)', 'F1-Score (Macro)'], 
                            var_name='Metric', value_name='Score')

sns.boxplot(data=melted_df, x='Metric', y='Score', palette='viridis')
sns.swarmplot(data=melted_df, x='Metric', y='Score', color='black', size=6, alpha=0.6)

plt.title(f'{k_folds}-Fold Cross-Validation Performance Distribution\n({best_model_name})', fontsize=14)
plt.ylim(0.8, 1.0) # Adjust based on your expected range
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Add Mean lines
means = melted_df.groupby('Metric')['Score'].mean()
for i, metric in enumerate(means.index):
    plt.plot(i, means[metric], 'r*', markersize=15, label=f'Mean {metric}' if i==0 else "")

plt.legend()
plt.tight_layout()
plt.savefig(CV_DIR / "cv_performance_boxplot.png", dpi=300, bbox_inches='tight')
plt.close()
print("   📈 Saved: cv_performance_boxplot.png")

# Bar chart of Mean ± Std Dev
plt.figure(figsize=(10, 6))
metric_names = list(results_summary.keys())
mean_vals = [float(results_summary[m].split('±')[0]) for m in metric_names]
std_vals = [float(results_summary[m].split('±')[1].strip()) for m in metric_names]

x_pos = np.arange(len(metric_names))
plt.bar(x_pos, mean_vals, yerr=std_vals, capsize=5, color='skyblue', edgecolor='navy', alpha=0.8)
plt.xticks(x_pos, metric_names, rotation=15, ha='right')
plt.ylabel('Score')
plt.title(f'Model Performance Summary ({k_folds}-Fold CV)\nMean ± Standard Deviation', fontsize=14)
plt.ylim(0, 1.05)

for i, v in enumerate(mean_vals):
    plt.text(i, v + std_vals[i] + 0.01, f"{v:.3f}", ha='center', fontsize=9)

plt.tight_layout()
plt.savefig(CV_DIR / "cv_mean_std_bar.png", dpi=300, bbox_inches='tight')
plt.close()
print("   📊 Saved: cv_mean_std_bar.png")

# ==========================================
# 6. Save Reports
# ==========================================
print("\n5️⃣  Saving Reports...")

# Save detailed metrics
metrics_df.to_csv(CV_DIR / "cv_detailed_metrics.csv", index=False)

# Save Text Report
report_path = CV_DIR / "cv_summary_report.txt"
with open(report_path, "w") as f:
    f.write("CROSS-VALIDATION & ROBUSTNESS TESTING REPORT\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Model: {best_model_name}\n")
    f.write(f"Strategy: Stratified {k_folds}-Fold Cross-Validation\n")
    f.write(f"Total Samples: {len(y)}\n\n")
    
    f.write("📊 Performance Summary (Mean ± Std Dev):\n")
    f.write("-" * 30 + "\n")
    for metric, res in results_summary.items():
        f.write(f"{metric:<20}: {res}\n")
    
    f.write("\n🛡️  Robustness Analysis:\n")
    f.write("-" * 30 + "\n")
    f.write(f"Verdict: {stability_verdict}\n")
    f.write(f"F1-Score (Weighted) Std Dev: {f1_std:.5f}\n")
    
    f.write("\n📝 Conclusion:\n")
    f.write("-" * 30 + "\n")
    if f1_std < 0.01:
        f.write("The model demonstrates exceptional stability across different data splits. \n")
        f.write("The performance is consistent and not dependent on a specific training/testing partition.\n")
    elif f1_std < 0.03:
        f.write("The model shows good stability. Minor variations are observed but are within acceptable limits.\n")
    else:
        f.write("The model shows some variance. Further hyperparameter tuning or more data might be needed to stabilize.\n")

print(f"   💾 Saved: cv_summary_report.txt")
print(f"   💾 Saved: cv_detailed_metrics.csv")

print("\n" + "=" * 70)
print("✅ Cross-Validation Complete!")
print(f"📂 Results saved to: {CV_DIR}")
print("=" * 70)