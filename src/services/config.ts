export const IS_CLIENT = process.env.NEXT_PUBLIC_IS_CLIENT === 'true';

// Add this new one specifically for browser API guards
export const IS_BROWSER = typeof window !== 'undefined';