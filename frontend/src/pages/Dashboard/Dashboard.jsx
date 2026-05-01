import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/config';
import './Dashboard.css';

const Dashboard = () => {
  const { user, fetchUser, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin && !user.hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    try {
      await api.post('/users/welcome-dismissed');
      fetchUser();
    } catch (err) { console.error("Failed to dismiss welcome"); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data);
    } catch (err) { console.error("Failed to fetch announcements"); }
  };

  return (
    <div className="dashboard-page animate-in">
      {showWelcome && (
        <div className="welcome-modal-overlay">
          <div className="welcome-modal glass-panel animate-pop">
            <div className="welcome-icon">🎁</div>
            <h2>مرحباً بك يا بطل!</h2>
            <p>لقد حصلت على هدية <b>1000 نقطة</b> لأنك عضو جديد انضم إلينا عبر كود دعوة.</p>
            <div className="gift-amount">💰 1,000</div>
            <button className="btn-primary btn-full" onClick={handleCloseWelcome}>ابدأ الاستثمار الآن</button>
          </div>
        </div>
      )}
      <header className="dashboard-header">
        <div className="rig-logo">{user?.isAdmin ? 'لوحة تحكم الإدارة' : 'لعبة رضا للاستثمار'}</div>
        {!user?.isAdmin && (
          <div className="user-badge">
            <span className="points">💰 {(user?.points || 0).toLocaleString()} كوين</span>
          </div>
        )}
      </header>

      {user?.isAdmin ? (
        <section className="admin-welcome glass-panel">
          <h2>مرحباً أيها المدير!</h2>
          <p>أنت الآن في وضع الإدارة. يمكنك إدارة المستثمرين، معالجة السحوبات، والتحكم في السوق من خلال القائمة السفلية.</p>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <div className="glass-panel stat-card">
              <h3>المستوى {user?.level}</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(user?.xp % 100)}%` }}></div>
              </div>
              <p>{user?.xp} نقطة خبرة (XP)</p>
            </div>

            <div className="glass-panel stat-card">
              <h3>النشاط اليومي</h3>
              <div className="streak-count">🔥 {user?.streak} أيام</div>
            </div>
          </section>

          <section className="portfolio-summary glass-panel">
            <h2>محفظتك الاستثمارية</h2>
            <div className="portfolio-value">
              <span className="value-label">القيمة الإجمالية:</span>
              <span className="value-amount">💰 {(user?.points || 0).toLocaleString()} كوين</span>
            </div>
          </section>
        </>
      )}

      <section className="announcements">
        <h3>الإعلانات</h3>
        {announcements.length > 0 ? (
          announcements.map(a => (
            <div key={a._id} className="glass-panel announcement-card animate-in mb-10">
              {a.imageUrl && <img src={a.imageUrl} alt="Announcement" className="announcement-img" />}
              <p>{a.message}</p>
              <small className="announce-date">{new Date(a.createdAt).toLocaleDateString('ar-EG')}</small>
            </div>
          ))
        ) : (
          <div className="glass-panel announcement-card">
            <p>
              {user?.isAdmin 
                ? "تأكد من مراجعة طلبات السحب المعلقة بانتظام لضمان رضا المستخدمين." 
                : "مرحباً بك في لعبة رضا للاستثمار! ابدأ الآن بلعب عجلة الحظ في قسم الألعاب لربح الكوينات."}
            </p>
          </div>
        )}
      </section>

      <section className="account-section glass-panel">
        <h3>إدارة الحساب</h3>
        <div className="account-actions">
          <button className="btn-secondary btn-full logout-btn" onClick={logout}>
            <span>🚪</span> تسجيل الخروج من التطبيق
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
