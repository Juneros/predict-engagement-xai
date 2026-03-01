import pandas as pd
import pickle
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

print("📈 Training Logistic Regression Model...")

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
# - multi_class='multinomial': 支持 5 级多分类 (默认是 ovr 或 binary)
# - solver='lbfgs': 适合多分类问题的优化算法
# - class_weight='balanced': 处理 5 类样本可能不均衡的问题
# - max_iter=1000: 增加迭代次数确保收敛
lr_model = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    class_weight='balanced',
    random_state=42,
    C=1.0  # 正则化强度，1.0 为默认
)

print("   Fitting model on training data...")
lr_model.fit(X_train, y_train)

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
print_simple_metrics(lr_model, X_train, y_train, "Training Set")
print_simple_metrics(lr_model, X_val, y_val, "Validation Set")
test_acc = print_simple_metrics(lr_model, X_test, y_test, "Test Set")

# ==========================================
# 5. Save Model
# ==========================================
model_path = MODEL_DIR / "logistic_regression_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(lr_model, f)

print(f"\n✅ Model saved to: {model_path}")
print("🚀 Logistic Regression training completed.")