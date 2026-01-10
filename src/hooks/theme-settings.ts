import { useState, useEffect } from "react";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(null);

  useEffect(() => {
    getThemeSettings()
      .then((data) => {
        if (data) {
          setThemeSettings(data);
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, []);

  return themeSettings;
};
