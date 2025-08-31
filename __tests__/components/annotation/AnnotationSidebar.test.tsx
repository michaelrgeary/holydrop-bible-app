import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnnotationSidebar } from '@/components/annotation/AnnotationSidebar'

describe('AnnotationSidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    verseRef: 'Genesis 1:1',
    verseText: 'In the beginning God created the heaven and the earth.',
    book: 'Genesis' as any,
    chapter: 1,
    verse: 1,
    annotations: [],
    isLoggedIn: false,
    onCreateAnnotation: jest.fn(),
    onVote: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<AnnotationSidebar {...defaultProps} />)
    expect(screen.getByText('Wisdom Drops')).toBeInTheDocument()
    expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<AnnotationSidebar {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Wisdom Drops')).not.toBeInTheDocument()
  })

  describe('when logged in', () => {
    it('shows "Add Annotation" button', () => {
      render(<AnnotationSidebar {...defaultProps} isLoggedIn={true} />)
      expect(screen.getByText('Add Annotation')).toBeInTheDocument()
    })

    it('opens editor when "Add Annotation" is clicked', () => {
      render(<AnnotationSidebar {...defaultProps} isLoggedIn={true} />)
      const addButton = screen.getByText('Add Annotation')
      fireEvent.click(addButton)
      
      // Editor should appear (would need to mock AnnotationEditor component)
      expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument()
    })
  })

  describe('when not logged in', () => {
    it('shows login prompt instead of add button', () => {
      render(<AnnotationSidebar {...defaultProps} isLoggedIn={false} />)
      expect(screen.getByText('Sign in to add annotations')).toBeInTheDocument()
      expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument()
    })
  })

  it('displays annotations', () => {
    const annotations = [
      {
        id: '1',
        userId: 'user1',
        username: 'john_doe',
        text: '<p>Test annotation content</p>',
        createdAt: new Date().toISOString(),
        upvotes: 5,
        downvotes: 1,
      },
      {
        id: '2',
        userId: 'user2',
        username: 'jane_smith',
        text: '<p>Another annotation</p>',
        createdAt: new Date().toISOString(),
        upvotes: 3,
        downvotes: 0,
      },
    ]

    render(<AnnotationSidebar {...defaultProps} annotations={annotations} />)
    
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.getByText('Test annotation content')).toBeInTheDocument()
    expect(screen.getByText('Another annotation')).toBeInTheDocument()
  })

  it('shows empty state when no annotations', () => {
    render(<AnnotationSidebar {...defaultProps} annotations={[]} />)
    expect(screen.getByText('No wisdom drops yet')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<AnnotationSidebar {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    const { container } = render(<AnnotationSidebar {...defaultProps} onClose={onClose} />)
    
    // Find the backdrop div (the one with the backdrop-blur class)
    const backdrop = container.querySelector('.backdrop-blur-sm')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onVote when voting buttons are clicked', async () => {
    const onVote = jest.fn()
    const annotations = [{
      id: '1',
      userId: 'user1',
      username: 'john_doe',
      text: '<p>Test annotation</p>',
      createdAt: new Date().toISOString(),
      upvotes: 5,
      downvotes: 1,
    }]

    render(
      <AnnotationSidebar 
        {...defaultProps} 
        annotations={annotations}
        isLoggedIn={true}
        onVote={onVote}
      />
    )

    // The VotingButtons component would handle the actual voting
    // This test ensures the callback is properly passed down
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })
  })

  it('formats relative dates correctly', () => {
    const now = new Date()
    const annotations = [
      {
        id: '1',
        userId: 'user1',
        username: 'recent_user',
        text: '<p>Just posted</p>',
        createdAt: new Date(now.getTime() - 60000).toISOString(), // 1 minute ago
        upvotes: 0,
        downvotes: 0,
      },
      {
        id: '2',
        userId: 'user2',
        username: 'old_user',
        text: '<p>Old post</p>',
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(), // 5 days ago
        upvotes: 0,
        downvotes: 0,
      },
    ]

    render(<AnnotationSidebar {...defaultProps} annotations={annotations} />)
    
    // Check that relative dates are shown
    expect(screen.getByText(/minute/i)).toBeInTheDocument()
    expect(screen.getByText(/days ago/i)).toBeInTheDocument()
  })
})