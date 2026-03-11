/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 原来的深紫色可能类似这样：
        // primary: '#4C1D95',
        // primary-light: '#6D28D9',
        
        // 👇 改成浅紫色系 👇
        primary: '#8B5CF6',        // 主色：柔和紫
        'primary-hover': '#7C3AED', // 悬停色
        'primary-light': '#F3E8FF', // 背景淡紫
        'primary-border': '#E9D5FF', // 边框淡紫
        
        // 保持其他颜色不变
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}