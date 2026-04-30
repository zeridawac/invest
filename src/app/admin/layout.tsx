import Sidebar from '@/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-container">
      <Sidebar isAdmin={true} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
