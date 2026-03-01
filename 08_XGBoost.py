import pandas as pd
import pickle
from pathlib import Path
import xgboost as xgb
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

print("🚀 Training XGBoost Model...")
print(f"   Using XGBoost Version: {xgb.__version__}")

# ==========================================
# 2. Load Preprocessed Data
# ==========================================
try:
    X_train = pd.read_csv(PROCESSED_DIR / "X_train.csv")
    y_train = pd.read_csv(PROCESSED_DIR / "y_train.csv").squeeze()
    X_val = pd.read_csv(PROCESSED_DIR / "X_val.csv")
    y_val = pd.read_csv(PROCESSED_DIR / "y_val.csv").squeeze()
    X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")
    y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()
except Exception as e:
    print(f"❌ Error loading data: {e}")
    exit(1)

# ==========================================
# 3. Initialize & Train Model
# ==========================================
xgb_model = xgb.XGBClassifier(
    objective='multi:softprob',
    num_class=5,
    n_estimators=300,         # 固定 300 棵树
    max_depth=4,              # 限制深度防止过拟合
    learning_rate=0.05,       # 低学习率
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    tree_method='hist',
    eval_metric='mlogloss',
    verbosity=0
)

print("   Fitting model...")
xgb_model.fit(X_train, y_train)
print("   Training completed.")

# ==========================================
# 4. Simple Evaluation
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

print_simple_metrics(xgb_model, X_train, y_train, "Training Set")
print_simple_metrics(xgb_model, X_val, y_val, "Validation Set")
test_acc = print_simple_metrics(xgb_model, X_test, y_test, "Test Set")

# ==========================================
# 5. Save Model
# ==========================================
model_path = MODEL_DIR / "xgboost_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(xgb_model, f)

print(f"\n✅ Model saved to: {model_path}")
print("🚀 XGBoost training completed.")