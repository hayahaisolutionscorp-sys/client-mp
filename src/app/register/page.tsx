"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, ArrowLeft, UserIcon, UserPlusIcon, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import { AuthSidebar } from "@/components/auth/AuthSidebar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { RegisterForm } from "@/models";
import BirthDatePicker from "@/components/ui/BirthDatePicker";
import Combobox from "@/components/ui/Combobox";
import { NATIONALITIES } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";

export default function RegisterPage() {
  const router = useRouter();
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';
  const dateToday = new Date();
  const { register, signInWithGoogle, signInWithFacebook, clearSession } = useAuth();
  
  useEffect(() => {
    clearSession();
  }, [clearSession]);

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    confirm: "",
    firstName: "",
    lastName: "",
    sex: "Male",
    birthday: dateToday.toISOString().split('T')[0],
    address: "",
    nationality: "",
    agreement: false,
    phone: "+639",
    emailConsent: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneChange = (value: string) => {
    // Always ensure it starts with +639
    if (!value.startsWith('+639')) {
      value = '+639';
    }
    
    // Remove any non-digit characters after +639
    const prefix = '+639';
    const digitsOnly = value.slice(4).replace(/\D/g, '');
    
    // Limit to 9 digits after +639 (total 13 characters)
    const limitedDigits = digitsOnly.slice(0, 9);
    
    setFormData(prev => ({
      ...prev,
      phone: prefix + limitedDigits
    }));
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
      if (!passwordRegex.test(formData.password)) {
        errors.password = "Password must have at least 1 uppercase, lowercase, number, and special character"
      }
    }

    if (formData.password !== formData.confirm) {
      errors.confirm = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleRegister = async (values: RegisterForm) => {
    const { email, password } = values;
    setLoading(true);
    setValidationErrors({}); // Clear previous errors
    setGeneralError(null); // Clear previous general errors

    try {
      await register(email, password, values);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      // Construct validation errors object if the error message is comma-separated list of validations
      if (error.message && typeof error.message === 'string' && error.message.includes(',')) {
        const errors: Record<string, string> = {};
        error.message.split(',').forEach((err: string) => {
          const [field] = err.trim().split(' ');
          if (field) {
            errors[field] = err.trim();
          }
        });
        setValidationErrors(errors);
      } else if (error.message && typeof error.message === 'string') {
        const errors: Record<string, string> = {};
        if (error.message.includes('firstName')) errors.firstName = error.message;
        if (error.message.includes('lastName')) errors.lastName = error.message;
        if (error.message.includes('birthday')) errors.birthday = error.message;
        if (error.message.includes('sex')) errors.sex = error.message;
        if (error.message.includes('address')) errors.address = error.message;
        if (error.message.includes('nationality')) errors.nationality = error.message;
        
        setValidationErrors(errors);
        setGeneralError(error.message || "An unexpected error occurred. Please try again.");
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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

  const handleFacebookRegister = async () => {
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

  const setBirthday: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setFormData((prev) => ({ ...prev, birthday: value.toISOString() }));
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
          <h1 className="sr-only">Register</h1>
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
            <p className="text-sm text-muted-foreground">Enter your Email and Password to Continue</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300`}
                  style={{
                    backgroundColor: step === 1 ? primaryColor : '#E5E7EB',
                    color: step === 1 ? '#FFFFFF' : '#6B7280'
                  }}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300`}
                  style={{ color: step === 1 ? primaryColor : '#374151' }}
                >
                  Account Info
                </span>
              </div>
              <div
                className={`mx-4 h-[2px] w-16 transition-colors duration-300`}
                style={{ backgroundColor: step === 2 ? primaryColor : '#E5E7EB' }}
              />
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300`}
                  style={{
                    backgroundColor: step === 2 ? primaryColor : '#E5E7EB',
                    color: step === 2 ? '#FFFFFF' : '#6B7280'
                  }}
                >
                  <UserPlusIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300`}
                  style={{ color: step === 2 ? primaryColor : '#374151' }}
                >
                  Passenger Info
                </span>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4" noValidate>
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{generalError}</span>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.email ? "border-red-500" : ""}`}
                />
                {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
              </div>
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
                    className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.password ? "border-red-500" : ""}`}
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
                    className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.confirm ? "border-red-500" : ""}`}
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
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }}>
                Next
              </Button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(formData); }} className="space-y-4">
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{generalError}</span>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">First Name <span className="text-red-500">*</span></div>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.firstName ? "border-red-500" : ""}`}
                />
                {validationErrors.firstName && <p className="text-xs text-red-500">{validationErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Name <span className="text-red-500">*</span></div>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.lastName ? "border-red-500" : ""}`}
                />
                {validationErrors.lastName && <p className="text-xs text-red-500">{validationErrors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></div>
                <Input
                  name="phone"
                  placeholder="+639171234567"
                  value={formData.phone || '+639'}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                  maxLength={13}
                  className={validationErrors.phone ? "border-red-500" : ""}

                />
                {validationErrors.phone && <p className="text-xs text-red-500">{validationErrors.phone}</p>}
              </div>
                <div className="gap-3 flex w-full">
                   <div className="space-y-2 flex-1">
                <div className="text-sm font-medium">Sex <span className="text-red-500">*</span></div>
                <Select
                  name="sex"
                  required
                  value={formData.sex}
                  onValueChange={(value: "Male" | "Female") => setFormData((prev) => ({ ...prev, sex: value }))}
                >
                  <SelectTrigger className={`w-full bg-white text-gray-900 border-gray-300 ${validationErrors.sex ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select your sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>  
                  </SelectContent>
                </Select>
                {validationErrors.sex && <p className="text-xs text-red-500">{validationErrors.sex}</p>}
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></div>  
                  <BirthDatePicker date={new Date(formData.birthday)} setDate={setBirthday} validationErrors={validationErrors} />
                {validationErrors.birthday && <p className="text-xs text-red-500">{validationErrors.birthday}</p>}
              </div>
             </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Address <span className="text-red-500">*</span></div>
                <Input
                  name="address"
                  placeholder="Region, Province, Municipality"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.address ? "border-red-500" : ""}`}
                />
                {validationErrors.address && <p className="text-xs text-red-500">{validationErrors.address}</p>}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Nationality <span className="text-red-500">*</span></div>
                <Combobox
                    values={NATIONALITIES}
                    placeholder="Select nationality"
                    defaultValue={formData.nationality}
                    onChange={(value) => setFormData((prev) => ({ ...prev, nationality: value }))}
                />
                {validationErrors.nationality && <p className="text-xs text-red-500">{validationErrors.nationality}</p>}
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: primaryColor }}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Submit"}
                </Button>
              </div>
            </form>
          )}

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
              onClick={handleGoogleRegister}
              variant="outline"
              className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
              disabled={loading}
            >
              <Image src="/assets/icons/google_logo.svg" alt="Google" width={20} height={20} className="mr-2" />
              Continue with Google
            </Button>
            <Button
              onClick={handleFacebookRegister}
              variant="outline"
              className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
              disabled={loading}
            >
              <Image src="/assets/icons/facebook_logo.svg" alt="Facebook" width={20} height={20} className="mr-2" />
              Continue with Facebook
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="hover:underline" style={{ color: primaryColor }}>
                Sign in
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


