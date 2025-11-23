import React, { memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  [key: string]: any;
}

export const OptimizedImage = memo(({ src, alt, className, ...props }: OptimizedImageProps) => (
  <img 
    src={src} 
    alt={alt} 
    className={className}
    loading="lazy"
    decoding="async"
    style={{ willChange: 'transform' }}
    {...props}
  />
));

OptimizedImage.displayName = 'OptimizedImage';

