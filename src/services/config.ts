export const IS_BUILD_TIME = typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

export const IS_CLIENT = process.env.NEXT_PUBLIC_IS_CLIENT === 'true' && !IS_BUILD_TIME;

// Add this new one specifically for browser API guards
export const IS_BROWSER = typeof window !== 'undefined';