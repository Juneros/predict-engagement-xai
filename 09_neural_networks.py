import pandas as pd
import pickle
from pathlib import Path
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

print("🧠 Training Neural Network (MLP) Model...")

# ==========================================
# 2. Load Preprocessed Data
# ==========================================
# 神经网络必须使用标准化数据，这里直接读取即可
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
# - hidden_layer_sizes=(128, 64): 两层隐藏层，节点数递减，适合中等复杂度数据
# - activation='relu': 最常用的激活函数，收敛快
# - solver='adam': 自适应学习率优化器，适合大规模数据
# - alpha=0.001: L2正则化，防止过拟合
# - max_iter=500: 增加迭代次数确保收敛
# - early_stopping=True: 内置早停机制，自动利用验证集防止过拟合
# - validation_fraction=0.1: 从训练集中划出10%作为内部验证集用于早停
nn_model = MLPClassifier(
    hidden_layer_sizes=(128, 64),
    activation='relu',
    solver='adam',
    alpha=0.001,          # L2 regularization
    batch_size=32,
    learning_rate='adaptive',
    learning_rate_init=0.001,
    max_iter=500,
    shuffle=True,
    random_state=42,
    tol=1e-4,
    verbose=False,
    early_stopping=True,  # 启用内置早停
    validation_fraction=0.1 # 使用部分训练数据监控早停
)

print("   Fitting model (this may take a moment)...")
nn_model.fit(X_train, y_train)

# 获取实际迭代次数
print(f"   Training completed in {nn_model.n_iter_} iterations.")

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
print_simple_metrics(nn_model, X_train, y_train, "Training Set")
print_simple_metrics(nn_model, X_val, y_val, "Validation Set")
test_acc = print_simple_metrics(nn_model, X_test, y_test, "Test Set")

# ==========================================
# 5. Save Model
# ==========================================
model_path = MODEL_DIR / "neural_network_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(nn_model, f)

print(f"\n✅ Model saved to: {model_path}")
print("🚀 Neural Network training completed.")