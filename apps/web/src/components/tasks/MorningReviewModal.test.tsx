import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MorningReviewModal } from './MorningReviewModal';
// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
      (props, ref) => React.createElement('div', { ...props, ref })
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock shadcn UI components (React 18/19 monorepo conflict)
vi.mock('@/components/ui/button', () => import('@/test/ui-mocks'));

// Mock lucide-react icons (hoisted at monorepo root, uses React 18)
vi.mock('lucide-react', () => {
  const icon = (name: string) => {
    const Icon = React.forwardRef<SVGSVGElement, React.ComponentProps<'svg'>>(
      (props, ref) => React.createElement('svg', { ...props, ref, 'data-testid': `icon-${name}` })
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    X: icon('X'),
    Check: icon('Check'),
    Inbox: icon('Inbox'),
    Trash2: icon('Trash2'),
    Sun: icon('Sun'),
  };
});

const makeTask = (overrides: Record<string, unknown> = {}) => ({
  id: 'task-1',
  userId: 'user-1',
  title: 'Test task',
  description: null,
  status: 'today' as const,
  priority: 'should' as const,
  energyRequired: 'medium' as const,
  estimatedMinutes: null,
  actualMinutes: null,
  pomodorosCompleted: 0,
  scheduledDate: '2026-02-04',
  dueDate: null,
  completedAt: null,
  projectId: null,
  parentTaskId: null,
  snoozedUntil: null,
  tags: [],
  streakContribution: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('MorningReviewModal', () => {
  const user = userEvent.setup();

  const defaultProps = {
    overdueTasks: [makeTask({ id: 'task-1', title: 'Overdue task 1' })],
    habits: [],
    onCompleteYesterday: vi.fn().mockResolvedValue(undefined),
    onRescheduleToToday: vi.fn().mockResolvedValue(undefined),
    onMoveToInbox: vi.fn().mockResolvedValue(undefined),
    onDeleteTask: vi.fn().mockResolvedValue(undefined),
    onSubmitHabits: vi.fn().mockResolvedValue(undefined),
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tasks step', () => {
    it('shows morning greeting', () => {
      render(<MorningReviewModal {...defaultProps} />);
      expect(screen.getByText(/good morning/i)).toBeInTheDocument();
    });

    it('shows the task title', () => {
      render(<MorningReviewModal {...defaultProps} />);
      expect(screen.getByText('Overdue task 1')).toBeInTheDocument();
    });

    it('shows progress counter', () => {
      const tasks = [
        makeTask({ id: '1', title: 'Task 1' }),
        makeTask({ id: '2', title: 'Task 2' }),
        makeTask({ id: '3', title: 'Task 3' }),
      ];
      render(<MorningReviewModal {...defaultProps} overdueTasks={tasks} />);
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('shows 4 action buttons', () => {
      render(<MorningReviewModal {...defaultProps} />);
      expect(screen.getByText('Did it')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onCompleteYesterday when "Did it" is clicked', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Did it'));
      await waitFor(() => {
        expect(defaultProps.onCompleteYesterday).toHaveBeenCalledWith('task-1');
      });
    });

    it('calls onRescheduleToToday when "Today" is clicked', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Today'));
      await waitFor(() => {
        expect(defaultProps.onRescheduleToToday).toHaveBeenCalledWith('task-1');
      });
    });

    it('calls onMoveToInbox when "Inbox" is clicked', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Inbox'));
      await waitFor(() => {
        expect(defaultProps.onMoveToInbox).toHaveBeenCalledWith('task-1');
      });
    });

    it('calls onDeleteTask when "Delete" is clicked', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Delete'));
      await waitFor(() => {
        expect(defaultProps.onDeleteTask).toHaveBeenCalledWith('task-1');
      });
    });

    it('advances to next task after action', async () => {
      const tasks = [
        makeTask({ id: '1', title: 'First task' }),
        makeTask({ id: '2', title: 'Second task' }),
      ];
      render(<MorningReviewModal {...defaultProps} overdueTasks={tasks} />);

      expect(screen.getByText('First task')).toBeInTheDocument();
      await user.click(screen.getByText('Did it'));

      await waitFor(() => {
        expect(screen.getByText('Second task')).toBeInTheDocument();
      });
    });

    it('dismisses after last task when no habits', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Did it'));

      await waitFor(() => {
        expect(defaultProps.onDismiss).toHaveBeenCalled();
      });
    });

    it('transitions to habits step after last task', async () => {
      const habits = [
        { id: 'h1', name: 'Meditate', emoji: null, isCompleted: false, isSkipped: false },
      ];
      render(<MorningReviewModal {...defaultProps} habits={habits} />);

      await user.click(screen.getByText('Did it'));

      await waitFor(() => {
        expect(screen.getByText(/habits/i)).toBeInTheDocument();
      });
    });
  });

  describe('habits step', () => {
    const habitsProps = {
      ...defaultProps,
      overdueTasks: [],
      habits: [
        { id: 'h1', name: 'Meditate', emoji: '🧘', isCompleted: false, isSkipped: false },
        { id: 'h2', name: 'Exercise', emoji: '🏃', isCompleted: false, isSkipped: false },
      ],
    };

    it('shows habits when no overdue tasks', () => {
      render(<MorningReviewModal {...habitsProps} />);
      expect(screen.getByText('Meditate')).toBeInTheDocument();
      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });

    it('shows Save button', () => {
      render(<MorningReviewModal {...habitsProps} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('calls onSubmitHabits with habit data on Save', async () => {
      render(<MorningReviewModal {...habitsProps} />);
      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(habitsProps.onSubmitHabits).toHaveBeenCalledWith({
          habits: [
            { id: 'h1', completed: false, skipped: false },
            { id: 'h2', completed: false, skipped: false },
          ],
        });
      });
    });

    it('calls onDismiss after successful habit submission', async () => {
      render(<MorningReviewModal {...habitsProps} />);
      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(habitsProps.onDismiss).toHaveBeenCalled();
      });
    });
  });

  describe('skip button', () => {
    it('calls onDismiss when Skip is clicked', async () => {
      render(<MorningReviewModal {...defaultProps} />);
      await user.click(screen.getByText('Skip'));
      expect(defaultProps.onDismiss).toHaveBeenCalled();
    });
  });

  describe('task description', () => {
    it('shows task description when present', () => {
      const tasks = [makeTask({ title: 'Task', description: 'Some notes' })];
      render(<MorningReviewModal {...defaultProps} overdueTasks={tasks} />);
      expect(screen.getByText('Some notes')).toBeInTheDocument();
    });
  });
});
