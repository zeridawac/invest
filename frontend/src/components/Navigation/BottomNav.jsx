import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span>🏠</span>
        <span>الرئيسية</span>
      </NavLink>
      
      {!user?.isAdmin && (
        <>
          <NavLink to="/games" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>🎮</span>
            <span>الألعاب</span>
          </NavLink>
          <NavLink to="/investment" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>📈</span>
            <span>استثمار</span>
          </NavLink>
          <NavLink to="/withdrawal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>💰</span>
            <span>السحب</span>
          </NavLink>
          <NavLink to="/coupons" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>🎁</span>
            <span>هدايا</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>🏆</span>
            <span>الترتيب</span>
          </NavLink>
        </>
      )}

      {user?.isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>🛠️</span>
          <span>الأدمن</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
