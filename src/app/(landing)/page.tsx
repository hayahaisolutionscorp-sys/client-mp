import Hero from '@/components/landing/Hero';
import Promos from '@/components/landing/Promos';
import PopularRoutes from '@/components/landing/PopularRoutes';
import WhyChooseUs from '@/components/landing/WhyChooseUs';

export default async function Home() {
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');

  return (
    <div className="bg-[#EEF8FC]">
      <Hero />

      <div className="bg-[#EEF8FC]">
        <Promos />
        <PopularRoutes />
        {shippingLineId === 3 && <WhyChooseUs />}
      </div>
    </div>
  );
}
