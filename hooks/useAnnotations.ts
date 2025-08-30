import { useState, useEffect, useCallback } from 'react';
import { Annotation } from '@/components/annotation/AnnotationSidebar';

interface ChapterAnnotations {
  annotations: Annotation[];
  verseCounts: Record<number, number>;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

export function useChapterAnnotations(book: string, chapter: number): ChapterAnnotations {
  const [data, setData] = useState<ChapterAnnotations>({
    annotations: [],
    verseCounts: {},
    totalCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(`/api/annotations/${book}/${chapter}`);
        if (!response.ok) {
          throw new Error('Failed to fetch annotations');
        }
        
        const result = await response.json();
        setData({
          annotations: result.annotations || [],
          verseCounts: result.verseCounts || {},
          totalCount: result.totalCount || 0,
          loading: false,
          error: null,
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred',
        }));
      }
    };

    fetchAnnotations();
  }, [book, chapter]);

  return data;
}

export function useVerseAnnotations(book: string, chapter: number, verse: number) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnotations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/annotations/${book}/${chapter}?verse=${verse}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse annotations');
      }
      
      const result = await response.json();
      setAnnotations(result.annotations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [book, chapter, verse]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  return { annotations, loading, error, refetch: fetchAnnotations };
}

interface CreateAnnotationResult {
  createAnnotation: (text: string, verse?: number) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export function useCreateAnnotation(
  book: string,
  chapter: number
): CreateAnnotationResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnnotation = useCallback(async (text: string, verse?: number) => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch(`/api/annotations/${book}/${chapter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          verse,
          // In a real app, these would come from auth context
          userId: 'demo-user',
          username: 'wisdom_dropper',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create annotation');
      }
      
      // You might want to trigger a refetch here or return the new annotation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [book, chapter]);

  return { createAnnotation, isCreating, error };
}

interface VoteAnnotationResult {
  voteAnnotation: (annotationId: string, vote: 'up' | 'down') => Promise<void>;
  isVoting: boolean;
  error: string | null;
}

export function useVoteAnnotation(
  book: string,
  chapter: number
): VoteAnnotationResult {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteAnnotation = useCallback(async (
    annotationId: string,
    vote: 'up' | 'down'
  ) => {
    try {
      setIsVoting(true);
      setError(null);
      
      const response = await fetch(`/api/annotations/${book}/${chapter}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ annotationId, vote }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote on annotation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsVoting(false);
    }
  }, [book, chapter]);

  return { voteAnnotation, isVoting, error };
}