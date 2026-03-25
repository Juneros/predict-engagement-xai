# utils/constants.py


# =========================
# Engagement Levels
# =========================
ENGAGEMENT_LEVELS = [
    "Very Low",
    "Low",
    "Medium",
    "High",
    "Very High"
]


LEVEL_TO_SCORE = {
    "Very Low": 0,
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Very High": 4
}


# =========================
# SHAP阈值
# =========================
SHAP_THRESHOLD = 0.05


# =========================
# UI配置
# =========================
TOP_FEATURES = 5
CHART_HEIGHT = 300


# =========================
# 策略说明（用于UI）
# =========================
STRATEGY_DESCRIPTIONS = {
    "Flipped Classroom": "Encourages students to learn basic concepts before class through videos and materials.",
    "Peer Instruction": "Promotes discussion and interaction among students.",
    "Project-Based Learning": "Focuses on hands-on projects and time management."
}


# =========================
# Feature分组（Explainability用）
# =========================
FEATURE_GROUPS = {
    "Engagement Behavior": [
        "total_clicks",
        "days_accessed",
        "video_completion_rate"
    ],
    "Learning Interaction": [
        "forum_posts",
        "resource_downloads"
    ],
    "Self-Regulation": [
        "on_time_rate"
    ],
    "Strategy Adoption": [
        "flipped_classroom_adoption",
        "peer_instruction_adoption",
        "project_based_learning_adoption"
    ]
}