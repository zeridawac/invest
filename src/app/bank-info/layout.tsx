import Sidebar from '@/components/Sidebar';

export default function BankInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-container">
      <Sidebar isAdmin={false} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
