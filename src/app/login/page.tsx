import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const session = cookies().get('session');
  if (session) {
    // Basic redirect, real check happens in middleware
    redirect('/dashboard');
  }

  return (
    <div className="page-container" style={{ 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      padding: '1rem'
    }}>
      <LoginForm />
    </div>
  );
}
