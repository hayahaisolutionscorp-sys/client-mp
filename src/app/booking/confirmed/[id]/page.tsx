import { Suspense } from "react";
import BookingDetails from "@/components/booking/confirmed/BookingDetails";

export default function Confirmed() {
  return (
    <Suspense>
      <BookingDetails />
    </Suspense>
  )
}
