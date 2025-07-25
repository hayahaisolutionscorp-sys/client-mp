import { useState, useEffect } from "react";
import { getThemeSettingsByShippingLineId } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";

const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || "3";

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(null);

  useEffect(() => {
    const parsedId = parseInt(shippingLineId, 10);
    if (isNaN(parsedId)) {
      console.error("Invalid shippingLineId:", shippingLineId);
      return;
    }

    getThemeSettingsByShippingLineId(parsedId)
      .then((data: IThemeSettings | null | undefined) => {
        if (data && Object.keys(data).length > 0) {
          setThemeSettings(data);
        } else {
          console.warn("Theme settings are null, undefined, or empty");
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, []);

  return themeSettings;
};
