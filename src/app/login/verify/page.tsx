import { Suspense } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { getLoginPage } from "@/services/content/login.service";
import { LoginPageBuilder } from "@/components/auth/builder/LoginPageBuilder";

export default async function LoginVerifyPage() {
  const [loginPage, branding, themeSettings] = await Promise.all([
    getLoginPage(),
    getBrandingConfig().catch(() => null),
    getThemeSettings().catch(() => null),
  ]);

  return (
    <Suspense>
      <LoginPageBuilder
        loginPage={loginPage}
        step="verify"
        themeSettings={themeSettings ?? null}
        branding={branding ?? null}
      />
    </Suspense>
  );
}
