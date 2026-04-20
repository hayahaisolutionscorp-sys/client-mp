"use client";

import { useThemeSettings } from "@/hooks/theme-settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input"
import { MailboxIcon } from "@/components/icons/MailboxIcon";

const SubscribeBanner = () => {
  const themeSettings = useThemeSettings();

  return (
    <div
      className="flex flex-col relative bg-[#AADCFB] rounded-lg shadow-md w-full h-auto max-w-6xl mx-auto px-6
      md:flex-row md:justify-between md:h-[278px] sm:px-28 lg:relative lg:z-10 lg:max-w-[85%] lg:px-10 overflow-hidden"
      style={{ backgroundColor: themeSettings?.secondaryColor }}
    >
      <div className="flex flex-col items-center w-full md:w-auto md:items-start justify-center text-center md:text-left py-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#FFFFFF]">
          Get Updates & More
        </h2>
        <p className="text-sm md:text-xs text-[#FFFFFF] mt-2">
          {`We'll send you a nice letter once per week. No spam.`}
        </p>
        <div className="flex flex-col items-center w-full mt-5 md:mr-4 space-y-4 md:w-auto md:flex-row md:space-y-0 md:space-x-4">
          <Input
            type="email"
            placeholder="Your email address"
            className="w-full md:w-[300px]"
          />
          <Button
            variant="default"
            className="px-6 py-2 w-full md:w-auto">
            Subscribe
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-center h-full mt-4 md:mt-0">
        <MailboxIcon
          className="w-full h-auto max-w-[350px]"
          primaryColor={themeSettings?.primaryColor}
          secondaryColor={themeSettings?.secondaryColor}
          accentColor={themeSettings?.accent}
        />
      </div>
    </div>
  );
};

export default SubscribeBanner;
