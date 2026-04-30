'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, CreditCard } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, pendingWithdrawals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, withdrawalsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/withdrawals')
        ]);
        
        if (usersRes.ok && withdrawalsRes.ok) {
          const users = await usersRes.json();
          const withdrawals = await withdrawalsRes.json();
          setStats({
            users: users.length,
            pendingWithdrawals: withdrawals.filter((w: any) => w.status === 'قيد الانتظار').length
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary)', fontWeight: '800' }}>نظرة عامة على النظام</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link href="/admin/users" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', borderRadius: '12px' }}>
            <Users size={40} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-muted)' }}>إجمالي المستثمرين</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.users}</p>
          </div>
        </Link>
        
        <Link href="/admin/withdrawals" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: 'var(--warning)', borderRadius: '12px' }}>
            <CreditCard size={40} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-muted)' }}>طلبات سحب قيد الانتظار</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)' }}>{stats.pendingWithdrawals}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
