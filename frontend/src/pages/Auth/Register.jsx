import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, inviteCode);
      toast.success("Account created successfully!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page animate-in">
      <div className="rig-logo auth-logo">لعبة رضا للاستثمار</div>
      <form className="glass-panel auth-form" onSubmit={handleSubmit}>
        <h2>إنشاء حساب</h2>
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
        <input 
          type="text" 
          placeholder="كود الدعوة" 
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">إنشاء الحساب</button>
        <p className="auth-footer">
          لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
