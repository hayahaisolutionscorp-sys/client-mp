"use client"

import { useEffect, useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, ArrowLeft, UserIcon, UserPlusIcon } from "lucide-react"
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
import { RegisterForm } from "@/models";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();  // Remove sendEmailVerification

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    confirm: "",
    firstName: "",
    lastName: "",
    sex: "Male",
    birthday: "",
    address: "",
    nationality: "",
    agreement: false,
    occupation: "Unemployed",
    civilStatus: "Single",
    mobile_number: "",
    emailConsent: false
  })

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
  }, [slides.length])  // Add slides.length to dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleRegister = async (values: RegisterForm) => {
    const { email, password } = values;
    setLoading(true);

    try {
      await register(email, password, values);
      router.push('/');
    } catch (error) {
      console.error(error);
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
          <h1 className="sr-only">Register</h1>
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

          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${step === 1 ? "text-blue-500" : "text-gray-700"
                    }`}
                >
                  Account Info
                </span>
              </div>
              <div
                className={`mx-4 h-[2px] w-16 transition-colors duration-300 ${step === 2 ? "bg-blue-500" : "bg-gray-200"
                  }`}
              />
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <UserPlusIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${step === 2 ? "text-blue-500" : "text-gray-700"
                    }`}
                >
                  Passenger Info
                </span>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
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
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                Next
              </Button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(formData); }} className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">First Name</div>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Name</div>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Sex</div>
                <Select
                  name="sex"
                  value={formData.sex}
                  onValueChange={(value: "Male" | "Female") => setFormData((prev) => ({ ...prev, sex: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Date of Birth</div>
                <Input
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Address</div>
                <Input
                  name="address"
                  placeholder="Region, Province, Municipality"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Nationality</div>
                <Input
                  name="nationality"
                  placeholder="Filipino, Chinese, American, etc."
                  value={formData.nationality}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Submit"}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden bg-blue-500 md:block">
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
