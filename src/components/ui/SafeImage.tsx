import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function SafeImage({ src, alt, className = '', priority = false }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#F2EFE9] text-[#5C574F] p-6 text-center ${className}`}
      >
        <Sparkles className="w-6 h-6 text-[#8C6F38] mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium max-w-[200px] leading-relaxed">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
