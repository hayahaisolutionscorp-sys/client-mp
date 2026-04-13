import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen bg-[var(--surface-alt)] md:grid-cols-2">
      <div className="relative flex items-center justify-center p-6 lg:p-8">
        <Link 
          href="/" 
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors" 
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <RegisterForm />
      </div>
      <Suspense fallback={<div className="hidden md:block bg-blue-500/10 animate-pulse w-full h-full" />}>
        <AuthSidebar />
      </Suspense>
    </main>
  )
}
