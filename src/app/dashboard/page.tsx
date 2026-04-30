'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import MarketTicker from '@/components/MarketTicker';
import { Wallet, TrendingUp, Activity, CheckCircle, AlertCircle, Award, Star, Shield, Zap } from 'lucide-react';
import { calculateLevel, getNextLevel, LEVELS } from '@/lib/gamification';

// Simple Custom SVG Line Chart
const GrowthChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min;
  const height = 150;
  const width = 400;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg}>
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${height} L ${points} L ${width} ${height} Z`}
        fill="url(#chartGradient)"
      />
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function DashboardPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, invRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/users/investors')
        ]);
        
        if (meRes.ok && invRes.ok) {
          const meData = await meRes.json();
          const invData = await invRes.json();
          setInvestors(invData);
          setCurrentUser(meData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      setWithdrawStatus('يرجى إدخال مبلغ صحيح');
      return;
    }
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });
      if (res.ok) {
        setWithdrawStatus('تم طلب السحب بنجاح');
        if (currentUser) {
           setCurrentUser({...currentUser, profit: currentUser.profit - Number(withdrawAmount)});
        }
        setTimeout(() => setShowModal(false), 2000);
      } else {
        const data = await res.json();
        setWithdrawStatus(data.error || 'حدث خطأ');
      }
    } catch (err) {
      setWithdrawStatus('حدث خطأ');
    }
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>جاري تحميل لوحة التحكم...</p>
    </div>
  );

  const currentLevel = calculateLevel(currentUser?.loyaltyPoints || 0);
  const nextLevel = getNextLevel(currentUser?.loyaltyPoints || 0);
  const progress = nextLevel 
    ? ((currentUser.loyaltyPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  // Mock data for the growth chart
  const growthData = [0, 10, 25, 20, 45, 60, 80, 75, 100, 120, 150];

  return (
    <div>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.pageTitle}>لوحة التحكم الذكية</h1>
          <p className={styles.welcomeText}>مرحباً، {currentUser?.investorName}. استثماراتك تنمو باستمرار.</p>
        </div>
        
        <div className={styles.levelBadge}>
          <div className={styles.badgeIcon}>
            {currentLevel.name === 'Bronze' && <Shield size={24} />}
            {currentLevel.name === 'Silver' && <Zap size={24} />}
            {currentLevel.name === 'Gold' && <Star size={24} />}
            {currentLevel.name === 'VIP' && <Award size={24} />}
          </div>
          <span className={styles.levelName}>{currentLevel.name}</span>
          <span className={styles.points}>{currentUser?.loyaltyPoints?.toFixed(0)} نقطة ولاء</span>
          {nextLevel && (
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      </div>

      <MarketTicker />

      {currentUser && (
        <div className={styles.statsGrid}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className={styles.iconBoxPrimary}><Wallet size={32} /></div>
            <div>
              <h3 className={styles.statLabel}>إجمالي الاستثمار</h3>
              <p className={styles.statValue}>{currentUser.totalInvestment} <span className={styles.currency}>MAD</span></p>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className={styles.iconBoxSuccess}><TrendingUp size={32} /></div>
            <div>
              <h3 className={styles.statLabel}>الأرباح الحالية</h3>
              <p className={styles.statValueSuccess}>{currentUser.profit} <span className={styles.currency}>MAD</span></p>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className={styles.iconBoxWarning}><Activity size={32} /></div>
            <div>
              <h3 className={styles.statLabel}>حالة الاستثمار</h3>
              <p className={styles.statValue}>{currentUser.profit >= 0 ? 'ربح' : 'خسارة'}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>رسم بياني للنمو</h2>
          <span className={styles.welcomeText}>آخر 30 يوم</span>
        </div>
        <GrowthChart data={growthData} />
      </div>

      <div className={styles.actions}>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.5rem' }} />
          سحب الأرباح / التفاصيل
        </button>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>قائمة المستثمرين</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>المستثمر</th>
                <th>تاريخ الاستثمار</th>
                <th>إجمالي الاستثمار</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((inv) => (
                <tr key={inv.id} className={inv.id === currentUser?.id ? styles.highlightRow : ''}>
                  <td style={{ fontWeight: inv.id === currentUser?.id ? '700' : '500' }}>
                    {inv.investorName} {inv.id === currentUser?.id && '(أنت)'}
                  </td>
                  <td>
                    {inv.id === currentUser?.id 
                      ? (inv.investmentStartDate ? new Date(inv.investmentStartDate).toLocaleDateString('ar-MA') : '-')
                      : 'مخفي'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                    {inv.totalInvestment} MAD
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${inv.status === 'نشط' ? styles.statusActive : ''}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && currentUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: 'var(--primary)' }}>تفاصيل الاستثمار</h2>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>المبلغ:</span>
                <span className={styles.detailValue}>{currentUser.totalInvestment} MAD</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>الأرباح المتاحة:</span>
                <span className={styles.detailValueSuccess}>{currentUser.profit} MAD</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>المستوى الحالي:</span>
                <span className={styles.detailValue} style={{ color: currentLevel.color }}>{currentLevel.name}</span>
              </div>
            </div>
            
            {currentUser.profit > 0 ? (
              <div className={styles.withdrawSection}>
                <h4 style={{ marginBottom: '1rem' }}>سحب الأرباح</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    placeholder="المبلغ (MAD)" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={currentUser.profit}
                    style={{ flexGrow: 1 }}
                  />
                  <button className="btn-success" onClick={handleWithdraw}>
                    تأكيد
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.noProfitAlert}>
                <AlertCircle size={20} />
                <span>لا توجد أرباح حالية للسحب.</span>
              </div>
            )}
            
            {withdrawStatus && (
              <div className={withdrawStatus.includes('بنجاح') ? styles.statusMsgSuccess : styles.statusMsgError}>
                {withdrawStatus}
              </div>
            )}
            
            <button className="btn-danger" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setShowModal(false)}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
