import Image from 'next/image';

export default async function Features() {
  return (
    <section className="w-full">
      <div className="min-h-[400px] flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-bold text-customText text-2xl sm:text-3xl md:text-4xl mb-4">
            Why Choose <span className="text-customBlue">Ayahay!</span>
          </h2>
          <p className="text-customText/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            Ayahay serves as a platform that caters to the needs of both shipping lines and passengers/shippers in the
            Philippines. It acts as a bridge between shipping lines and passengers/shippers, providing a centralized
            platform for efficient communication and transactions.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto">
          <FeatureCard
            icon={
              <Image
                src="/assets/features/best_price_guarantee.svg"
                alt=""
                width={65}
                height={65}
              />
            }
            title="Best Price Guarantee"
            description="Enjoy the lowest fares for your journey, with no hidden fees — guaranteed!"
          />

          <FeatureCard
            icon={
              <Image
                src="/assets/features/easy_and_quick_booking.svg"
                alt=""
                width={65}
                height={65}
              />
            }
            title="Easy & Quick Booking"
            description="Book your trip in just a few steps and get ready to sail without the wait!"
          />

          <FeatureCard
            icon={
              <Image
                src="/assets/features/customer_care_24_for_7.svg"
                alt=""
                width={65}
                height={65}
              />
            }
            title="Customer Care 24/7"
            description="We're here for you anytime, with round-the-clock support to assist you on your journey!"
          />
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col p-6 sm:p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out h-full">
      <div className="py-2 mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="font-semibold text-customText text-lg sm:text-xl mb-3">{title}</h3>
      <p className="text-customText/70 text-sm sm:text-base">{description}</p>
    </div>
  );
}

