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
import { LoginForm } from "@/models";

export default function LoginPage() {
  const router = useRouter();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)


  // Import auth context functions
  const {
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
  } = useAuth();

  const slides = [
    { image: '/assets/photogrid/palompon.png', title: 'Palompon, Leyte' },
    { image: '/assets/photogrid/camotes.jpg', title: 'Camotes Island, Cebu' },
    { image: '/assets/photogrid/coron.png', title: 'Coron, Palawan' },
    { image: '/assets/photogrid/el-nido.png', title: 'El Nido, Palawan' },
    { image: '/assets/photogrid/isabel.png', title: 'Isabel, Leyte' },
    { image: '/assets/photogrid/mactan.png', title: 'Mactan, Cebu' },
    { image: '/assets/photogrid/santa-fe.png', title: 'Santa Fe, Bantayan' },
    { image: '/assets/photogrid/kawit.png', title: 'Kawit Medellin' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  // Handle email/password login
  const handleLogin = async (values: LoginForm) => {
    const { email, password } = values;
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google SSO login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result?.user) {
        router.push('/');
      }
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
      await signInWithFacebook();
      router.push('/');
    } catch (error: unknown) {
      console.error('Facebook sign-in error:', error);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (email: string) => {
    if (!email) {
      return false;
    }

    try {
        await resetPassword(email);
        return true;
    } catch (error) {
      console.error('Error sending reset email:', error);
      return false;
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
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Password</div>
                <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-500 hover:underline"
                >
                    Forgot password?
                </button>
                <ForgotPasswordModal
                    isOpen={showForgotPassword}
                    onClose={() => setShowForgotPassword(false)}
                    onSubmit={handleForgotPassword}
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
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
              className="w-full bg-blue-500 hover:bg-blue-600"
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
              <span className="bg-background px-2 text-muted-foreground">Or login with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full"
            >
              <Image src="/assets/icons/google_logo.svg" alt="Google" width={20} height={20} className="mr-2" />
              Google
            </Button>
            <Button
              onClick={handleFacebookLogin}
              variant="outline"
              className="w-full"
            >
              <Image src="/assets/icons/facebook_logo.svg" alt="Facebook" width={20} height={20} className="mr-2" />
              Facebook
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Register now
              </Link>
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-blue-500 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden bg-blue-500 md:block md:rounded-l-3xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-blue-500/20" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center p-6 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">{slides[currentSlide].title}</h2>
          <p className="mb-6 text-3xl font-bold">Quick, Easy Booking & Reach Your Destination with Ease</p>
          <p className="text-xl">Kay Ang Pagsakay, Dapat AYAHAY!</p>
          <div className="mt-8 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}