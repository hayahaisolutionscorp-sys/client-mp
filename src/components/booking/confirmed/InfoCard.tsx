import Image from "next/image";

import { useThemeSettings } from "@/hooks/theme-settings";

interface InfoCardProps {
  imgSrc: string;
  altText: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

const InfoCard = ({
  imgSrc,
  altText,
  title,
  description,
  linkText,
  linkHref,
}: InfoCardProps) => {
  const themeSettings = useThemeSettings();

  return (
    <div
      className="flex flex-col sm:flex-row items-center border-2 rounded-lg shadow-sm bg-white gap-3 sm:gap-4 w-full min-w-[280px] sm:min-w-[350px] lg:min-w-[400px] max-w-[500px] p-3 sm:p-4 mb-5"
      style={{ borderColor: themeSettings?.accent || "#23abff" }}
    >
      <Image
        src={imgSrc}
        alt={altText}
        width={200}
        height={200}
        className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
      />
      <div className="space-y-2 text-center sm:text-left">
        <h3 className="text-base sm:text-lg font-bold text-customText">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        <a
          href={linkHref}
          className="inline-block text-xs sm:text-sm font-medium hover:underline"
          style={{ color: themeSettings?.accent || '#23abff' }}
        >
          {linkText}
        </a>
      </div>
    </div>
  );
};

export default InfoCard;
