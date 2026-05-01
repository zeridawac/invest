import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import { toast } from 'react-toastify';
import './Riddles.css';

const Riddles = () => {
  const [riddles, setRiddles] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiddles();
  }, []);

  const fetchRiddles = async () => {
    try {
      const res = await api.get('/games/riddles');
      setRiddles(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("فشل تحميل الألغاز");
      setLoading(false);
    }
  };

  const handleSolve = async (riddleId) => {
    const answer = answers[riddleId];
    if (!answer) return toast.warn("يرجى إدخال الإجابة");

    try {
      const res = await api.post('/games/riddles/solve', { riddleId, answer });
      if (res.data.success) {
        toast.success(`أحسنت! ربحت ${res.data.reward} كوين`);
        fetchRiddles(); // Refresh to remove solved riddle
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ ما");
    }
  };

  return (
    <div className="riddles-page animate-in">
      <h1>قسم الألغاز 🧩</h1>
      <p className="riddles-subtitle">أجب على الألغاز لتربح نقاط إضافية!</p>

      {loading ? (
        <div className="loader">جاري التحميل...</div>
      ) : riddles.length > 0 ? (
        <div className="riddles-list">
          {riddles.map(r => (
            <div key={r._id} className="glass-panel riddle-card animate-in">
              <div className="riddle-header">
                <span className="reward-tag">🎁 {r.rewardPoints} كوين</span>
              </div>
              <p className="question">{r.question}</p>
              <div className="solve-box">
                <input 
                  type="text" 
                  placeholder="اكتب إجابتك هنا..." 
                  value={answers[r._id] || ''}
                  onChange={e => setAnswers({...answers, [r._id]: e.target.value})}
                />
                <button className="btn-primary" onClick={() => handleSolve(r._id)}>إرسال</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-riddles glass-panel">
          <p>لا توجد ألغاز جديدة حالياً. انتظر الأدمن ليضيف لغزاً جديداً!</p>
        </div>
      )}
    </div>
  );
};

export default Riddles;
