import { NextRequest, NextResponse } from 'next/server';
import { Annotation } from '@/components/annotation/AnnotationSidebar';

// Mock data store (in-memory for now)
const mockAnnotations: Record<string, Annotation[]> = {
  'genesis-1': [
    {
      id: '1',
      userId: 'user1',
      username: 'theologian42',
      text: '<p>The opening verse establishes God as the <strong>supreme creator</strong> who exists before all creation. The Hebrew word "bara" (created) is used exclusively for divine creation.</p>',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      upvotes: 15,
      downvotes: 2,
    },
    {
      id: '2',
      userId: 'user2',
      username: 'wisdomseeker',
      text: '<p>Notice how the Spirit of God "moved" (Hebrew: rachaph) upon the waters - like a bird hovering over its nest. Beautiful imagery of God\'s nurturing presence!</p>',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      upvotes: 8,
      downvotes: 0,
    },
  ],
  'john-3': [
    {
      id: '3',
      userId: 'user3',
      username: 'gracefound',
      text: '<p>John 3:16 - The gospel in a nutshell! God\'s love is <em>active</em>, not passive. He gave His only Son - the ultimate expression of divine love.</p>',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      upvotes: 42,
      downvotes: 1,
    },
  ],
};

// Mock verse annotations count
const verseAnnotationCounts: Record<string, Record<number, number>> = {
  'genesis-1': { 1: 2, 2: 1, 3: 1 },
  'john-3': { 16: 3, 17: 1, 3: 2 },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  try {
    const { book, chapter } = await params;
    const key = `${book}-${chapter}`;
    
    // Get verse query parameter
    const verse = request.nextUrl.searchParams.get('verse');
    
    if (verse) {
      // Filter annotations for specific verse
      const verseAnnotations = mockAnnotations[key]?.filter(() => {
        // In real implementation, annotations would be tied to specific verses
        // For mock data, we'll just return all annotations for now
        return true;
      }) || [];
      
      return NextResponse.json({
        annotations: verseAnnotations,
        count: verseAnnotations.length,
      });
    }
    
    // Return all annotations for the chapter
    const annotations = mockAnnotations[key] || [];
    const counts = verseAnnotationCounts[key] || {};
    
    return NextResponse.json({
      annotations,
      verseCounts: counts,
      totalCount: annotations.length,
    });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  try {
    const { book, chapter } = await params;
    const key = `${book}-${chapter}`;
    
    // Parse request body
    const body = await request.json();
    const { text, verse, userId = 'demo-user', username = 'anonymous' } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Create new annotation
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      userId,
      username,
      text,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };
    
    // Add to mock store
    if (!mockAnnotations[key]) {
      mockAnnotations[key] = [];
    }
    mockAnnotations[key].push(newAnnotation);
    
    // Update verse count
    if (verse) {
      if (!verseAnnotationCounts[key]) {
        verseAnnotationCounts[key] = {};
      }
      verseAnnotationCounts[key][verse] = (verseAnnotationCounts[key][verse] || 0) + 1;
    }
    
    return NextResponse.json(newAnnotation, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  try {
    const { book, chapter } = await params;
    const key = `${book}-${chapter}`;
    
    const body = await request.json();
    const { annotationId, vote } = body;
    
    if (!annotationId || !vote) {
      return NextResponse.json(
        { error: 'annotationId and vote are required' },
        { status: 400 }
      );
    }
    
    const annotations = mockAnnotations[key];
    if (!annotations) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    const annotation = annotations.find(a => a.id === annotationId);
    if (!annotation) {
      return NextResponse.json(
        { error: 'Annotation not found' },
        { status: 404 }
      );
    }
    
    // Update vote counts
    if (vote === 'up') {
      annotation.upvotes += 1;
      annotation.userVote = 'up';
    } else if (vote === 'down') {
      annotation.downvotes += 1;
      annotation.userVote = 'down';
    }
    
    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}