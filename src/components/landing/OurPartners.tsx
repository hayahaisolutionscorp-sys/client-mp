import Image from 'next/image';
import { getPartners } from '@/services';


export default async function OurPartners() {
  const { data: partners } = await getPartners();

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

