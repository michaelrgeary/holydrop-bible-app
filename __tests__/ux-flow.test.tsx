/**
 * UX Flow Integration Tests
 * Tests the complete user experience flow from onboarding to advanced features
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { FirstActions } from '@/components/onboarding/FirstActions';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { WelcomeBack } from '@/components/engagement/WelcomeBack';
import { ToastProvider } from '@/components/ui/Toast';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    pathname: '/',
  },
  writable: true,
});

describe('UX Flow Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Welcome Flow', () => {
    test('shows welcome flow for new users', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<WelcomeFlow />);
      
      expect(screen.getByText('Welcome to HolyDrop!')).toBeInTheDocument();
      expect(screen.getByText('Your personal Bible companion for daily spiritual growth')).toBeInTheDocument();
    });

    test('does not show welcome flow for returning users', () => {
      localStorageMock.getItem.mockReturnValue('true');
      
      render(<WelcomeFlow />);
      
      expect(screen.queryByText('Welcome to HolyDrop!')).not.toBeInTheDocument();
    });

    test('progresses through welcome steps', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<WelcomeFlow />);
      
      // First step
      expect(screen.getByText('See What\'s Special')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('See What\'s Special'));
      
      // Second step
      await waitFor(() => {
        expect(screen.getByText('What makes HolyDrop special:')).toBeInTheDocument();
        expect(screen.getByText('Read & Study')).toBeInTheDocument();
        expect(screen.getByText('Smart Search')).toBeInTheDocument();
        expect(screen.getByText('Share Beautifully')).toBeInTheDocument();
        expect(screen.getByText('Works Offline')).toBeInTheDocument();
      });
    });

    test('completes onboarding and sets localStorage flags', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<WelcomeFlow />);
      
      fireEvent.click(screen.getByText('See What\'s Special'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Start Exploring'));
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('has_visited', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'onboarding_completed',
        expect.any(String)
      );
    });
  });

  describe('First Actions Guide', () => {
    test('shows first actions for onboarded users', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'has_visited') return 'true';
        if (key === 'onboarding_completed') return new Date().toISOString();
        if (key === 'completed_first_actions') return '[]';
        return null;
      });
      
      render(<FirstActions />);
      
      expect(screen.getByText('Get Started with HolyDrop')).toBeInTheDocument();
      expect(screen.getByText(/Complete these actions to discover key features/)).toBeInTheDocument();
    });

    test('tracks action completion progress', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'has_visited') return 'true';
        if (key === 'onboarding_completed') return new Date().toISOString();
        if (key === 'completed_first_actions') return '["search-love"]';
        return null;
      });
      
      render(<FirstActions />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      // Should show progress for 1 completed action
    });

    test('dismisses first actions when requested', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'has_visited') return 'true';
        if (key === 'onboarding_completed') return new Date().toISOString();
        if (key === 'completed_first_actions') return '[]';
        return null;
      });
      
      render(<FirstActions />);
      
      const dismissButton = screen.getByLabelText('Dismiss suggestions');
      fireEvent.click(dismissButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('first_actions_dismissed', 'true');
    });
  });

  describe('Feedback Widget', () => {
    test('renders feedback button', () => {
      render(<FeedbackWidget />);
      
      const feedbackButton = screen.getByLabelText('Send Feedback');
      expect(feedbackButton).toBeInTheDocument();
    });

    test('opens feedback modal when clicked', async () => {
      render(<FeedbackWidget />);
      
      fireEvent.click(screen.getByLabelText('Send Feedback'));
      
      await waitFor(() => {
        expect(screen.getByText('Send Feedback')).toBeInTheDocument();
        expect(screen.getByText('What type of feedback do you have?')).toBeInTheDocument();
      });
    });

    test('submits feedback successfully', async () => {
      render(<FeedbackWidget />);
      
      fireEvent.click(screen.getByLabelText('Send Feedback'));
      
      await waitFor(() => {
        // Fill out the form
        const messageInput = screen.getByPlaceholderText('Please share your thoughts...');
        fireEvent.change(messageInput, { target: { value: 'Great app!' } });
        
        // Submit the form
        const submitButton = screen.getByText('Send Feedback');
        fireEvent.click(submitButton);
      });
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument();
      });
      
      // Should store feedback in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_feedback',
        expect.stringContaining('Great app!')
      );
    });

    test('allows feedback type selection', async () => {
      render(<FeedbackWidget />);
      
      fireEvent.click(screen.getByLabelLabel('Send Feedback'));
      
      await waitFor(() => {
        expect(screen.getByText('Bug Report')).toBeInTheDocument();
        expect(screen.getByText('Feature Request')).toBeInTheDocument();
        expect(screen.getByText('General Feedback')).toBeInTheDocument();
        expect(screen.getByText('Appreciation')).toBeInTheDocument();
      });
    });
  });

  describe('Welcome Back Experience', () => {
    test('shows welcome back for returning users', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'last_visit') return threeDaysAgo.toString();
        if (key === 'last_welcome_back') return null;
        return null;
      });
      
      render(<WelcomeBack />);
      
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
      expect(screen.getByText(/It's been \d+ days since your last visit/)).toBeInTheDocument();
    });

    test('does not show for recent visitors', () => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      localStorageMock.getItem.mockReturnValue(oneHourAgo.toString());
      
      render(<WelcomeBack />);
      
      expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument();
    });

    test('shows user progress stats when available', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'last_visit') return threeDaysAgo.toString();
        if (key === 'last_welcome_back') return null;
        if (key === 'reading_history') return JSON.stringify([
          { reference: 'John 3:16', timestamp: new Date().toISOString() }
        ]);
        if (key === 'bookmarks') return JSON.stringify(['john-3-16']);
        return null;
      });
      
      render(<WelcomeBack />);
      
      expect(screen.getByText('Your Progress')).toBeInTheDocument();
    });

    test('provides continuation suggestions', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'last_visit') return threeDaysAgo.toString();
        if (key === 'last_welcome_back') return null;
        if (key === 'reading_history') return JSON.stringify([
          { reference: 'John 3:16', timestamp: new Date().toISOString() }
        ]);
        return null;
      });
      
      render(<WelcomeBack />);
      
      expect(screen.getByText('Pick up where you left off')).toBeInTheDocument();
      expect(screen.getByText('Start a New Reading Plan')).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    test('renders toast provider and shows notifications', async () => {
      const TestComponent = () => {
        const [showToast, setShowToast] = React.useState(false);
        return (
          <ToastProvider>
            <button onClick={() => setShowToast(true)}>Show Toast</button>
            {showToast && (
              <div data-testid="toast-trigger">
                Toast triggered
              </div>
            )}
          </ToastProvider>
        );
      };
      
      render(<TestComponent />);
      
      fireEvent.click(screen.getByText('Show Toast'));
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-trigger')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Flow', () => {
    test('complete new user flow', async () => {
      // Start as new user
      localStorageMock.getItem.mockReturnValue(null);
      
      // Step 1: Welcome flow
      const { rerender } = render(<WelcomeFlow />);
      
      expect(screen.getByText('Welcome to HolyDrop!')).toBeInTheDocument();
      
      // Complete onboarding
      fireEvent.click(screen.getByText('See What\'s Special'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Start Exploring'));
      });
      
      // Step 2: Now show first actions (simulate re-render after onboarding)
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'has_visited') return 'true';
        if (key === 'onboarding_completed') return new Date().toISOString();
        if (key === 'completed_first_actions') return '[]';
        return null;
      });
      
      rerender(<FirstActions />);
      
      expect(screen.getByText('Get Started with HolyDrop')).toBeInTheDocument();
      
      // Verify localStorage was updated correctly
      expect(localStorageMock.setItem).toHaveBeenCalledWith('has_visited', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'onboarding_completed',
        expect.any(String)
      );
    });

    test('returning user flow after extended absence', async () => {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'last_visit') return weekAgo.toString();
        if (key === 'last_welcome_back') return null;
        if (key === 'has_visited') return 'true';
        if (key === 'reading_history') return JSON.stringify([
          { reference: 'Psalm 23:1', timestamp: new Date().toISOString() }
        ]);
        return null;
      });
      
      render(<WelcomeBack />);
      
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
      expect(screen.getByText(/It's been 7 days since your last visit/)).toBeInTheDocument();
      expect(screen.getByText('Pick up where you left off')).toBeInTheDocument();
    });
  });
});

// Helper function to simulate user interactions
const simulateUserJourney = {
  newUser: {
    completeOnboarding: async () => {
      // Simulate completing the welcome flow
      localStorageMock.setItem('has_visited', 'true');
      localStorageMock.setItem('onboarding_completed', new Date().toISOString());
    },
    
    completeFirstAction: async (actionId: string) => {
      const completed = JSON.parse(localStorageMock.getItem('completed_first_actions') || '[]');
      completed.push(actionId);
      localStorageMock.setItem('completed_first_actions', JSON.stringify(completed));
    },
    
    provideFeedback: async (feedback: string) => {
      const allFeedback = JSON.parse(localStorageMock.getItem('user_feedback') || '[]');
      allFeedback.push({
        type: 'general',
        message: feedback,
        timestamp: new Date().toISOString()
      });
      localStorageMock.setItem('user_feedback', JSON.stringify(allFeedback));
    }
  },
  
  returningUser: {
    simulateAbsence: (days: number) => {
      const pastDate = Date.now() - (days * 24 * 60 * 60 * 1000);
      localStorageMock.setItem('last_visit', pastDate.toString());
    },
    
    addReadingHistory: (verses: string[]) => {
      const history = verses.map(verse => ({
        reference: verse,
        timestamp: new Date().toISOString()
      }));
      localStorageMock.setItem('reading_history', JSON.stringify(history));
    }
  }
};

export { simulateUserJourney };