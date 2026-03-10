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

  // 模拟加载效果
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-mono text-sm animate-pulse">加载管理控制台...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans flex flex-col">
      
      {/* --- 顶部导航栏 (管理员专用) --- */}
      <header className="h-16 border-b border-white/5 bg-[#0f111a]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
            <UserCog size={20} />
            <span className="font-bold tracking-wide text-sm">ADMIN PORTAL</span>
          </div>
          <h2 className="text-xl font-semibold text-white hidden sm:block">系统管理仪表盘</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">返回教师端</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-900/20">
              AD
            </div>
            <span className="text-sm font-medium text-gray-300 hidden sm:block">系统管理员</span>
          </div>
        </div>
      </header>

      {/* --- 主内容区 --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 1. 核心指标卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 总学生数 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/10 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">注册学生总数</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{SYSTEM_STATS.totalStudents.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Users size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <TrendingUp size={12} />
                <span>+12 本周新增</span>
              </div>
            </div>

            {/* 高风险预警 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-600/10 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">高风险预警</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{SYSTEM_STATS.highRiskCount}</h3>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-rose-400">
                <span>需立即干预</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">占比 6.9%</span>
              </div>
            </div>

            {/* 模型准确率 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-violet-500/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/model')}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-violet-600/10 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">预测模型准确率</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{SYSTEM_STATS.modelAccuracy}%</h3>
                </div>
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                  <Cpu size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-violet-400">
                <Activity size={12} />
                <span>点击查看详情</span>
              </div>
            </div>

            {/* 最后同步时间 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/data')}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600/10 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">数据最后同步</p>
                  <h3 className="text-lg font-bold text-white mt-1 truncate">{SYSTEM_STATS.lastSync}</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Database size={20} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle size={12} />
                <span>状态正常</span>
              </div>
            </div>
          </div>

          {/* 2. 图表与快捷操作区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 左侧：准确率趋势图 (占 2/3) */}
            <div className="lg:col-span-2 bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-violet-400" />
                    模型性能趋势 (近 10 天)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">准确率 (Accuracy) vs 召回率 (Recall)</p>
                </div>
                <button 
                  onClick={() => navigate('/admin/model')}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 transition-colors"
                >
                  完整报告
                </button>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ACCURACY_HISTORY}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} name="准确率" />
                    <Area type="monotone" dataKey="recall" stroke="#10b981" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} name="召回率" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右侧：快捷入口 (占 1/3) */}
            <div className="space-y-4">
              <div 
                onClick={() => navigate('/admin/data')}
                className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 cursor-pointer hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white">数据源管理</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">上传 CSV/Excel 日志，同步 LMS 数据，管理数据清洗规则。</p>
                <div className="flex items-center text-emerald-400 text-sm font-medium">
                  <span>去上传数据</span>
                  <ArrowLeft size={16} className="rotate-180 ml-1" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/admin/model')}
                className="bg-gradient-to-br from-violet-900/40 to-violet-900/10 border border-violet-500/20 rounded-xl p-6 cursor-pointer hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-900/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400 group-hover:scale-110 transition-transform">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white">模型训练中心</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">查看混淆矩阵，调整超参数，手动触发模型重训练。</p>
                <div className="flex items-center text-violet-400 text-sm font-medium">
                  <span>去监控模型</span>
                  <ArrowLeft size={16} className="rotate-180 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. 系统日志表格 */}
          <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                最近系统活动
              </h3>
              <button className="text-xs text-gray-500 hover:text-white transition-colors">查看全部</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-300 uppercase text-xs font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">操作类型</th>
                    <th className="px-4 py-3">来源/对象</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3 rounded-r-lg">发生时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RECENT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.source}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.status === 'success' ? '成功' : log.status === 'warning' ? '警告' : '失败'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{log.time}</td>
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
              © 2026 EduVision AI Lab - Admin Console v2.4.0
            </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;