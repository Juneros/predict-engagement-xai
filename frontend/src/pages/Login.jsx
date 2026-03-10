import React, { useState } from 'react';
import '../assets/css/theme.css';
import StarfieldBackground from '../components/StarfieldBackground';
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'teacher'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log('Login Attempt:', formData);
      
      if (formData.role === 'teacher' || formData.role === 'admin') {
        const userInfo = {
          username: formData.username,
          role: formData.role,
          loginTime: new Date().toISOString() 
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('token', 'mock-jwt-token-' + formData.role);

        console.log('用户信息已保存:', userInfo);
        
        // ✅ 根据角色判断跳转路径
        if (formData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('未知角色');
        setIsLoading(false);
        return;
      }
      
    }, 1500);
  };

  return (
    <>
      <StarfieldBackground />
      
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
          
          {/* ✅ Logo 容器：添加 display: flex 和 justifyContent: center 确保绝对居中 */}
          <div className="logo-container" style={{ 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src="/src/assets/images/logo.png" 
              alt="EduVision Logo" 
              className="logo-image"
              style={{ maxHeight: '80px', objectFit: 'contain', display: 'block' }}
            />
          </div>
          
          {/* 标题 */}
          <h1 className="brand-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>EduVision·育见未来</h1>
          
          {/* Slogans */}
          <div className="slogan-container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="english-slogan" style={{ margin: '0 0 0.25rem 0', fontStyle: 'italic' }}>"Insight Today, Vision Tomorrow."</p>
            <p className="chinese-slogan" style={{ margin: 0, opacity: 0.7 }}>洞察此刻，遇见未来</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* 用户名 */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your ID or Email"
                className="input-dark"
                style={{ width: '100%', boxSizing: 'border-box' }}
                required
              />
            </div>

            {/* 密码 */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-dark"
                style={{ width: '100%', boxSizing: 'border-box' }}
                required
              />
            </div>

            {/* 【修改点1】角色选择：完全使用内联样式强制并排 */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              width: '100%', 
              marginBottom: '1.5rem' 
            }}>
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={formData.role === 'teacher' ? 'active' : ''}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: formData.role === 'teacher' ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255,255,255,0.05)',
                  color: formData.role === 'teacher' ? '#fff' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Teacher
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={formData.role === 'admin' ? 'active' : ''}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: formData.role === 'admin' ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255,255,255,0.05)',
                  color: formData.role === 'admin' ? '#fff' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Admin
              </button>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '8px',
                background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                color: 'white',
                border: 'none',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Verifying...' : 'Sign In to EduVision'}
            </button>
          </form>

          {/* 【修改点2】版权信息：强制居中、缩小、大间距 */}
          <div style={{
            marginTop: '3.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              © 2026 EduVision AI Lab. Powered by XAI Technology.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;