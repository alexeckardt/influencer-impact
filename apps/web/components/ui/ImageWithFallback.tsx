'use client';

import Image from 'next/image';
import { ImgHTMLAttributes, useState } from 'react';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  ...props
}: ImageWithFallbackProps) {

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        role="presentation"
        aria-label="Image placeholder"
        {...props}
      >
        <svg 
          className="w-1/3 h-1/3 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          aria-label="Loading image"
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
}
