import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Withdrawal.css';

const Withdrawal = () => {
  const { user, fetchUser } = useAuth();
  const [points, setPoints] = useState(100);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    fullName: ''
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isEditingBank, setIsEditingBank] = useState(false);

  useEffect(() => {
    fetchHistory();
    if (user?.bankDetails?.bankName) {
      setBankDetails(user.bankDetails);
      setIsEditingBank(false);
    } else {
      setIsEditingBank(true);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/withdrawals/my');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.points < points) return toast.error("ليس لديك رصيد كافٍ");
    if (points < 100) return toast.error("الحد الأدنى للسحب هو 100 كوين");
    
    if (isEditingBank && (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.fullName)) {
      return toast.error("يرجى ملء جميع معلومات البنك");
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/withdrawals', { points, bankDetails });
      toast.success("تم إرسال طلب السحب بنجاح");
      fetchUser();
      fetchHistory();
      setIsEditingBank(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "فشل إرسال الطلب. تأكد من الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdrawal-page animate-in">
      <h1 className="page-title">سحب الأرباح</h1>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <span>رصيدك الحالي</span>
          <strong>💰 {user?.points || 0} كوين</strong>
        </div>
        <div className="glass-panel stat-card">
          <span>القيمة بالدولار</span>
          <strong className="usd-value">$ {(user?.points * 0.0001).toFixed(4)}</strong>
        </div>
      </div>

      <section className="withdrawal-form glass-panel">
        <h3>طلب سحب جديد</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>عدد الكوينات للسحب (1 كوين = 0.0001$)</label>
            <input 
              type="number" 
              value={points} 
              onChange={e => setPoints(Number(e.target.value))}
              min="100"
              required
            />
            <p className="preview-amount">ستحصل على: $ {(points * 0.0001).toFixed(4)}</p>
          </div>

          <div className="bank-details-section">
            <div className="section-header">
              <h4>معلومات الحساب البنكي</h4>
              {user?.bankDetails?.bankName && (
                <button type="button" className="btn-text" onClick={() => setIsEditingBank(!isEditingBank)}>
                  {isEditingBank ? "إلغاء التعديل" : "تعديل الحساب"}
                </button>
              )}
            </div>

            {isEditingBank ? (
              <div className="bank-inputs">
                <input 
                  type="text" 
                  placeholder="اسم البنك" 
                  value={bankDetails.bankName}
                  onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="رقم الحساب (RIB)" 
                  value={bankDetails.accountNumber}
                  onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="الاسم الكامل" 
                  value={bankDetails.fullName}
                  onChange={e => setBankDetails({...bankDetails, fullName: e.target.value})}
                  required
                />
              </div>
            ) : (
              <div className="saved-bank-info">
                <p><strong>البنك:</strong> {user?.bankDetails?.bankName}</p>
                <p><strong>الحساب:</strong> {user?.bankDetails?.accountNumber}</p>
                <p><strong>الاسم:</strong> {user?.bankDetails?.fullName}</p>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "جاري الإرسال..." : "تأكيد طلب السحب"}
          </button>
        </form>
      </section>

      <section className="withdrawal-history">
        <h3>سجل السحوبات</h3>
        <div className="history-list">
          {history.length === 0 ? <p>لا توجد سحوبات سابقة</p> : history.map(item => (
            <div key={item._id} className="glass-panel history-item">
              <div className="item-info">
                <strong>{item.points} كوين ($ {item.amountUSD.toFixed(4)})</strong>
                <span>{new Date(item.createdAt).toLocaleDateString('ar-MA')}</span>
              </div>
              <div className={`status ${item.status}`}>
                {item.status === 'pending' ? 'قيد الانتظار' : 
                 item.status === 'completed' ? 'تم الدفع' : 'مرفوض'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Withdrawal;
