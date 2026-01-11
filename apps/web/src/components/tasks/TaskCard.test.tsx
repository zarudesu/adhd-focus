import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import type { Task } from '@adhd-focus/shared';

// Mock task factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  status: 'today',
  energy_required: 'medium',
  priority: 'should',
  pomodoros_completed: 0,
  tags: [],
  streak_contribution: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sort_order: 0,
  ...overrides,
});

describe('TaskCard', () => {
  const user = userEvent.setup();

  describe('rendering', () => {
    it('renders task title', () => {
      const task = createMockTask({ title: 'My Important Task' });
      render(<TaskCard task={task} />);

      expect(screen.getByText('My Important Task')).toBeInTheDocument();
    });

    it('renders energy badge', () => {
      const task = createMockTask({ energy_required: 'high' });
      render(<TaskCard task={task} />);

      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('renders priority badge for must/should priorities', () => {
      const mustTask = createMockTask({ priority: 'must' });
      render(<TaskCard task={mustTask} />);
      expect(screen.getByText('Must')).toBeInTheDocument();
    });

    it('does not render priority badge for want/someday priorities', () => {
      const wantTask = createMockTask({ priority: 'want' });
      render(<TaskCard task={wantTask} />);
      expect(screen.queryByText('Want')).not.toBeInTheDocument();
    });

    it('renders estimated time when provided', () => {
      const task = createMockTask({ estimated_minutes: 25 });
      render(<TaskCard task={task} />);

      expect(screen.getByText('25m')).toBeInTheDocument();
    });

    it('does not render estimated time when not provided', () => {
      const task = createMockTask({ estimated_minutes: undefined });
      render(<TaskCard task={task} />);

      expect(screen.queryByText(/\d+m/)).not.toBeInTheDocument();
    });

    it('renders pomodoros count when completed', () => {
      const task = createMockTask({ pomodoros_completed: 3 });
      render(<TaskCard task={task} />);

      expect(screen.getByText('3 pom')).toBeInTheDocument();
    });

    it('applies completed styles when task is done', () => {
      const task = createMockTask({ status: 'done' });
      render(<TaskCard task={task} />);

      const title = screen.getByText('Test Task');
      expect(title).toHaveClass('line-through');
    });

    it('renders checkbox as checked when task is done', () => {
      const task = createMockTask({ status: 'done' });
      render(<TaskCard task={task} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('due date formatting', () => {
    it('shows "Today" for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const task = createMockTask({ due_date: today });
      render(<TaskCard task={task} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('shows "Tomorrow" for tomorrow\'s date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const task = createMockTask({ due_date: tomorrow.toISOString().split('T')[0] });
      render(<TaskCard task={task} />);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onComplete when checkbox is clicked', async () => {
      const onComplete = vi.fn();
      const task = createMockTask();
      render(<TaskCard task={task} onComplete={onComplete} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onComplete).toHaveBeenCalledWith('task-1');
    });

    it('calls onClick when card is clicked', async () => {
      const onClick = vi.fn();
      const task = createMockTask();
      render(<TaskCard task={task} onClick={onClick} />);

      const title = screen.getByText('Test Task');
      await user.click(title);

      expect(onClick).toHaveBeenCalledWith(task);
    });

    it('does not call onClick when checkbox is clicked', async () => {
      const onClick = vi.fn();
      const onComplete = vi.fn();
      const task = createMockTask();
      render(<TaskCard task={task} onClick={onClick} onComplete={onComplete} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onClick).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('action menu', () => {
    it('shows "Move to Today" for inbox tasks', async () => {
      const onMoveToToday = vi.fn();
      const task = createMockTask({ status: 'inbox' });
      render(<TaskCard task={task} onMoveToToday={onMoveToToday} />);

      const menuButton = screen.getByRole('button', { name: /task actions/i });
      await user.click(menuButton);

      expect(screen.getByText('Move to Today')).toBeInTheDocument();
    });

    it('shows "Move to Inbox" for today tasks', async () => {
      const onMoveToInbox = vi.fn();
      const task = createMockTask({ status: 'today' });
      render(<TaskCard task={task} onMoveToInbox={onMoveToInbox} />);

      const menuButton = screen.getByRole('button', { name: /task actions/i });
      await user.click(menuButton);

      expect(screen.getByText('Move to Inbox')).toBeInTheDocument();
    });

    it('calls onDelete when delete is clicked', async () => {
      const onDelete = vi.fn();
      const task = createMockTask();
      render(<TaskCard task={task} onDelete={onDelete} />);

      const menuButton = screen.getByRole('button', { name: /task actions/i });
      await user.click(menuButton);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      expect(onDelete).toHaveBeenCalledWith('task-1');
    });
  });
});
