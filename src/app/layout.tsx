import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REDA INVESTISMENT',
  description: 'نظام إدارة المستثمرين - REDA INVESTISMENT V2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
