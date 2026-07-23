'use client';

import { useState } from 'react';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-sm border border-beige-200 bg-white">
        {list[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={list[active]} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-charcoal-800/30">No image</div>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 ${
                i === active ? 'border-brand' : 'border-beige-200'
              }`}
              aria-label={`Image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
