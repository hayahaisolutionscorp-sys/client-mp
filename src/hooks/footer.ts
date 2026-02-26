import { useState, useEffect } from "react";
import { getFooterSections } from "@/services/ui/footer-section.service";
import { IFooterSection } from "@/models";

const FOOTER_CACHE_KEY = "footer_sections";

export const useFooter = () => {
  const [footer, setFooter] = useState<IFooterSection | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(FOOTER_CACHE_KEY);
    if (cached) {
      try {
        setFooter(JSON.parse(cached));
        setIsHydrated(true);
        return;
      } catch (e) {
        console.error("Failed to parse cached footer:", e);
      }
    }

    setIsHydrated(true);

    getFooterSections()
      .then((data) => {
        if (data) {
          setFooter(data);

          // Exclude unnecessary fields before caching
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { ...cacheData } = data;
          localStorage.setItem(FOOTER_CACHE_KEY, JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching footer settings:", error));
  }, []);

  return footer;
};
