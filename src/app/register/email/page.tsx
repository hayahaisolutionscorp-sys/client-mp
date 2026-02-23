"use client"

import { useEffect, useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, UserIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from 'next/navigation';
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";
import { AuthService } from "@/services/auth.service";

const STEP_KEY = 'register-step';
const TTL_MS = 10 * 60 * 1000;

export default function RegisterEmailPage() {
  const router = useRouter();
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  const [stepData, setStepData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean; exists: boolean | null; checking: boolean;
  }>({ isValid: false, exists: null, checking: false });

  // Guard: requires valid step 1 session data
  useEffect(() => {
    const raw = sessionStorage.getItem(STEP_KEY);
    if (!raw) { router.replace('/register'); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.firstName || Date.now() - parsed.ts > TTL_MS) {
        sessionStorage.removeItem(STEP_KEY);
        router.replace('/register');
        return;
      }
      setStepData(parsed);
      // Pre-fill email if user navigated back
      if (parsed.email) setEmail(parsed.email);
    } catch {
      sessionStorage.removeItem(STEP_KEY);
      router.replace('/register');
    }
  }, [router]);

  // Email validation and lookup
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    setEmailValidation(prev => ({ ...prev, isValid: isEmailValid }));
    if (!isEmailValid || !email) { setEmailValidation(prev => ({ ...prev, exists: null })); return; }

    const timeoutId = setTimeout(async () => {
      try {
        setEmailValidation(prev => ({ ...prev, checking: true }));
        const response = await AuthService.lookupEmail(email);
        setEmailValidation(prev => ({ ...prev, exists: response.data.data.exists, checking: false }));
      } catch {
        setEmailValidation(prev => ({ ...prev, checking: false }));
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !emailValidation.isValid || emailValidation.exists === true || emailValidation.checking) return;

    // Merge email into existing step data, refresh TTL
    const updated = { ...stepData, email, ts: Date.now() };
    sessionStorage.setItem(STEP_KEY, JSON.stringify(updated));
    router.push('/register/password');
  };

  if (!stepData) return null;

  const StepIndicator = () => (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor, color: 'white' }}>
            <Check className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">Passenger Info</span>
        </div>
        <div className="w-12 h-0.5 mx-2" style={{ backgroundColor: primaryColor }} />
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor, color: 'white' }}>2</div>
          <span className="text-sm font-medium" style={{ color: primaryColor }}>Email</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 mx-2" />
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">3</div>
          <span className="text-sm font-medium text-gray-700">Security</span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8">
        <button onClick={() => router.push('/register')}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Back">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="w-full max-w-md space-y-6">
          <h1 className="sr-only">Register — Email</h1>
          <div className="flex justify-center">
            <Image src={branding?.logo.dark || branding?.logo.light || "/assets/icons/Ayahay_blue_vertical.svg"}
              alt={`${branding?.brand_name || "Hayahai"} Logo`} width={210} height={210} className="h-15 w-15" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Enter your Email to Continue</p>
          </div>

          <StepIndicator />

          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Email <span className="text-red-500">*</span></div>
              <Input name="email" type="email" placeholder="Enter your email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400" />
              {email && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  {emailValidation.checking ? (
                    <span className="text-gray-500">Checking...</span>
                  ) : !emailValidation.isValid ? (
                    <span className="text-red-500">✗ Invalid email format</span>
                  ) : emailValidation.exists === true ? (
                    <span className="text-red-500">✗ Email is already taken</span>
                  ) : emailValidation.exists === false ? (
                    <span className="text-green-600">✓ Email is available</span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/register')}>
                Back
              </Button>
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }}
                disabled={!emailValidation.isValid || emailValidation.checking || emailValidation.exists === true}>
                Continue
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="hover:underline" style={{ color: primaryColor }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <AuthSidebar />
    </main>
  )
}
