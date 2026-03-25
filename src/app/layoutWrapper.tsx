'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SubscribeBanner from '@/components/landing/SubscribeBanner';
import ChatWidget from '@/components/chat/ChatWidget';
import Footer from '@/components/Footer';
import { SessionExpiredModal } from '@/components/auth/SessionExpiredModal';

export default function LayoutWrapper({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPreviewRoute = pathname.startsWith('/preview');
  const hideLayout = isPreviewRoute || pathname === '/login' || pathname === '/register' || pathname.startsWith('/reset-password') || pathname.startsWith('/login/') || pathname.startsWith('/register/');
  const isProfilePage = pathname === '/profile';

  return (
    <>
      {!hideLayout && pathname !== '/' && <Navbar />}
      <main className="">{children}</main>
      {!hideLayout && !isProfilePage && (
        <div id="Resources" className="w-full lg:pt-56">
          <div className="flex items-center justify-center w-full">
            <SubscribeBanner />
          </div>
          <Footer />
        </div>
      )}
      <SessionExpiredModal />
      {!isPreviewRoute && <ChatWidget tenantId={parseInt(process.env.NEXT_PUBLIC_TENANT_ID || "1", 10)} />}
    </>
  );
}
