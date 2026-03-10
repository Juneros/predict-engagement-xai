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

// --- 模拟数据 ---
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 移动端菜单状态
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoading(false); 
    } else {
      navigate('/');
    }
  }, [navigate]); // 确保依赖项正确

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      case 'medium': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      case 'low': return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
      default: return 'bg-gray-500';
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
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-400 font-mono text-sm animate-pulse">Loading EduVision AI...</p>
        </div>
      </div>
    );
  }

  // 导航菜单项
  const navItems = [
    { id: 'dashboard', icon: Activity, label: '仪表盘' },
    { id: 'students', icon: Users, label: '学生列表' },
    { id: 'analytics', icon: TrendingUp, label: '数据报表' },
    { id: 'model', icon: UserCheck, label: '模型监控' },
    { id: 'settings', icon: Settings, label: '系统设置' },
  ];

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans flex overflow-hidden">
      
      {/* --- 移动端遮罩层 --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- 左侧导航栏 (Sidebar) --- */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-[#161b29] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <img 
            src={logoImg} 
            alt="EduVision Logo" 
            className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
          />
            <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">EduVision</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
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
                  ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-violet-400' : 'group-hover:text-violet-300 transition-colors'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* --- 主内容区 --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 背景光效 */}
        <div className="absolute top-0 left-0 w-full h-96 bg-violet-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-900/10 blur-[100px] pointer-events-none"></div>

        {/* 顶部导航栏 (Top Bar) */}
        <header className="h-16 border-b border-white/5 bg-[#0f111a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-white tracking-tight">教师工作台</h2>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <div className="h-6 w-px bg-white/10"></div>
              <div className="relative group">
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-[#161b29] border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500 appearance-none cursor-pointer hover:border-violet-500/50 transition-colors"
                >
                  <option>All Courses</option>
                  <option>高等数学 A</option>
                  <option>大学物理</option>
                  <option>计算机基础</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-500 pointer-events-none group-hover:text-violet-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索学生..." 
                className="bg-[#161b29] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 w-48 lg:w-64 transition-all placeholder-gray-600"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0f111a] animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-white/10">
            {/* 头像：如果有 avatar 字段就用，否则用默认图 */}
                <img 
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=8b5cf6&color=fff`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-violet-500/30 ring-2 ring-violet-500/10 object-cover" 
                />
                
                <div className="hidden lg:block">
                    {/* 动态显示用户名 */}
                    <p className="text-sm font-medium text-white">
                        {currentUser?.username || '加载中...'}
                    </p>
                    
                    {/* 动态显示角色 (转为首字母大写或中文) */}
                    <p className="text-xs text-gray-500">
                        {currentUser?.role === 'admin' ? '系统管理员' : '教师账号'}
                    </p>
                </div>
            </div>
          </div>
        </header>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 顶部统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '总学生数', value: '142', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '平均参与度', value: '78.5%', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { label: '高风险预警', value: '12', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: '模型准确率', value: '94.2%', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#161b29] border border-white/5 rounded-xl p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={18} className={`${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 核心图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 左侧：参与度趋势图 */}
              <div className="lg:col-span-2 bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">全班参与度趋势</h3>
                    <p className="text-xs text-gray-500 mt-1">实时监测班级整体学习状态</p>
                  </div>
                  <span className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">最近7天</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_TREND_DATA}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#374151', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                          color: '#fff' 
                        }}
                        itemStyle={{ color: '#a78bfa' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
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
                        stroke="#f43f5e" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#1f2937' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="高风险人数"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 右侧：模型准确率 */}
              <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center shadow-xl shadow-black/20 relative overflow-hidden">
                {/* 装饰背景 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full"></div>
                
                <h3 className="text-lg font-semibold text-white mb-6 w-full text-left flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-400" />
                  预测置信度
                </h3>
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#1f2937" strokeWidth="16" fill="none" />
                    <circle 
                      cx="96" cy="96" r="80" 
                      stroke="#10b981" 
                      strokeWidth="16" 
                      fill="none" 
                      strokeDasharray="502" 
                      strokeDashoffset="29"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white drop-shadow-lg">94.2%</span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">模型准确率</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 text-center px-4 leading-relaxed">
                  基于过去 30 天的 <span className="text-white font-mono">12,450</span> 条行为数据训练
                </p>
              </div>
            </div>

            {/* 底部：高风险学生列表 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <AlertCircle size={20} className="text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">重点关注学生</h3>
                    <p className="text-xs text-gray-500">需要及时干预的高风险群体</p>
                  </div>
                </div>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 group self-start sm:self-auto">
                  查看全部 
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">学生信息</th>
                      <th className="px-6 py-4 font-medium">当前得分</th>
                      <th className="px-6 py-4 font-medium">参与状态</th>
                      <th className="px-6 py-4 font-medium">趋势</th>
                      <th className="px-6 py-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MOCK_STUDENTS.filter(s => s.status === 'low' || s.status === 'medium').map((student) => (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                {/* ✅ 修改开始：动态计算头像源 */}
                                <img 
                                    src={
                                        student.avatar 
                                        ? student.avatar 
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=8b5cf6&color=fff&size=128`
                                    } 
                                    alt={student.name} 
                                    className="w-10 h-10 rounded-full border border-white/10 object-cover bg-gray-800" 
                                />
                                {/* ✅ 修改结束 */}
                                
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161b29] ${getStatusColor(student.status)}`}></span>
                                </div>
                                <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-xs text-gray-500 font-mono">{student.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-lg font-bold font-mono ${student.score < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {student.score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(student.status)}`}></span>
                            <span className="text-sm text-gray-300 font-medium">{getStatusText(student.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${
                            student.trend === 'up' ? 'text-emerald-400' : 
                            student.trend === 'down' ? 'text-rose-400' : 'text-gray-400'
                          }`}>
                            {student.trend === 'up' && <TrendingUp size={16} />}
                            {student.trend === 'down' && <TrendingUp size={16} className="transform rotate-180" />}
                            {student.trend === 'stable' && <span className="w-4 h-0.5 bg-gray-400 rounded-full"></span>}
                            <span>{student.trend === 'up' ? '上升' : student.trend === 'down' ? '下降' : '平稳'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/student/${student.id}`)}
                            className="text-xs bg-violet-600/10 text-violet-300 border border-violet-600/20 px-3 py-1.5 rounded-lg hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all font-medium">
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
          <div className="mt-12 pt-6 border-t border-white/5 text-center pb-6">
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab. Powered by XAI Technology.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
