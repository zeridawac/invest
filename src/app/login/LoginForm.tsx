'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginCard} onSubmit={handleLogin}>
      <h1 className={styles.title}>REDA INVESTISMENT V2</h1>
      <p className={styles.subtitle}>تسجيل الدخول لحسابك</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label>اسم المستخدم</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
        {loading ? 'جاري التحميل...' : 'دخول'}
      </button>
    </form>
  );
}
