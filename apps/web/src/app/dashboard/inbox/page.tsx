'use client';

import { useTasks } from '@/hooks';
import { ENERGY_LABELS, PRIORITY_LABELS } from '@adhd-focus/shared';

export default function InboxPage() {
  const { inboxTasks, loading, error, moveToToday, deleteTask, create } = useTasks();

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('title') as HTMLInputElement;
    const title = input.value.trim();

    if (title) {
      await create({ title });
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
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="text-sm text-zinc-500">
          {inboxTasks.length} task{inboxTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <form onSubmit={handleQuickAdd} className="mb-6">
        <input
          name="title"
          type="text"
          placeholder="Quick capture... just type and press Enter"
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </form>

      {inboxTasks.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">Inbox zero!</p>
          <p className="text-sm">Capture ideas quickly above. Process later.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inboxTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-lg"
            >
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
                onClick={() => moveToToday(task.id)}
                className="px-3 py-1 text-xs font-medium text-white bg-zinc-900 rounded hover:bg-zinc-800"
              >
                Do today
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-xs text-zinc-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
