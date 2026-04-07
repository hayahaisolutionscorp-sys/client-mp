"use client"

import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { UserIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContexts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { RegisterForm as IRegisterForm } from "@/models";
import BirthDatePicker from "@/components/ui/BirthDatePicker";
import Combobox from "@/components/ui/Combobox";
import CountryCodeSelector, { CountryData } from "@/components/ui/CountryCodeSelector";
import { defaultCountries, parseCountry } from "react-international-phone";
import NationalitySelector from "@/components/ui/NationalitySelector";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";

const REGISTER_STEP_KEY = 'register-step';

export function RegisterForm() {
  const router = useRouter();
  const branding = useBranding();
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';
  const { clearSession, signInWithGoogle, signInWithFacebook, signInWithHayahai } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleHayahaiRegister = async () => {
    try {
      setLoading(true);
      await signInWithHayahai();
      router.push('/');
    } catch (error: any) {
      if (error?.message === 'Authentication cancelled') {
        console.log('Hayahai sign-in cancelled');
      } else {
        console.error('Hayahai sign-in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    clearSession();
    sessionStorage.removeItem(REGISTER_STEP_KEY);
    sessionStorage.removeItem('login-step');
  }, [clearSession]);

  const MIN_AGE = 18;
  const defaultBirthday = new Date();
  defaultBirthday.setFullYear(defaultBirthday.getFullYear() - MIN_AGE);

  const defaultCountryData = React.useMemo(() => {
    const ph = defaultCountries.find(c => parseCountry(c).iso2 === 'ph') || defaultCountries[0];
    const parsed = parseCountry(ph);
    const formatStr = typeof parsed.format === 'string' ? parsed.format : '';
    const dotMatches = formatStr.match(/\./g);
    return {
      iso2: parsed.iso2,
      dialCode: parsed.dialCode,
      maxLength: dotMatches ? dotMatches.length : 10,
      placeholder: formatStr.replace(/\./g, "0").replace(/\\/g, "") || "917 123 4567"
    };
  }, []);
  
  const [phoneState, setPhoneState] = useState({
    code: defaultCountryData.iso2,
    digits: "",
    config: {
      maxLength: defaultCountryData.maxLength,
      placeholder: defaultCountryData.placeholder,
      dialCode: defaultCountryData.dialCode
    }
  });

  const [formData, setFormData] = useState<Omit<IRegisterForm, 'email' | 'password' | 'confirm' | 'agreement' | 'emailConsent'>>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffixName: "",
    sex: "Male",
    birthday: defaultBirthday.toISOString().split('T')[0],
    address: "",
    nationality: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, phoneState.config.maxLength);
    setPhoneState(prev => ({ ...prev, digits: limitedDigits }));
    setFormData(prev => ({ ...prev, phone: '+' + phoneState.config.dialCode + limitedDigits }));
  };

  const setBirthday: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setFormData(prev => ({ ...prev, birthday: value.toISOString() }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "First Name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last Name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.nationality.trim()) errors.nationality = "Nationality is required";
    if (!phoneState.digits || phoneState.digits.length < phoneState.config.maxLength) {
      errors.phone = `Phone number must be ${phoneState.config.maxLength} digits`;
    }

    const birthDate = new Date(formData.birthday);
    const minAllowed = new Date();
    minAllowed.setFullYear(minAllowed.getFullYear() - MIN_AGE);
    if (birthDate > minAllowed) errors.birthday = `You must be at least ${MIN_AGE} years old to register`;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    sessionStorage.setItem(REGISTER_STEP_KEY, JSON.stringify({ ...formData, ts: Date.now() }));
    router.push('/register/email');
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log('Google sign-in cancelled');
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
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor, color: 'white' }}>
            <UserIcon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium" style={{ color: primaryColor }}>Passenger Info</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 mx-2" />
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>2</div>
          <span className="text-sm font-medium text-gray-700">Email</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 mx-2" />
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>3</div>
          <span className="text-sm font-medium text-gray-700">Security</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="sr-only">Register</h1>
      <div className="flex justify-center">
        <Image
          src={branding?.logo.dark || branding?.logo.light || "/assets/icons/Ayahay_blue_vertical.svg"}
          alt={`${branding?.brand_name || "Hayahai"} Logo`}
          width={210} height={210} className="h-15 w-15"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Create your account</p>
      </div>

      <StepIndicator />

      <form onSubmit={handleNext} className="space-y-4" noValidate>
        <div className="space-y-2">
          <div className="text-sm font-medium">First Name <span className="text-red-500">*</span></div>
          <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required
            className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.firstName ? "border-red-500" : ""}`} />
          {validationErrors.firstName && <p className="text-xs text-red-500">{validationErrors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Middle Name</div>
          <Input name="middleName" placeholder="Middle Name (Optional)" value={formData.middleName} onChange={handleInputChange}
            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Last Name <span className="text-red-500">*</span></div>
          <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required
            className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.lastName ? "border-red-500" : ""}`} />
          {validationErrors.lastName && <p className="text-xs text-red-500">{validationErrors.lastName}</p>}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Suffix</div>
          <Input name="suffixName" placeholder="Jr., Sr., III, etc. (Optional)" value={formData.suffixName} onChange={handleInputChange}
            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></div>
          <div className="flex gap-2">
            <CountryCodeSelector 
              value={phoneState.code}
              onChange={(country: CountryData) => {
                const truncated = phoneState.digits.slice(0, country.maxLength);
                setPhoneState({
                  code: country.iso2,
                  digits: truncated,
                  config: {
                    maxLength: country.maxLength,
                    placeholder: country.placeholder,
                    dialCode: country.dialCode
                  }
                });
                setFormData(prev => ({ 
                  ...prev, 
                  phone: '+' + country.dialCode + truncated 
                }));
              }}
            />
            <Input 
              name="phone" 
              placeholder={phoneState.config.placeholder} 
              value={phoneState.digits}
              onChange={(e) => handlePhoneChange(e.target.value)} 
              required 
              type="tel"
              className={`flex-1 ${validationErrors.phone ? "border-red-500" : ""}`} 
            />
          </div>
          {validationErrors.phone && <p className="text-xs text-red-500">{validationErrors.phone}</p>}
        </div>
        <div className="gap-3 flex w-full">
          <div className="space-y-2 flex-1">
            <div className="text-sm font-medium">Sex <span className="text-red-500">*</span></div>
            <Select name="sex" required value={formData.sex}
              onValueChange={(value: "Male" | "Female") => setFormData(prev => ({ ...prev, sex: value }))}>
              <SelectTrigger className={`w-full bg-white text-gray-900 border-gray-300 ${validationErrors.sex ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select your sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <div className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></div>
            <BirthDatePicker date={new Date(formData.birthday)} setDate={setBirthday} validationErrors={validationErrors} />
            {validationErrors.birthday && <p className="text-xs text-red-500">{validationErrors.birthday}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Address <span className="text-red-500">*</span></div>
          <Input name="address" placeholder="Region, Province, Municipality" value={formData.address} onChange={handleInputChange} required
            className={`bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 ${validationErrors.address ? "border-red-500" : ""}`} />
          {validationErrors.address && <p className="text-xs text-red-500">{validationErrors.address}</p>}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Nationality <span className="text-red-500">*</span></div>
          <NationalitySelector
            defaultValue={formData.nationality}
            onChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
          />
          {validationErrors.nationality && <p className="text-xs text-red-500">{validationErrors.nationality}</p>}
        </div>
        <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }} disabled={loading}>
          {loading ? "Please wait..." : "Next"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={handleGoogleRegister}
          variant="outline"
          disabled={loading}
          className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
        >
          <Image src="/assets/icons/google_logo.svg" alt="Google" width={20} height={20} className="mr-2" />
          Continue with Google
        </Button>
        <Button
          onClick={handleFacebookRegister}
          variant="outline"
          disabled={loading}
          className="w-full border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
        >
          <Image src="/assets/icons/facebook_logo.svg" alt="Facebook" width={20} height={20} className="mr-2" />
          Continue with Facebook
        </Button>
        {process.env.NEXT_PUBLIC_IS_CLIENT === 'true' && (
          <Button
            onClick={handleHayahaiRegister}
            variant="outline"
            disabled={loading}
            className="w-full sm:col-span-2 border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
          >
            <Image src="/assets/icons/Ayahay_logo.svg" alt="Ayahay" width={20} height={20} className="mr-2" />
            Continue with Hayahai
          </Button>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            href="/login" 
            onMouseEnter={() => router.prefetch('/login')}
            className="hover:underline" 
            style={{ color: primaryColor }}
          >
            Sign in
          </Link>
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="hover:underline" style={{ color: primaryColor }}>Terms of Use</Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:underline" style={{ color: primaryColor }}>Privacy Policy</Link>
      </p>
    </div>
  );
}
