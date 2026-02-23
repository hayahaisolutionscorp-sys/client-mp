'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContexts';
import { useThemeSettings } from '@/hooks/theme-settings';

const UserDropdown = ({ shouldBeTransparent = false }: { shouldBeTransparent: boolean }) => {
  const { logout, currentUser, loggedInAccount, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeSettings = useThemeSettings();

  // Add useEffect for clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* User Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border border-gray-100" />
        ) : loggedInAccount?.passenger?.profilePictureUrl ? (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none relative w-8 h-8 rounded-full overflow-hidden border border-gray-200"
          >
            <Image
              src={loggedInAccount.passenger.profilePictureUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          </button>
        ) : currentUser ? (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none ${shouldBeTransparent ? 'bg-white/20 text-white backdrop-blur-sm border border-white/40 hover:bg-white/30' : 'text-white'
              }`}
            style={{
              backgroundColor: !shouldBeTransparent && themeSettings?.primaryColor ? themeSettings.primaryColor : undefined
            }}
          >
            {(loggedInAccount?.passenger?.firstName?.charAt(0) || currentUser.email?.charAt(0) || '?').toUpperCase()}
          </button>
        ) : (
          <>
            {/* Desktop: Login Button */}
            <Link
              href="/login"
              className={`hidden md:flex items-center justify-center px-6 py-2 bg-[#23ABFF] text-white font-bold rounded-lg hover:bg-blue-500 transition-all shadow-md whitespace-nowrap`}
            >
              Login/Create Account
            </Link>

            {/* Mobile: Menu Icon */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <Image
                  src="/assets/icons/circle-user-round.svg"
                  alt="User Menu"
                  width={32}
                  height={32}
                  className={`w-8 h-8 transition-all duration-200 ${shouldBeTransparent ? 'brightness-0 invert' : 'brightness-0'}`}
                />
              </button>
            </div>
          </>
        )}

        {/* Dropdown Menu (Only logic for logged in or mobile logged out) */}
        <div
          className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transition-all duration-200 ${isDropdownOpen ? 'transform opacity-100 scale-100' : 'transform opacity-0 scale-95 pointer-events-none'
            }`}
        >
          {currentUser ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Mobile Dropdown Links */}
              <Link
                href="/login"
                className="block md:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block md:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div >
    </>
  );
};

export default UserDropdown;
