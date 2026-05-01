import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

const Admin = () => {
  const [coins, setCoins] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', rewardPoints: 100, maxUses: 1 });
  const [newInvite, setNewInvite] = useState('');

  const [settings, setSettings] = useState({ value: 0.0001 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ message: '', imageUrl: '' });
  const [riddles, setRiddles] = useState([]);
  const [newRiddle, setNewRiddle] = useState({ question: '', answer: '', rewardPoints: 50 });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [coinRes, userRes, inviteRes, withdrawRes, couponRes, settingsRes, announceRes, riddleRes] = await Promise.all([
        axios.get('http://localhost:5000/api/coins'),
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/invite-codes'),
        axios.get('http://localhost:5000/api/withdrawals/admin'),
        axios.get('http://localhost:5000/api/admin/coupons'),
        axios.get('http://localhost:5000/api/admin/settings'),
        axios.get('http://localhost:5000/api/admin/announcements'),
        axios.get('http://localhost:5000/api/admin/riddles')
      ]);
      setCoins(coinRes.data);
      setUsers(userRes.data);
      setInviteCodes(inviteRes.data);
      setWithdrawals(withdrawRes.data);
      setCoupons(couponRes.data);
      setSettings(settingsRes.data);
      setAnnouncements(announceRes.data);
      setRiddles(riddleRes.data);
    } catch (err) {
      toast.error("فشل تحميل البيانات");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.message) return;
    try {
      await axios.post('http://localhost:5000/api/admin/announcements', newAnnouncement);
      toast.success("تم نشر الإعلان");
      setNewAnnouncement({ message: '', imageUrl: '' });
      fetchAdminData();
    } catch (err) { toast.error("فشل النشر"); }
  };

  const handleCreateRiddle = async () => {
    if (!newRiddle.question || !newRiddle.answer) return;
    try {
      await axios.post('http://localhost:5000/api/admin/riddles', newRiddle);
      toast.success("تم إضافة اللغز");
      setNewRiddle({ question: '', answer: '', rewardPoints: 50 });
      fetchAdminData();
    } catch (err) { toast.error("فشل الإضافة"); }
  };

  const updateSettings = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/settings', { coinRate: settings.value });
      toast.success("تم تحديث سعر الكوين");
    } catch (err) { toast.error("فشل التحديث"); }
  };

  const handleUserAction = async (id, action, data = {}) => {
    try {
      if (action === 'ban') await axios.post(`http://localhost:5000/api/admin/users/${id}/ban`);
      if (action === 'delete') {
        if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      }
      if (action === 'reset') await axios.patch(`http://localhost:5000/api/admin/users/${id}`, { points: 0, xp: 0 });
      if (action === 'update') await axios.patch(`http://localhost:5000/api/admin/users/${id}`, data);
      
      toast.success("تمت العملية بنجاح");
      fetchAdminData();
      setSelectedUser(null);
    } catch (err) { toast.error("فشل العملية"); }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code) return;
    try {
      await axios.post('http://localhost:5000/api/admin/coupons', newCoupon);
      toast.success("تم إنشاء الكوبون");
      setNewCoupon({ code: '', rewardPoints: 100, maxUses: 1 });
      fetchAdminData();
    } catch (err) { toast.error("فشل إنشاء الكوبون"); }
  };

  const handleWithdrawalStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/withdrawals/admin/${id}`, { status });
      toast.success("تم تحديث الحالة");
      fetchAdminData();
    } catch (err) { toast.error("فشل التحديث"); }
  };

  const createInvite = async () => {
    if (!newInvite) return;
    try {
      await axios.post('http://localhost:5000/api/admin/invite-codes', { code: newInvite });
      toast.success("تم إنشاء كود الدعوة");
      setNewInvite('');
      fetchAdminData();
    } catch (err) { toast.error("فشل إنشاء الكود"); }
  };

  const pumpPrice = async (id, currentPrice) => {
    const newPrice = currentPrice * 1.1;
    try {
      await axios.post(`http://localhost:5000/api/admin/coins/${id}/price`, { newPrice });
      toast.success("تم الرفع بـ 10%!");
      fetchAdminData();
    } catch (err) { toast.error("فشل العملية"); }
  };

  const dumpPrice = async (id, currentPrice) => {
    const newPrice = currentPrice * 0.9;
    try {
      await axios.post(`http://localhost:5000/api/admin/coins/${id}/price`, { newPrice });
      toast.error("تم الخفض بـ 10%!");
      fetchAdminData();
    } catch (err) { toast.error("فشل العملية"); }
  };

  return (
    <div className="admin-page animate-in">
      <h1>لوحة التحكم</h1>

      <section className="admin-section glass-panel">
        <h3>إعدادات النظام</h3>
        <div className="flex-row settings-admin">
          <div className="input-group">
            <label>سعر الكوين مقابل الدولار ($)</label>
            <input 
              type="number" 
              step="0.00001"
              value={settings.value}
              onChange={e => setSettings({...settings, value: Number(e.target.value)})}
            />
          </div>
          <button className="btn-primary" onClick={updateSettings}>حفظ الإعدادات</button>
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>إدارة السحوبات</h3>
        <div className="withdrawals-list">
          {withdrawals.filter(w => w.status === 'pending').map(w => (
            <div key={w._id} className="withdrawal-admin-item">
              <div className="w-info">
                <strong>{w.user?.username}</strong>
                <p>{w.points} كوين ($ {w.amountUSD})</p>
                <div className="bank-info-box">
                  <small>البنك: {w.bankDetails.bankName}</small>
                  <small>الحساب: {w.bankDetails.accountNumber}</small>
                  <small>الاسم: {w.bankDetails.fullName}</small>
                </div>
              </div>
              <div className="w-actions">
                <button className="btn-success" onClick={() => handleWithdrawalStatus(w._id, 'completed')}>تأكيد الدفع</button>
                <button className="btn-danger" onClick={() => handleWithdrawalStatus(w._id, 'rejected')}>رفض</button>
              </div>
            </div>
          ))}
          {withdrawals.filter(w => w.status === 'pending').length === 0 && <p>لا توجد طلبات معلقة</p>}
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>إنشاء كود دعوة</h3>
        <div className="flex-row">
          <input 
            type="text" 
            placeholder="كود الدعوة" 
            value={newInvite}
            onChange={e => setNewInvite(e.target.value)}
          />
          <button className="btn-primary" onClick={createInvite}>إنشاء</button>
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>التحكم في السوق</h3>
        <div className="coins-admin">
          {coins.map(coin => (
            <div key={coin._id} className="coin-admin-item">
              <span>{coin.name} ({coin.currentPrice})</span>
              <div className="admin-btns">
                <button className="btn-pump" onClick={() => pumpPrice(coin._id, coin.currentPrice)}>رفع (PUMP)</button>
                <button className="btn-dump" onClick={() => dumpPrice(coin._id, coin.currentPrice)}>خفض (DUMP)</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>إدارة المستخدمين</h3>
        <div className="users-list-admin">
          {users.map(u => (
            <div key={u._id} className="user-card-admin">
              <div className="user-main-info" onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}>
                <div className="u-info-left">
                  <strong>{u.username}</strong>
                  <span>💰 {u.points}</span>
                </div>
                <span className={`status-dot ${u.isBan ? 'banned' : 'active'}`}></span>
              </div>
              
              {selectedUser?._id === u._id && (
                <div className="user-details-edit animate-in">
                  <div className="edit-grid">
                    <div className="input-group">
                      <label>النقاط</label>
                      <input type="number" defaultValue={u.points} onBlur={(e) => handleUserAction(u._id, 'update', { points: Number(e.target.value) })} />
                    </div>
                    <div className="input-group">
                      <label>XP</label>
                      <input type="number" defaultValue={u.xp} onBlur={(e) => handleUserAction(u._id, 'update', { xp: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="admin-user-btns">
                    <button className={u.isBan ? 'btn-unban' : 'btn-ban'} onClick={() => handleUserAction(u._id, 'ban')}>
                      {u.isBan ? 'فك الحظر' : 'حظر المستخدم'}
                    </button>
                    <button className="btn-reset" onClick={() => handleUserAction(u._id, 'reset')}>تصفير الحساب</button>
                    <button className="btn-danger-small" onClick={() => handleUserAction(u._id, 'delete')}>حذف الحساب</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>نشر إعلان جديد</h3>
        <div className="flex-column gap-10">
          <textarea 
            placeholder="نص الإعلان..." 
            value={newAnnouncement.message}
            onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="رابط الصورة (اختياري)" 
            value={newAnnouncement.imageUrl}
            onChange={e => setNewAnnouncement({...newAnnouncement, imageUrl: e.target.value})}
          />
          <button className="btn-primary" onClick={handleCreateAnnouncement}>نشر الإعلان</button>
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>إدارة الألغاز (Riddles)</h3>
        <div className="flex-column gap-10">
          <input 
            type="text" 
            placeholder="السؤال / اللغز" 
            value={newRiddle.question}
            onChange={e => setNewRiddle({...newRiddle, question: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="الإجابة الصحيحة" 
            value={newRiddle.answer}
            onChange={e => setNewRiddle({...newRiddle, answer: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="نقاط المكافأة" 
            value={newRiddle.rewardPoints}
            onChange={e => setNewRiddle({...newRiddle, rewardPoints: Number(e.target.value)})}
          />
          <button className="btn-primary" onClick={handleCreateRiddle}>إضافة لغز</button>
        </div>
        <div className="riddles-list-admin mt-15">
          {riddles.map(r => (
            <div key={r._id} className="riddle-item-admin">
              <span><strong>{r.question}</strong></span>
              <span>الإجابة: {r.answer} ({r.rewardPoints} كوين)</span>
              <span>حلّه: {r.solvedBy.length} مستخدم</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section glass-panel">
        <h3>إدارة الكوبونات</h3>
        <div className="coupon-admin-inputs">
          <input 
            type="text" 
            placeholder="كود الكوبون" 
            value={newCoupon.code}
            onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
          />
          <input 
            type="number" 
            placeholder="النقاط" 
            value={newCoupon.rewardPoints}
            onChange={e => setNewCoupon({...newCoupon, rewardPoints: Number(e.target.value)})}
          />
          <input 
            type="number" 
            placeholder="عدد المرات" 
            value={newCoupon.maxUses}
            onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
          />
          <button className="btn-primary" onClick={handleCreateCoupon}>إنشاء كوبون</button>
        </div>
        <div className="coupons-list-admin">
          {coupons.map(c => (
            <div key={c._id} className="coupon-item-admin">
              <span><strong>{c.code}</strong> ({c.rewardPoints} كوين) - استعمله {c.usedBy.length}/{c.maxUses}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;
