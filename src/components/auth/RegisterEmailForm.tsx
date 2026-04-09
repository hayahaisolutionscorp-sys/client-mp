"use client"

import { useEffect, useState, useCallback } from "react";
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter, useSearchParams } from 'next/navigation';
import { useBranding } from "@/hooks/branding";
import { useThemeSettings } from "@/hooks/theme-settings";
import { AuthService } from "@/services/auth.service";
import { buildReturnUrlParam, sanitizeReturnUrl, withReturnUrl } from "@/lib/return-url";

const REGISTER_STEP_KEY = 'register-step';
const REGISTER_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function RegisterEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  const returnUrlParam = buildReturnUrlParam(safeReturnUrl);
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  const [stepData, setStepData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean; exists: boolean | null; checking: boolean;
  }>({ isValid: false, exists: null, checking: false });

  // Guard: requires valid step 1 session data
  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_STEP_KEY);
    if (!raw) { router.replace(withReturnUrl('/register', safeReturnUrl)); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.firstName || Date.now() - parsed.ts > REGISTER_TTL_MS) {
        sessionStorage.removeItem(REGISTER_STEP_KEY);
        router.replace(withReturnUrl('/register', safeReturnUrl));
        return;
      }
      setStepData(parsed);
      if (parsed.email) setEmail(parsed.email);
    } catch {
      sessionStorage.removeItem(REGISTER_STEP_KEY);
      router.replace(withReturnUrl('/register', safeReturnUrl));
    }
  }, [router, safeReturnUrl]);

  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    try {
      setEmailValidation(prev => ({ ...prev, checking: true }));
      const response = await AuthService.lookupEmail(emailToCheck);
      const exists = response.data.data.exists;
      setEmailValidation({ isValid: true, exists, checking: false });
    } catch {
      setEmailValidation(prev => ({ ...prev, checking: false }));
    }
  }, []);

  // Automatic email validation and debounced check
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    
    setEmailValidation(prev => ({ ...prev, isValid: isEmailValid, exists: null }));

    if (isEmailValid) {
      // Check if user has finished typing the domain (e.g. .com, .ph, .edu)
      const domainParts = email.split('@')[1]?.split('.');
      const hasExtension = domainParts && domainParts.length >= 2 && domainParts[domainParts.length - 1].length >= 2;

      if (hasExtension) {
        const timer = setTimeout(() => {
          checkEmailAvailability(email);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [email, checkEmailAvailability]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !emailValidation.isValid || emailValidation.checking) return;

    if (emailValidation.exists === null) {
        await checkEmailAvailability(email);
    }

    if (emailValidation.exists === true) return;

    setIsNavigating(true);
    const updated = { ...stepData, email, ts: Date.now() };
    sessionStorage.setItem(REGISTER_STEP_KEY, JSON.stringify(updated));
    const passwordUrl = withReturnUrl('/register/password', safeReturnUrl);
    router.push(passwordUrl);
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
          <Button type="button" variant="outline" className="w-full" 
            onClick={() => { setIsNavigating(true); router.push(`/register${returnUrlParam}`); }} 
            disabled={emailValidation.checking || isNavigating}>
            Back
          </Button>
          <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }}
            disabled={!emailValidation.isValid || emailValidation.checking || emailValidation.exists === true || isNavigating}>
            {isNavigating ? "Please wait..." : (emailValidation.checking ? "Checking..." : "Continue")}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/login${returnUrlParam}`} className="hover:underline" style={{ color: primaryColor }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
