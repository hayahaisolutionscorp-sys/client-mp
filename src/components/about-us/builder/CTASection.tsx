import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface CTASectionProps {
  primaryColor: string;
  secondaryColor: string;
  textOnPrimary: string;
}

export default function CTASection({
  primaryColor,
  secondaryColor,
  textOnPrimary,
}: CTASectionProps) {
  return (
    <section
      className="rounded-[28px] px-8 py-10 text-center text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: textOnPrimary }}
    >
      <h2 className="text-2xl font-semibold md:text-3xl">Ready to work with us?</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base" style={{ color: textOnPrimary === '#f8fafc' ? '#e2e8f0' : '#334155' }}>
        Reach out to our team and we&apos;ll help you move passengers, cargo, and operations with less friction.
      </p>
      <Link href="/contact-us" className="mt-6 inline-flex">
        <Button variant="default" className="px-6 py-3 text-sm font-semibold">
          Get in touch
        </Button>
      </Link>
    </section>
  );
}
