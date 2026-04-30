'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, Landmark } from 'lucide-react';

export default function BankInfoPage() {
  const [bankInfo, setBankInfo] = useState({
    bankFullName: '',
    bankAccountNumber: '',
    bankName: '',
    rib: ''
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, wRes] = await Promise.all([
          fetch('/api/users/bank'),
          fetch('/api/withdrawals')
        ]);
        
        if (bankRes.ok) {
          const data = await bankRes.json();
          setBankInfo({
            bankFullName: data.bankFullName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankName: data.bankName || '',
            rib: data.rib || ''
          });
        }
        if (wRes.ok) {
          setWithdrawals(await wRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/users/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankInfo),
      });

      if (res.ok) {
        setMessage('تم حفظ المعلومات بنجاح');
      } else {
        const data = await res.json();
        setMessage(data.error || 'حدث خطأ');
      }
    } catch (err) {
      setMessage('حدث خطأ أثناء الاتصال');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--primary)', fontWeight: '600' }}>
      جاري تحميل المعلومات...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '2rem', marginBottom: '0.5rem' }}>معلوماتي البنكية</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>إدارة الحسابات البنكية لاستلام الأرباح.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <Landmark size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>تحديث المعلومات البنكية</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>الاسم الكامل (كما في البنك)</label>
            <input 
              type="text" 
              value={bankInfo.bankFullName} 
              onChange={e => setBankInfo({...bankInfo, bankFullName: e.target.value})} 
              style={{ width: '100%' }}
              placeholder="الاسم الثلاثي..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>اسم البنك</label>
            <input 
              type="text" 
              value={bankInfo.bankName} 
              onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} 
              style={{ width: '100%' }}
              placeholder="مثال: Attijariwafa Bank"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>رقم الحساب</label>
            <input 
              type="text" 
              value={bankInfo.bankAccountNumber} 
              onChange={e => setBankInfo({...bankInfo, bankAccountNumber: e.target.value})} 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>رقم التعريف البنكي (RIB) *</label>
            <input 
              type="text" 
              value={bankInfo.rib} 
              onChange={e => setBankInfo({...bankInfo, rib: e.target.value})} 
              required
              style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '1px' }}
              placeholder="24 رقم..."
            />
          </div>
          
          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: message.includes('بنجاح') ? '#d1fae5' : '#fef2f2',
              color: message.includes('بنجاح') ? '#047857' : '#dc2626', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
          
          <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Save size={20} />
            {saving ? 'جاري الحفظ...' : 'حفظ المعلومات'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Clock size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>تاريخ طلبات السحب</h2>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>المعلومات البنكية المستخدمة</th>
                <th>ملاحظة الإدارة</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id}>
                  <td>{new Date(w.createdAt).toLocaleDateString('ar-MA')}</td>
                  <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>{w.amount} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>MAD</span></td>
                  <td>
                    <span style={{ 
                      padding: '0.35rem 0.875rem', 
                      borderRadius: '9999px', 
                      backgroundColor: w.status === 'قيد الانتظار' ? '#fef3c7' : w.status === 'مرفوض' ? '#fef2f2' : '#d1fae5', 
                      color: w.status === 'قيد الانتظار' ? '#b45309' : w.status === 'مرفوض' ? '#dc2626' : '#047857', 
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{w.bankName}</div>
                      <div>{w.bankFullName}</div>
                      <div style={{ fontFamily: 'monospace' }}>RIB: {w.rib}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {w.adminNote || '-'}
                    </div>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>لا توجد طلبات سحب سابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
