import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("Welcome back!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page animate-in">
      <div className="rig-logo auth-logo">لعبة رضا للاستثمار</div>
      <form className="glass-panel auth-form" onSubmit={handleSubmit}>
        <h2>تسجيل الدخول</h2>
        <input 
          type="text" 
          placeholder="اسم المستخدم" 
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">دخول</button>
        <p className="auth-footer">
          ليس لديك دعوة؟ تواصل مع الإدارة.
          <br />
          <Link to="/register">إنشاء حساب بكود دعوة</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
