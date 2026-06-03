"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_API } from 'constants/api';

interface SecureImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  fallbackToDefault?: boolean;
}

/**
 * A secure wrapper around Next.js Image component.
 *
 * Pass a directly-usable URL: http(s), blob:, and data: values are used as-is.
 * This is the normal case — the backend presigns private S3 keys (e.g. KYC ID
 * documents) into full https URLs before returning them, so callers should
 * already have a usable URL here.
 *
 * As a fallback, a bare internal key (e.g. "kyc/1/identity-documents/abc.jpg")
 * is turned into `${UPLOAD_API}/<key>`. Note: there is no backend route that
 * resolves such keys to a presigned URL, so a bare key will fail to load and
 * render the "Unavailable" placeholder. Always presign private keys
 * server-side rather than relying on this branch.
 */
export const SecureImage = ({ src, alt, className, fallbackToDefault = true, ...props }: SecureImageProps) => {
  const [error, setError] = useState(false);

  // Resolve the src to a usable URL synchronously — no async fetch needed
  const resolvedSrc = (() => {
    if (!src) return null;

    // Already a usable URL — pass through directly
    if (
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('blob:') ||
      src.startsWith('data:')
    ) {
      return src;
    }

    // Fallback for a bare internal key. There is no backend endpoint that
    // resolves these to a presigned S3 URL, so this only renders if the key
    // happens to be publicly reachable — otherwise the <img> errors and we
    // show the "Unavailable" placeholder. Presign private keys server-side.
    return `${UPLOAD_API}/${src}`;
  })();

  if (error || !resolvedSrc) {
    if (fallbackToDefault) {
      return (
        <div
          className={cn("flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 p-2", className)}
          style={{ width: props.width, height: props.height }}
        >
          <AlertCircle className="h-5 w-5 mb-1 text-slate-300" />
          <span className="text-[10px] font-medium text-center uppercase tracking-tight">Unavailable</span>
        </div>
      );
    }
    return null;
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      className={className}
      unoptimized={props.unoptimized ?? true}
      onError={() => setError(true)}
    />
  );
};
