'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './PhotoGrid.module.css';
import { IoClose } from 'react-icons/io5';
import { IThumbnail } from '@/models';

export default function PhotoGrid({ images }: { images: Promise<IThumbnail[]> }) {

  const allImages = use(images)
  const [modalImage, setModalImage] = useState<IThumbnail | null>(null);

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

  const handleImageClick = (image: IThumbnail) => {
    setModalImage(image);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {allImages.map((image, index) => (
          <div
            key={index}
            className={`${styles['zoom-container']} relative shadow-md rounded-lg overflow-hidden aspect-[4/3]`}
            role="button"
            tabIndex={0}
            onClick={() => handleImageClick(image)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick(image);
              }
            }}
          >
            <Image
              // src={`${PHOTOGRID_IMAGES}${image.shippingLineId}/${image.filename}`}
              src={image.filename}
              alt={image.label}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              priority={index < 4}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 pl-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs sm:text-sm">{image.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal with improved mobile handling */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden">
            <Image
              // src={`${PHOTOGRID_IMAGES}${modalImage.shippingLineId}/${modalImage.filename}`}
              src={modalImage.filename}
              alt="Modal View"
              width={1200}
              height={800}
              className="object-contain w-auto h-auto max-h-[90vh]"
            />
            <button
              onClick={closeModal}
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
}

