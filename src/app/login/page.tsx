import { Metadata } from "next";
import { Suspense } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { getLoginPage } from "@/services/content/login.service";
import { LoginPageBuilder } from "@/components/auth/builder/LoginPageBuilder";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const [loginPage, branding, themeSettings] = await Promise.all([
    getLoginPage(),
    getBrandingConfig().catch(() => null),
    getThemeSettings().catch(() => null),
  ]);

  return (
    <Suspense>
      <LoginPageBuilder
        loginPage={loginPage}
        step="email"
        themeSettings={themeSettings ?? null}
        branding={branding ?? null}
      />
    </Suspense>
  );
}
