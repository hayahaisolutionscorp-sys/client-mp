'use client';

import { useState, useEffect, useCallback, TouchEvent, use } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';

import { CAROUSEL_IMAGES } from 'constants/storage';
import { IThumbnail } from '@/models';

const Carousel = ({ images }: { images: Promise<IThumbnail[]> }) => {
  const allImages = use(images);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imagesToShow, setImagesToShow] = useState<number>(3);
  const [modalImage, setModalImage] = useState<IThumbnail | null>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalImages = allImages.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalImage(null);
      }
    };

    if (modalImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalImage]);

  useEffect(() => {
    const updateImagesToShow = () => {
      if (window.innerWidth >= 1280) setImagesToShow(3);
      else if (window.innerWidth >= 768) setImagesToShow(2);
      else setImagesToShow(1);
    };

    updateImagesToShow();
    window.addEventListener('resize', updateImagesToShow);
    return () => window.removeEventListener('resize', updateImagesToShow);
  }, []);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(prev + 1, totalImages - imagesToShow));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [totalImages, imagesToShow, isTransitioning]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < totalImages - imagesToShow) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="relative w-full px-4 sm:px-8">
      <div className="w-full overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${100 * currentIndex}%)`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {allImages.map((image, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-2"
              style={{
                flex: `0 0 ${100 / imagesToShow}%`
              }}
            >
              <div
                className="relative w-full pt-[56.25%] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                role="button"
                tabIndex={0}
                onClick={() => setModalImage(image)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModalImage(image);
                  }
                }}
                aria-label={`View image ${image.label}`}
              >
                <Image
                  // src={`${CAROUSEL_IMAGES}${image.shippingLineId}/${image.filename}`}
                  src={image.filename}
                  alt={`${image.label}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33.33vw"
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                  priority={index === currentIndex}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Improved visibility and touch areas */}
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0 || isTransitioning}
        className={`absolute top-1/2 -left-2 sm:-left-4 transform -translate-y-1/2 p-2 sm:p-3 bg-white/90 text-gray-800 rounded-full shadow-lg backdrop-blur-sm z-10 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:bg-white active:scale-95'
          }`}
        aria-label="Previous slide"
      >
        <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex >= totalImages - imagesToShow || isTransitioning}
        className={`absolute top-1/2 -right-2 sm:-right-4 transform -translate-y-1/2 p-2 sm:p-3 bg-white/90 text-gray-800 rounded-full shadow-lg backdrop-blur-sm z-10 ${currentIndex >= totalImages - imagesToShow
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-110 hover:bg-white active:scale-95'
          }`}
        aria-label="Next slide"
      >
        <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Pagination Dots - Enhanced visibility */}
      <div className="flex justify-center items-center mt-4 space-x-1">
        {Array.from({ length: Math.ceil(totalImages / imagesToShow) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${currentIndex === index ? 'text-customBlue scale-150' : 'text-gray-400 hover:text-gray-600'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <BsDot className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Modal - Improved mobile experience */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] rounded-lg overflow-hidden">
            <Image
              // src={`${CAROUSEL_IMAGES}${modalImage.shippingLineId}/${modalImage.filename}`}
              src={modalImage.filename}
              alt="Enlarged view"
              width={1200}
              height={800}
              className="object-contain w-auto h-auto max-h-[90vh]"
              priority
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalImage(null);
              }}
              className="absolute top-4 right-4 text-white bg-black/50 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300"
              aria-label="Close modal"
            >
              <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
