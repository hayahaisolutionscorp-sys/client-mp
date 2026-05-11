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
import { cn } from '@/lib/utils';

const UserDropdown = ({ shouldBeTransparent = false }: { shouldBeTransparent: boolean }) => {
  const router = useRouter();
  const { logout, currentUser, loading } = useAuth();
  const themeSettings = useThemeSettings();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || loading) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse border border-gray-100" />;
  }

  /** Guest: desktop uses a plain link (not inside DropdownMenuTrigger — that opened an empty menu on lg). */
  if (!currentUser) {
    return (
      <>
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

        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open account menu"
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  shouldBeTransparent ? "hover:bg-white/10" : "hover:bg-slate-100/50"
                )}
              >
                <Image
                  src="/assets/icons/circle-user-round.svg"
                  alt=""
                  width={32}
                  height={32}
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    shouldBeTransparent ? "brightness-0 invert" : "brightness-0"
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem asChild>
                <Link href="/login" className="w-full cursor-pointer" onMouseEnter={() => router.prefetch('/login')}>
                  Login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register" className="w-full cursor-pointer" onMouseEnter={() => router.prefetch('/register')}>
                  Create Account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            shouldBeTransparent ? "hover:bg-white/10" : "hover:bg-slate-100/50"
          )}
        >
          {currentUser.passenger?.profilePictureUrl ? (
            <div
              className="relative flex h-8 w-8 items-center space-x-2 overflow-hidden rounded-full border border-gray-200"
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              <Image
                src={currentUser.passenger.profilePictureUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-none text-xs font-bold shadow-sm transition-all duration-200",
                shouldBeTransparent
                  ? "border border-white/40 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  : "text-white"
              )}
              style={{
                backgroundColor: !shouldBeTransparent && themeSettings?.primaryColor ? themeSettings.primaryColor : undefined,
                boxShadow: 'none',
              }}
            >
              {(currentUser.passenger?.firstName?.charAt(0) || currentUser.email?.charAt(0) || '?').toUpperCase()}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-white">
        <div className="border-b border-gray-100 px-4 py-2">
          <p className="truncate text-xs text-gray-500">{currentUser.email}</p>
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
        <DropdownMenuItem asChild>
          <Link
            href="/my-activity"
            onMouseEnter={() => router.prefetch('/my-activity')}
            className="w-full cursor-pointer"
          >
            My Activity
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
