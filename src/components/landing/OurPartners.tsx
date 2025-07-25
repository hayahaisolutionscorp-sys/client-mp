import Image from 'next/image';
import { SHIPPING_LINE_LOGO } from 'constants/storage';
import { getAllShippingLinesServer } from '@/services';


export default async function OurPartners() {
  const shippingLines = await getAllShippingLinesServer();

  const filteredShippingLines = shippingLines
    ?.filter((line) => !line.name.toLowerCase().includes('ayahay'))
    .sort((a, b) => a.id - b.id); // Sort by id in ascending order

  return (
    <section className="flex flex-col items-center justify-start bg-white h-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        {filteredShippingLines?.map((line) => (
          <div key={line.id} className="flex flex-col items-center justify-center">
            <Image
              src={`${SHIPPING_LINE_LOGO}${line.logoFilename}`}
              alt={`${line.name} Logo`}
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

