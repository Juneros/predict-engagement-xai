import pandas as pd
import numpy as np
from pathlib import Path

# ==========================================
# 1. Configuration & Data Loading
# ==========================================
RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
PROCESSED_DIR.mkdir(exist_ok=True)

print("🚀 Building Student Features including Pedagogy Adoption Metrics...")

# Load Raw Data
student_vle_df = pd.read_csv(RAW_DIR / "studentVle.csv")
vle_df = pd.read_csv(RAW_DIR / "vle.csv")
assessments_df = pd.read_csv(RAW_DIR / "assessments.csv")
student_assessment_df = pd.read_csv(RAW_DIR / "studentAssessment.csv")
student_info_df = pd.read_csv(RAW_DIR / "studentInfo.csv")

# ==========================================
# 2. Base Features Calculation
# ==========================================

# 2.1 Total Clicks & Days Accessed
base_stats = student_vle_df.groupby(['id_student', 'code_module', 'code_presentation']).agg(
    total_clicks=('sum_click', 'sum'),
    days_accessed=('date', 'nunique')
).reset_index()

# 2.2 Video Completion Rate
oucontent_sites = vle_df[vle_df['activity_type'] == 'oucontent']
total_videos = oucontent_sites.groupby(['code_module', 'code_presentation'])['id_site'].nunique().reset_index(name='total_video_count')
student_video = student_vle_df.merge(oucontent_sites[['id_site', 'code_module', 'code_presentation']], on=['id_site', 'code_module', 'code_presentation'], how='inner')
student_video_count = student_video.groupby(['id_student', 'code_module', 'code_presentation'])['id_site'].nunique().reset_index(name='accessed_video_count')
video_feat = student_video_count.merge(total_videos, on=['code_module', 'code_presentation'], how='left')
video_feat['video_completion_rate'] = (video_feat['accessed_video_count'] / video_feat['total_video_count'].replace(0, np.nan)).fillna(0)
video_feat = video_feat[['id_student', 'code_module', 'code_presentation', 'video_completion_rate']]

# 2.3 Resource Downloads
resource_sites = vle_df[vle_df['activity_type'] == 'resource']
res_feat = student_vle_df.merge(resource_sites[['id_site', 'code_module', 'code_presentation']], on=['id_site', 'code_module', 'code_presentation'], how='inner')
res_feat = res_feat.groupby(['id_student', 'code_module', 'code_presentation'])['sum_click'].sum().reset_index(name='resource_downloads')

# 2.4 Forum Posts
forum_sites = vle_df[vle_df['activity_type'] == 'forumng']
forum_feat = student_vle_df.merge(forum_sites[['id_site', 'code_module', 'code_presentation']], on=['id_site', 'code_module', 'code_presentation'], how='inner')
forum_feat = forum_feat.groupby(['id_student', 'code_module', 'code_presentation'])['sum_click'].sum().reset_index(name='forum_posts')

# 2.5 On-Time Rate
stu_assess = student_assessment_df.merge(assessments_df[['id_assessment', 'code_module', 'code_presentation', 'date', 'assessment_type']], on='id_assessment', how='left')
# 判断是否准时: date_submitted <= cutoff_date (assessments.date usually is cutoff)
stu_assess['is_on_time'] = (stu_assess['date_submitted'] <= stu_assess['date']).astype(int)
on_time_feat = stu_assess.groupby(['id_student', 'code_module', 'code_presentation']).agg(
    on_time_rate=('is_on_time', 'mean') # 平均值即为准时率
).reset_index()

# ==========================================
# 3. Pedagogy Adoption Features Calculation
# ==========================================

# 3.1 Flipped Classroom Adoption (Time Shift)
# A. Student Median Video Date
stu_video_dates = student_vle_df.merge(oucontent_sites[['id_site', 'code_module', 'code_presentation']], on=['id_site', 'code_module', 'code_presentation'], how='inner')
median_video_date = stu_video_dates.groupby(['id_student', 'code_module', 'code_presentation'])['date'].median().reset_index(name='median_video_date')

# B. Course First Exam Date
first_exam_date = assessments_df.groupby(['code_module', 'code_presentation'])['date'].min().reset_index(name='first_exam_date')

# C. Calculate Score
fc_adoption = median_video_date.merge(first_exam_date, on=['code_module', 'code_presentation'], how='left')
fc_adoption['gap_days'] = fc_adoption['first_exam_date'] - fc_adoption['median_video_date']
# Normalize: 14 days gap = 1.0, 0 days = 0.0
fc_adoption['flipped_classroom_adoption'] = (fc_adoption['gap_days'] / 14.0).clip(0, 1)
fc_adoption = fc_adoption[['id_student', 'code_module', 'code_presentation', 'flipped_classroom_adoption']]

# 3.2 Peer Instruction Adoption (Relative Intensity)
# A. Calculate P90 benchmark per course
# Use forum_feat calculated in 1.4
p90_benchmark = forum_feat.groupby(['code_module', 'code_presentation'])['forum_posts'].quantile(0.9).reset_index(name='forum_p90')

pi_adoption = forum_feat.merge(p90_benchmark, on=['code_module', 'code_presentation'], how='left')
pi_adoption['forum_p90'] = pi_adoption['forum_p90'].replace(0, 1) # Avoid div by zero
pi_adoption['peer_instruction_adoption'] = (pi_adoption['forum_posts'] / pi_adoption['forum_p90']).clip(0, 1)
pi_adoption = pi_adoption[['id_student', 'code_module', 'code_presentation', 'peer_instruction_adoption']]

# 3.3 Project Based Learning Adoption (Project Performance)
# Focus on TMA or Weight >= 30
heavy_assessments = assessments_df[(assessments_df['assessment_type'] == 'TMA') | (assessments_df['weight'] >= 30)]

stu_proj = student_assessment_df.merge(heavy_assessments[['id_assessment', 'code_module', 'code_presentation', 'date']], on='id_assessment', how='inner')
stu_proj['is_on_time_proj'] = (stu_proj['date_submitted'] <= stu_proj['date']).astype(int)

pbl_adoption = stu_proj.groupby(['id_student', 'code_module', 'code_presentation'])['is_on_time_proj'].mean().reset_index(name='project_based_learning_adoption')
# If a student has no project assessments, fill with 0 later

# ==========================================
# 4. Merge All Features
# ==========================================
features_list = [
    base_stats, 
    video_feat, 
    res_feat, 
    forum_feat, 
    on_time_feat,
    fc_adoption, 
    pi_adoption, 
    pbl_adoption
]

from functools import reduce
X = reduce(lambda left, right: pd.merge(left, right, on=['id_student', 'code_module', 'code_presentation'], how='left'), features_list)

# Fill NaNs
# For adoption metrics, NaN means no activity relevant to that pedagogy -> 0
adoption_cols = ['flipped_classroom_adoption', 'peer_instruction_adoption', 'project_based_learning_adoption']
for col in adoption_cols:
    if col in X.columns:
        X[col] = X[col].fillna(0)

# For behavior metrics, NaN means 0 activity
behavior_cols = ['total_clicks', 'days_accessed', 'video_completion_rate', 'resource_downloads', 'forum_posts', 'on_time_rate']
for col in behavior_cols:
    if col in X.columns:
        X[col] = X[col].fillna(0)

# Save
X.to_csv('data/processed/X_features.csv', index=False)
print("✅ Features saved with 9 core columns (+ IDs)")
print(X.columns)
