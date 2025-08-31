'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationLayer } from '@/components/annotation/AnnotationLayer';

interface VerseDisplayProps {
  verseNumber: number;
  text: string;
  annotationsCount: number;
  hasAnnotations?: boolean;
  onShowAnnotations: () => void;
  onAddAnnotation: () => void;
}

export function VerseDisplay({ 
  verseNumber, 
  text, 
  annotationsCount,
  hasAnnotations = false,
  onShowAnnotations,
  onAddAnnotation,
}: VerseDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showAnnotationLayer, setShowAnnotationLayer] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const verseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !verseRef.current) {
        return;
      }

      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const verseElement = verseRef.current;

      // Check if selection is within this verse
      if (selectedText && verseElement.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setShowAnnotationLayer(true);
        setSelected(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (verseRef.current && !verseRef.current.contains(e.target as Node)) {
        setShowAnnotationLayer(false);
        setSelected(false);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    // Prevent opening annotations when text is being selected
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      return;
    }
    
    onShowAnnotations();
  };

  const handleAddAnnotation = () => {
    setShowAnnotationLayer(false);
    setSelected(false);
    window.getSelection()?.removeAllRanges();
    onAddAnnotation();
  };

  return (
    <>
      <div
        ref={verseRef}
        data-verse={verseNumber}
        className={`
          verse-text relative p-6 rounded-xl transition-all duration-500 cursor-pointer select-text group
          ${hasAnnotations ? 'glass-morphism border-l-4 border-water-500 holy-glow-subtle' : 'glass-morphism-hover'}
          ${isHovered 
            ? 'shadow-2xl holy-glow-subtle transform -translate-y-1 scale-[1.02]' 
            : hasAnnotations 
              ? 'shadow-lg hover:shadow-xl'
              : 'shadow-sm hover:shadow-lg hover:scale-[1.01]'
          }
          ${selected ? 'ring-2 ring-water-500 ring-opacity-60' : ''}
          animate-slide-up
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Enhanced water ripple effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 water-gradient-subtle animate-wave-flow opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-water-200/30 to-transparent animate-shimmer" />
          </div>
        )}
        
        {/* Modern Verse number with water theme */}
        <span className={`
          inline-flex items-center justify-center min-w-[2.5rem] h-[2.5rem] mr-4 font-bold text-lg select-none
          rounded-full transition-all duration-500 relative z-10
          ${isHovered || hasAnnotations 
            ? 'water-gradient text-white shadow-lg scale-110' 
            : 'text-water-500 bg-water-50 dark:bg-water-900/30 border border-water-200 dark:border-water-700'
          }
        `}>
          {verseNumber}
        </span>
        
        {/* Enhanced Verse text */}
        <span className={`
          text-gray-800 dark:text-gray-200 leading-relaxed inline transition-all duration-500
          ${isHovered ? 'text-water-800 dark:text-water-200' : ''}
          group-hover:text-gradient-holy
        `}>
          {text}
        </span>
        
        {/* Enhanced Annotations indicator with water drop animation */}
        {annotationsCount > 0 && (
          <span className={`
            ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none
            transition-all duration-500 animate-bounce-gentle
            ${isHovered 
              ? 'water-gradient text-white shadow-lg' 
              : 'glass-morphism text-water-600 dark:text-water-400'
            }
          `}>
            💧 {annotationsCount} {annotationsCount === 1 ? 'drop' : 'drops'}
          </span>
        )}

        {/* Enhanced holy glow effect */}
        {isHovered && (
          <div className="absolute -inset-2 water-gradient rounded-xl blur-2xl opacity-20 pointer-events-none animate-pulse-water" />
        )}
        
        {/* Smooth scroll animation on load */}
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      {/* Annotation layer for text selection */}
      {showAnnotationLayer && (
        <AnnotationLayer
          position={selectionPosition}
          onAddAnnotation={handleAddAnnotation}
          onClose={() => {
            setShowAnnotationLayer(false);
            setSelected(false);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </>
  );
}