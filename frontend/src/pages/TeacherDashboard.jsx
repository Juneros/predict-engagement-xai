import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  Bell, 
  Search, 
  LogOut, 
  ChevronDown,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import logoImg from '../assets/images/logo.png'; 

// --- 模拟数据 (保持不变) ---
const MOCK_STUDENTS = [
  { id: 'S001', name: '张伟', avatar: null, status: 'high', score: 92, trend: 'up' },
  { id: 'S002', name: '李娜', avatar: null, status: 'medium', score: 75, trend: 'stable' },
  { id: 'S003', name: '王强', avatar: null, status: 'low', score: 45, trend: 'down' },
  { id: 'S004', name: '赵敏', avatar: null, status: 'high', score: 88, trend: 'up' },
  { id: 'S005', name: '刘洋', avatar: null, status: 'low', score: 38, trend: 'down' },
];

const MOCK_TREND_DATA = [
  { date: '周一', avg: 65, highRisk: 20 },
  { date: '周二', avg: 68, highRisk: 18 },
  { date: '周三', avg: 72, highRisk: 15 },
  { date: '周四', avg: 70, highRisk: 12 },
  { date: '周五', avg: 75, highRisk: 10 },
  { date: '周六', avg: 80, highRisk: 8 },
  { date: '周日', avg: 82, highRisk: 5 },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoading(false); 
    } else {
      navigate('/');
    }
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
      case 'medium': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
      case 'low': return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'high': return '积极参与';
      case 'medium': return '需要关注';
      case 'low': return '高风险';
      default: return '未知';
    }
  };

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/'); 
  };

  if (isLoading) {
    return (
      // ✅ 修改：加载页背景改为浅色
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* ✅ 修改：Loading 圈改为紫色 */}
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          {/* ✅ 修改：文字改为深紫色 */}
          <p className="text-violet-700 font-mono text-sm animate-pulse">Loading EduVision AI...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', icon: Activity, label: '仪表盘' },
    { id: 'students', icon: Users, label: '学生列表' },
    { id: 'analytics', icon: TrendingUp, label: '数据报表' },
    { id: 'model', icon: UserCheck, label: '模型监控' },
    { id: 'settings', icon: Settings, label: '系统设置' },
  ];

  return (
    // ✅ 修改：主容器背景改为浅色 (匹配 theme.css 中的 --bg-deep)
    // 去掉 overflow-hidden 防止内部滚动条问题，让 content 区自己滚动
    <div className="min-h-screen bg-[#FAF5FF] text-slate-800 font-sans flex relative">
      
      {/* --- 移动端遮罩层 --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- 左侧导航栏 (Sidebar) --- */}
      {/* ✅ 修改：侧边栏改为白色背景 + 淡紫边框 + 柔和阴影 */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-white border-r border-violet-100 flex flex-col transition-transform duration-300 ease-in-out shadow-xl shadow-violet-900/5
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="EduVision Logo" 
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]" 
            />
            {/* ✅ 修改：Logo 文字改为深紫渐变 */}
            <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-violet-500">EduVision</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-violet-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  // ✅ 修改：激活状态改为淡紫背景 + 深紫文字
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm' 
                  // ✅ 修改：默认状态改为灰字，悬停变紫
                  : 'text-slate-500 hover:bg-violet-50 hover:text-violet-600 hover:pl-5'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-violet-600' : 'group-hover:text-violet-500 transition-colors'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-violet-100">
          <button 
            onClick={handleLogout}
            // ✅ 修改：退出按钮悬停改为红色系背景
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* --- 主内容区 --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* ✅ 修改：背景光效改为极淡的紫色，不再使用深色光晕 */}
        <div className="absolute top-0 left-0 w-full h-96 bg-violet-200/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 blur-[100px] pointer-events-none"></div>

        {/* 顶部导航栏 (Top Bar) */}
        {/* ✅ 修改：顶栏改为半透明白色 + 模糊 */}
        <header className="h-16 border-b border-violet-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-violet-600">
              <Menu size={24} />
            </button>
            {/* ✅ 修改：标题改为深紫色 */}
            <h2 className="text-xl font-semibold text-violet-900 tracking-tight">教师工作台</h2>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <div className="h-6 w-px bg-violet-200"></div>
              <div className="relative group">
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  // ✅ 修改：下拉框改为白底灰字
                  className="bg-white border border-violet-200 rounded-lg pl-3 pr-8 py-1.5 text-sm text-slate-600 focus:outline-none focus:border-violet-500 appearance-none cursor-pointer hover:border-violet-400 transition-colors shadow-sm"
                >
                  <option>All Courses</option>
                  <option>高等数学 A</option>
                  <option>大学物理</option>
                  <option>计算机基础</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none group-hover:text-violet-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              {/* ✅ 修改：搜索框改为白底 */}
              <input 
                type="text" 
                placeholder="搜索学生..." 
                className="bg-white border border-violet-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 w-48 lg:w-64 transition-all placeholder-slate-400 shadow-sm"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">
              <Bell size={20} />
              {/* ✅ 修改：红点保留，边框改为白色以在浅色背景凸显 */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-violet-200">
                <img 
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=8b5cf6&color=fff`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-violet-200 ring-2 ring-violet-100 object-cover" 
                />
                
                <div className="hidden lg:block">
                    <p className="text-sm font-medium text-violet-900">
                        {currentUser?.username || '加载中...'}
                    </p>
                    <p className="text-xs text-slate-500">
                        {currentUser?.role === 'admin' ? '系统管理员' : '教师账号'}
                    </p>
                </div>
            </div>
          </div>
        </header>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 顶部统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '总学生数', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: '平均参与度', value: '78.5%', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: '高风险预警', value: '12', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: '模型准确率', value: '94.2%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((stat, idx) => (
                // ✅ 修改：卡片改为白底 + 淡色边框 + 柔和阴影
                <div key={idx} className="bg-white border border-violet-100 rounded-xl p-5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200/50 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={18} className={`${stat.color}`} />
                    </div>
                  </div>
                  {/* ✅ 修改：数值改为深灰色 */}
                  <p className="text-2xl font-bold text-slate-800 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 核心图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 左侧：参与度趋势图 */}
              {/* ✅ 修改：图表容器改为白底 */}
              <div className="lg:col-span-2 bg-white border border-violet-100 rounded-xl p-6 shadow-xl shadow-violet-900/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    {/* ✅ 修改：标题改为深紫色 */}
                    <h3 className="text-lg font-semibold text-slate-800">全班参与度趋势</h3>
                    <p className="text-xs text-slate-500 mt-1">实时监测班级整体学习状态</p>
                  </div>
                  <span className="text-xs text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full font-medium">最近7天</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_TREND_DATA}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      {/* ✅ 修改：网格线改为淡灰色 */}
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      {/* ✅ 修改：坐标轴文字改为灰色 */}
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderColor: '#e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
                          color: '#4c1d95' 
                        }}
                        itemStyle={{ color: '#7c3aed' }}
                        labelStyle={{ color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avg" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAvg)" 
                        name="平均参与度"
                        animationDuration={1500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="highRisk" 
                        stroke="#e11d48" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="高风险人数"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 右侧：模型准确率 */}
              {/* ✅ 修改：容器改为白底 */}
              <div className="bg-white border border-violet-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-xl shadow-violet-900/5 relative overflow-hidden">
                {/* ✅ 修改：装饰背景改为极淡的绿色 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-[50px] rounded-full"></div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-6 w-full text-left flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-600" />
                  预测置信度
                </h3>
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* ✅ 修改：轨道背景改为淡灰色 */}
                    <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="16" fill="none" />
                    <circle 
                      cx="96" cy="96" r="80" 
                      stroke="#10b981" 
                      strokeWidth="16" 
                      fill="none" 
                      strokeDasharray="502" 
                      strokeDashoffset="29"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800 drop-shadow-sm">94.2%</span>
                    <span className="text-xs text-slate-500 mt-1 font-medium">模型准确率</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 text-center px-4 leading-relaxed">
                  基于过去 30 天的 <span className="text-slate-800 font-mono font-semibold">12,450</span> 条行为数据训练
                </p>
              </div>
            </div>

            {/* 底部：高风险学生列表 */}
            {/* ✅ 修改：表格容器改为白底 */}
            <div className="bg-white border border-violet-100 rounded-xl overflow-hidden shadow-xl shadow-violet-900/5">
              <div className="p-6 border-b border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <AlertCircle size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">重点关注学生</h3>
                    <p className="text-xs text-slate-500">需要及时干预的高风险群体</p>
                  </div>
                </div>
                <button className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 group self-start sm:self-auto">
                  查看全部 
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  {/* ✅ 修改：表头背景改为淡紫色，文字改为深灰 */}
                  <thead className="bg-violet-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">学生信息</th>
                      <th className="px-6 py-4 font-semibold">当前得分</th>
                      <th className="px-6 py-4 font-semibold">参与状态</th>
                      <th className="px-6 py-4 font-semibold">趋势</th>
                      <th className="px-6 py-4 font-semibold text-right">操作</th>
                    </tr>
                  </thead>
                  {/* ✅ 修改：分割线改为淡紫色 */}
                  <tbody className="divide-y divide-violet-100">
                    {MOCK_STUDENTS.filter(s => s.status === 'low' || s.status === 'medium').map((student) => (
                      <tr key={student.id} className="hover:bg-violet-50/50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                <img 
                                    src={
                                        student.avatar 
                                        ? student.avatar 
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=8b5cf6&color=fff&size=128`
                                    } 
                                    alt={student.name} 
                                    className="w-10 h-10 rounded-full border border-violet-100 object-cover bg-white" 
                                />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(student.status)}`}></span>
                                </div>
                                <div>
                                    {/* ✅ 修改：名字改为深灰色 */}
                                    <p className="font-medium text-slate-800">{student.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{student.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-lg font-bold font-mono ${student.score < 60 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {student.score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(student.status)}`}></span>
                            <span className="text-sm text-slate-700 font-medium">{getStatusText(student.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${
                            student.trend === 'up' ? 'text-emerald-600' : 
                            student.trend === 'down' ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {student.trend === 'up' && <TrendingUp size={16} />}
                            {student.trend === 'down' && <TrendingUp size={16} className="transform rotate-180" />}
                            {student.trend === 'stable' && <span className="w-4 h-0.5 bg-slate-400 rounded-full"></span>}
                            <span>{student.trend === 'up' ? '上升' : student.trend === 'down' ? '下降' : '平稳'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/student/${student.id}`)}
                            // ✅ 修改：按钮改为淡紫底 + 深紫字，悬停变深
                            className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all font-medium">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          
          {/* 底部版权 */}
          <div className="mt-12 pt-6 border-t border-violet-100 text-center pb-6">
            {/* ✅ 修改：版权文字改为淡灰色 */}
            <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab. Powered by XAI Technology.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;