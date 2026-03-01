import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from pathlib import Path
import os

# ==========================================
# 1. Configuration & Paths
# ==========================================
PROCESSED_DIR = Path("data/processed")
OUTPUT_DIR = PROCESSED_DIR  # Save processed splits in the same folder
OUTPUT_DIR.mkdir(exist_ok=True)

print("🚀 Preparing Model Data (Merging + Splitting + Scaling)...")

# ==========================================
# 2. Load Datasets
# ==========================================
try:
    # Student Features (Behavior + Adoption + Background)
    student_features = pd.read_csv(PROCESSED_DIR / "X_features.csv")
    
    # Course Pedagogy Features (Flipped, Peer, PBL conditions)
    course_features = pd.read_csv(PROCESSED_DIR / "course_pedagogy_features.csv")
    
    # Engagement Labels (Target)
    engagement_labels = pd.read_csv(PROCESSED_DIR / "engagement_label.csv")
    
    print(f"✅ Loaded Student Features: {student_features.shape}")
    print(f"✅ Loaded Course Features: {course_features.shape}")
    print(f"✅ Loaded Engagement Labels: {engagement_labels.shape}")
    
except FileNotFoundError as e:
    print(f"❌ Error: Missing file - {e}")
    print("Please ensure 01, 02, and 03 scripts have been run successfully.")
    exit(1)

# ==========================================
# 3. Merge All Datasets
# ==========================================
print("\n🔗 Merging datasets...")

# Merge Keys
student_keys = ["id_student", "code_module", "code_presentation"]
course_keys = ["code_module", "code_presentation"]

# Step 1: Merge Student + Course
merged_df = student_features.merge(
    course_features,
    on=course_keys,
    how="left"
)

# Step 2: Merge with Labels
merged_df = merged_df.merge(
    engagement_labels[["id_student", "code_module", "code_presentation", "engagement_level", "engagement_level_encoded"]],
    on=student_keys,
    how="inner"  # Only keep records that have a valid label
)

print(f"✅ Merged Dataset Shape: {merged_df.shape}")

# ==========================================
# 4. Data Cleaning & Preprocessing
# ==========================================
print("\n🧹 Cleaning data...")

# 4.1 Fill Missing Values in Pedagogy Features
# If a course doesn't have a specific pedagogy feature, it means 0 intensity or False
pedagogy_numeric_cols = ["flipped_classroom", "peer_instruction_intensity", "project_based_learning"]
for col in pedagogy_numeric_cols:
    if col in merged_df.columns:
        merged_df[col] = merged_df[col].fillna(0)

# 4.2 Handle Categorical Features
# Identify categorical columns (object or category dtype)
categorical_cols = merged_df.select_dtypes(include=["object", "category"]).columns.tolist()
# Remove ID columns and Target from categorical list
id_cols = ["id_student", "code_module", "code_presentation"]
target_col = "engagement_level_encoded"
label_str_col = "engagement_level"

cols_to_exclude = id_cols + [target_col, label_str_col]
categorical_cols = [c for c in categorical_cols if c not in cols_to_exclude]

print(f"📋 Identified Categorical Features: {categorical_cols}")
print(f"   (Will be One-Hot Encoded)")

# Fill NaNs in categorical cols with "Unknown"
for col in categorical_cols:
    merged_df[col] = merged_df[col].fillna("Unknown")

# Fill NaNs in remaining numeric cols with 0
numeric_cols_all = merged_df.select_dtypes(include=[np.number]).columns.tolist()
numeric_cols_all = [c for c in numeric_cols_all if c not in cols_to_exclude]
for col in numeric_cols_all:
    merged_df[col] = merged_df[col].fillna(0)

# ==========================================
# 5. Define Features (X) and Target (y)
# ==========================================
drop_cols = id_cols + [target_col, label_str_col]
X = merged_df.drop(columns=drop_cols)
y = merged_df[target_col]  # Use the encoded 0-4 labels

print(f"\n📊 Feature Matrix Shape: {X.shape}")
print(f"🎯 Target Distribution:\n{y.value_counts().sort_index()}")

# ==========================================
# 6. Train / Validation / Test Split
# ==========================================
print("\n✂️ Splitting data (60% Train, 20% Val, 20% Test)...")

# First Split: Train (60%) vs Temp (40%)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.4,
    random_state=42,
    stratify=y  # Crucial: Keep 5-class distribution balanced
)

# Second Split: Temp -> Val (50%) and Test (50%) => 20% each of total
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.5,
    random_state=42,
    stratify=y_temp
)

print(f"   Train Set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
print(f"   Val Set:   {len(X_val)} samples ({len(X_val)/len(X)*100:.1f}%)")
print(f"   Test Set:  {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")

# ==========================================
# 7. Feature Scaling (Standardization)
# ==========================================
# Note: XGBoost doesn't strictly require scaling, but it's good practice for neural nets or SVMs.
# We will scale numeric features only. Categorical will be One-Hot Encoded.

print("\n⚖️ Scaling numeric features...")

# Identify numeric columns in the final X (after dropping IDs)
numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
# Remove any integer columns that are actually categories (if any were left)
# In our case, adoption scores are float, clicks are int. All good.

scaler = StandardScaler()

# Fit on TRAIN only to prevent data leakage
X_train[numeric_features] = scaler.fit_transform(X_train[numeric_features])
# Transform on VAL and TEST using train statistics
X_val[numeric_features] = scaler.transform(X_val[numeric_features])
X_test[numeric_features] = scaler.transform(X_test[numeric_features])

# ==========================================
# 8. One-Hot Encoding for Categorical Features
# ==========================================
if categorical_cols:
    print("\n🔣 One-Hot Encoding categorical features...")
    
    # Combine train/val/test for consistent encoding
    X_all = pd.concat([X_train, X_val, X_test], axis=0)
    
    X_all_encoded = pd.get_dummies(X_all, columns=categorical_cols, drop_first=False)
    
    # Split back
    X_train = X_all_encoded.iloc[:len(X_train)]
    X_val = X_all_encoded.iloc[len(X_train):len(X_train)+len(X_val)]
    X_test = X_all_encoded.iloc[len(X_train)+len(X_val):]
    
    print(f"   Final Feature Count after Encoding: {X_train.shape[1]}")

# ==========================================
# 9. Save Processed Datasets
# ==========================================
print("\n💾 Saving processed datasets...")

X_train.to_csv(OUTPUT_DIR / "X_train.csv", index=False)
X_val.to_csv(OUTPUT_DIR / "X_val.csv", index=False)
X_test.to_csv(OUTPUT_DIR / "X_test.csv", index=False)

y_train.to_csv(OUTPUT_DIR / "y_train.csv", index=False)
y_val.to_csv(OUTPUT_DIR / "y_val.csv", index=False)
y_test.to_csv(OUTPUT_DIR / "y_test.csv", index=False)

# Save the scaler and feature list for inference later (optional but recommended)
import pickle
with open(OUTPUT_DIR / "preprocessor_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)
with open(OUTPUT_DIR / "feature_columns.pkl", "wb") as f:
    pickle.dump(X_train.columns.tolist(), f)

# Save the full merged dataset for reference
merged_df.to_csv(OUTPUT_DIR / "merged_dataset.csv", index=False)

print("\n" + "="*60)
print("✅ Data Preparation Complete!")
print("="*60)
print(f"📂 Files saved to: {OUTPUT_DIR}")
print("   - X_train.csv, y_train.csv")
print("   - X_val.csv, y_val.csv")
print("   - X_test.csv, y_test.csv")
print("   - merged_dataset.csv")
print("   - preprocessor_scaler.pkl, feature_columns.pkl")
print("\n✨ Ready for Model Training (05_train_model.py)!")