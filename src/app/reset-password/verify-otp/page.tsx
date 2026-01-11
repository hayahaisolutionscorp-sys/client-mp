"use client"

import { useEffect, useState, FormEvent, Suspense } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { AuthSidebar } from "@/components/auth/AuthSidebar";

import { useRef } from "react";


function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  const { forgotPassword, verifyResetCode } = useAuth();

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getRemainingTime = () => {
    if (typeof window === 'undefined') return 300;
    const expiry = sessionStorage.getItem('resend_otp');
    if (!expiry) return 0;
    const remaining = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
    return remaining;
  };

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Client-side only initializations to prevent hydration errors
    const storedEmail = sessionStorage.getItem('reset_email') || "";
    setEmail(storedEmail);

    const initialTime = getRemainingTime();
    setTimeLeft(initialTime);

    const storedAttempts = sessionStorage.getItem('otp_attempts');
    if (storedAttempts !== null) {
      setAttemptsLeft(parseInt(storedAttempts));
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the OTP code.");
      return;
    }

    if (attemptsLeft <= 0) {
      setError("No attempts remaining. Please resend code.");
      return;
    }

    try {
      const success = await verifyResetCode(email, otpString);
      if (success) {
        router.push('/reset-password');
      } 
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }

    setOtp(new Array(6).fill(""));
    setAttemptsLeft((prev) => {
      const next = prev - 1;
      sessionStorage.setItem('otp_attempts', next.toString());
      return next;
    });  
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await forgotPassword(email);
      if (success) {
        const newExpiry = Date.now() + 300 * 1000;
        sessionStorage.setItem('resend_otp', newExpiry.toString());
        sessionStorage.setItem('otp_attempts', '3');
        setTimeLeft(300);
        setAttemptsLeft(3);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      } 
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, index: number) => {
    const char = value.slice(-1).toUpperCase();
    if (!/^[A-Z0-9]$/.test(char) && value !== "") return;
    const digit = char;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next input if digit is entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Move focus to the next available input or the last filled
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isOtpComplete = otp.join("").length === 6;

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="sr-only">Verify OTP</h1>
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
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground mt-2">
          We've sent a 6-digit code to <span className="font-medium text-black">{email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {!error && attemptsLeft < 3 && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-md text-xs text-center">
          {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
        </div>
      )}

      <form className="space-y-6" onSubmit={handleVerify}>
        <div className="space-y-4">
          <div className="text-sm font-medium text-center text-muted-foreground">OTP Code</div>
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="h-12 w-12 text-center text-xl font-bold p-0"
                disabled={attemptsLeft <= 0 || loading}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 h-11 text-lg font-medium"
          disabled={loading || !isOtpComplete || attemptsLeft <= 0}
        >
          {attemptsLeft <= 0 ? "No attempts left" : "Verify"}
        </Button>
      </form>


      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          {timeLeft > 0 ? (
            <span className="text-blue-600 font-medium">Resend matches in {formatTime(timeLeft)}</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-blue-600 hover:underline font-medium"
            >
              {loading ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </p>
        <Link href="/login" className="block text-sm text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8 relative">
        <Link
          href="/login"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to login"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <OTPVerificationForm />
        </Suspense>
      </div>
      <AuthSidebar />
    </main>
  )
}
