'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#ff9f43', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc' }}>
      {children}
    </div>
  );
}
