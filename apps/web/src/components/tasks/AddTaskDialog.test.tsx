import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskDialog } from './AddTaskDialog';

// Mock all shadcn UI components to avoid React 18/19 version conflict in monorepo
// (Radix UI resolves to hoisted React 18 at monorepo root)
vi.mock('@/components/ui/dialog', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/select', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/popover', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/calendar', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/switch', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/checkbox', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/button', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/label', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/input', () => import('@/test/ui-mocks'));
vi.mock('@/components/ui/textarea', () => import('@/test/ui-mocks'));

// Mock lucide-react — hoisted at monorepo root, uses React 18 forwardRef
vi.mock('lucide-react', () => {
  const icon = (name: string) => {
    const Icon = React.forwardRef<SVGSVGElement, React.ComponentProps<'svg'>>(
      (props, ref) => React.createElement('svg', { ...props, ref, 'data-testid': `icon-${name}` })
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    Loader2: icon('Loader2'),
    Zap: icon('Zap'),
    Battery: icon('Battery'),
    BatteryLow: icon('BatteryLow'),
    ChevronDown: icon('ChevronDown'),
    ChevronUp: icon('ChevronUp'),
    FolderOpen: icon('FolderOpen'),
    Sun: icon('Sun'),
    Check: icon('Check'),
    CalendarIcon: icon('CalendarIcon'),
  };
});

// Mock hooks used internally by AddTaskDialog
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [],
    loading: false,
    error: null,
    fetch: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
  }),
}));

vi.mock('@/hooks/useFeatures', () => ({
  useFeatures: () => ({
    isUnlocked: () => true,
    navFeatures: [],
    loading: false,
    refreshFeatures: vi.fn(),
    isNewlyUnlocked: () => false,
    markFeatureOpened: vi.fn(),
  }),
}));

// Mock GamificationProvider — prevents transitive lucide-react imports
vi.mock('@/components/gamification/GamificationProvider', () => ({
  useGamificationContext: () => null,
  useGamificationEvents: () => ({
    handleTaskComplete: vi.fn(),
    refreshAll: vi.fn(),
    registerDialog: vi.fn(),
    unregisterDialog: vi.fn(),
  }),
}));

describe('AddTaskDialog', () => {
  const user = userEvent.setup();
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders dialog when open', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows "Quick Capture" title for inbox', () => {
      render(<AddTaskDialog {...defaultProps} defaultStatus="inbox" />);

      expect(screen.getByText('Quick Capture')).toBeInTheDocument();
    });

    it('shows "Add Task for Today" title for today', () => {
      render(<AddTaskDialog {...defaultProps} defaultStatus="today" />);

      expect(screen.getByText('Add Task for Today')).toBeInTheDocument();
    });

    it('renders title input', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    });

    it('renders energy buttons', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /low/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /med/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument();
    });

    it('renders priority buttons', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Must' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Should' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Want' })).toBeInTheDocument();
    });

    it('renders time estimate buttons', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: '5m' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '15m' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '25m' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '45m' })).toBeInTheDocument();
    });

    it('renders "More options" button', () => {
      render(<AddTaskDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('disables Add button when title is empty', () => {
      render(<AddTaskDialog {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Add' });
      expect(submitButton).toBeDisabled();
    });

    it('enables Add button when title is entered', async () => {
      render(<AddTaskDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const submitButton = screen.getByRole('button', { name: 'Add' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with task data', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New task',
            energyRequired: 'medium',
            priority: 'should',
          })
        );
      });
    });

    it('calls onSubmit with selected energy level', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const highButton = screen.getByRole('button', { name: /high/i });
      await user.click(highButton);

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            energyRequired: 'high',
          })
        );
      });
    });

    it('calls onSubmit with selected priority', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const mustButton = screen.getByRole('button', { name: 'Must' });
      await user.click(mustButton);

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'must',
          })
        );
      });
    });

    it('calls onSubmit with selected time estimate', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const timeButton = screen.getByRole('button', { name: '25m' });
      await user.click(timeButton);

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            estimatedMinutes: 25,
          })
        );
      });
    });

    it('clears title after successful submission', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('keeps dialog open in create mode for quick adding', async () => {
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      // In create mode, dialog stays open for quick adding
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('cancel behavior', () => {
    it('calls onOpenChange(false) when Cancel is clicked', async () => {
      const onOpenChange = vi.fn();
      render(<AddTaskDialog {...defaultProps} onOpenChange={onOpenChange} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('resets form when Cancel is clicked', async () => {
      render(<AddTaskDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'Some text');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(input).toHaveValue('');
    });
  });

  describe('more options', () => {
    it('shows description textarea when "More options" is clicked', async () => {
      render(<AddTaskDialog {...defaultProps} />);

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      expect(screen.getByPlaceholderText('Add notes or context...')).toBeInTheDocument();
    });

    it('toggles to "Less options" after clicking "More options"', async () => {
      render(<AddTaskDialog {...defaultProps} />);

      const moreButton = screen.getByRole('button', { name: /more options/i });
      await user.click(moreButton);

      expect(screen.getByRole('button', { name: /less options/i })).toBeInTheDocument();
    });
  });

  describe('time estimate toggle', () => {
    it('deselects time estimate when clicking the same button again', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<AddTaskDialog {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task');

      const timeButton = screen.getByRole('button', { name: '25m' });
      await user.click(timeButton);
      await user.click(timeButton); // Click again to deselect

      const submitButton = screen.getByRole('button', { name: 'Add' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            estimatedMinutes: undefined,
          })
        );
      });
    });
  });
});
