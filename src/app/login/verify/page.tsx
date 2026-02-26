import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { LoginVerifyForm } from "@/components/auth/LoginVerifyForm";
import { Suspense } from "react";

export default function LoginVerifyPage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8 relative">
        <Link
          href="/login"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to email step"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <LoginVerifyForm />
      </div>
      <Suspense fallback={<div className="hidden md:block bg-blue-500/10 animate-pulse w-full h-full" />}>
        <AuthSidebar />
      </Suspense>
    </main>
  )
}
