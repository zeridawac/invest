'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) setWithdrawals(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const openModal = (w: any) => {
    setSelectedWithdrawal(w);
    setStatus(w.status);
    setAdminNote(w.adminNote || '');
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWithdrawal.id, status, adminNote }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchWithdrawals();
      } else {
        alert('حدث خطأ');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--primary)', fontWeight: '600' }}>
      جاري تحميل الطلبات...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '2rem', marginBottom: '0.25rem' }}>إدارة طلبات السحب</h1>
        <p style={{ color: 'var(--text-muted)' }}>معالجة وتحديث حالات طلبات السحب للمستثمرين.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <CreditCard size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>سجل الطلبات</h2>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم المستثمر</th>
                <th>المبلغ</th>
                <th>البنك (RIB)</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id}>
                  <td>{new Date(w.createdAt).toLocaleDateString('ar-MA')}</td>
                  <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{w.user?.investorName || w.user?.username}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: '800', fontFamily: 'monospace', fontSize: '1.1rem' }}>{w.amount} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MAD</span></td>
                  <td>
                    <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{w.bankName}</span><br/>
                      <span style={{ color: 'var(--text-muted)' }}>{w.bankFullName}</span><br/>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{w.rib}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.35rem 0.875rem', borderRadius: '9999px', 
                      backgroundColor: w.status === 'قيد الانتظار' ? '#fef3c7' : w.status === 'مرفوض' ? '#fef2f2' : '#d1fae5', 
                      color: w.status === 'قيد الانتظار' ? '#b45309' : w.status === 'مرفوض' ? '#dc2626' : '#047857', 
                      fontSize: '0.75rem', fontWeight: '700'
                    }}>
                      {w.status === 'قيد الانتظار' && <Clock size={12} />}
                      {w.status === 'تم الدفع' && <CheckCircle size={12} />}
                      {w.status === 'مرفوض' && <XCircle size={12} />}
                      {w.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }} onClick={() => openModal(w)}>
                      معالجة
                    </button>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>لا توجد طلبات سحب حالية</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ 
            background: 'white', padding: '2.5rem', borderRadius: '20px', 
            width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>معالجة طلب السحب</h2>
            
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>المستثمر:</span>
                <span style={{ fontWeight: '700' }}>{selectedWithdrawal.user?.investorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>المبلغ:</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem' }}>{selectedWithdrawal.amount} MAD</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border)', margin: '0.75rem 0' }}></div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>البنك:</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.bankName}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>الاسم بالحساب:</span>
                <span style={{ fontWeight: '600' }}>{selectedWithdrawal.bankFullName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>RIB:</span>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>{selectedWithdrawal.rib}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>تحديث الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}>
                <option value="قيد الانتظار">قيد الانتظار</option>
                <option value="تم الدفع">تم الدفع</option>
                <option value="مرفوض">مرفوض</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>ملاحظة للإدارة (تظهر للمستثمر)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px' }} placeholder="اكتب ملاحظة توضيحية هنا..."></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-danger" style={{ flex: 1, backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border)', background: 'none', boxShadow: 'none' }} onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleUpdate}>حفظ التحديثات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
