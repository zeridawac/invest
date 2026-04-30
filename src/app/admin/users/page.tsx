'use client';

import { useState, useEffect } from 'react';
import styles from './users.module.css';
import { Pencil, Trash2, Plus, Search, ShieldCheck, Landmark } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '', password: '', investorName: '', investmentStartDate: '',
    totalInvestment: '', status: 'نشط', profit: '',
    bankFullName: '', bankAccountNumber: '', bankName: '', rib: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        username: user.username, password: '', investorName: user.investorName || '',
        investmentStartDate: user.investmentStartDate ? user.investmentStartDate.split('T')[0] : '',
        totalInvestment: user.totalInvestment, status: user.status, profit: user.profit,
        bankFullName: user.bankFullName || '', bankAccountNumber: user.bankAccountNumber || '',
        bankName: user.bankName || '', rib: user.rib || ''
      });
    } else {
      setFormData({
        username: '', password: '', investorName: '', investmentStartDate: '',
        totalInvestment: '', status: 'نشط', profit: '',
        bankFullName: '', bankAccountNumber: '', bankName: '', rib: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingUser;
    try {
      const res = await fetch('/api/users', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...formData, id: editingUser.id } : formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert('حدث خطأ');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.investorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--primary)', fontWeight: '600' }}>
      جاري تحميل المستثمرين...
    </div>
  );

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '2rem', marginBottom: '0.25rem' }}>إدارة المستثمرين</h1>
          <p style={{ color: 'var(--text-muted)' }}>إضافة وتعديل وحذف حسابات المستثمرين.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openModal()}>
          <Plus size={20} />
          إضافة مستثمر
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو اسم المستخدم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.25rem', boxShadow: 'none' }}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>اسم المستثمر</th>
                <th>معلومات الحساب</th>
                <th>إجمالي الاستثمار</th>
                <th>الأرباح</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{u.investorName || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <ShieldCheck size={16} color="var(--primary)" />
                      {u.username}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '600' }}>{u.totalInvestment} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MAD</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '600', color: 'var(--success)' }}>{u.profit} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MAD</span></td>
                  <td>
                    <span style={{ 
                      padding: '0.35rem 0.875rem', 
                      borderRadius: '9999px', 
                      backgroundColor: u.status === 'نشط' ? '#d1fae5' : u.status === 'مكتمل' ? '#dbeafe' : '#fef3c7', 
                      color: u.status === 'نشط' ? '#047857' : u.status === 'مكتمل' ? '#1d4ed8' : '#b45309', 
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => openModal(u)} className={styles.actionBtnEdit} title="تعديل"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} className={styles.actionBtnDelete} title="حذف"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>لا يوجد مستثمرين متطابقين مع البحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? 'تعديل مستثمر' : 'إضافة مستثمر جديد'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>اسم المستخدم (للدخول) *</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>كلمة المرور {editingUser && <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>(اتركه فارغاً لعدم التغيير)</span>}</label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>اسم المستثمر الحقيقي</label>
                <input type="text" value={formData.investorName} onChange={e => setFormData({...formData, investorName: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>تاريخ بدء الاستثمار</label>
                <input type="date" value={formData.investmentStartDate} onChange={e => setFormData({...formData, investmentStartDate: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>إجمالي الاستثمار (MAD)</label>
                <input type="number" value={formData.totalInvestment} onChange={e => setFormData({...formData, totalInvestment: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>إجمالي الأرباح الحالية (MAD)</label>
                <input type="number" value={formData.profit} onChange={e => setFormData({...formData, profit: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>الحالة</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="نشط">نشط</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
              
              <div className={styles.fullWidth}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <Landmark size={18} />
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>المعلومات البنكية (اختياري)</h3>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>اسم البنك</label>
                <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>الاسم الكامل بالحساب</label>
                <input type="text" value={formData.bankFullName} onChange={e => setFormData({...formData, bankFullName: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>رقم الحساب</label>
                <input type="text" value={formData.bankAccountNumber} onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>RIB</label>
                <input type="text" value={formData.rib} onChange={e => setFormData({...formData, rib: e.target.value})} />
              </div>

              <div className={styles.fullWidth} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn-danger" style={{ flex: 1, backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border)', background: 'none', boxShadow: 'none' }} onClick={() => setShowModal(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>حفظ بيانات المستثمر</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
