import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../api/config';
import { useAuth } from '../../../context/AuthContext';

const Predictor = () => {
  const { fetchUser } = useAuth();
  const [bet, setBet] = useState(10);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [result, setResult] = useState(null);

  const handlePredict = async (pred) => {
    if (loading) return;
    setLoading(true);
    setPrediction(pred);
    setCountdown(3);
    setResult(null);

    // Small delay for tension
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(async () => {
      try {
        const res = await api.post('/games/predict', { bet, prediction: pred });
        setResult(res.data.result);
        if (res.data.won) {
          toast.success(`Correct! You won ${bet} points!`);
        } else {
          toast.error(`Wrong! Better luck next time.`);
        }
        fetchUser();
      } catch (err) {
        toast.error(err.response?.data?.message || "Error");
      } finally {
        setLoading(false);
      }
    }, 3000);
  };

  return (
    <div className="game-card predictor-game glass-panel">
      <h3>متوقع السوق</h3>
      <p className="game-desc">هل سيرتفع السعر أم ينخفض في 3 ثواني؟</p>
      
      <div className="bet-controls">
        <button onClick={() => setBet(Math.max(10, bet - 10))}>-</button>
        <span>الرهان: {bet} كوين</span>
        <button onClick={() => setBet(bet + 10)}>+</button>
      </div>

      <div className="prediction-buttons">
        <button 
          className={`btn-up ${prediction === 'up' ? 'active' : ''}`} 
          onClick={() => handlePredict('up')}
          disabled={loading}
        >
          ▲ صعود
        </button>
        <button 
          className={`btn-down ${prediction === 'down' ? 'active' : ''}`} 
          onClick={() => handlePredict('down')}
          disabled={loading}
        >
          ▼ هبوط
        </button>
      </div>

      {loading && (
        <div className="game-overlay">
          <div className="countdown">{countdown}</div>
        </div>
      )}

      {result && !loading && (
        <div className={`game-result ${result}`}>
          النتيجة: {result === 'up' ? 'صعود' : 'هبوط'}
        </div>
      )}
    </div>
  );
};

export default Predictor;
