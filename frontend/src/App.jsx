import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import './assets/css/theme.css';
import StudentDetail from './pages/StudentDetail';
import AdminDashboard from './pages/AdminDashboard';
import DataManagement from './pages/DataManagement';
import ModelMonitor from './pages/ModelMonitor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/:id" element={<StudentDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/data" element={<DataManagement />} />
        <Route path="/admin/model" element={<ModelMonitor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;