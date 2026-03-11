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
  BookOpen,
  Award,
  Activity,
  Plus, 
  X,  
  Check,
  Rocket,
  FileText, 
  Download,
  Brain,
  Info,
  Hourglass,
  Trash2 // ✅ 新增：删除图标
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart, 
  Bar, 
  Cell,
  XAxis,
  YAxis
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
  
  // 模拟状态管理
  const [simulatedData, setSimulatedData] = useState(null); 
  const [explanation, setExplanation] = useState(null); 
  
  // ✅ 新增：用于管理自定义 Tooltip 的状态
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    type: '翻转课堂',
    date: new Date().toISOString().split('T')[0],
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeBasic: true,
    includeRadar: true,
    includeActivity: true,
    includeInterventions: true
  });

  // ✅ 新增：删除确认对话框状态
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // 模拟逻辑
  const simulateInterventionEffect = (currentStudent, method) => {
    let scoreIncrease = 0;
    let radarBoost = {};
    let reasonText = "";
    let keyFactors = [];

    switch (method) {
      case '翻转课堂':
        scoreIncrease = 8;
        radarBoost = { '出勤率': 10, '作业完成': 15, '在线时长': 10 };
        reasonText = "该策略通过课前视频学习强制提升了学生的【在线时长】和【出勤率】，并通过课前任务显著改善了【作业完成度】。";
        keyFactors = [
          { dim: '作业完成', boost: 15, reason: '课前任务驱动' },
          { dim: '出勤率', boost: 10, reason: '签到与视频挂钩' },
          { dim: '在线时长', boost: 10, reason: '视频学习强制要求' }
        ];
        break;
      case '同伴教学':
        scoreIncrease = 6;
        radarBoost = { '课堂互动': 20, '讨论区参与': 25, '测验成绩': 5 };
        reasonText = "该策略利用社交驱动力，大幅提升了【课堂互动】和【讨论区参与】，间接带动【测验成绩】。";
        keyFactors = [
          { dim: '讨论区参与', boost: 25, reason: '小组互评机制' },
          { dim: '课堂互动', boost: 20, reason: '同伴激励效应' },
          { dim: '测验成绩', boost: 5, reason: '知识内化加深' }
        ];
        break;
      case '项目式学习':
        scoreIncrease = 10;
        radarBoost = { '作业完成': 20, '测验成绩': 15, '课堂互动': 10 };
        reasonText = "PBL 模式以结果为导向，极大地激发了学生的主动性，显著提升【作业完成度】和【测验成绩】。";
        keyFactors = [
          { dim: '作业完成', boost: 20, reason: '项目交付压力' },
          { dim: '测验成绩', boost: 15, reason: '实践促进理解' },
          { dim: '课堂互动', boost: 10, reason: '团队协作需求' }
        ];
        break;
      default:
        scoreIncrease = 5;
        reasonText = "常规干预措施预计带来小幅全面提升。";
        keyFactors = [{ dim: '综合', boost: 5, reason: '常规督促' }];
    }

    const newScore = Math.min(100, currentStudent.score + scoreIncrease);
    
    const newRadarData = currentStudent.radarData.map(item => {
      const boost = radarBoost[item.subject] || 2;
      return { 
        ...item, 
        A: Math.min(100, item.A + boost),
        boost: boost 
      };
    });

    let newStatus = currentStudent.status;
    if (newScore >= 60) newStatus = 'high';
    else if (newScore >= 45) newStatus = 'medium';
    else newStatus = 'low';

    return {
      data: {
        ...currentStudent,
        score: newScore,
        trend: 'up',
        status: newStatus,
        radarData: newRadarData
      },
      explanation: {
        text: reasonText,
        factors: keyFactors,
        totalBoost: scoreIncrease
      }
    };
  };

  const handlePreviewIntervention = () => {
    if (!student) return;
    const result = simulateInterventionEffect(student, interventionForm.type);
    setSimulatedData(result.data);
    setExplanation(result.explanation);
    setIsModalOpen(false); 
  };

  const confirmApplyIntervention = () => {
    if (!student || !simulatedData) return;

    const newRecord = {
      id: Date.now(), 
      date: interventionForm.date,
      type: 'active_learning', 
      method: interventionForm.type, 
      content: `启动【${interventionForm.type}】教学干预方案。系统预测：参与度及成绩将提升 ${simulatedData.score - student.score} 分。`,
      author: '当前教师',
      status: 'completed'
    };

    const finalStudent = {
      ...simulatedData,
      interventions: [newRecord, ...student.interventions]
    };

    setStudent(finalStudent);
    setSimulatedData(null);
    setExplanation(null);
    setInterventionForm({
      type: '翻转课堂',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const cancelSimulation = () => {
    setSimulatedData(null);
    setExplanation(null);
    setHoveredSubject(null);
  };

  const handleExportReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsExportModalOpen(false);
      alert(`✅ 报告生成成功！\n\n文件名：${student.name}_学情分析报告.pdf`);
    }, 1500);
  };

  // ✅ 新增：删除记录处理函数
  const handleDeleteIntervention = (recordId) => {
    if (!student) return;
    
    const updatedInterventions = student.interventions.filter(r => r.id !== recordId);
    setStudent({
      ...student,
      interventions: updatedInterventions
    });
    setDeleteConfirmId(null); // 关闭确认状态
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundStudent = MOCK_STUDENTS_DB.find(s => s.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        alert(`未找到 ID 为 ${id} 的学生信息`);
        navigate('/dashboard'); 
      }
      setIsLoading(false);
    }, 600);
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] text-emerald-600';
      case 'medium': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] text-amber-600';
      case 'low': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] text-rose-600';
      default: return 'bg-gray-400 text-gray-600';
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

  // ✅ 处理鼠标悬停事件
  const handleRadarMouseEnter = (data, index, event) => {
    if (!data || !data.subject) return;
    
    // 获取图表容器的位置以计算 Tooltip 位置
    const rect = event.target.closest('.recharts-wrapper')?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top - 10
      });
    }
    
    setHoveredSubject(data.subject);
  };

  const handleRadarMouseLeave = () => {
    setHoveredSubject(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-700 font-mono text-sm animate-pulse">加载学生档案...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center text-slate-600">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-violet-100">
          <AlertCircle size={48} className="mx-auto mb-4 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">未找到学生档案</h2>
          <p className="mt-2 text-slate-500">ID: {id} 不存在</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors">返回首页</button>
        </div>
      </div>
    );
  }

  const displayData = simulatedData || student;
  const isSimulationMode = !!simulatedData;

  // 计算当前悬停维度的数值
  const getCurrentValues = () => {
    if (!hoveredSubject) return null;
    
    const originalItem = student.radarData.find(d => d.subject === hoveredSubject);
    const simulatedItem = isSimulationMode ? simulatedData.radarData.find(d => d.subject === hoveredSubject) : null;

    if (!originalItem) return null;

    return {
      subject: hoveredSubject,
      original: originalItem.A,
      simulated: simulatedItem ? simulatedItem.A : null,
      diff: simulatedItem ? simulatedItem.A - originalItem.A : 0
    };
  };

  const currentValues = getCurrentValues();

  return (
    <div className="min-h-screen bg-[#FAF5FF] text-slate-800 font-sans flex flex-col overflow-hidden">
      
      {/* --- 顶部导航栏 --- */}
      <header className="h-16 border-b border-violet-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if(isSimulationMode) cancelSimulation();
              else navigate(-1);
            }} 
            className="p-2 hover:bg-violet-50 rounded-lg text-slate-500 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-violet-900 tracking-tight flex items-center gap-2">
              学生详情档案
              {isSimulationMode && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  模拟预览模式
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">{isSimulationMode ? '正在预览干预效果，尚未保存' : '实时学情数据'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {!isSimulationMode && (
             <>
               <span className="text-xs text-slate-400 hidden sm:inline">最后更新：刚刚</span>
               <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-violet-50 border border-violet-200 rounded-lg text-xs font-medium text-slate-600 hover:text-violet-700 transition-all shadow-sm"
                >
                    <FileText size={14} />
                    <span className="hidden sm:inline">导出报告</span>
                </button>
             </>
           )}
           {isSimulationMode && (
             <div className="flex gap-2">
               <button
                 onClick={cancelSimulation}
                 className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
               >
                 取消模拟
               </button>
               <button
                 onClick={confirmApplyIntervention}
                 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
               >
                 <Check size={16} />
                 确认应用
               </button>
             </div>
           )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 顶部信息卡片 */}
          <div className="bg-white border border-violet-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl shadow-violet-900/5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] opacity-10 rounded-full pointer-events-none ${
              displayData.status === 'low' ? 'bg-rose-400' : displayData.status === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></div>

            <div className="relative shrink-0">
              <img 
                src={student.avatar ? student.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=8b5cf6&color=fff&size=256`} 
                alt={student.name} 
                className="w-24 h-24 rounded-full border-2 border-violet-100 object-cover bg-white shadow-md" 
              />
              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(displayData.status).split(' ')[0]}`}></span>
            </div>

            <div className="flex-1 space-y-1 z-10">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-opacity-10 border-opacity-20 ${getStatusColor(displayData.status)}`}>
                  {getStatusText(displayData.status)}
                </span>
                <span className="text-slate-400 font-mono text-sm">{student.id}</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                <div className="flex items-center gap-2"><BookOpen size={16} className="text-violet-400" /><span>{student.major}</span></div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-violet-400" /><span>入学年份：{student.enrollmentYear}</span></div>
                <div className="flex items-center gap-2"><MessageSquare size={16} className="text-violet-400" /><span>{student.email}</span></div>
              </div>
            </div>

            <div className="flex flex-col items-end z-10">
              <div className="flex items-baseline gap-2">
                <div className={`text-4xl font-bold font-mono tracking-tighter transition-colors duration-500 ${isSimulationMode ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {displayData.score}
                </div>
                <span className="text-lg text-slate-400 font-normal">/ 100</span>
              </div>
              
              {isSimulationMode && (
                <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  预计提升 {displayData.score - student.score} 分
                </div>
              )}

              <div className="flex items-center gap-1 text-sm mt-1">
                <TrendingUp size={16} className={displayData.trend === 'down' ? 'text-rose-500 rotate-180' : 'text-emerald-500'} />
                <span className={displayData.trend === 'down' ? 'text-rose-600' : 'text-emerald-600'}>
                  {displayData.trend === 'up' ? '上升' : displayData.trend === 'down' ? '下降' : '平稳'}
                </span>
                <span className="text-slate-400 ml-1">较上周</span>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：能力雷达图 (双图层方案) */}
            <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-xl shadow-violet-900/5 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Award size={20} className="text-violet-600" />
                  多维度能力分析
                </h3>
                {isSimulationMode && (
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-violet-500 border-2 border-white shadow-sm"></div>
                      <span className="text-slate-600 font-medium">原始能力</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-dashed border-slate-400 shadow-sm"></div>
                      <span className="text-slate-600 font-medium">模拟效果</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 图表容器：相对定位，用于容纳绝对定位的 Tooltip */}
              <div className="h-64 w-full relative group">
                
                {/* 底层图表：原始数据 */}
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={student.radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    
                    <Radar
                      name="原始能力"
                      dataKey="A"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="#8b5cf6"
                      fillOpacity={0.1}
                      onMouseEnter={handleRadarMouseEnter}
                      onMouseLeave={handleRadarMouseLeave}
                      style={{ cursor: 'crosshair' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                {/* 顶层图表：模拟数据 (绝对定位覆盖) */}
                {isSimulationMode && (
                  <div className="absolute inset-0 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={simulatedData.radarData}>
                        <PolarGrid stroke="none" />
                        <PolarAngleAxis tick={false} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        
                        <Radar
                          name="模拟效果"
                          dataKey="A"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          fill="#94a3b8"
                          fillOpacity={0.15}
                          animationDuration={1000}
                          onMouseEnter={handleRadarMouseEnter}
                          onMouseLeave={handleRadarMouseLeave}
                          style={{ cursor: 'crosshair' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ✅ 自定义 HTML Tooltip (绝对定位) */}
                {currentValues && (
                  <div 
                    className="absolute z-50 bg-white/95 backdrop-blur-sm p-3 border border-violet-100 rounded-lg shadow-xl text-xs min-w-[140px] pointer-events-none transition-all duration-75 ease-out"
                    style={{ 
                      left: `${tooltipPos.x}px`, 
                      top: `${tooltipPos.y}px`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">{currentValues.subject}</p>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                          原始能力
                        </span>
                        <span className="font-mono font-medium text-slate-700">{currentValues.original}</span>
                      </div>
                      
                      {isSimulationMode && currentValues.simulated !== null && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400 border border-dashed border-slate-500"></span>
                            模拟效果
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-slate-700">{currentValues.simulated}</span>
                            {currentValues.diff > 0 && (
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded flex items-center">
                                +{currentValues.diff}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                 {displayData.radarData.slice(0,3).map((item, i) => (
                   <div key={i} className={`rounded p-2 border ${isSimulationMode && student.radarData[i].A !== item.A ? 'bg-emerald-50 border-emerald-200' : 'bg-violet-50 border-violet-100'}`}>
                     <div className="text-xs text-slate-500">{item.subject}</div>
                     <div className="text-sm font-bold text-slate-800">
                       {item.A}
                       {isSimulationMode && student.radarData[i].A !== item.A && (
                         <span className="text-xs text-emerald-600 ml-1">+{item.A - student.radarData[i].A}</span>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* 右侧：周活跃度 */}
            <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-xl shadow-violet-900/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  本周活跃度分布
                </h3>
                <span className="text-xs text-slate-400">基于登录与交互次数</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.weeklyActivity}>
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis hide />
                    <RechartsTooltip
                      cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#4c1d95', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {student.weeklyActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 50 ? '#10b981' : entry.value > 20 ? '#f59e0b' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-rose-500"></div> 低 (&lt;20)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> 中 (20-50)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> 高 (&gt;50)</div>
              </div>
            </div>
          </div>

          {/* 可解释性模型分析面板 */}
          {isSimulationMode && explanation && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-violet-600 shrink-0">
                  <Brain size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-violet-900 flex items-center gap-2">
                    AI 可解释性分析
                    <span className="text-xs font-normal text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">XAI Engine</span>
                  </h3>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {explanation.text}
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {explanation.factors.map((factor, idx) => (
                      <div key={idx} className="bg-white/60 backdrop-blur-sm border border-violet-100 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500">{factor.dim}</div>
                          <div className="text-xs font-medium text-slate-700">{factor.reason}</div>
                        </div>
                        <div className="text-emerald-600 font-bold text-sm">+{factor.boost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 模拟干预预览卡片 */}
          {isSimulationMode && (
            <div className="bg-amber-50 border border-amber-200 border-dashed rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-amber-600 shrink-0">
                  <Hourglass size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    待确认的干预计划
                    <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">未保存</span>
                  </h3>
                  <div className="mt-3 bg-white rounded-lg p-4 border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <Rocket size={12} className="mr-1" />
                          {interventionForm.type}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{interventionForm.date}</span>
                      </div>
                      <span className="text-xs text-amber-600 font-medium">操作人：当前教师</span>
                    </div>
                    <p className="text-slate-700 text-sm">
                      启动【{interventionForm.type}】教学干预方案。系统预测：参与度及成绩将提升 <span className="font-bold text-emerald-600">{simulatedData.score - student.score} 分</span>。
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 mt-2">* 此记录暂未存入档案，请点击右上角“确认应用”后生效。</p>
                </div>
              </div>
            </div>
          )}

          {/* 底部：真实干预记录时间轴 */}
          <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-xl shadow-violet-900/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-amber-600" />
                历史干预记录
              </h3>
              {!isSimulationMode && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-violet-600/20"
                >
                  <Plus size={16} />
                  制定干预计划
                </button>
              )}
            </div>

            <div className="relative border-l border-violet-100 ml-3 space-y-6 pb-4">
              {student.interventions.length > 0 ? (
                student.interventions.map((record) => (
                  <div key={record.id} className="relative pl-6 group">
                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      record.type === 'active_learning' ? 'bg-emerald-500 ring-2 ring-emerald-500/30' :
                      record.type === 'email' ? 'bg-blue-500' : 
                      record.type === 'meeting' ? 'bg-emerald-500' : 
                      record.type === 'plan' ? 'bg-amber-500' : 'bg-violet-500'
                    }`}></div>
                    
                    <div className="bg-violet-50/50 rounded-lg p-4 hover:bg-violet-50 transition-colors border border-violet-100 relative">
                      {/* ✅ 删除按钮 (仅在非模拟模式且鼠标悬停时显示) */}
                      {!isSimulationMode && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {deleteConfirmId === record.id ? (
                            <div className="flex items-center gap-1 bg-white rounded shadow-lg border border-rose-200 p-1">
                              <button 
                                onClick={() => handleDeleteIntervention(record.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                title="确认删除"
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="取消"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirmId(record.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="删除记录"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2 pr-8">
                        <div className="flex items-center gap-2 flex-wrap">
                          {record.method ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Rocket size={12} className="mr-1" />
                              {record.method}
                            </span>
                          ) : (
                            <span className={`text-xs px-2 py-0.5 rounded border ${
                              record.type === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              record.type === 'meeting' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              'bg-violet-50 text-violet-700 border-violet-200'
                            }`}>
                              {record.type === 'email' ? '邮件通知' : record.type === 'meeting' ? '面谈辅导' : '计划制定'}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">{record.date}</span>
                        </div>
                        <span className="text-xs text-slate-500">操作人：{record.author}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{record.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-6 text-slate-400 text-sm italic">暂无历史干预记录。</div>
              )}
            </div>
          </div>

        </div>
        
        <div className="mt-12 pt-6 border-t border-violet-100 text-center pb-6">
            <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab. Powered by XAI Technology.
            </p>
        </div>
      </main>

      {/* --- 主动学习干预模态框 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-violet-100 rounded-xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-violet-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Rocket className="text-violet-600" size={24} />
                选择干预策略
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">选择主动学习方法</label>
                <div className="space-y-3">
                  {['翻转课堂', '同伴教学', '项目式学习'].map((method) => (
                    <label key={method} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${interventionForm.type === method ? 'bg-violet-50 border-violet-500 text-slate-800 shadow-sm' : 'bg-white border-violet-100 text-slate-600 hover:bg-violet-50 hover:border-violet-300'}`}>
                      <input type="radio" name="method" value={method} checked={interventionForm.type === method} onChange={(e) => setInterventionForm({...interventionForm, type: e.target.value})} className="w-4 h-4 text-violet-600 focus:ring-violet-500 bg-white border-violet-300" />
                      <span className="ml-3 font-medium">{method}</span>
                      {interventionForm.type === method && <Check size={16} className="ml-auto text-violet-600" />}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">开始日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="date" value={interventionForm.date} onChange={(e) => setInterventionForm({...interventionForm, date: e.target.value})} className="w-full bg-white border border-violet-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-violet-100 bg-violet-50/50 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-violet-200 text-slate-600 hover:bg-white hover:text-slate-800 font-medium transition-colors">取消</button>
              <button onClick={handlePreviewIntervention} className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md shadow-violet-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"><Brain size={18} />模拟效果</button>
            </div>
          </div>
        </div>
      )}

      {/* 导出报告模态框 */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-violet-100 rounded-xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-violet-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="text-violet-600" size={24} />导出学情分析报告</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 mb-4">请选择要包含在报告 <span className="text-violet-700 font-mono bg-violet-50 px-1 rounded">{student.name}_{student.id}.pdf</span> 中的内容模块：</p>
                <div className="space-y-3">
                {[
                    { key: 'includeBasic', label: '学生基本信息', desc: '姓名、专业、入学年份、当前风险等级' },
                    { key: 'includeRadar', label: '多维度能力分析', desc: '雷达图数据及详细解读' },
                    { key: 'includeActivity', label: '活跃度趋势分析', desc: '周活跃度分布图表及异常点标记' },
                    { key: 'includeInterventions', label: '干预与辅导记录', desc: '历史干预措施及效果评估' },
                ].map((item) => (
                    <label key={item.key} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${exportOptions[item.key] ? 'bg-violet-50 border-violet-300' : 'bg-white border-violet-100 hover:bg-violet-50'}`}>
                    <input type="checkbox" checked={exportOptions[item.key]} onChange={(e) => setExportOptions({...exportOptions, [item.key]: e.target.checked})} className="mt-1 w-4 h-4 text-violet-600 rounded focus:ring-violet-500 bg-white border-violet-300" />
                    <div className="ml-3">
                        <div className={`text-sm font-medium ${exportOptions[item.key] ? 'text-slate-800' : 'text-slate-600'}`}>{item.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    </label>
                ))}
                </div>
                {!Object.values(exportOptions).some(Boolean) && (<p className="text-xs text-rose-600 mt-2 bg-rose-50 inline-block px-2 py-1 rounded">⚠️ 请至少选择一个模块</p>)}
            </div>
            <div className="flex gap-3 p-6 border-t border-violet-100 bg-violet-50/50 rounded-b-xl">
                <button onClick={() => setIsExportModalOpen(false)} disabled={isGenerating} className="flex-1 px-4 py-2.5 rounded-lg border border-violet-200 text-slate-600 hover:bg-white hover:text-slate-800 font-medium transition-colors disabled:opacity-50">取消</button>
                <button onClick={handleExportReport} disabled={isGenerating || !Object.values(exportOptions).some(Boolean)} className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-md shadow-violet-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                {isGenerating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>生成中...</span></>) : (<><Download size={18} /><span>生成并下载</span></>)}
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
};

export default StudentDetail;