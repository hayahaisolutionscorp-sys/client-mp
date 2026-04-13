"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type BrandingLogoProps = {
  logoSrc?: string | null;
  brandName?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  /** Prefer true for above-the-fold nav (LCP). */
  priority?: boolean;
  imageClassName?: string;
  textClassName?: string;
  textStyle?: React.CSSProperties;
};

/**
 * Navbar / header logo: shows tenant logo from branding, or brand name if missing or load fails.
 * Deployed sites can intermittently fail image fetches (SW cache, CDN, cold API); onError avoids a blank/broken image.
 */
export function BrandingLogo({
  logoSrc,
  brandName,
  alt = "Company Logo",
  width = 150,
  height = 150,
  priority = false,
  imageClassName = "w-auto h-[40px] object-contain sm:h-[55px] transition-all duration-300",
  textClassName = "text-xl font-semibold",
  textStyle,
}: BrandingLogoProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoSrc]);

  if (!logoSrc || failed) {
    return (
      <span className={textClassName} style={textStyle}>
        {brandName || "Ayahay"}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      src={logoSrc}
      width={width}
      height={height}
      className={imageClassName}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
