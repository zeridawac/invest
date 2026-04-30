'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Home, Landmark, Users, CreditCard } from 'lucide-react';
import styles from './sidebar.module.css';

export default function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.brand}>REDA INVESTISMENT V2</h2>
        <p className={styles.role}>{isAdmin ? 'لوحة تحكم الإدارة' : 'لوحة تحكم المستثمر'}</p>
      </div>

      <nav className={styles.nav}>
        {isAdmin ? (
          <>
            <Link href="/admin/dashboard" className={`${styles.link} ${pathname === '/admin/dashboard' ? styles.active : ''}`}>
              <Home size={20} className={styles.icon} />
              الرئيسية
            </Link>
            <Link href="/admin/users" className={`${styles.link} ${pathname.startsWith('/admin/users') ? styles.active : ''}`}>
              <Users size={20} className={styles.icon} />
              المستثمرون
            </Link>
            <Link href="/admin/withdrawals" className={`${styles.link} ${pathname.startsWith('/admin/withdrawals') ? styles.active : ''}`}>
              <CreditCard size={20} className={styles.icon} />
              طلبات السحب
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
              <Home size={20} className={styles.icon} />
              الرئيسية
            </Link>
            <Link href="/bank-info" className={`${styles.link} ${pathname === '/bank-info' ? styles.active : ''}`}>
              <Landmark size={20} className={styles.icon} />
              معلوماتي البنكية
            </Link>
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} className={styles.icon} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
