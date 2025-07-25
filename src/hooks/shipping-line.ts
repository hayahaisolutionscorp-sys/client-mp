import { useState, useEffect } from "react";
import { whiteLabelLinks } from 'constants/nav';
import { redirect } from 'next/navigation';
import { getShippingLine } from "@/services/shipping-line/shipping-line.service";
import { IShippingLine } from "@/models";

export function useShippingLineForWhiteLabel() {
  const [shippingLine, setShippingLine] = useState<IShippingLine | undefined>();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHIPPING_LINE_ID) {
      fetchShippingLine();
    }
  }, []);

  const fetchShippingLine = async () => {
    const shippingLine = await getShippingLine(
      Number(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID)
    );
    setShippingLine(shippingLine);
  };

  return shippingLine;
}

export function useShippingLineToRestrictAccess(link: string) {
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_SHIPPING_LINE_ID &&
      !whiteLabelLinks.some((e) => e.label === link)
    ) {
      redirect('/404');
    }
  }, []);
}
