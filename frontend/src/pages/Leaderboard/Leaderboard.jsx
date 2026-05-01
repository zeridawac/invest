import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/users/leaderboard');
      setUsers(res.data);
    } catch (err) {
      console.error("Leaderboard fetch failed");
    }
  };

  return (
    <div className="leaderboard-page animate-in">
      <h1>قائمة المتصدرين</h1>
      <div className="glass-panel leaderboard-list">
        {users.map((u, index) => (
          <div key={u._id} className={`leader-item ${index < 3 ? 'top-three' : ''}`}>
            <span className="rank">#{index + 1}</span>
            <span className="username">{u.username.substring(0, 2)}***</span>
            <span className="points">💰 {(u.points || 0).toLocaleString()} كوين</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
