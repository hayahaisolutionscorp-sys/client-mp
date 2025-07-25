import React from 'react';
import Image from 'next/image';

interface QRCodeDisplayProps {
  qr_code: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qr_code, 
  size = 150 
}) => {
  if (!qr_code) {
    return null;
  }

  return (
    <div className="qr-code-container">
      <Image 
        src={qr_code} 
        alt="Account QR Code" 
        width={size} 
        height={size}
        className="qr-code-image"
        priority
      />
    </div>
  );
};