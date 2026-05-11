import { Suspense } from 'react';
import MyActivityClient from './MyActivityClient';

export default function MyActivityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}>
      <MyActivityClient />
    </Suspense>
  );
}
