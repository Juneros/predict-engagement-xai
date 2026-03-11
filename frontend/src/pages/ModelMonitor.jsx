import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Cpu, 
  RefreshCw, 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Terminal,
  Brain,
  BarChart3,
  Layers,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- 初始模型数据 ---
const INITIAL_METRICS = {
  version: 'v2.4.1',
  trainedAt: '2026-03-10 03:00',
  accuracy: 94.2,
  precision: 92.5,
  recall: 91.8,
  f1: 92.1,
  loss: 0.18
};

// 初始混淆矩阵数据
const INITIAL_CONFUSION = [
  { name: '真阴性 (TN)', value: 850, color: '#10b981' },
  { name: '假阳性 (FP)', value: 45, color: '#f59e0b' },
  { name: '假阴性 (FN)', value: 32, color: '#f43f5e' },
  { name: '真阳性 (TP)', value: 121, color: '#8b5cf6' },
];

// 特征重要性数据
const FEATURE_IMPORTANCE = [
  { name: '出勤率', score: 92 },
  { name: '作业提交延迟', score: 85 },
  { name: '视频观看时长', score: 78 },
  { name: '论坛活跃度', score: 65 },
  { name: '测验平均分', score: 60 },
];

// 模拟训练日志
const TRAINING_LOGS = [
  "Initializing model architecture (ResNet-1D)...",
  "Loading dataset: 1,240,592 records loaded.",
  "Preprocessing: Normalizing features...",
  "Starting Epoch 1/10... Loss: 0.852",
  "Starting Epoch 2/10... Loss: 0.641",
  "Starting Epoch 3/10... Loss: 0.423",
  "Validation check: Accuracy 88.4%",
  "Starting Epoch 4/10... Loss: 0.315",
  "Starting Epoch 5/10... Loss: 0.240",
  "Early stopping candidate detected.",
  "Starting Epoch 6/10... Loss: 0.198",
  "Starting Epoch 7/10... Loss: 0.175",
  "Validation check: Accuracy 93.1%",
  "Optimizing hyperparameters...",
  "Finalizing model weights...",
  "Model training completed successfully!",
  "New Model Version: v2.5.0 generated."
];

const ModelMonitor = () => {
  const navigate = useNavigate();
  const logsEndRef = useRef(null);

  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [confusionData, setConfusionData] = useState(INITIAL_CONFUSION);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentLog]);

  const startRetraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    setCurrentLog([]);
    setShowSuccess(false);

    let logIndex = 0;
    const totalSteps = TRAINING_LOGS.length;

    const interval = setInterval(() => {
      if (logIndex < totalSteps) {
        setCurrentLog(prev => [...prev, TRAINING_LOGS[logIndex]]);
        setTrainingProgress(((logIndex + 1) / totalSteps) * 100);
        logIndex++;
      } else {
        clearInterval(interval);
        finishTraining();
      }
    }, 600);
  };

  const finishTraining = () => {
    setTimeout(() => {
      setIsTraining(false);
      
      setMetrics(prev => ({
        ...prev,
        version: 'v2.5.0',
        trainedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        accuracy: Math.min(99.9, prev.accuracy + (Math.random() * 2)).toFixed(1),
        precision: Math.min(99.9, prev.precision + (Math.random() * 2)).toFixed(1),
        recall: Math.min(99.9, prev.recall + (Math.random() * 2)).toFixed(1),
        f1: Math.min(99.9, prev.f1 + (Math.random() * 2)).toFixed(1),
        loss: Math.max(0.01, prev.loss - 0.05).toFixed(3)
      }));

      setConfusionData([
        { name: '真阴性 (TN)', value: 880, color: '#10b981' },
        { name: '假阳性 (FP)', value: 25, color: '#f59e0b' },
        { name: '假阴性 (FN)', value: 15, color: '#f43f5e' },
        { name: '真阳性 (TP)', value: 130, color: '#8b5cf6' },
      ]);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 500);
  };

  return (
    // ✅ 修改：主背景改为浅薰衣草色
    <div className="min-h-screen bg-[#FAF5FF] text-slate-800 font-sans flex flex-col">
      
      {/* --- 顶部导航栏 --- */}
      {/* ✅ 修改：顶栏改为白底 + 淡紫边框 */}
      <header className="h-16 border-b border-violet-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')} 
            className="p-2 hover:bg-violet-50 rounded-lg text-slate-500 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-violet-900 flex items-center gap-2">
              <Brain className="text-violet-600" size={24} />
              模型训练监控中心
            </h2>
            <p className="text-xs text-slate-500">实时追踪 AI 预测性能与重训练流程</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500">当前模型版本</div>
            <div className="text-sm font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded inline-block">{metrics.version}</div>
          </div>
          <button
            onClick={startRetraining}
            disabled={isTraining}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-md transition-all ${
              isTraining 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : 'bg-violet-600 hover:bg-violet-700 text-white hover:shadow-violet-600/30 active:scale-95'
            }`}
          >
            {isTraining ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                训练中...
              </>
            ) : (
              <>
                <Zap size={16} />
                重新训练模型
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- 主内容区 --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 成功提示 Toast */}
          {showSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-500 shadow-sm">
              <CheckCircle size={24} className="shrink-0 text-emerald-600" />
              <div>
                <h4 className="font-bold">模型重训练完成!</h4>
                <p className="text-sm opacity-90">新版本 {metrics.version} 已部署。准确率提升至 {metrics.accuracy}%，假阴性率显著降低。</p>
              </div>
            </div>
          )}

          {/* 1. 核心指标卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '预测准确率', value: `${metrics.accuracy}%`, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '精确率 (Precision)', value: `${metrics.precision}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: '召回率 (Recall)', value: `${metrics.recall}%`, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'F1 Score', value: `${metrics.f1}`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-xs font-medium uppercase">{stat.label}</p>
                    <h3 className={`text-2xl font-bold mt-1 font-mono ${stat.color}`}>{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${stat.bg} blur-2xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity`}></div>
              </div>
            ))}
          </div>

          {/* 2. 图表区域：混淆矩阵 & 特征重要性 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 左侧：混淆矩阵 */}
            <div className="lg:col-span-2 bg-white border border-violet-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Target className="text-violet-600" size={20} />
                  混淆矩阵 (Confusion Matrix)
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">基于最近 1,000 条验证数据</span>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={confusionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {confusionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#4c1d95', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#4c1d95' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full md:w-1/2 space-y-3">
                  {confusionData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-violet-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800">
                    <p><strong>关注重点：</strong> 尽量减少 <span className="text-rose-600 font-bold">假阴性 (FN)</span>，即避免漏掉真正的高风险学生。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：特征重要性 */}
            <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <BarChart3 className="text-blue-600" size={20} />
                特征重要性
              </h3>
              <div className="space-y-4">
                {FEATURE_IMPORTANCE.map((feature, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">{feature.name}</span>
                      <span className="text-slate-500 font-mono">{feature.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-violet-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${feature.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">模型主要依赖 <span className="text-slate-800 font-semibold">出勤率</span> 和 <span className="text-slate-800 font-semibold">作业行为</span> 进行预测。</p>
              </div>
            </div>
          </div>

          {/* 3. 训练控制台 (终端风格 - 浅色版) */}
          {/* ✅ 修改：改为浅灰色背景，深色文字，模仿 VS Code Light 主题 */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-64">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-600 font-semibold">Training Console Output</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
              </div>
            </div>
            
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 space-y-1 bg-[#F8FAFC]">
              {currentLog.length === 0 && !isTraining && (
                <div className="text-slate-400 italic">等待指令... 点击“重新训练模型”开始新的训练周期。</div>
              )}
              
              {currentLog.map((log, idx) => (
                <div key={idx} className={`${
                  log.includes('Error') ? 'text-rose-600 font-semibold' : 
                  log.includes('completed') ? 'text-emerald-600 font-bold' : 
                  log.includes('Loss') ? 'text-blue-600' : 
                  'text-slate-700'
                }`}>
                  <span className="text-slate-400 mr-2 select-none">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              
              {isTraining && (
                <div className="animate-pulse text-violet-600 font-bold">_</div>
              )}
              <div ref={logsEndRef} />
            </div>
            
            {isTraining && (
              <div className="h-1 bg-slate-100 w-full">
                <div 
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
            )}
          </div>

        </div>
        
        {/* 底部版权 */}
        <div className="mt-12 pt-6 border-t border-violet-100 text-center pb-6">
            <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab - Model Ops Center
            </p>
        </div>
      </main>
    </div>
  );
};

export default ModelMonitor;