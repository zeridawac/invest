'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './loyalty.module.css';
import { Gift, Coins, RotateCcw, AlertTriangle } from 'lucide-react';

const SECTIONS = [
  { p: 10, color: '#3b82f6' },
  { p: 50, color: '#8b5cf6' },
  { p: 5, color: '#6366f1' },
  { p: 100, color: '#f59e0b' },
  { p: 20, color: '#10b981' },
  { p: 10, color: '#3b82f6' },
  { p: 5, color: '#6366f1' },
  { p: 200, color: '#ec4899' },
];

export default function LoyaltyPointsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        // Fetch full user data from db to get loyalty points
        const fullUserRes = await fetch(`/api/users/me`);
        if (fullUserRes.ok) {
           setUser(await fullUserRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (isSpinning || user.spinsUsedToday >= 2) return;

    setIsSpinning(true);
    setMessage('');

    try {
      const res = await fetch('/api/loyalty/spin', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        const sectionIndex = SECTIONS.findIndex(s => s.p === data.pointsWon);
        // Add multiple full rotations + target section
        const extraDegrees = (360 / SECTIONS.length) * (SECTIONS.length - sectionIndex - 0.5);
        const newRotation = rotation + (360 * 5) + extraDegrees;
        
        setRotation(newRotation);

        setTimeout(() => {
          setIsSpinning(false);
          setUser({
            ...user,
            loyaltyPoints: data.newTotal,
            spinsUsedToday: data.spinsUsedToday,
            lastSpinResult: data.pointsWon
          });
          setMessage(`مبروك! ربحت ${data.pointsWon} نقطة ولاء`);
        }, 4000);
      } else {
        setMessage(data.error || 'حدث خطأ ما');
        setIsSpinning(false);
      }
    } catch (err) {
      setMessage('فشل الاتصال بالخادم');
      setIsSpinning(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const remainingSpins = Math.max(0, 2 - (user?.spinsUsedToday || 0));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>نقط الولاء</h1>
        <p className={styles.subtitle}>العب واربح نقط الولاء الخاصة بك كل يوم!</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Coins className={styles.statIcon} size={32} />
          <span className={styles.statValue}>{user?.loyaltyPoints || 0}</span>
          <span className={styles.statLabel}>إجمالي النقط</span>
        </div>
        <div className={styles.statCard}>
          <RotateCcw className={styles.statIcon} size={32} />
          <span className={styles.statValue}>{remainingSpins}</span>
          <span className={styles.statLabel}>المحاولات المتبقية اليوم</span>
        </div>
        <div className={styles.statCard}>
          <Gift className={styles.statIcon} size={32} />
          <span className={styles.statValue}>{user?.lastSpinResult || 0}</span>
          <span className={styles.statLabel}>آخر نتيجة</span>
        </div>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.wheelContainer}>
          <div className={styles.pointer}></div>
          <div 
            className={styles.wheel} 
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {SECTIONS.map((section, i) => (
              <div 
                key={i}
                style={{
                  position: 'absolute',
                  width: '50%',
                  height: '50%',
                  backgroundColor: section.color,
                  transformOrigin: '100% 100%',
                  transform: `rotate(${(360 / SECTIONS.length) * i}deg) skewY(-${90 - (360 / SECTIONS.length)}deg)`,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <span style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '40px',
                  transform: `skewY(${90 - (360 / SECTIONS.length)}deg) rotate(${(360 / SECTIONS.length) / 2}deg)`,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {section.p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {remainingSpins > 0 ? (
          <button 
            className={styles.spinButton} 
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? 'جاري السحب...' : 'إضغط للبدء'}
          </button>
        ) : (
          <div className={`${styles.message} ${styles.messageWarning}`}>
            <AlertTriangle size={20} style={{ marginBottom: '0.5rem' }} />
            <p>لقد استعملت محاولاتك اليومية. عد غداً للمزيد.</p>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${styles.messageSuccess}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
