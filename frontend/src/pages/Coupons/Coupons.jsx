import React, { useState } from 'react';
import api from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Coupons.css';

const Coupons = () => {
  const { fetchUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const res = await api.post('/coupons/redeem', { code });
      toast.success(`تم استبدال الكوبون بنجاح! حصلت على ${res.data.rewardPoints} نقطة`);
      setCode('');
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل في تفعيل الكوبون");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupons-page animate-in">
      <h1 className="page-title">كوبونات الهدايا</h1>
      
      <div className="glass-panel coupon-card">
        <div className="gift-icon">🎁</div>
        <h3>أدخل كود الهدية</h3>
        <p>استخدم الكوبونات التي حصلت عليها لزيادة رصيدك من الكوينات مجاناً!</p>
        
        <form onSubmit={handleRedeem} className="coupon-form">
          <input 
            type="text" 
            placeholder="مثال: GIFT2026" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "جاري التحقق..." : "تفعيل الكوبون"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Coupons;
