import streamlit as st

# 1. 设置页面标题和图标
st.set_page_config(
    page_title="AI 教学助手",
    page_icon="🎓",
    layout="wide"
)

# 2. 强制跳转到 Dashboard (可选，如果不加这行，默认可能显示空白页或第一个页面)
# 确保你的 pages 文件夹里真的有 Dashboard.py 这个文件
try:
    st.switch_page("pages/Dashboard.py")
except Exception:
    # 如果版本太低不支持 switch_page，就什么都不做，用户手动点侧边栏即可
    pass

# 3. 这里不要写任何 st.title, st.write 等内容
# 这样主页就是“隐形”的，用户一进来就直接看到 Dashboard