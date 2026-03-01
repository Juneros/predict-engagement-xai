import pandas as pd
import pickle
from pathlib import Path
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

print("🌳 Training Decision Tree Model...")

# ==========================================
# 2. Load Preprocessed Data
# ==========================================
X_train = pd.read_csv(PROCESSED_DIR / "X_train.csv")
y_train = pd.read_csv(PROCESSED_DIR / "y_train.csv").squeeze()

X_val = pd.read_csv(PROCESSED_DIR / "X_val.csv")
y_val = pd.read_csv(PROCESSED_DIR / "y_val.csv").squeeze()

X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")
y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()

# ==========================================
# 3. Initialize & Train Model
# ==========================================
dt_model = DecisionTreeClassifier(
    criterion='gini',
    max_depth=10,           # 限制树深防止过拟合
    min_samples_split=20,   # 节点分裂最小样本数
    min_samples_leaf=10,    # 叶子节点最小样本数
    class_weight='balanced',# 平衡5类样本
    random_state=42
)

print("   Fitting model on training data...")
dt_model.fit(X_train, y_train)

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
print_simple_metrics(dt_model, X_train, y_train, "Training Set")
print_simple_metrics(dt_model, X_val, y_val, "Validation Set")
test_acc = print_simple_metrics(dt_model, X_test, y_test, "Test Set")

# ==========================================
# 5. Save Model
# ==========================================
model_path = MODEL_DIR / "decision_tree_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(dt_model, f)

print(f"\n✅ Model saved to: {model_path}")
print("🚀 Decision Tree training completed.")