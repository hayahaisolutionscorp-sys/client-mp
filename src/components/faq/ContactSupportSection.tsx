import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ContactSupportSection() {
  return (
    <div className="mt-12 md:mt-16 text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
      <p className="text-gray-600 mb-6">
        Can&sbquo;t find the answer you&sbquo;re looking for? Our support team is here to help 24/7.
      </p>
      <Link href="/contact-us" passHref>
        <Button variant="default" className="px-6 py-3">
          Contact Support
        </Button>
      </Link>
    </div>
  );
}
