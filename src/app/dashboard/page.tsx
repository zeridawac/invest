'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import MarketTicker from '@/components/MarketTicker';
import { Wallet, TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';

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
          fetch('/api/auth/me'),
          fetch('/api/users/investors')
        ]);
        
        if (meRes.ok && invRes.ok) {
          const meData = await meRes.json();
          const invData = await invRes.json();
          setInvestors(invData);
          setCurrentUser(invData.find((i: any) => i.id === meData.id));
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
           setInvestors(investors.map(inv => inv.id === currentUser.id ? {...inv, profit: inv.profit - Number(withdrawAmount)} : inv));
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

  return (
    <div>
      <div className={styles.headerArea}>
        <h1 className={styles.pageTitle}>لوحة تحكم المستثمر</h1>
        <p className={styles.welcomeText}>مرحباً بك مجدداً، استثماراتك في أمان.</p>
      </div>

      {/* Market Ticker Component Added Here */}
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
              <h3 className={styles.statLabel}>الحالة</h3>
              <p className={styles.statValue}>{currentUser.status}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.5rem' }} />
          تحقق من استثماري / سحب الأرباح
        </button>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>قائمة المستثمرين</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>اسم المستثمر</th>
                <th>تاريخ الاستثمار</th>
                <th>إجمالي الاستثمار</th>
                <th>الأرباح</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((inv) => (
                <tr key={inv.id} className={inv.id === currentUser?.id ? styles.highlightRow : ''}>
                  <td style={{ fontWeight: inv.id === currentUser?.id ? '700' : '500' }}>
                    {inv.id === currentUser?.id ? `${inv.investorName} (أنت)` : inv.investorName}
                  </td>
                  <td>
                    {inv.id === currentUser?.id 
                      ? (inv.investmentStartDate ? new Date(inv.investmentStartDate).toLocaleDateString('ar-MA') : '-')
                      : 'مخفي'}
                  </td>
                  <td className={styles.priceCell}>{inv.totalInvestment} MAD</td>
                  <td className={styles.priceCellSuccess}>{inv.profit} MAD</td>
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
                <span className={styles.detailLabel}>مبلغ الاستثمار:</span>
                <span className={styles.detailValue}>{currentUser.totalInvestment} MAD</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>حالة الاستثمار:</span>
                <span className={styles.detailValue}>{currentUser.status}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>مبلغ الأرباح المتاح:</span>
                <span className={styles.detailValueSuccess}>{currentUser.profit} MAD</span>
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
                    تأكيد السحب
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.noProfitAlert}>
                <AlertCircle size={20} />
                <span>لا توجد أرباح متاحة للسحب حالياً.</span>
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
