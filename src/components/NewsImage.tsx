import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import type { NewsTopic } from '../types/news.ts';
import { getEditorialImageForTopic } from '../utils/editorialImages.ts';

interface NewsImageProps {
  topic: NewsTopic;
  alt: string;
  slotOffset?: number;
  className?: string;
}

export function NewsImage({ topic, alt, slotOffset = 0, className = '' }: NewsImageProps) {
  const [hasError, setHasError] = useState(false);
  const src = getEditorialImageForTopic(topic, slotOffset);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 ${className}`}
      >
        <Globe2 className="h-8 w-8 mb-2 opacity-70" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-stone-700">{topic} Dispatch</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
