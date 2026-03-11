import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Server,
  Cloud,
  HardDrive,
  X
} from 'lucide-react';

// --- 模拟数据源状态 ---
const INITIAL_SOURCES = [
  { id: 1, name: 'LMS 学习行为日志', type: 'CSV', lastSync: '2026-03-11 02:15', status: 'success', records: '1,240,592' },
  { id: 2, name: '教务系统考勤表', type: 'Excel', lastSync: '2026-03-10 18:00', status: 'success', records: '45,200' },
  { id: 3, name: '图书馆门禁数据', type: 'API', lastSync: '2026-03-11 04:00', status: 'syncing', records: '890,102' },
  { id: 4, name: '在线作业提交记录', type: 'CSV', lastSync: '2026-03-09 12:30', status: 'error', records: '320,450' },
];

// --- 模拟预览数据 (上传后显示) ---
const MOCK_PREVIEW_DATA = [
  { student_id: 'S002', event: 'login', timestamp: '2026-03-11 08:30:05', duration: '0m', source: 'LMS' },
  { student_id: 'S002', event: 'video_watch', timestamp: '2026-03-11 08:32:10', duration: '15m', source: 'LMS' },
  { student_id: 'S005', event: 'quiz_submit', timestamp: '2026-03-11 09:15:00', duration: '0m', source: 'LMS' },
  { student_id: 'S003', event: 'forum_post', timestamp: '2026-03-11 09:45:22', duration: '5m', source: 'LMS' },
  { student_id: 'S002', event: 'logout', timestamp: '2026-03-11 10:00:00', duration: '0m', source: 'LMS' },
];

const DataManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [sources, setSources] = useState(INITIAL_SOURCES);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, preview, success
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setUploadState('uploading');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('preview');
          setPreviewData(MOCK_PREVIEW_DATA);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const confirmImport = () => {
    setUploadState('success');
    const newSources = sources.map(s => 
      s.id === 1 ? { ...s, lastSync: '刚刚', status: 'success', records: (parseInt(s.records.replace(/,/g, '')) + 5).toLocaleString() } : s
    );
    setSources(newSources);

    setTimeout(() => {
      setUploadState('idle');
      setSelectedFile(null);
      setPreviewData([]);
      setProgress(0);
    }, 2000);
  };

  const cancelUpload = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setProgress(0);
  };

  const triggerSync = (id) => {
    const updated = sources.map(s => 
      s.id === id ? { ...s, status: 'syncing' } : s
    );
    setSources(updated);

    setTimeout(() => {
      setSources(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'success', lastSync: '刚刚' } : s
      ));
    }, 2000);
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
            <h2 className="text-xl font-semibold text-violet-900">数据源管理</h2>
            <p className="text-xs text-slate-500">管理系统数据接入与 ETL 流程</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
             <Database size={14} />
             系统运行正常
           </span>
        </div>
      </header>

      {/* --- 主内容区 --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 1. 上传区域 */}
          {uploadState !== 'success' && (
            // ✅ 修改：卡片改为白底
            <div className="bg-white border border-violet-100 rounded-xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">上传新数据源</h3>
                <p className="text-sm text-slate-500">支持 .CSV, .XLSX 格式。系统将自动清洗并合并至主数据库。</p>
              </div>

              {uploadState === 'idle' && (
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-violet-500 bg-violet-50 scale-[1.01]' 
                      : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleChange}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">点击上传 或 拖拽文件至此</p>
                      <p className="text-xs text-slate-400 mt-1">最大支持 500MB</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadState === 'uploading' && (
                // ✅ 修改：进度条容器改为浅灰底
                <div className="py-12 px-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-violet-600" size={24} />
                      <span className="text-slate-800 font-medium truncate max-w-xs">{selectedFile?.name}</span>
                    </div>
                    <span className="text-violet-600 font-mono text-sm font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-violet-600 h-2.5 rounded-full transition-all duration-300 ease-out shadow-sm" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center animate-pulse">正在解析文件结构并校验数据完整性...</p>
                  <button onClick={cancelUpload} className="mt-4 text-xs text-rose-600 hover:text-rose-700 underline font-medium">取消上传</button>
                </div>
              )}

              {uploadState === 'preview' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* ✅ 修改：成功提示框改为浅绿底 */}
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-600" size={24} />
                      <div>
                        <p className="text-emerald-800 font-medium">文件解析成功</p>
                        <p className="text-xs text-emerald-600/80">检测到 {previewData.length} 条样本数据，格式符合标准。</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={cancelUpload} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                        重新选择
                      </button>
                      <button onClick={confirmImport} className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2">
                        <Upload size={16} />
                        确认导入数据库
                      </button>
                    </div>
                  </div>

                  {/* 数据预览表 */}
                  {/* ✅ 修改：表格改为白底深字 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      数据预览 (前 5 行)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Student ID</th>
                            <th className="px-4 py-3">Event Type</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-xs">
                          {previewData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-violet-50 transition-colors">
                              <td className="px-4 py-3 text-violet-700 font-bold">{row.student_id}</td>
                              <td className="px-4 py-3">{row.event}</td>
                              <td className="px-4 py-3">{row.timestamp}</td>
                              <td className="px-4 py-3">{row.duration}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-sans">{row.source}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 成功提示 Toast */}
          {uploadState === 'success' && (
            // ✅ 修改：Toast 改为浅绿底深绿字
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-600" />
                <div>
                  <h4 className="font-bold">数据导入成功</h4>
                  <p className="text-sm opacity-80">已新增 5 条记录至 LMS 日志库，模型将在下次训练时自动纳入。</p>
                </div>
              </div>
              <button onClick={() => setUploadState('idle')} className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600"><X size={20}/></button>
            </div>
          )}

          {/* 2. 现有数据源列表 */}
          {/* ✅ 修改：卡片改为白底 */}
          <div className="bg-white border border-violet-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Server size={20} className="text-blue-600" />
                已连接数据源
              </h3>
              <button className="text-xs flex items-center gap-1 text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
                <RefreshCw size={14} />
                刷新状态
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((source) => (
                <div key={source.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-violet-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        source.type === 'API' ? 'bg-orange-50 text-orange-600' : 
                        source.type === 'Excel' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {source.type === 'API' ? <Cloud size={20} /> : <FileSpreadsheet size={20} />}
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-sm">{source.name}</h4>
                        <p className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1 rounded mt-0.5">{source.records} 条</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      source.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      source.status === 'syncing' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {source.status === 'success' ? <CheckCircle size={12}/> : 
                       source.status === 'syncing' ? <RefreshCw size={12} className="animate-spin"/> : 
                       <AlertCircle size={12}/>}
                      {source.status === 'success' ? '正常' : source.status === 'syncing' ? '同步中' : '异常'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12} />
                      <span>上次同步：{source.lastSync}</span>
                    </div>
                    <button 
                      onClick={() => triggerSync(source.id)}
                      disabled={source.status === 'syncing'}
                      className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                    >
                      {source.status === 'syncing' ? '同步中...' : '立即同步'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* 底部版权 */}
        <div className="mt-12 pt-6 border-t border-violet-100 text-center pb-6">
            <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>
              © 2026 EduVision AI Lab - Data Pipeline Manager
            </p>
        </div>
      </main>
    </div>
  );
};

export default DataManagement;