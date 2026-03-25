# utils/formatter.py

def format_feature_name(name: str) -> str:
    """
    snake_case → Title Case
    """
    if not name:
        return ""

    return name.replace("_", " ").title()


def format_percentage(value: float) -> str:
    """
    0.85 → 85%
    """
    try:
        return f"{value * 100:.1f}%"
    except:
        return "-"


def format_score(value: float, digits: int = 2) -> str:
    """
    数值格式化
    """
    try:
        return f"{value:.{digits}f}"
    except:
        return "-"


def format_change(value: float) -> str:
    """
    + / - 变化
    """
    try:
        sign = "+" if value > 0 else ""
        return f"{sign}{value:.2f}"
    except:
        return "-"


def shorten_text(text: str, max_length: int = 40) -> str:
    """
    文本截断（UI用）
    """
    if not text:
        return ""

    return text if len(text) <= max_length else text[:max_length] + "..."


# =========================
# 教育语义映射（关键）
# =========================
def feature_to_readable(feature: str) -> str:
    """
    特征 → 教学语言
    """

    mapping = {
        "total_clicks": "Learning Activity",
        "days_accessed": "Study Consistency",
        "video_completion_rate": "Video Engagement",
        "resource_downloads": "Resource Usage",
        "forum_posts": "Peer Interaction",
        "on_time_rate": "Time Management",

        "flipped_classroom_adoption": "Flipped Learning Adoption",
        "peer_instruction_adoption": "Peer Learning Adoption",
        "project_based_learning_adoption": "Project-Based Learning Adoption"
    }

    return mapping.get(feature, format_feature_name(feature))