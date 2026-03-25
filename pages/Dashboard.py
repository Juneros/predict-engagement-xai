import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import sys

# ==========================================
# 1. 路径配置与导入 (确保能找到上级目录的模块)
# ==========================================
# 获取当前文件所在目录的父目录 (即项目根目录)
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

# 现在可以安全导入项目内的模块了
try:
    from components.sidebar import render_sidebar
except ImportError as e:
    st.error(f"导入模块失败: {e}")
    st.stop()

# ==========================================
# 2. 页面配置
# ==========================================
st.set_page_config(
    page_title="Student Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 3. 数据加载 (每个页面独立加载，确保不依赖主文件)
# ==========================================
@st.cache_data
def load_dashboard_data():
    """加载仪表盘所需的数据"""
    try:
        # 尝试从处理后的数据文件夹加载
        data_path = root_dir / "data" / "processed"
        
        if not data_path.exists():
            st.error(f"数据目录不存在: {data_path}")
            return None, None
            
        X_test = pd.read_csv(data_path / "X_test.csv")
        y_test = pd.read_csv(data_path / "y_test.csv").squeeze()
        
        # 重置索引以确保匹配
        X_test = X_test.reset_index(drop=True)
        y_test = y_test.reset_index(drop=True)
        
        return X_test, y_test
    except Exception as e:
        st.error(f"加载数据失败: {e}")
        return None, None

# 执行加载
X_test, y_test = load_dashboard_data()

# 如果数据加载失败，停止运行
if X_test is None or y_test is None:
    st.warning("⚠️ 无法加载数据。请确保已运行数据预处理脚本并生成了 `data/processed/` 文件夹。")
    st.stop()

# ==========================================
# 4. 渲染侧边栏并获取选中学生 (关键修复步骤)
# ==========================================
# 这一步至关重要：它在当前页面执行 Sidebar 逻辑，并更新 session_state
selected_student, true_label = render_sidebar(X_test, y_test)

# ==========================================
# 5. 主逻辑检查
# ==========================================
# 现在检查 session_state，因为上面已经运行过 render_sidebar，理论上应该有值
# 除非用户还没在下拉框选任何值（render_sidebar 可能返回 None）
if selected_student is None:
    st.info("👈 请在左侧侧边栏选择一个学生 ID 以查看详细信息。")
    st.stop()

# 更新 session_state 以防万一
st.session_state["selected_student"] = selected_student
st.session_state["true_label"] = true_label

# ==========================================
# 6. 仪表盘内容渲染
# ==========================================
st.title("📊 Student Engagement Dashboard")

# --- Safe Data Retrieval ---
if selected_student not in X_test.index:
    st.error(f"❌ Error: Student ID {selected_student} not found in the dataset index.")
    st.write(f"Available Student ID range: {X_test.index.min()} to {X_test.index.max()}")
    st.stop()

# Get student data row using integer index
student_data = X_test.loc[selected_student]

# Header Info
st.markdown(f"**Current Student ID**: `{selected_student}` | **True Label**: `{true_label}`")
st.divider()

# --- Row 1: Key Metrics Cards ---
col1, col2, col3, col4 = st.columns(4)

def safe_get(col_name, default=0):
    """Safely get value from series, handling missing columns."""
    return student_data.get(col_name, default)

with col1:
    val1 = safe_get('total_clicks')
    st.metric(label="🖱️ Total Clicks", value=f"{val1:,}")
    
with col2:
    # Assuming 'days_accesss' is the column for days accessed
    val2 = safe_get('days_accessed') 
    st.metric(label="📅 Days Accessed", value=f"{val2:,}")
    
with col3:
    val3 = safe_get('forum_posts')
    st.metric(label="💬 Forum Posts", value=f"{val3:,}")
    
with col4:
    val4 = safe_get('on_time_rate')
    st.metric(label="⏰ On-Time Submissions", value=f"{val4:,}")

st.divider()

# --- Row 2: Charts ---
col_chart1, col_chart2 = st.columns(2)

with col_chart1:
    st.subheader("🕸️ Student Behavior Radar Chart")
    
    numeric_cols = X_test.select_dtypes(include=['float64', 'int64']).columns.tolist()
    
    if len(numeric_cols) > 2:
        student_values = student_data[numeric_cols].values
        avg_values = X_test[numeric_cols].mean().values
        
        import plotly.graph_objects as go
        
        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(
            r=student_values,
            theta=numeric_cols,
            fill='toself',
            name=f'Student #{selected_student}',
            line_color='rgb(31, 119, 180)'
        ))
        fig.add_trace(go.Scatterpolar(
            r=avg_values,
            theta=numeric_cols,
            fill='toself',
            name='Class Average',
            line_color='rgb(255, 127, 14)',
            line=dict(dash='dot')
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(visible=True)
            ),
            showlegend=True,
            height=400,
            title="Current Student vs. Class Average"
        )
        
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("Insufficient numerical columns to generate radar chart.")

with col_chart2:
    st.subheader("📊 Detailed Metrics Bar Chart")
    
    if len(numeric_cols) > 0:
        df_bar = pd.DataFrame({
            'Feature': numeric_cols,
            'Value': student_values
        })
        
        import plotly.express as px
        fig_bar = px.bar(
            df_bar, 
            x='Value', 
            y='Feature', 
            orientation='h',
            title=f"Metrics for Student #{selected_student}",
            color='Value',
            color_continuous_scale='Blues'
        )
        st.plotly_chart(fig_bar, use_container_width=True)

# --- Row 3: Raw Data Preview ---
with st.expander("🔍 View Full Raw Data"):
    st.dataframe(student_data.to_frame().T, use_container_width=True)
    st.caption("Note: Column names may be abbreviated due to CSV export limits.")