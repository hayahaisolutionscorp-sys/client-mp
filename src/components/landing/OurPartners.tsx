'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getPartners } from '@/services';
import type { PreviewPartner } from '@/lib/preview/landing-preview';

interface OurPartnersProps {
  partnersOverride?: PreviewPartner[] | null;
}

export default function OurPartners({ partnersOverride }: OurPartnersProps = {}) {
  const [partners, setPartners] = useState<PreviewPartner[]>(() =>
    partnersOverride != null ? partnersOverride : []
  );
  const [loading, setLoading] = useState(() => partnersOverride == null);

  useEffect(() => {
    if (partnersOverride != null) {
      setPartners(partnersOverride);
      setLoading(false);
      return;
    }

    getPartners().then(res => {
      setPartners(res.data || []);
      setLoading(false);
    });
  }, [partnersOverride]);

  if (loading) return null;

  return (
    <section className="flex flex-col items-center justify-start bg-white h-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        {partners?.map((partner) => (
          <div key={partner.id} className="flex flex-col items-center justify-center">
            <Image
              src={partner.logo_url}
              alt={`${partner.name} Logo`}
              height={200}
              width={500}
              className="w-auto h-[96px] object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
