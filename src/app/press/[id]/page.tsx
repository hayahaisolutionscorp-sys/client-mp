// src/app/press/[id]/page.tsx

import { notFound } from "next/navigation";
import { getPressById } from "@/services";
import { PressItemContent } from "@/components/press/PressItemContent";

export default async function PressItem({ params }: { params: Promise<{ id: string }> }) {
  const parsedId = parseInt((await params).id, 10);

  if (isNaN(parsedId)) {
    notFound();
  }

  const press = await getPressById(parsedId);
  if (!press) {
    notFound();
  }

  const formattedPressItem = {
    ...press,
    formattedDate: press.publish_date
      ? new Date(press.publish_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      : "",
  };

  return <PressItemContent pressItem={formattedPressItem} />;
}
