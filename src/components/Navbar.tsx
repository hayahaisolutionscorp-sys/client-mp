'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { NAV_ITEMS } from 'constants/index';

type NavItem = {
  id: string;
  name: string;
  trigger: string;
  redirect_url: string;
};
import UserDropdown from './UserDropdown';
import { getHeadersSections } from '@/services';
import { getBrandingConfig } from '@/services/ui/branding.service';

const Navbar = () => {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState('Book');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const fetchHeaderSection = async () => {
      let itemsToRemove: string[] = [];

      // if (parsedId !== 3) {
      //   itemsToRemove = ['WhyChooseUs', 'Partner'];
      // }

      const headerSection = await getHeadersSections();

      if (headerSection) {
        if (!headerSection.showPromos) itemsToRemove.push('Promos');
        if (!headerSection.showRoutes) itemsToRemove.push('Routes');
        if (!headerSection.showResources) itemsToRemove.push('Resources');
        if (!headerSection.showAboutUs) itemsToRemove.push('AboutUs');
        // prep lng
        // if (!headerSection.showWhyChooseUs) itemsToRemove.push('WhyChooseUs');
        // if (!headerSection.showPartner) itemsToRemove.push('Partner');
      }

      const tempFilteredNavItems = NAV_ITEMS.filter((item) => !itemsToRemove.includes(item.id));
      setFilteredNavItems(tempFilteredNavItems);
    };

    fetchHeaderSection();
  }, []);

  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      const config = await getBrandingConfig();
      setBranding(config);
    };
    fetchBranding();
  }, []);

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
    // Special case for Resources - scroll to bottom of the page
    if (id === 'Resources') {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  if (!branding) return null;

  const isHome = pathname === '/';
  const shouldBeTransparent = isHome && !isMenuOpen;
  const position = isHome ? 'absolute' : 'relative';
  const backgroundColor = shouldBeTransparent ? 'text-white bg-black bg-opacity-35' : 'text-black bg-white';

  const logoSrc = isHome ? branding.logo.light : branding.logo.dark;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`w-full h-auto top-0 z-[50] ${position} ${backgroundColor} transition-all duration-300`}
      >
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[80px] relative">
            {/* Logo */}
            <div className="flex-shrink-0 relative z-50">
              <Link href="/">
                <Image
                  alt="Company Logo"
                  src={logoSrc}
                  width={150}
                  height={150}
                  className="w-auto h-[40px] object-contain sm:h-[55px] transition-all duration-300"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex flex-grow items-center justify-center space-x-8">
              {isHome &&
                filteredNavItems.map((item) =>
                  item.trigger.toLowerCase() === 'scroll' ? (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        scrollToElement(item.id);
                      }}
                      className={`text-md font-medium transition-all duration-300 ${activeNav === item.id
                        ? 'border-b-2 border-current'
                        : 'hover:border-b-2 border-transparent hover:border-current'
                        }`}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.redirect_url}
                      className={`text-md font-medium transition-all duration-300 ${activeNav === item.id
                        ? 'border-b-2 border-current'
                        : 'hover:border-b-2 border-transparent hover:border-current'
                        }`}
                    >
                      {item.name}
                    </Link>
                  )
                )}
            </div>
            <UserDropdown shouldBeTransparent={shouldBeTransparent} />

            {/* Mobile menu button */}
            {isHome && (
              <div className="md:hidden relative z-50">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 mt-4 rounded-md focus:outline-none"
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
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isHome && (
          <div
            className={`fixed inset-0 bg-white transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            style={{ zIndex: 40 }}
          >
            <div className="h-full w-full px-4 pt-[100px] overflow-y-auto">
              <div className="space-y-1">
                {/* Mobile menu overlay */}
                {isHome && (
                  <div
                    className={`fixed inset-0 bg-white transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    style={{ zIndex: 40 }}
                  >
                    <div className="h-full w-full px-4 pt-[100px] overflow-y-auto">
                      <div className="space-y-1">
                        {filteredNavItems.map((item) =>
                          item.trigger.toLowerCase() === 'scroll' ? (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveNav(item.id);
                                scrollToElement(item.id);
                              }}
                              className={`block w-full text-left px-3 py-4 text-xl font-medium border-b border-gray-100 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                                } ${activeNav === item.id ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'}`}
                            >
                              {item.name}
                            </button>
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile backdrop */}
      {isHome && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
            }`}
          style={{ zIndex: 30 }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
