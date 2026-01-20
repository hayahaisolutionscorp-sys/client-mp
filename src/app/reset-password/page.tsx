"use client"

import { useEffect, useState, FormEvent, Suspense } from "react";
import Link from "next/link"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { AuthSidebar } from "@/components/auth/AuthSidebar";


function ResetPasswordPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { confirmResetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirm: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {}

    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
      if (!passwordRegex.test(formData.password)) {
        errors.password = "Password must have at least 1 uppercase, lowercase, number, and special character"
      }
    }

    if (formData.password !== formData.confirm) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    setLoading(true);
    setError(null);

    try {
      const email = sessionStorage.getItem('reset_email');

      const success = await confirmResetPassword({ 
        new_password: formData.password, 
        email 
      });

      if (success) {
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('resend_otp');
        
        router.push('/login');
      } else {
        setError("Failed to reset password. Please check your token or try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="sr-only">Reset Password</h1>
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
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-2">Enter your new password below to reset your account.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <div className="text-sm font-medium">Password</div>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={validationErrors.password ? "border-red-500" : ""}
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
          {validationErrors.password && <p className="text-xs text-red-500">{validationErrors.password}</p>}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Repeat Password</div>
          <div className="relative">
            <Input
              name="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.confirm}
              onChange={handleInputChange}
              required
              className={validationErrors.confirm ? "border-red-500" : ""}
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
          {validationErrors.confirm && <p className="text-xs text-red-500">{validationErrors.confirm}</p>}
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8 relative">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordPageForm />
        </Suspense>
      </div>
      <AuthSidebar />
    </main>
  )
}


