import { useState, useEffect } from "react";
import { getContactUs } from "@/services/content/contact-us.service";
import { IContactInformation } from "@/models";

const CONTACT_CACHE_KEY = "contact_information";

export const useContactUs = () => {
  const [contactInfo, setContactInfo] = useState<IContactInformation[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(CONTACT_CACHE_KEY);
    if (cached) {
      try {
        setContactInfo(JSON.parse(cached));
        setIsHydrated(true);
      } catch (e) {
        console.error("Failed to parse cached contact info:", e);
      }
    }

    setIsHydrated(true);

    getContactUs()
      .then((data) => {
        if (data) {
          setContactInfo(data);

          // Exclude unnecessary fields before caching
          const cacheData = data.map(({ created_at, updated_at, ...rest }) => rest);
          localStorage.setItem(CONTACT_CACHE_KEY, JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching contact information:", error));
  }, []);

  return contactInfo;
};
