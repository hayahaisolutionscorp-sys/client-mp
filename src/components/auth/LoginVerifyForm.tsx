"use client"

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { ForgotPasswordModal } from "@/components/auth/ForgotPassword";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";
import { buildReturnUrlParam, resolvePostAuthPath, sanitizeReturnUrl, withReturnUrl } from "@/lib/return-url";

const STEP_KEY = "login-step";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface LoginVerifyFormProps {
  mode?: "default" | "immersive" | "canvas";
}

export function LoginVerifyForm({ mode = "default" }: LoginVerifyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  const returnUrlParam = buildReturnUrlParam(safeReturnUrl);
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || "oklch(34.38% 0.118 262.34)";

  const { signIn } = useAuth();

  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem(STEP_KEY);
    if (!raw) {
      router.replace(withReturnUrl('/login', safeReturnUrl));
      return;
    }
    try {
      const { email: storedEmail, ts } = JSON.parse(raw);
      if (!storedEmail || Date.now() - ts > TTL_MS) {
        sessionStorage.removeItem(STEP_KEY);
        router.replace(withReturnUrl('/login', safeReturnUrl));
        return;
      }
      setEmail(storedEmail);
    } catch {
      sessionStorage.removeItem(STEP_KEY);
      router.replace(withReturnUrl('/login', safeReturnUrl));
    }
  }, [router, safeReturnUrl]);

  useEffect(() => {
    if (cooldownTime <= 0) return;
    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      sessionStorage.removeItem(STEP_KEY);
      router.push(resolvePostAuthPath(safeReturnUrl));
    } catch (err: any) {
      console.error("Login error:", err);
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) {
        const remaining = Math.max(0, Math.floor((retryAfter - Date.now()) / 1000));
        setCooldownTime(remaining);
      }
      const msg = err.response?.data?.message || err.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (email === null) return null;

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="sr-only">Login - Enter Password</h1>
      {mode === "default" ? (
        <>
          <div className="flex justify-center">
            <Image
              src={branding?.logo.dark || branding?.logo.light || "/assets/icons/Ayahay_blue_vertical.svg"}
              alt={`${branding?.brand_name || "Hayahai"} Logo`}
              width={210}
              height={210}
              className="h-15 w-15"
            />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Enter your Password to Continue</p>
            <p className="text-xs text-gray-500 font-medium">{email}</p>
          </div>
        </>
      ) : null}

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm text-center">
          {cooldownTime > 0 ? (
            <>
              <div className="font-medium">Too many failed login attempts</div>
              <div className="mt-2 text-lg font-semibold">
                Please try again in {formatTime(cooldownTime)}
              </div>
            </>
          ) : (
            error
          )}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Password</div>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs hover:underline"
              style={{ color: primaryColor }}
            >
              Forgot password?
            </button>
            <ForgotPasswordModal
              isOpen={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
              email={email}
            />
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-white"
          style={{ backgroundColor: primaryColor }}
          disabled={loading || cooldownTime > 0 || !password || isNavigating}
        >
          {isNavigating
            ? "Please wait..."
            : cooldownTime > 0
              ? `Wait ${formatTime(cooldownTime)}`
              : loading
                ? "Signing in..."
                : "Sign In"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={`/register${returnUrlParam}`} className="hover:underline" style={{ color: primaryColor }}>
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
