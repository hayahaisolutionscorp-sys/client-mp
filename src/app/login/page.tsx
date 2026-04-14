import { Metadata } from "next";
import { Suspense } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { getLoginPage } from "@/services/content/login.service";
import { LoginPageBuilder } from "@/components/auth/builder/LoginPageBuilder";
import { AuthSkeleton } from "@/components/ui/PageSkeleton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function LoginContent() {
  const [loginPage, branding, themeSettings] = await Promise.all([
    getLoginPage(),
    getBrandingConfig().catch(() => null),
    getThemeSettings().catch(() => null),
  ]);

  return (
    <LoginPageBuilder
      loginPage={loginPage}
      step="email"
      themeSettings={themeSettings ?? null}
      branding={branding ?? null}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

