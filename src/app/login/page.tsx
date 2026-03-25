import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

const AuthSidebar = dynamic(() => import("@/components/auth/AuthSidebar").then(m => ({ default: m.AuthSidebar })));

export default function LoginPage() {

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-8 relative">
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <LoginForm />
      </div>
      <Suspense fallback={<div className="hidden md:block bg-blue-500/10 animate-pulse w-full h-full" />}>
        <AuthSidebar />
      </Suspense>
    </main>
  )
}
