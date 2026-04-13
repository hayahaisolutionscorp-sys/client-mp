'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContexts';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

const UserDropdown = ({ shouldBeTransparent = false }: { shouldBeTransparent: boolean }) => {
  const router = useRouter();
  const { logout, currentUser, loading } = useAuth();
  const themeSettings = useThemeSettings();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer focus:outline-none">
            {!hasMounted || loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border border-gray-100" />
            ) : currentUser?.passenger?.profilePictureUrl ? (
              <div
                className="flex items-center space-x-2 relative w-8 h-8 rounded-full overflow-hidden border border-gray-200"
                style={{ background: 'transparent', boxShadow: 'none' }}
              >
                <Image
                  src={currentUser.passenger.profilePictureUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : currentUser ? (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200 border-none ${shouldBeTransparent ? 'bg-white/20 text-white backdrop-blur-sm border border-white/40 hover:bg-white/30' : 'text-white'
                  }`}
                style={{
                  backgroundColor: !shouldBeTransparent && themeSettings?.primaryColor ? themeSettings.primaryColor : undefined,
                  boxShadow: 'none'
                }}
              >
                {(currentUser?.passenger?.firstName?.charAt(0) || currentUser.email?.charAt(0) || '?').toUpperCase()}
              </div>
            ) : (
              <>
                {/* Desktop: Login Button */}
                <Link
                  href="/login"
                  onMouseEnter={() => router.prefetch('/login')}
                  className={`hidden lg:flex items-center justify-center px-6 py-2 font-bold rounded-lg transition-all whitespace-nowrap border ${
                    shouldBeTransparent
                      ? 'border-white/50 bg-transparent text-white hover:bg-white/10'
                      : 'border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Login/Create Account
                </Link>

                {/* Mobile: Menu Icon */}
                <div className="lg:hidden relative">
                  <div className="flex items-center space-x-2 focus:outline-none cursor-pointer">
                    <Image
                      src="/assets/icons/circle-user-round.svg"
                      alt="User Menu"
                      width={32}
                      height={32}
                      className={`w-8 h-8 transition-all duration-200 ${shouldBeTransparent ? 'brightness-0 invert' : 'brightness-0'}`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        {/* Dropdown Menu Content - This is Portaled by default in our DropdownMenuContent wrapper */}
        <DropdownMenuContent align="end" className="w-48 bg-white">
          {currentUser ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  onMouseEnter={() => router.prefetch('/profile')}
                  className="w-full cursor-pointer"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
              >
                Log Out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {/* Mobile Dropdown Links (Hidden on LG desktop as they see the Login button directly) */}
              <DropdownMenuItem asChild className="lg:hidden">
                <Link href="/login" className="w-full cursor-pointer">
                  Login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="lg:hidden">
                <Link href="/register" className="w-full cursor-pointer">
                  Create Account
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserDropdown;
