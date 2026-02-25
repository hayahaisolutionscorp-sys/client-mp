"use client"

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";
import { AuthService } from "@/services/auth.service";

const STEP_KEY = 'login-step';
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const router = useRouter();
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  const { clearSession, signInWithGoogle, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    exists: boolean | null;
    checking: boolean;
  }>({ isValid: false, exists: null, checking: false });

  useEffect(() => {
    clearSession();
    // Clear any stale step data
    sessionStorage.removeItem(STEP_KEY);
  }, [clearSession]);

  // email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    setEmailValidation(prev => ({ ...prev, isValid: isEmailValid }));
  }, [email]);

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !emailValidation.isValid) return;

    // Store email in sessionStorage with a TTL — never in the URL
    sessionStorage.setItem(STEP_KEY, JSON.stringify({ email, ts: Date.now() }));
    router.push('/login/verify');
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'auth/popup-closed-by-user') {
        console.log('Google sign-in cancelled');
      } else {
        console.error('Google sign-in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      await signInWithFacebook();
      router.push('/');
    } catch (error: unknown) {
      console.error('Facebook sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8">
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="w-full max-w-md space-y-6">
          <h1 className="sr-only">Login</h1>
          <div className="flex justify-center">
            <Image
              src={branding?.logo.dark || branding?.logo.light || "/assets/icons/Ayahay_blue_vertical.svg"}
              alt={`${branding?.brand_name || "Hayahai"} Logo`}
              width={210}
              height={210}
              className="h-15 w-15"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Enter your Email to Continue</p>
          </div>

          <form className="space-y-4" onSubmit={handleContinue}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
              />
              {email && !emailValidation.isValid && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className="text-red-500">✗ Invalid email format</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: primaryColor }}
              disabled={!emailValidation.isValid}
            >
              Continue
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={loading}
              className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
            >
              <Image src="/assets/icons/google_logo.svg" alt="Google" width={20} height={20} className="mr-2" />
              Continue with Google
            </Button>
            <Button
              onClick={handleFacebookLogin}
              variant="outline"
              disabled={loading}
              className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
            >
              <Image src="/assets/icons/facebook_logo.svg" alt="Facebook" width={20} height={20} className="mr-2" />
              Continue with Facebook
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="hover:underline" style={{ color: primaryColor }}>
                Register now
              </Link>
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="hover:underline" style={{ color: primaryColor }}>
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline" style={{ color: primaryColor }}>
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
      <AuthSidebar />
    </main>
  )
}
