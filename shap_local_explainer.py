import pandas as pd
import numpy as np
import pickle
import shap
from pathlib import Path
from functools import lru_cache
import warnings

warnings.filterwarnings('ignore')

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
MODEL_DIR = Path("models")
EVAL_DIR = Path("evaluation")

# Define Pedagogy Feature Groups (Must match 11_shap_global_analysis.py)
PEDAGOGY_GROUPS = {
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

class LocalExplainer:
    """
    A singleton-like class to handle local SHAP explanations for individual students.
    Optimized for use in Streamlit applications.
    """
    
    _instance = None
    _explainer = None
    _model = None
    _background_data = None
    _feature_names = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalExplainer, cls).__new__(cls)
            # ✅ 修复：确保 _initialize 在实例创建时调用，且缩进正确
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Load model and initialize SHAP explainer (called only once)."""
        print("🔍 Initializing Local SHAP Explainer...")
        
        # 1. Identify Best Model
        best_model_file = EVAL_DIR / "best_model_name.txt"
        if best_model_file.exists():
            with open(best_model_file, "r") as f:
                self.model_name = f.read().strip()
        else:
            self.model_name = "Neural Network" # Default fallback
            
        model_mapping = {
            "Decision Tree": "decision_tree_model.pkl",
            "Logistic Regression": "logistic_regression_model.pkl",
            "Random Forest": "random_forest_model.pkl",
            "XGBoost": "xgboost_model.pkl",
            "Neural Network": "neural_network_model.pkl"
        }
        
        model_path = MODEL_DIR / model_mapping.get(self.model_name, "neural_network_model.pkl")
        
        # 2. Load Model
        try:
            with open(model_path, "rb") as f:
                self._model = pickle.load(f)
            print(f"   ✅ Model loaded: {self.model_name}")
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
            raise e
        
        # 3. Load Background Data for SHAP
        background_path = PROCESSED_DIR / "X_train.csv"
        if not background_path.exists():
            background_path = PROCESSED_DIR / "X_test.csv"
            
        full_data = pd.read_csv(background_path)
        
        # ⚠️ 修改点 A: 对于 KernelExplainer，背景数据越少越快，50行通常足够代表分布
        bg_sample_size = min(50, len(full_data))
        self._background_data = full_data.sample(n=bg_sample_size, random_state=42)
        self._feature_names = self._background_data.columns.tolist()
        
        print(f"   📊 Background data sampled: {len(self._background_data)} rows")
        
        # 4. Initialize SHAP Explainer
        if self.model_name in ["Random Forest", "XGBoost", "Decision Tree"]:
            self._explainer = shap.TreeExplainer(self._model)
            print(f"   🌲 Using TreeExplainer")
        else:
            # For NN and LR (KernelExplainer)
            def model_predict(data):
                preds = self._model.predict(data)
                return np.array(preds)
            
            # ⚠️ 修改点 B: 显式设置 nsamples 防止 shape (0,1) 错误
            nsamples_val = 100 
            
            print(f"   🧠 Initializing KernelExplainer with nsamples={nsamples_val}...")
            
            try:
                self._explainer = shap.KernelExplainer(
                    model_predict, 
                    self._background_data,
                    nsamples=nsamples_val
                )
            except Exception as e:
                print(f"   ⚠️ KernelExplainer init failed with nsamples={nsamples_val}, trying 'auto'...")
                self._explainer = shap.KernelExplainer(model_predict, self._background_data)
                
            print(f"   🧠 Using KernelExplainer")
            
        print("✅ Local Explainer Initialized Successfully.")

    def explain_student(self, student_data):
        """
        Calculate SHAP values for a single student.
        """
        # Ensure input is DataFrame
        if isinstance(student_data, pd.Series):
            student_df = student_data.to_frame().T
        elif isinstance(student_data, dict):
            student_df = pd.DataFrame([student_data])
        else:
            student_df = student_data.reset_index(drop=True) if hasattr(student_data, 'reset_index') else pd.DataFrame(student_data)
            
        # ⚠️ 关键保护：确保只有一行数据
        if len(student_df) > 1:
            print(f"⚠️ Warning: Multiple rows detected ({len(student_df)}). Taking only the first row for explanation.")
            student_df = student_df.iloc[:1]
        
        if len(student_df) == 0:
            raise ValueError("Input student data is empty!")

        # Align columns strictly
        try:
            student_df = student_df[self._feature_names]
        except KeyError as e:
            missing_cols = set(self._feature_names) - set(student_df.columns)
            raise KeyError(f"Missing columns in student data: {missing_cols}") from e
            
        # 确保数据类型是 float
        student_df = student_df.astype(float)

        # Calculate SHAP values
        if hasattr(self._explainer, 'shap_values'):
            shap_output = self._explainer.shap_values(student_df)
        else:
            shap_output = self._explainer(student_df)
            
        # Handle Multi-class output
        predicted_probs = self._model.predict_proba(student_df)[0]
        predicted_class_idx = np.argmax(predicted_probs)
        predicted_class_label = self._model.classes_[predicted_class_idx]
        
        if isinstance(shap_output, list):
            # Multi-class: list of arrays
            target_shap_values = shap_output[predicted_class_idx]
            all_class_shap = shap_output
        else:
            # Binary or Regression
            target_shap_values = shap_output
            all_class_shap = shap_output
            
        return {
            "shap_values": target_shap_values[0], # Return 1D array for the single sample
            "all_class_shap": all_class_shap,
            "base_value": self._explainer.expected_value if not isinstance(self._explainer.expected_value, list) else self._explainer.expected_value[predicted_class_idx],
            "feature_names": self._feature_names,
            "predicted_class": predicted_class_label,
            "predicted_probs": predicted_probs,
            "student_data": student_df.iloc[0].to_dict()
        }

    def get_pedagogy_contribution(self, explanation_result):
        """
        Aggregate SHAP values for specific pedagogy groups.
        """
        shap_vals = explanation_result["shap_values"]
        features = explanation_result["feature_names"]
        
        contributions = {}
        
        for group_name, feature_list in PEDAGOGY_GROUPS.items():
            total_contrib = 0.0
            valid_features = []
            
            for feat in feature_list:
                if feat in features:
                    idx = features.index(feat)
                    total_contrib += shap_vals[idx]
                    valid_features.append(feat)
            
            contributions[group_name] = {
                "total_shap": total_contrib,
                "features": valid_features
            }
            
        return contributions

# ==========================================
# Helper Function for Streamlit
# ==========================================
def get_explainer():
    """Simple wrapper to get the singleton instance."""
    return LocalExplainer()

# ==========================================
# Test Block (Run directly to verify)
# ==========================================
if __name__ == "__main__":
    print("\n🧪 Testing LocalExplainer...")
    try:
        explainer = get_explainer()
        
        # Load a sample student from test set
        test_sample = pd.read_csv(PROCESSED_DIR / "X_test.csv").iloc[0:1]
        
        print("\n👤 Explaining a sample student...")
        result = explainer.explain_student(test_sample)
        
        print(f"   Predicted Class: {result['predicted_class']}")
        print(f"   Base Value: {result['base_value']:.4f}")
        print(f"   Top 3 Positive Features:")
        
        # Sort features by SHAP value
        sorted_indices = np.argsort(result['shap_values'])[::-1]
        for i in sorted_indices[:3]:
            fname = result['feature_names'][i]
            val = result['shap_values'][i]
            print(f"      - {fname}: {val:.4f}")
            
        print("\n🎓 Pedagogy Contributions:")
        pedagogy_contrib = explainer.get_pedagogy_contribution(result)
        for method, data in pedagogy_contrib.items():
            print(f"   {method}: {data['total_shap']:.4f} (Features: {', '.join(data['features'])})")
            
        print("\n✅ Test Passed! LocalExplainer is ready for Streamlit.")
        
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()