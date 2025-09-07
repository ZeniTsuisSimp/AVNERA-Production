'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Fallback to a reliable placeholder
    setImgSrc(`https://via.placeholder.com/${width || 600}x${height || 800}/e2e8f0/64748b?text=Product+Image`);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`relative ${className || ''}`}>
      {isLoading && !hasError && (
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse ${fill ? 'w-full h-full' : ''}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-medium">Product Image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
