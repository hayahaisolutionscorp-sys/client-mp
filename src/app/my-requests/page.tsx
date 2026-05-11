import { redirect } from 'next/navigation';

export default function MyRequestsLegacyRedirect() {
  redirect('/my-activity');
}
