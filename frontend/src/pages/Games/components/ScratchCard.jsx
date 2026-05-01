import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import confetti from 'canvas-confetti';

const ScratchCard = () => {
  const { fetchUser } = useAuth();
  const [scratched, setScratched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(null);

  const handleScratch = async () => {
    if (loading || scratched) return;
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/games/scratch');
      setReward(res.data.reward);
      setScratched(true);
      
      if (res.data.reward > 0) {
        toast.success(`You revealed ${res.data.reward} points!`);
        confetti({
          particleCount: 100,
          spread: 50,
          origin: { y: 0.8 }
        });
      } else {
        toast.info("Try another card!");
      }
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScratched(false);
    setReward(null);
  };

  return (
    <div className="game-card scratch-game glass-panel">
      <h3>إمسح واربح</h3>
      <p className="game-desc">التكلفة: 50 كوين</p>
      
      <div className={`scratch-area ${scratched ? 'scratched' : ''}`} onClick={handleScratch}>
        {scratched ? (
          <div className="reward-reveal">
            {reward > 0 ? `💰 ${reward}` : '❌'}
          </div>
        ) : (
          <div className="scratch-cover">
            {loading ? 'جاري المسح...' : 'إضغط للمسح'}
          </div>
        )}
      </div>

      {scratched && (
        <button className="btn-secondary" onClick={reset}>حاول مرة أخرى</button>
      )}
    </div>
  );
};

export default ScratchCard;
