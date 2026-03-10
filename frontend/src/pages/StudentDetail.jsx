import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  MoreVertical,
  BookOpen,
  Award,
  Activity,
  Plus, 
  X,  
  Check,
  Rocket,
  FileText, 
  Download,
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts';

// --- 模拟数据库数组 ---
const MOCK_STUDENTS_DB = [
  {
    id: 'S002',
    name: '李娜',
    avatar: null, 
    status: 'low',
    score: 42,
    trend: 'down',
    email: 'lina@university.edu.cn',
    major: '计算机科学与技术',
    enrollmentYear: '2023',
    radarData: [
      { subject: '出勤率', A: 35, fullMark: 100 },
      { subject: '课堂互动', A: 25, fullMark: 100 },
      { subject: '作业完成', A: 50, fullMark: 100 },
      { subject: '测验成绩', A: 40, fullMark: 100 },
      { subject: '在线时长', A: 30, fullMark: 100 },
      { subject: '讨论区参与', A: 15, fullMark: 100 },
    ],
    weeklyActivity: [
      { day: '周一', value: 30 }, { day: '周二', value: 20 },
      { day: '周三', value: 50 }, { day: '周四', value: 15 },
      { day: '周五', value: 40 }, { day: '周六', value: 10 },
      { day: '周日', value: 10 },
    ],
    interventions: [
      { id: 1, date: '2026-03-01', type: 'email', content: '发送缺勤预警邮件。', author: '王老师' },
      { id: 2, date: '2026-03-05', type: 'meeting', content: '面谈了解家庭情况，给予心理疏导。', author: '辅导员' },
    ]
  },
  {
    id: 'S005',
    name: '刘洋',
    avatar: null,
    status: 'medium',
    score: 55,
    trend: 'stable',
    email: 'liuyang@university.edu.cn',
    major: '软件工程',
    enrollmentYear: '2023',
    radarData: [
      { subject: '出勤率', A: 70, fullMark: 100 },
      { subject: '课堂互动', A: 40, fullMark: 100 },
      { subject: '作业完成', A: 60, fullMark: 100 },
      { subject: '测验成绩', A: 55, fullMark: 100 },
      { subject: '在线时长', A: 50, fullMark: 100 },
      { subject: '讨论区参与', A: 30, fullMark: 100 },
    ],
    weeklyActivity: [
      { day: '周一', value: 50 }, { day: '周二', value: 45 },
      { day: '周三', value: 60 }, { day: '周四', value: 40 },
      { day: '周五', value: 55 }, { day: '周六', value: 20 },
      { day: '周日', value: 25 },
    ],
    interventions: [
      { id: 1, date: '2026-02-20', type: 'plan', content: '制定小组学习计划，提升互动性。', author: '李老师' }
    ]
  },
  {
    id: 'S003',
    name: '王强',
    avatar: null,
    status: 'low',
    score: 45,
    trend: 'down',
    email: 'wangqiang@university.edu.cn',
    major: '人工智能',
    enrollmentYear: '2023',
    radarData: [
      { subject: '出勤率', A: 40, fullMark: 100 },
      { subject: '课堂互动', A: 30, fullMark: 100 },
      { subject: '作业完成', A: 60, fullMark: 100 },
      { subject: '测验成绩', A: 50, fullMark: 100 },
      { subject: '在线时长', A: 45, fullMark: 100 },
      { subject: '讨论区参与', A: 20, fullMark: 100 },
    ],
    weeklyActivity: [
      { day: '周一', value: 40 }, { day: '周二', value: 30 },
      { day: '周三', value: 65 }, { day: '周四', value: 20 },
      { day: '周五', value: 50 }, { day: '周六', value: 10 },
      { day: '周日', value: 15 },
    ],
    interventions: [
      { id: 1, date: '2023-10-15', type: 'email', content: '发送了出勤预警邮件，提醒注意考勤。', author: '李老师' },
      { id: 2, date: '2023-10-20', type: 'meeting', content: '课后简短谈话，了解最近学习困难。', author: '李老师' },
      { id: 3, date: '2023-10-25', type: 'plan', content: '制定了每周补习计划，重点关注作业完成度。', author: '张老师' },
    ]
  }
];

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表单数据状态
  const [interventionForm, setInterventionForm] = useState({
    type: '翻转课堂', // 默认选中
    date: new Date().toISOString().split('T')[0], // 默认今天
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeBasic: true,
    includeRadar: true,
    includeActivity: true,
    includeInterventions: true
  });

  // 处理添加干预逻辑
    // ✅ 新增：模拟数据变化的辅助函数
    const simulateInterventionEffect = (currentStudent, method) => {
        let scoreIncrease = 0;
        let radarBoost = {};
    
        // 根据方法不同，模拟不同的提升效果
        switch (method) {
          case '翻转课堂':
            scoreIncrease = 8;
            radarBoost = { '出勤率': 10, '作业完成': 15, '在线时长': 10 };
            break;
          case '同伴教学':
            scoreIncrease = 6;
            radarBoost = { '课堂互动': 20, '讨论区参与': 25, '测验成绩': 5 };
            break;
          case '项目式学习':
            scoreIncrease = 10;
            radarBoost = { '作业完成': 20, '测验成绩': 15, '课堂互动': 10 };
            break;
          default:
            scoreIncrease = 5;
        }
    
        // 1. 更新总分 (上限 100)
        const newScore = Math.min(100, currentStudent.score + scoreIncrease);
        
        // 2. 更新趋势
        const newTrend = 'up';
    
        // 3. 更新雷达图数据
        const newRadarData = currentStudent.radarData.map(item => {
          const boost = radarBoost[item.subject] || 2; // 默认所有项微升 2
          return {
            ...item,
            A: Math.min(100, item.A + boost)
          };
        });
    
        // 4. 重新计算状态 (简单逻辑：>60 高, >45 中, 其他 低)
        let newStatus = currentStudent.status;
        if (newScore >= 60) newStatus = 'high';
        else if (newScore >= 45) newStatus = 'medium';
        else newStatus = 'low';
    
        return {
          ...currentStudent,
          score: newScore,
          trend: newTrend,
          status: newStatus,
          radarData: newRadarData
        };
      };
    
      // ✅ 修改后的：处理添加干预逻辑
    const handleAddIntervention = () => {
        if (!student) return;
    
        // 1. 创建干预记录
        const newRecord = {
          id: Date.now(), 
          date: interventionForm.date,
          type: 'active_learning', 
          method: interventionForm.type, 
          content: `启动【${interventionForm.type}】教学干预方案。系统模拟显示：该策略预计提升参与度及成绩。`,
          author: '当前教师',
          status: 'completed' // 标记为已执行以触发效果
        };
    
        // 2. 模拟执行后的数据变化
        const updatedStudentData = simulateInterventionEffect(student, interventionForm.type);
    
        // 3. 合并新记录和新数据
        const finalStudent = {
          ...updatedStudentData,
          interventions: [newRecord, ...updatedStudentData.interventions] 
        };
    
        // 4. 更新状态
        setStudent(finalStudent);
        setIsModalOpen(false); 
        
        // 5. 重置表单
        setInterventionForm({
          type: '翻转课堂',
          date: new Date().toISOString().split('T')[0],
        });
    
        // 6. (可选) 给用户一个提示
        // alert(`干预已启动！模拟数据显示：分数提升至 ${finalStudent.score}，趋势转为上升。`);
    };

    // ✅ 新增：处理导出逻辑
  const handleExportReport = () => {
    setIsGenerating(true);
    
    // 模拟生成过程 (1.5秒)
    setTimeout(() => {
      setIsGenerating(false);
      setIsExportModalOpen(false);
      
      // 模拟下载提示
      alert(`✅ 报告生成成功！\n\n文件名：${student.name}_学情分析报告.pdf\n包含内容：${Object.values(exportOptions).filter(Boolean).length} 个模块`);
      
      // 实际项目中这里会触发 blob 下载或调用后端 API
      // 模拟触发浏览器打印作为替代方案
      // window.print(); 
    }, 1500);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundStudent = MOCK_STUDENTS_DB.find(s => s.id === id);
      
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        alert(`未找到 ID 为 ${id} 的学生信息，将重定向回仪表盘`);
        navigate('/dashboard'); 
      }
      setIsLoading(false);
    }, 600);
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] text-emerald-400';
      case 'medium': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] text-amber-400';
      case 'low': return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] text-rose-400';
      default: return 'bg-gray-500 text-gray-400';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-400 font-mono text-sm animate-pulse">加载学生档案...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-rose-500" />
          <h2 className="text-xl font-bold">未找到学生档案</h2>
          <p className="mt-2">ID: {id} 不存在</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-violet-600 rounded text-white">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans flex flex-col overflow-hidden">
      
      {/* --- 顶部导航栏 --- */}
      <header className="h-16 border-b border-white/5 bg-[#0f111a]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-white tracking-tight">学生详情档案</h2>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs text-gray-500 hidden sm:inline">最后更新：刚刚</span>
           <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-all"
            >
                <FileText size={14} />
                <span className="hidden sm:inline">导出报告</span>
            </button>
        </div>
      </header>

      {/* --- 主内容滚动区 --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 顶部信息卡片 */}
          <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl shadow-black/20 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] opacity-10 rounded-full pointer-events-none ${
              student.status === 'low' ? 'bg-rose-600' : student.status === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}></div>

            <div className="relative shrink-0">
              <img 
                src={
                  student.avatar 
                  ? student.avatar 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=8b5cf6&color=fff&size=256`
                } 
                alt={student.name} 
                className="w-24 h-24 rounded-full border-2 border-white/10 object-cover bg-gray-800 shadow-lg" 
              />
              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#161b29] flex items-center justify-center ${getStatusColor(student.status).split(' ')[0]}`}>
              </span>
            </div>

            <div className="flex-1 space-y-1 z-10">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{student.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(student.status)} bg-opacity-10 border-opacity-20`}>
                  {getStatusText(student.status)}
                </span>
                <span className="text-gray-500 font-mono text-sm">{student.id}</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>{student.major}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>入学年份：{student.enrollmentYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>{student.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end z-10">
              <div className="text-4xl font-bold text-white font-mono tracking-tighter">
                {student.score}
                <span className="text-lg text-gray-500 font-normal ml-1">/ 100</span>
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                <TrendingUp size={16} className={student.trend === 'down' ? 'text-rose-500 rotate-180' : 'text-emerald-500'} />
                <span className={student.trend === 'down' ? 'text-rose-400' : 'text-emerald-400'}>
                  {student.trend === 'up' ? '上升' : student.trend === 'down' ? '下降' : '平稳'}
                </span>
                <span className="text-gray-500 ml-1">较上周</span>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：能力雷达图 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award size={20} className="text-violet-400" />
                  多维度能力分析
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={student.radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={student.name}
                      dataKey="A"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                 {student.radarData.slice(0,3).map((item, i) => (
                   <div key={i} className="bg-white/5 rounded p-2">
                     <div className="text-xs text-gray-500">{item.subject}</div>
                     <div className="text-sm font-bold text-white">{item.A}</div>
                   </div>
                 ))}
              </div>
            </div>

            {/* 右侧：周活跃度 */}
            <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-400" />
                  本周活跃度分布
                </h3>
                <span className="text-xs text-gray-500">基于登录与交互次数</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.weeklyActivity}>
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {student.weeklyActivity.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value > 50 ? '#10b981' : entry.value > 20 ? '#f59e0b' : '#f43f5e'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-rose-500"></div> 低 (&lt;20)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> 中 (20-50)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> 高 (&gt;50)</div>
              </div>
            </div>
          </div>

          {/* 底部：干预记录时间轴 */}
          <div className="bg-[#161b29] border border-white/5 rounded-xl p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                干预与辅导记录
              </h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/20"
              >
                <Plus size={16} />
                制定干预计划
              </button>
            </div>

            <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4">
              {student.interventions.map((record) => (
                <div key={record.id} className="relative pl-6 group">
                  {/* 时间轴节点 - 根据类型显示不同颜色 */}
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#161b29] ${
                    record.type === 'active_learning' ? 'bg-emerald-500 ring-2 ring-emerald-500/30' :
                    record.type === 'email' ? 'bg-blue-500' : 
                    record.type === 'meeting' ? 'bg-emerald-500' : 
                    record.type === 'plan' ? 'bg-amber-500' : 'bg-violet-500'
                  }`}></div>
                  
                  <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 如果是主动学习方法，显示特殊标签 */}
                        {record.method ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Rocket size={12} className="mr-1" />
                            {record.method}
                          </span>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            record.type === 'email' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            record.type === 'meeting' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            'bg-violet-500/10 text-violet-400 border-violet-500/20'
                          }`}>
                            {record.type === 'email' ? '邮件通知' : record.type === 'meeting' ? '面谈辅导' : '计划制定'}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 font-mono">{record.date}</span>
                      </div>
                      <span className="text-xs text-gray-500">操作人：{record.author}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{record.content}</p>
                  </div>
                </div>
              ))}
              
              {student.interventions.length === 0 && (
                <div className="pl-6 text-gray-500 text-sm italic">暂无干预记录，点击右上角添加第一条记录。</div>
              )}
            </div>
          </div>

        </div>
        
        {/* 底部版权 */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center pb-6">
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab. Powered by XAI Technology.
            </p>
        </div>
      </main>

      {/* --- 主动学习干预模态框 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161b29] border border-white/10 rounded-xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            {/* 头部 */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-emerald-400" size={24} />
                制定主动学习干预
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-6">
              {/* 方法选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择主动学习方法
                </label>
                <div className="space-y-3">
                  {['翻转课堂', '同伴教学', '项目式学习'].map((method) => (
                    <label 
                      key={method}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                        interventionForm.type === method 
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-900/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={interventionForm.type === method}
                        onChange={(e) => setInterventionForm({...interventionForm, type: e.target.value})}
                        className="w-4 h-4 text-violet-600 focus:ring-violet-500 bg-gray-700 border-gray-600"
                      />
                      <span className="ml-3 font-medium">{method}</span>
                      {interventionForm.type === method && <Check size={16} className="ml-auto text-violet-400" />}
                    </label>
                  ))}
                </div>
              </div>

              {/* 日期选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  开始日期
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="date"
                    value={interventionForm.date}
                    onChange={(e) => setInterventionForm({...interventionForm, date: e.target.value})}
                    className="w-full bg-[#0f111a] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 p-6 border-t border-white/5 bg-white/5 rounded-b-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddIntervention}
                className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-900/20 transition-all active:scale-95"
              >
                确认启动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 导出报告模态框 */}
        {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#161b29] border border-white/10 rounded-xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            {/* 头部 */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-violet-400" size={24} />
                导出学情分析报告
                </h3>
                <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                >
                <X size={20} />
                </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400 mb-4">
                请选择要包含在报告 <span className="text-violet-400 font-mono">{student.name}_{student.id}.pdf</span> 中的内容模块：
                </p>
                
                <div className="space-y-3">
                {[
                    { key: 'includeBasic', label: '学生基本信息', desc: '姓名、专业、入学年份、当前风险等级' },
                    { key: 'includeRadar', label: '多维度能力分析', desc: '雷达图数据及详细解读' },
                    { key: 'includeActivity', label: '活跃度趋势分析', desc: '周活跃度分布图表及异常点标记' },
                    { key: 'includeInterventions', label: '干预与辅导记录', desc: '历史干预措施及效果评估' },
                ].map((item) => (
                    <label 
                    key={item.key}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                        exportOptions[item.key]
                        ? 'bg-violet-600/10 border-violet-500/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    >
                    <input
                        type="checkbox"
                        checked={exportOptions[item.key]}
                        onChange={(e) => setExportOptions({...exportOptions, [item.key]: e.target.checked})}
                        className="mt-1 w-4 h-4 text-violet-600 rounded focus:ring-violet-500 bg-gray-700 border-gray-600"
                    />
                    <div className="ml-3">
                        <div className={`text-sm font-medium ${exportOptions[item.key] ? 'text-white' : 'text-gray-300'}`}>
                        {item.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                    </label>
                ))}
                </div>
                
                {!Object.values(exportOptions).some(Boolean) && (
                <p className="text-xs text-rose-400 mt-2">⚠️ 请至少选择一个模块</p>
                )}
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 p-6 border-t border-white/5 bg-white/5 rounded-b-xl">
                <button
                onClick={() => setIsExportModalOpen(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white font-medium transition-colors disabled:opacity-50"
                >
                取消
                </button>
                <button
                onClick={handleExportReport}
                disabled={isGenerating || !Object.values(exportOptions).some(Boolean)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-violet-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                {isGenerating ? (
                    <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>生成中...</span>
                    </>
                ) : (
                    <>
                    <Download size={18} />
                    <span>生成并下载</span>
                    </>
                )}
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
};

export default StudentDetail;