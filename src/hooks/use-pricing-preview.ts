'use client';

import { useState, useEffect, useRef } from 'react';
import { calculatePricing } from '@/services/booking/booking.service';
import type { CalculatePricingRequest, PricingResponse } from '@/types/booking/pricing';

interface UsePricingPreviewOptions {
  request: CalculatePricingRequest | null;
  shippingLineId?: string;
  headers?: HeadersInit;
  enabled?: boolean;
  debounceMs?: number;
}

interface UsePricingPreviewResult {
  pricingData: PricingResponse['data'] | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePricingPreview({
  request,
  shippingLineId,
  headers,
  enabled = true,
  debounceMs = 400,
}: UsePricingPreviewOptions): UsePricingPreviewResult {
  const [pricingData, setPricingData] = useState<PricingResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !request) {
      setPricingData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const res = await calculatePricing(request, headers, shippingLineId);
        setPricingData(res.data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, request, shippingLineId, headers, debounceMs]);

  return { pricingData, isLoading, error };
}
