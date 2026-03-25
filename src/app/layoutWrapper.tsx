'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscribeBanner from '@/components/landing/SubscribeBanner';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });
const SessionExpiredModal = dynamic(
  () => import('@/components/auth/SessionExpiredModal').then(m => ({ default: m.SessionExpiredModal })),
  { ssr: false }
);

export default function LayoutWrapper({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPreviewRoute = pathname.startsWith('/preview');
  const hideLayout = isPreviewRoute || pathname === '/login' || pathname === '/register' || pathname.startsWith('/reset-password') || pathname.startsWith('/login/') || pathname.startsWith('/register/');
  const isProfilePage = pathname === '/profile';
  return (
    <>
      {!hideLayout && pathname !== '/' && <Navbar />}
      <main className="">{children}</main>
      {!hideLayout && !isProfilePage && pathname !== '/' && (
        <div id="Resources" className="w-full lg:pt-56">
          <div className="flex items-center justify-center w-full">
            <SubscribeBanner />
          </div>
          <Footer />
        </div>
      )}
      {mounted && <SessionExpiredModal />}
      {mounted && !isPreviewRoute && <ChatWidget tenantId={parseInt(process.env.NEXT_PUBLIC_TENANT_ID || "1", 10)} />}
    </>
  );
}
