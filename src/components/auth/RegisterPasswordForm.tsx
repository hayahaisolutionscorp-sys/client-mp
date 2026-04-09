"use client"

import { useEffect, useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { PasswordStrengthTracker } from "@/components/auth/PasswordStrengthTracker";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";
import { buildReturnUrlParam, resolvePostAuthPath, sanitizeReturnUrl, withReturnUrl } from "@/lib/return-url";

const REGISTER_STEP_KEY = 'register-step';
const REGISTER_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function RegisterPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  const returnUrlParam = buildReturnUrlParam(safeReturnUrl);
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  const { register } = useAuth();

  const [stepData, setStepData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Guard: requires step 1 + email data
  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_STEP_KEY);
    if (!raw) { router.replace(withReturnUrl('/register', safeReturnUrl)); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.firstName || !parsed.email || Date.now() - parsed.ts > REGISTER_TTL_MS) {
        sessionStorage.removeItem(REGISTER_STEP_KEY);
        router.replace(withReturnUrl('/register', safeReturnUrl));
        return;
      }
      setStepData(parsed);
    } catch {
      sessionStorage.removeItem(REGISTER_STEP_KEY);
      router.replace(withReturnUrl('/register', safeReturnUrl));
    }
  }, [router, safeReturnUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepData) return;

    const errors: Record<string, string> = {};
    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(password)) {
        errors.password = "Password must have at least 1 uppercase, lowercase, number, and special character";
      }
    }
    if (password !== confirm) errors.confirm = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setValidationErrors({});
    setGeneralError(null);

    try {
      const { ts: _ts, ...stepFields } = stepData;
      const fullForm = {
        ...stepFields,
        password,
        confirm,
        agreement: true,
        emailConsent: false,
      };
      await register(stepData.email, password, fullForm);
      sessionStorage.removeItem(REGISTER_STEP_KEY);
      router.push(resolvePostAuthPath(safeReturnUrl));
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "An unexpected error occurred. Please try again.";
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor, color: 'white' }}>
            <Check className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">Email</span>
        </div>
        <div className="w-12 h-0.5 mx-2" style={{ backgroundColor: primaryColor }} />
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor, color: 'white' }}>3</div>
          <span className="text-sm font-medium" style={{ color: primaryColor }}>Security</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="sr-only">Register — Account Security</h1>
      <div className="flex justify-center">
        <Image src={branding?.logo.dark || branding?.logo.light || "/assets/icons/Ayahay_blue_vertical.svg"}
          alt={`${branding?.brand_name || "Hayahai"} Logo`} width={210} height={210} className="h-15 w-15" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Create a strong password</p>
        <p className="text-xs text-gray-500 font-medium">{stepData.email}</p>
      </div>

      <StepIndicator />

      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Password <span className="text-red-500">*</span></div>
          <div className="relative">
            <Input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus
              className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.password ? "border-red-500" : ""}`} />
            <Button type="button" variant="ghost" size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOffIcon className="h-4 w-4 text-muted-foreground" /> : <EyeIcon className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          <PasswordStrengthTracker password={password} />
          {validationErrors.password && <p className="text-xs text-red-500">{validationErrors.password}</p>}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Repeat Password <span className="text-red-500">*</span></div>
          <div className="relative">
            <Input name="confirm" type={showPassword ? "text" : "password"} placeholder="Confirm your password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={!password}
              className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.confirm ? "border-red-500" : ""}`} />
            <Button type="button" variant="ghost" size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOffIcon className="h-4 w-4 text-muted-foreground" /> : <EyeIcon className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          {password && confirm && password === confirm && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check className="h-3 w-3" /> Passwords match
            </div>
          )}
          {validationErrors.confirm && <p className="text-xs text-red-500">{validationErrors.confirm}</p>}
        </div>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" className="w-full" 
            onClick={() => { setIsNavigating(true); router.push(`/register/email${returnUrlParam}`); }}
            disabled={isNavigating || loading}>
            Back
          </Button>
          <Button type="submit" className="w-full text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
            style={{ backgroundColor: primaryColor }} disabled={loading || isNavigating}>
            {isNavigating ? "Please wait..." : (loading ? "Registering..." : "Submit")}
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
