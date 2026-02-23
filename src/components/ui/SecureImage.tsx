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
 * For internal file keys (e.g. "view/kyc/1/identity-documents/abc.jpg"),
 * it constructs the full backend URL and lets the browser's native <img>
 * follow the 302 redirect to the S3 presigned URL. This avoids CORS issues
 * that occur when Axios tries to follow the redirect via XHR.
 *
 * Direct http(s), blob:, and data: URLs are passed through as-is.
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

    // Internal file key → build the full backend URL.
    // The backend will 302 redirect to the S3 presigned URL,
    // and the browser's <img> tag follows redirects natively (no CORS issue).
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
