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
        
        if (formData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('未知角色');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <>
      <StarfieldBackground />
      
      <div className="min-h-screen flex items-center justify-center relative p-4">
        
        <div className="glass-panel">
          
          {/* ✅ Logo 区域：已修复居中问题 */}
          <div className="logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="/src/assets/images/logo.png" 
              alt="EduVision Logo" 
              className="logo-image"
              style={{ display: 'block' }}
            />
          </div>
          
          <h1 className="brand-title">EduVision·育见未来</h1>
          
          <div className="slogan-container">
            <p className="english-slogan">"Insight Today, Vision Tomorrow."</p>
            <p className="chinese-slogan">洞察此刻，遇见未来</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your ID or Email"
                className="input-dark"
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-dark"
                required
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              width: '100%', 
              marginBottom: '2rem' 
            }}>
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`role-button ${formData.role === 'teacher' ? 'active' : ''}`}
              >
                <span>👨‍</span>
                <span>Teacher</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`role-button ${formData.role === 'admin' ? 'active' : ''}`}
              >
                <span>🛡️</span>
                <span>Admin</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                'Sign In to EduVision'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '3rem',
            borderTop: '1px solid var(--border-color, rgba(0,0,0,0.05))',
            paddingTop: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '10px',
              color: 'var(--text-muted, #9ca3af)', 
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