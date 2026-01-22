"use client"

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { ForgotPasswordModal } from "@/components/auth/ForgotPassword";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { LoginForm } from "@/models";
import { useThemeSettings } from "@/hooks/theme-settings";

export default function LoginPage() {
  const router = useRouter();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)



  // Import auth context functions
  const {
    signIn,
    signInWithGoogle,
    signInWithFacebook,
  } = useAuth();



  const [error, setError] = useState<string | null>(null);

  // Handle email/password login
  const handleLogin = async (values: LoginForm) => {
    const { email, password } = values;
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      // Extract error message similar to how AuthContext does it, or rely on what's thrown
      const msg = err.response?.data?.message || err.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google SSO login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'auth/popup-closed-by-user') {
        console.log('Google sign-in cancelled by user');
      } else {
        console.error('Google sign-in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Facebook SSO login
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
              src="/assets/icons/Ayahay_blue_vertical.svg"
              alt="Ayahay Logo"
              width={210}
              height={210}
              className="h-15 w-15"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Enter your Email and Password to Continue</p>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleLogin({ email, password });
          }}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
              />
            </div>
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
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
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
              className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
            >
              <Image src="/assets/icons/google_logo.svg" alt="Google" width={20} height={20} className="mr-2" />
              Continue with Google
            </Button>
            <Button
              onClick={handleFacebookLogin}
              variant="outline"
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
            By signing up, you agree to our{" "}
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

