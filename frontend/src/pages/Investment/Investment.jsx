import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './Investment.css';

const Investment = () => {
  const { user, fetchUser } = useAuth();
  const [coins, setCoins] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coinRes, invRes] = await Promise.all([
        axios.get('http://localhost:5000/api/coins'),
        axios.get('http://localhost:5000/api/investments/me')
      ]);
      setCoins(coinRes.data);
      setInvestments(invRes.data);
    } catch (err) {
      toast.error("Failed to load investment data");
    }
  };

  const handleBuy = async () => {
    if (!buyAmount || buyAmount <= 0) return toast.error("Enter a valid amount");
    try {
      await axios.post('http://localhost:5000/api/investments/buy', {
        coinId: selectedCoin._id,
        amount: parseFloat(buyAmount)
      });
      toast.success("Investment successful!");
      setSelectedCoin(null);
      setBuyAmount('');
      fetchData();
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    }
  };

  const handleSell = async (invId) => {
    try {
      await axios.post(`http://localhost:5000/api/investments/sell/${invId}`);
      toast.success("Sold successfully!");
      fetchData();
      fetchUser();
    } catch (err) {
      toast.error("Sale failed");
    }
  };

  return (
    <div className="investment-page animate-in">
      <h1 className="page-title">سوق العملات</h1>

      <div className="coins-list">
        {coins.map(coin => (
          <div key={coin._id} className="glass-panel coin-card" onClick={() => setSelectedCoin(coin)}>
            <div className="coin-header">
              <h3>{coin.name} ({coin.symbol})</h3>
              <span className={`risk-badge ${coin.riskLevel.toLowerCase()}`}>
                مستوى المخاطرة: {coin.riskLevel === 'High' ? 'عالي' : coin.riskLevel === 'Medium' ? 'متوسط' : 'منخفض'}
              </span>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={coin.priceHistory}>
                  <Line type="monotone" dataKey="price" stroke={coin.riskLevel === 'High' ? '#ff4d4d' : '#00ff88'} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="coin-footer">
              <span className="current-price">💰 {coin.currentPrice}</span>
              <button className="btn-primary">تداول</button>
            </div>
          </div>
        ))}
      </div>

      <section className="portfolio-section">
        <h3>استثماراتي</h3>
        {investments.length === 0 ? (
          <div className="empty-state">لا توجد استثمارات نشطة حالياً.</div>
        ) : (
          investments.map(inv => (
            <div key={inv._id} className="glass-panel portfolio-card">
              <div className="inv-info">
                <h4>{inv.coin.name}</h4>
                <p>سعر الشراء: {inv.buyPrice}</p>
                <p>المبلغ المستثمر: {inv.amount}</p>
              </div>
              <div className="inv-actions">
                <span className={`p-l ${inv.coin.currentPrice >= inv.buyPrice ? 'positive' : 'negative'}`}>
                  {((inv.coin.currentPrice / inv.buyPrice - 1) * 100).toFixed(2)}%
                </span>
                <button className="btn-sell" onClick={() => handleSell(inv._id)}>بيع</button>
              </div>
            </div>
          ))
        )}
      </section>

      {selectedCoin && (
        <div className="modal-overlay" onClick={() => setSelectedCoin(null)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <h2>استثمار في {selectedCoin.name}</h2>
            <p>السعر الحالي: 💰 {selectedCoin.currentPrice}</p>
            <input 
              type="number" 
              placeholder="المبلغ المراد استثماره" 
              value={buyAmount}
              onChange={e => setBuyAmount(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleBuy}>تأكيد الشراء</button>
              <button className="btn-close" onClick={() => setSelectedCoin(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;
