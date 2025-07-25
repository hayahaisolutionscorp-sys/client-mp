'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SubscribeBanner from '@/components/landing/SubscribeBanner';
import Footer from '@/components/Footer';

export default function LayoutWrapper({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideLayout = pathname === '/login' || pathname === '/register';
  const isProfilePage = pathname.startsWith('/profile/');

  return (
    <>
      {!hideLayout && <Navbar />}
      <div className="">{children}</div>
      {!hideLayout && !isProfilePage && (
        <div id="Resources" className="w-full lg:pt-56">
          <div className="flex items-center justify-center w-full">
            <SubscribeBanner />
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}
