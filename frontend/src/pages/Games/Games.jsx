import React, { useState } from 'react';
import api from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import Predictor from './components/Predictor';
import ScratchCard from './components/ScratchCard';
import './Games.css';

const Games = () => {
  const { user, fetchUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [tapping, setTapping] = useState(false);

  const handleSpin = async () => {
    if (spinning) return;
    try {
      const res = await api.post('/games/spin');
      const { reward } = res.data;
      setSpinning(true);
      const newRotation = rotation + 1800 + Math.random() * 360;
      setRotation(newRotation);
      setTimeout(() => {
        setSpinning(false);
        if (reward > 0) {
          toast.success(`You won 💰 ${reward} points!`);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } else {
          toast.info("Better luck next time!");
        }
        fetchUser();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error spinning wheel");
    }
  };

  const handleTap = async () => {
    if (tapping) return;
    setTapping(true);
    try {
      const res = await api.post('/games/tap');
      toast.success(`+${res.data.reward} points!`, { autoClose: 500, hideProgressBar: true });
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cooldown...");
    } finally {
      setTimeout(() => setTapping(false), 500);
    }
  };

  return (
    <div className="games-page animate-in">
      <header className="games-header">
        <h1 className="page-title">مركز الألعاب</h1>
        <div className="user-balance glass-panel">
          <span>نقاطك:</span>
          <strong>💰 {user?.points || 0} كوين</strong>
        </div>
      </header>

      <div className="games-grid">
        {/* Spin Wheel */}
        <section className="game-card wheel-game glass-panel">
          <h3>عجلة الحظ</h3>
          <div className="wheel-container">
            <div className="wheel-pointer">▼</div>
            <div className={`wheel ${spinning ? 'spinning' : ''}`} style={{ transform: `rotate(${rotation}deg)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="wheel-segment" style={{ transform: `rotate(${i * 45}deg)` }}>
                  <span>{[10, 20, 50, 100, 200, 500, 0, 0][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="spin-info">
            <p>المحاولات المتبقية: {2 - (user?.spinCount || 0)}</p>
            <button className="btn-primary spin-btn" onClick={handleSpin} disabled={spinning || (user?.spinCount >= 2)}>
              {spinning ? 'جاري التدوير...' : 'دوران العجلة'}
            </button>
          </div>
        </section>

        {/* Miner Game */}
        <section className="game-card miner-game glass-panel">
          <h3>منجم الكوينات</h3>
          <p className="game-desc">إضغط على الجوهرة لجمع النقاط!</p>
          <div className={`mine-btn ${tapping ? 'tapping' : ''}`} onClick={handleTap}>
            💎
          </div>
          <p className="cooldown-text">انتظار 5 ثواني</p>
        </section>

        {/* Market Predictor */}
        <Predictor />

        {/* Scratch Card */}
        <ScratchCard />

        {/* Riddles Puzzle */}
        <section className="game-card riddle-game glass-panel" onClick={() => window.location.href = '/riddles'}>
          <h3>حل الألغاز 🧩</h3>
          <p className="game-desc">أجب على الألغاز اليومية واربح جوائز قيمة!</p>
          <div className="riddle-icon">❓</div>
          <button className="btn-primary mt-15">ادخل الآن</button>
        </section>
      </div>

      <section className="missions-section">
        <h3>الإنجازات</h3>
        <div className="missions-grid">
          <div className="glass-panel mission-card completed">
            <div className="mission-info">
              <h4>مكافأة الانضمام</h4>
              <p>لقد حصلت على 1000 كوين كهدية ترحيبية!</p>
            </div>
            <div className="mission-status">تم الاستلام</div>
          </div>
          <div className="glass-panel mission-card locked">
            <div className="mission-info">
              <h4>المستثمر الكبير</h4>
              <p>صل إلى 10,000 كوين لفتح هذا الإنجاز.</p>
            </div>
            <div className="mission-status">مقفل</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;
