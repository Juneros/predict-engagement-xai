import pandas as pd
import pickle
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

print("🌲 Training Random Forest Model...")

# ==========================================
# 2. Load Preprocessed Data
# ==========================================
# 数据已在 04 中完成 Scaling 和 One-Hot Encoding，直接读取
X_train = pd.read_csv(PROCESSED_DIR / "X_train.csv")
y_train = pd.read_csv(PROCESSED_DIR / "y_train.csv").squeeze()

X_val = pd.read_csv(PROCESSED_DIR / "X_val.csv")
y_val = pd.read_csv(PROCESSED_DIR / "y_val.csv").squeeze()

X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")
y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()

# ==========================================
# 3. Initialize & Train Model
# ==========================================
# 关键参数:
# - n_estimators=200: 树的数量，越多越稳定但训练越慢 (200是性价比之选)
# - max_depth=None: 让树充分生长，依靠后续参数控制过拟合
# - min_samples_split=5: 节点分裂最小样本数，防止过拟合噪声
# - min_samples_leaf=2: 叶子节点最小样本数
# - class_weight='balanced': 处理5类样本不均衡
# - n_jobs=-1: 使用所有CPU核心并行计算，大幅加速
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',      # 每次分裂只考虑 sqrt(总特征数) 个特征，增加多样性
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
    bootstrap=True            # 使用自助采样法构建每棵树
)

print("   Fitting model on training data (this may take a moment)...")
rf_model.fit(X_train, y_train)

# ==========================================
# 4. Simple Evaluation (Print Only)
# ==========================================
def print_simple_metrics(model, X, y, label):
    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred, average='weighted')
    rec = recall_score(y, y_pred, average='weighted')
    f1 = f1_score(y, y_pred, average='weighted')
    
    print(f"\n--- {label} Performance ---")
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1-Score : {f1:.4f}")
    return acc

# Evaluate on Train, Val, and Test
print_simple_metrics(rf_model, X_train, y_train, "Training Set")
print_simple_metrics(rf_model, X_val, y_val, "Validation Set")
test_acc = print_simple_metrics(rf_model, X_test, y_test, "Test Set")

# ==========================================
# 5. Save Model
# ==========================================
model_path = MODEL_DIR / "random_forest_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(rf_model, f)

print(f"\n✅ Model saved to: {model_path}")
print("🚀 Random Forest training completed.")