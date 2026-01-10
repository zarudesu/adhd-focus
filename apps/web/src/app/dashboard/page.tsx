'use client';

import { useTasks } from '@/hooks';
import { ENERGY_LABELS, PRIORITY_LABELS } from '@adhd-focus/shared';

export default function DashboardPage() {
  const { todayTasks, loading, error, complete, moveToInbox, moveToToday, create } = useTasks();

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('title') as HTMLInputElement;
    const title = input.value.trim();

    if (title) {
      const task = await create({ title });
      await moveToToday(task.id);
      input.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Today</h1>
        <div className="text-sm text-zinc-500">
          {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <form onSubmit={handleQuickAdd} className="mb-6">
        <input
          name="title"
          type="text"
          placeholder="Add a task for today..."
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </form>

      {todayTasks.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">No tasks for today</p>
          <p className="text-sm">Add a task above or move tasks from your inbox</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-lg"
            >
              <button
                onClick={() => complete(task.id)}
                className="w-5 h-5 border-2 border-zinc-300 rounded hover:border-zinc-500"
                title="Complete"
              />
              <div className="flex-1">
                <div className="font-medium">{task.title}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-zinc-500">
                    {ENERGY_LABELS[task.energy_required].label}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {PRIORITY_LABELS[task.priority].label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => moveToInbox(task.id)}
                className="text-xs text-zinc-500 hover:text-zinc-900"
              >
                Move to inbox
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
