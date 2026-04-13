'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import { useBranding } from '@/hooks/branding';
import { useHeaders } from '@/hooks/headers';
import { useAuth } from '@/contexts/AuthContexts';
import type { IBrandingConfig } from '@/models/branding.model';
import type { HeaderNavigationConfig } from '@/lib/landing-nav';
import { getFilteredLandingNavItems, scrollToLandingTarget } from '@/lib/landing-nav';

interface NavbarProps {
  forceHomeStyle?: boolean;
  initialBranding?: IBrandingConfig | null;
  initialHeaderSection?: HeaderNavigationConfig | null;
  showLandingNav?: boolean;
}

const Navbar = ({
  forceHomeStyle = false,
  initialBranding = null,
  initialHeaderSection = null,
  showLandingNav = false,
}: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('Book');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const branding = useBranding() || initialBranding;
  const headerSection = useHeaders(initialHeaderSection) || initialHeaderSection;
  const { currentUser, logout } = useAuth();

  const filteredNavItems = useMemo(() => getFilteredLandingNavItems(headerSection), [headerSection]);

  // Handle scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToElement = (id: string) => {
    scrollToLandingTarget({
      id,
      pathname,
      navigate: (href) => router.push(href),
      onDone: () => setIsMenuOpen(false),
    });
  };

  if (!branding) return null;

  const isHome = forceHomeStyle || pathname === '/';
  const shouldRenderLandingNav = showLandingNav || isHome;
  const shouldBeTransparent = isHome && !isMenuOpen;
  const position = isHome ? 'absolute' : 'relative';
  const backgroundColor = shouldBeTransparent ? 'text-white bg-transparent' : 'text-black bg-white';
  const bookingsHref = '/profile?tab=booking-history';

  const logoSrc = isHome ? branding.logo?.light : branding.logo?.dark;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`w-full h-auto top-0 z-50 ${position} ${backgroundColor} transition-all duration-300`}
      >
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[80px] relative">
            {/* Logo */}
            <div className="flex-shrink-0 relative z-50">
              <Link href="/">
                {logoSrc ? (
                  <Image
                    alt="Company Logo"
                    src={logoSrc}
                    width={150}
                    height={150}
                    className="w-auto h-[40px] object-contain sm:h-[55px] transition-all duration-300"
                  />
                ) : (
                  <span className="text-xl font-semibold">{branding.brand_name}</span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className={`hidden lg:flex flex-1 items-center justify-center space-x-6 lg:space-x-8 ${shouldBeTransparent ? 'text-white' : 'text-black'}`}>
              {shouldRenderLandingNav &&
                filteredNavItems.map((item) =>
                  item.trigger.toLowerCase() === 'scroll' ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveNav(item.id);
                        scrollToElement(item.id);
                      }}
                      className={`text-sm lg:text-md font-medium transition-all duration-300 cursor-pointer ${activeNav === item.id
                        ? 'border-b-2 border-current'
                        : 'hover:border-b-2 border-transparent hover:border-current'
                        }`}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.redirect_url}
                      className={`text-sm lg:text-md font-medium transition-all duration-300 ${activeNav === item.id
                        ? 'border-b-2 border-current'
                        : 'hover:border-b-2 border-transparent hover:border-current'
                        }`}
                    >
                      {item.name}
                    </Link>
                  )
                )}
            </div>

            {/* Right Side Icons & User Dropdown */}
            <div className={`hidden lg:flex items-center space-x-4 lg:space-x-6 ${shouldBeTransparent ? 'text-white' : 'text-customText'}`}>
              {currentUser && (
                <Link
                  href={bookingsHref}
                  className="text-sm lg:text-md font-medium transition-opacity duration-300 whitespace-nowrap hover:opacity-80"
                >
                  My Bookings
                </Link>
              )}

              <NotificationDropdown shouldBeTransparent={shouldBeTransparent} />

              <UserDropdown shouldBeTransparent={shouldBeTransparent} />
            </div>

            {/* Mobile section - UserDropdown always visible; hamburger only for landing nav */}
            <div className="lg:hidden relative z-50 flex items-center gap-4">
              <NotificationDropdown shouldBeTransparent={shouldBeTransparent} mobile />
              <div className="flex items-center">
                <UserDropdown shouldBeTransparent={shouldBeTransparent} />
              </div>
              {shouldRenderLandingNav && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none cursor-pointer"
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                  aria-label="Toggle menu"
                >
                  <div className="relative w-6 h-6">
                    <span
                      className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                        }`}
                    />
                    <span
                      className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    <span
                      className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                        }`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {shouldRenderLandingNav && (
          <div
            className={`fixed inset-0 bg-white transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            style={{ zIndex: 40 }}
          >
            <div className="h-full w-full px-4 pt-[100px] overflow-y-auto">
              <div className="space-y-1">
                {filteredNavItems.map((item) =>
                  item.trigger.toLowerCase() === 'scroll' ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveNav(item.id);
                        scrollToElement(item.id);
                      }}
                      className={`block w-full text-left px-3 py-4 text-xl font-medium border-b border-gray-100 transition-opacity duration-300 cursor-pointer ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        } ${activeNav === item.id ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'}`}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.redirect_url}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block w-full text-left px-3 py-4 text-xl font-medium border-b border-gray-100 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        } ${activeNav === item.id ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'}`}
                    >
                      {item.name}
                    </Link>
                  )
                )}

                {/* Auth links for mobile */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  {currentUser ? (
                    <>
                      <div className="px-3 py-2 mb-2">
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        href={bookingsHref}
                        onMouseEnter={() => router.prefetch(bookingsHref)}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-left px-3 py-4 text-xl font-medium transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                          } text-gray-900 hover:text-blue-600`}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/profile"
                        onMouseEnter={() => router.prefetch('/profile')}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-left px-3 py-4 text-xl font-medium transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                          } text-gray-900 hover:text-blue-600`}
                      >
                        Profile
                      </Link>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && logout()}
                        className={`block w-full text-left px-3 py-4 text-xl font-medium transition-opacity duration-300 cursor-pointer ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                          } text-red-600 hover:bg-red-50`}
                      >
                        Log Out
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onMouseEnter={() => router.prefetch('/login')}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-left px-3 py-4 text-xl font-medium transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                          } text-gray-900 hover:text-blue-600`}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onMouseEnter={() => router.prefetch('/register')}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-left px-3 py-4 text-xl font-medium transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                          } text-gray-900 hover:text-blue-600`}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile backdrop */}
      {shouldRenderLandingNav && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
            }`}
          style={{ zIndex: 30 }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
