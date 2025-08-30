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
          verse-text relative p-4 rounded-lg transition-all duration-300 cursor-pointer select-text
          ${hasAnnotations ? 'bg-blue-50/50 border-l-4 border-water-400' : ''}
          ${isHovered 
            ? 'bg-blue-50 shadow-lg shadow-blue-100/50 transform -translate-y-0.5' 
            : hasAnnotations 
              ? 'bg-blue-50/30 hover:bg-blue-50/70'
              : 'bg-white hover:bg-blue-50/50'
          }
          ${selected ? 'ring-2 ring-water-400' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Water ripple effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent animate-shimmer" />
          </div>
        )}
        
        {/* Verse number */}
        <span className={`
          inline-block min-w-[2rem] mr-3 font-bold select-none
          ${isHovered || hasAnnotations ? 'text-blue-600' : 'text-gray-500'}
          transition-colors duration-300
        `}>
          {verseNumber}
        </span>
        
        {/* Verse text */}
        <span className="text-gray-800 leading-relaxed">
          {text}
        </span>
        
        {/* Annotations indicator */}
        {annotationsCount > 0 && (
          <span className={`
            ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium select-none
            ${isHovered 
              ? 'bg-blue-200 text-blue-800' 
              : 'bg-blue-100 text-blue-600'
            }
            transition-colors duration-300
          `}>
            💧 {annotationsCount} {annotationsCount === 1 ? 'drop' : 'drops'}
          </span>
        )}

        {/* Holy glow effect on hover */}
        {isHovered && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 via-blue-300/30 to-blue-200/30 rounded-lg blur-xl opacity-50 pointer-events-none" />
        )}
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