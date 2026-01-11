import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
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

describe('TaskList', () => {
  const user = userEvent.setup();

  describe('loading state', () => {
    it('renders skeleton cards when loading', () => {
      render(<TaskList tasks={[]} loading={true} />);

      // Should render 3 skeleton cards
      const skeletons = document.querySelectorAll('.rounded-lg.border');
      expect(skeletons.length).toBe(3);
    });

    it('does not render tasks when loading', () => {
      const tasks = [createMockTask({ title: 'Task 1' })];
      render(<TaskList tasks={tasks} loading={true} />);

      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders default empty message when no tasks', () => {
      render(<TaskList tasks={[]} />);

      expect(screen.getByText('No tasks')).toBeInTheDocument();
      expect(screen.getByText('Tasks you add will appear here')).toBeInTheDocument();
    });

    it('renders custom empty message', () => {
      render(
        <TaskList
          tasks={[]}
          emptyMessage="Inbox is empty"
          emptyDescription="Capture ideas here"
        />
      );

      expect(screen.getByText('Inbox is empty')).toBeInTheDocument();
      expect(screen.getByText('Capture ideas here')).toBeInTheDocument();
    });
  });

  describe('task rendering', () => {
    it('renders all tasks', () => {
      const tasks = [
        createMockTask({ id: '1', title: 'Task 1' }),
        createMockTask({ id: '2', title: 'Task 2' }),
        createMockTask({ id: '3', title: 'Task 3' }),
      ];
      render(<TaskList tasks={tasks} />);

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    it('renders tasks in order', () => {
      const tasks = [
        createMockTask({ id: '1', title: 'First Task' }),
        createMockTask({ id: '2', title: 'Second Task' }),
      ];
      render(<TaskList tasks={tasks} />);

      const taskElements = screen.getAllByRole('checkbox');
      expect(taskElements).toHaveLength(2);
    });
  });

  describe('event handlers', () => {
    it('passes onComplete to TaskCards', async () => {
      const onComplete = vi.fn();
      const tasks = [createMockTask({ id: 'task-1' })];
      render(<TaskList tasks={tasks} onComplete={onComplete} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onComplete).toHaveBeenCalledWith('task-1');
    });

    it('passes onDelete to TaskCards', async () => {
      const onDelete = vi.fn();
      const tasks = [createMockTask({ id: 'task-1' })];
      render(<TaskList tasks={tasks} onDelete={onDelete} />);

      const menuButton = screen.getByRole('button', { name: /task actions/i });
      await user.click(menuButton);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      expect(onDelete).toHaveBeenCalledWith('task-1');
    });

    it('passes onTaskClick to TaskCards', async () => {
      const onTaskClick = vi.fn();
      const task = createMockTask();
      render(<TaskList tasks={[task]} onTaskClick={onTaskClick} />);

      const title = screen.getByText('Test Task');
      await user.click(title);

      expect(onTaskClick).toHaveBeenCalledWith(task);
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <TaskList tasks={[]} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
