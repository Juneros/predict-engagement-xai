import pandas as pd
import numpy as np
from pathlib import Path

RAW_DIR = Path("data/raw")
OUTPUT_DIR = Path("data/processed")
OUTPUT_DIR.mkdir(exist_ok=True)

# Load Data
assessments_df = pd.read_csv(RAW_DIR / "assessments.csv")
vle_df = pd.read_csv(RAW_DIR / "vle.csv")
student_vle_df = pd.read_csv(RAW_DIR / "studentVle.csv")

# Ensure date types
student_vle_df['date'] = student_vle_df['date'].astype(int)
assessments_df['date'] = assessments_df['date'].astype(int)

print("🚀 Building Course Pedagogy Features (Intensity-Based)...")

# ==========================================
# 1. Flipped Classroom Score (Time Structure)
# ==========================================
# Logic: Median student video access time vs. Median student assessment submission time per course.
# If Video Median is significantly earlier than Assessment Median -> High Score.

# A. Get Oucontent Access Dates
oucontent_sites = vle_df[vle_df['activity_type'] == 'oucontent'][['id_site', 'code_module', 'code_presentation']]
stu_video = student_vle_df.merge(oucontent_sites, on=['id_site', 'code_module', 'code_presentation'], how='inner')
stu_video_median = stu_video.groupby(['code_module', 'code_presentation'])['date'].median().reset_index(name='median_video_date')

# B. Get Assessment Submission Dates
stu_assess = pd.read_csv(RAW_DIR / "studentAssessment.csv").merge(
    assessments_df[['id_assessment', 'code_module', 'code_presentation']], 
    on='id_assessment', how='left'
)
stu_assess_median = stu_assess.groupby(['code_module', 'code_presentation'])['date_submitted'].median().reset_index(name='median_sub_date')

# C. Calculate Gap & Score
fc_df = stu_video_median.merge(stu_assess_median, on=['code_module', 'code_presentation'], how='outer')
fc_df['gap_days'] = fc_df['median_sub_date'] - fc_df['median_video_date']

# Scoring: 
# Gap >= 14 days -> 1.0 (Strong Flipped)
# Gap <= 0 days  -> 0.0 (Not Flipped)
fc_df['flipped_classroom'] = (fc_df['gap_days'] / 14.0).clip(0, 1).fillna(0)

# ==========================================
# 2. Peer Instruction Intensity (Resource Ratio)
# ==========================================
# Logic: Ratio of Forum Resources to Total Resources.

total_resources = vle_df.groupby(['code_module', 'code_presentation'])['id_site'].count().reset_index(name='total_sites')
forum_resources = vle_df[vle_df['activity_type'] == 'forumng'].groupby(['code_module', 'code_presentation'])['id_site'].count().reset_index(name='forum_sites')

pi_df = total_resources.merge(forum_resources, on=['code_module', 'code_presentation'], how='left')
pi_df['forum_sites'] = pi_df['forum_sites'].fillna(0)

# Calculate Ratio (Intensity)
pi_df['peer_instruction_intensity'] = (pi_df['forum_sites'] / (pi_df['total_sites'] + 1e-6)).clip(0, 1)

# ==========================================
# 3. Project Based Learning Intensity (Weight Sum)
# ==========================================
# Logic: Sum of weights for TMA or Weight >= 30. Normalized by 100.

heavy_assessments = assessments_df[
    (assessments_df['assessment_type'] == 'TMA') | (assessments_df['weight'] >= 30)
]
pbl_df = heavy_assessments.groupby(['code_module', 'code_presentation'])['weight'].sum().reset_index(name='total_project_weight')

# Normalize to 0-1
pbl_df['project_based_learning'] = (pbl_df['total_project_weight'] / 100.0).clip(0, 1)

# ==========================================
# 4. Merge Features
# ==========================================
# Start with a base of unique course presentations from one of the main features

base_courses = fc_df[['code_module', 'code_presentation']].drop_duplicates()

# Final Merge
pedagogy_features = base_courses.merge(
    fc_df[['code_module', 'code_presentation', 'flipped_classroom']], 
    on=['code_module', 'code_presentation'], how='left'
).merge(
    pi_df[['code_module', 'code_presentation', 'peer_instruction_intensity']], 
    on=['code_module', 'code_presentation'], how='left'
).merge(
    pbl_df[['code_module', 'code_presentation', 'project_based_learning']], 
    on=['code_module', 'code_presentation'], how='left'
)

# Fill NaNs (in case some courses lack specific activity types)
pedagogy_features['flipped_classroom'] = pedagogy_features['flipped_classroom'].fillna(0)
pedagogy_features['peer_instruction_intensity'] = pedagogy_features['peer_instruction_intensity'].fillna(0)
pedagogy_features['project_based_learning'] = pedagogy_features['project_based_learning'].fillna(0)

# Save
output_path = OUTPUT_DIR / "course_pedagogy_features.csv"
pedagogy_features.to_csv(output_path, index=False)

print(f"✅ Saved to {output_path}")
print("\n📊 Feature Statistics (Check Variance):")
print(pedagogy_features.describe())

# Verify columns
print("\n📋 Columns in output:")
print(pedagogy_features.columns.tolist())


# Check variance
if pedagogy_features['flipped_classroom'].std() == 0:
    print("⚠️ Warning: Flipped Classroom has no variance!")
else:
    print("✅ Flipped Classroom has good variance.")