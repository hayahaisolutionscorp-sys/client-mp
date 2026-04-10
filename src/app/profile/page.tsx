import { Suspense } from "react";
import ProfilePageClient from "./ProfilePageClient";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageClient />
    </Suspense>
  );
}
