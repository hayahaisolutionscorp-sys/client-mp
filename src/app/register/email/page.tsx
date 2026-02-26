import { ArrowLeft } from "lucide-react"
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { RegisterEmailForm } from "@/components/auth/RegisterEmailForm";
import { Suspense } from "react";

export default function RegisterEmailPage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8 relative">
        <a 
          href="/register"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors" 
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </a>
        <RegisterEmailForm />
      </div>
      <Suspense fallback={<div className="hidden md:block bg-blue-500/10 animate-pulse w-full h-full" />}>
        <AuthSidebar />
      </Suspense>
    </main>
  )
}
