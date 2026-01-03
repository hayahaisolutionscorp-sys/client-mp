import Media from '@/components/landing/Media';
import SearchBox from '@/components/landing/SearchBox';
import { getHeroSections } from '@/services';
import { HERO_SECTION_IMAGES } from 'constants/storage';

export default async function Hero() {
  const heroSection = await getHeroSections();
  let captionBackground;

  if (heroSection?.bg_type?.toLowerCase() == 'youtube') {
    captionBackground = (
      <Media
        src={heroSection?.bg_url}
        type="youtube"
        playing={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-150"
      />
    );
  } else if (heroSection?.bg_type?.toLowerCase() == 'image') {
    captionBackground = (
      <Media
        // src={`${HERO_SECTION_IMAGES}${heroSection?.shippingLineId}/${heroSection?.filename}`}
        src={heroSection?.bg_url || ''}
        type="image"
        alt={heroSection?.bg_alt || ''}
        className="object-cover"
        priority={true}
      />
    );
  } else {
    captionBackground = (
      <Media
        // src={`${HERO_SECTION_IMAGES}${heroSection?.shippingLineId}/${heroSection?.filename}`}
        src={heroSection?.bg_url || ''}
        type="video"
        autoPlay={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    );
  }
  return (
    <header id="Book" className="relative bg-[#EEF8FC]">
      <div className="relative w-full h-[600px] pl-4 pr-4 bg-transparent overflow-hidden">
        {captionBackground ? (
          captionBackground
        ) : (
          <video
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
            src="/assets/videos/ayahay_landing_bg.mp4"
            autoPlay
            loop
            playsInline
            muted
            aria-hidden="true"
          />
        )}

        {/* Content overlay on top of the video */}
        <div className="flex flex-col items-center absolute z-[10] inset-0 text-white text-center mt-[85px] md:mt-[100px] lg:mt-[150px]">
          <h1 className="font-bold leading-tight px-6 text-[22px] min-w-[500px] max-w-[500px] md:text-[40px] md:max-w-[800px] lg:text-[50px] lg:max-w-[1002px]">
            {heroSection?.title}
          </h1>
          <p className="font-normal px-4 pt-3 text-xs md:text-lg">{heroSection?.subtitle}</p>
        </div>
      </div>

      <SearchBox />
    </header>
  );
}
