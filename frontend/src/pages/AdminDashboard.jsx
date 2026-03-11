import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle, 
  Activity,
  LogOut,
  UserCog,
  ArrowLeft
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

// --- 模拟系统级数据 ---
const SYSTEM_STATS = {
  totalStudents: 1248,
  highRiskCount: 86,
  modelAccuracy: 94.2,
  lastSync: '2026-03-11 02:15',
  activeInterventions: 34
};

const ACCURACY_HISTORY = [
  { date: '03-01', accuracy: 88.5, recall: 85.2 },
  { date: '03-03', accuracy: 89.1, recall: 86.0 },
  { date: '03-05', accuracy: 91.4, recall: 88.5 },
  { date: '03-07', accuracy: 92.8, recall: 90.1 },
  { date: '03-09', accuracy: 93.5, recall: 91.8 },
  { date: '03-11', accuracy: 94.2, recall: 93.0 },
];

const RECENT_LOGS = [
  { id: 1, action: '数据同步完成', source: 'LMS_Logs_20260311.csv', status: 'success', time: '10 分钟前' },
  { id: 2, action: '模型自动重训练', source: 'System Scheduler', status: 'success', time: '2 小时前' },
  { id: 3, action: '新增高风险预警', source: 'Student S042', status: 'warning', time: '5 小时前' },
  { id: 4, action: '数据同步失败', source: 'Attendance_DB', status: 'error', time: '昨天 23:00' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      // ✅ 修改：加载页背景改为浅色
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-700 font-mono text-sm animate-pulse">加载管理控制台...</p>
        </div>
      </div>
    );
  }

  return (
    // ✅ 修改：主背景改为浅薰衣草色
    <div className="min-h-screen bg-[#FAF5FF] text-slate-800 font-sans flex flex-col">
      
      {/* --- 顶部导航栏 (管理员专用) --- */}
      {/* ✅ 修改：顶栏改为白底 + 淡紫边框 */}
      <header className="h-16 border-b border-violet-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">
            <UserCog size={20} />
            <span className="font-bold tracking-wide text-sm">ADMIN PORTAL</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">系统管理仪表盘</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">返回教师端</span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              AD
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">系统管理员</span>
          </div>
        </div>
      </header>

      {/* --- 主内容区 --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 1. 核心指标卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 总学生数 */}
            <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">注册学生总数</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{SYSTEM_STATS.totalStudents.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Users size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium relative z-10">
                <TrendingUp size={12} />
                <span>+12 本周新增</span>
              </div>
            </div>

            {/* 高风险预警 */}
            <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 blur-[40px] rounded-full pointer-events-none group-hover:bg-rose-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">高风险预警</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{SYSTEM_STATS.highRiskCount}</h3>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-rose-600 font-medium relative z-10">
                <span>需立即干预</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">占比 6.9%</span>
              </div>
            </div>

            {/* 模型准确率 */}
            <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all group relative overflow-hidden cursor-pointer" onClick={() => navigate('/admin/model')}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-violet-50 blur-[40px] rounded-full pointer-events-none group-hover:bg-violet-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">预测模型准确率</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{SYSTEM_STATS.modelAccuracy}%</h3>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                  <Cpu size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-violet-600 font-medium relative z-10">
                <Activity size={12} />
                <span>点击查看详情</span>
              </div>
            </div>

            {/* 最后同步时间 */}
            <div className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group relative overflow-hidden cursor-pointer" onClick={() => navigate('/admin/data')}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">数据最后同步</p>
                  <h3 className="text-lg font-bold text-slate-800 mt-1 truncate">{SYSTEM_STATS.lastSync}</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Database size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium relative z-10">
                <CheckCircle size={12} />
                <span>状态正常</span>
              </div>
            </div>
          </div>

          {/* 2. 图表与快捷操作区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 左侧：准确率趋势图 (占 2/3) */}
            <div className="lg:col-span-2 bg-white border border-violet-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-violet-600" />
                    模型性能趋势 (近 10 天)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">准确率 (Accuracy) vs 召回率 (Recall)</p>
                </div>
                <button 
                  onClick={() => navigate('/admin/model')}
                  className="text-xs px-3 py-1.5 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded text-slate-600 hover:text-violet-700 transition-colors font-medium"
                >
                  完整报告
                </button>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ACCURACY_HISTORY}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    {/* ✅ 修改：网格线改为淡灰色 */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#4c1d95', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', color: '#4c1d95' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} name="准确率" />
                    <Area type="monotone" dataKey="recall" stroke="#10b981" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} name="召回率" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右侧：快捷入口 (占 1/3) */}
            <div className="space-y-4">
              {/* ✅ 修改：快捷卡片改为浅色渐变背景 */}
              <div 
                onClick={() => navigate('/admin/data')}
                className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-6 cursor-pointer hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">数据源管理</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">上传 CSV/Excel 日志，同步 LMS 数据，管理数据清洗规则。</p>
                <div className="flex items-center text-emerald-700 text-sm font-bold">
                  <span>去上传数据</span>
                  <ArrowLeft size={16} className="rotate-180 ml-1" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/admin/model')}
                className="bg-gradient-to-br from-violet-50 to-white border border-violet-200 rounded-xl p-6 cursor-pointer hover:border-violet-400 hover:shadow-md hover:shadow-violet-100 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-100 rounded-lg text-violet-600 group-hover:scale-110 transition-transform">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">模型训练中心</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">查看混淆矩阵，调整超参数，手动触发模型重训练。</p>
                <div className="flex items-center text-violet-700 text-sm font-bold">
                  <span>去监控模型</span>
                  <ArrowLeft size={16} className="rotate-180 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. 系统日志表格 */}
          <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" />
                最近系统活动
              </h3>
              <button className="text-xs text-slate-500 hover:text-violet-700 font-medium transition-colors">查看全部</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">操作类型</th>
                    <th className="px-4 py-3">来源/对象</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3 rounded-r-lg">发生时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-violet-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 bg-slate-50 inline-block rounded my-2 px-1">{log.source}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {log.status === 'success' ? '成功' : log.status === 'warning' ? '警告' : '失败'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
        {/* 底部版权 */}
        <div className="mt-12 pt-6 border-t border-violet-100 text-center pb-6">
            <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab - Admin Console v2.4.0
            </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;