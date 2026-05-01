import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Investment.css';

const Investment = () => {
  const { user, fetchUser } = useAuth();
  const [coins, setCoins] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [coinRes, invRes] = await Promise.all([
        api.get('/coins'),
        api.get('/investments/me')
      ]);
      setCoins(coinRes.data);
      setMyInvestments(invRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuy = async (coinId, amount) => {
    try {
      await api.post('/investments/buy', {
        coinId,
        amount: Number(amount)
      });
      toast.success("تمت عملية الشراء بنجاح!");
      fetchUser();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشلت عملية الشراء");
    }
  };

  const handleSell = async (invId) => {
    try {
      await api.post(`/investments/sell/${invId}`);
      toast.success("تم بيع الاستثمار بنجاح!");
      fetchUser();
      fetchData();
    } catch (err) {
      toast.error("فشلت عملية البيع");
    }
  };

  return (
    <div className="investment-page animate-in">
      <header className="page-header">
        <h1>سوق الاستثمار</h1>
        <div className="user-balance glass-panel">
          <span>رصيدك:</span>
          <strong>💰 {user?.points.toLocaleString()} كوين</strong>
        </div>
      </header>

      <div className="investment-grid">
        <section className="market-section glass-panel">
          <h3>العملات المتاحة</h3>
          <div className="coins-list">
            {coins.map(coin => (
              <div key={coin._id} className="coin-card">
                <div className="coin-info">
                  <span className="coin-name">{coin.name}</span>
                  <span className="coin-price">{coin.currentPrice.toFixed(4)} $</span>
                </div>
                <div className="buy-actions">
                  <input type="number" placeholder="الكمية" id={`buy-${coin._id}`} />
                  <button onClick={() => {
                    const amount = document.getElementById(`buy-${coin._id}`).value;
                    handleBuy(coin._id, amount);
                  }}>شراء</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-investments glass-panel">
          <h3>استثماراتي</h3>
          <div className="investments-list">
            {myInvestments.length > 0 ? myInvestments.map(inv => (
              <div key={inv._id} className="investment-card">
                <div className="inv-header">
                  <strong>{inv.coin.name}</strong>
                  <span className={inv.currentProfit >= 0 ? 'profit' : 'loss'}>
                    {inv.currentProfit >= 0 ? '+' : ''}{inv.currentProfit.toFixed(2)}%
                  </span>
                </div>
                <div className="inv-details">
                  <p>الكمية: {inv.amount}</p>
                  <p>سعر الدخول: {inv.buyPrice.toFixed(4)}</p>
                </div>
                <button className="sell-btn" onClick={() => handleSell(inv._id)}>بيع الآن</button>
              </div>
            )) : <p className="no-data">ليس لديك استثمارات حالياً</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Investment;
