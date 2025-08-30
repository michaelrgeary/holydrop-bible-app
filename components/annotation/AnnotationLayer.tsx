'use client';

import { useEffect, useRef, useState } from 'react';

interface AnnotationLayerProps {
  position: { x: number; y: number };
  onAddAnnotation: () => void;
  onClose: () => void;
}

export function AnnotationLayer({ 
  position, 
  onAddAnnotation, 
  onClose 
}: AnnotationLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10);

    const handleClickOutside = (event: MouseEvent) => {
      if (layerRef.current && !layerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={layerRef}
      className={`
        absolute z-50 transform -translate-x-1/2 -translate-y-full -mt-2
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-75'
        }
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Water drop animation container */}
      <div className="relative">
        {/* Water drop effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-water-500/20 rounded-full blur-xl animate-water-ripple" />
        </div>

        {/* Button */}
        <button
          onClick={onAddAnnotation}
          className={`
            relative px-4 py-2 bg-gradient-to-r from-water-500 to-water-600 
            text-white text-sm font-medium rounded-full
            shadow-lg shadow-water-500/25
            hover:from-water-600 hover:to-water-700
            hover:shadow-xl hover:shadow-water-500/30
            transform transition-all duration-200
            hover:scale-105 active:scale-95
            before:absolute before:inset-0 before:rounded-full
            before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
            before:animate-shimmer before:opacity-0 hover:before:opacity-100
          `}
        >
          <span className="relative z-10 flex items-center gap-1">
            💧 Drop wisdom
          </span>
        </button>

        {/* Tooltip arrow */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-water-600" />
        </div>
      </div>
    </div>
  );
}