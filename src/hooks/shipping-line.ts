import { useState } from "react";
import { IShippingLine } from "@/models";

export function useShippingLineForWhiteLabel() {
  const [shippingLine, setShippingLine] = useState<IShippingLine | undefined>();

  // UseEffect removed as NEXT_PUBLIC_SHIPPING_LINE_ID is deprecated (white label mode disabled)
  // This hook now effectively returns undefined, defaulting to Marketplace behavior.

  return shippingLine;
}

export function useShippingLineToRestrictAccess(link: string) {
  // Access restriction based on NEXT_PUBLIC_SHIPPING_LINE_ID is removed.
  // This hook is now a no-op.
}
