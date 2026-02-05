// src/app/press/[id]/page.tsx

import { notFound } from "next/navigation";
import { getPressById } from "@/services";
import { PressItemContent } from "@/components/press/PressItemContent";

export default async function PressItem({ params }: { params: Promise<{ id: string }> }) {
  // No need to parseInt since ID can be a string (slug or uuid)
  const id = (await params).id;
  const press = await getPressById(id);

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
