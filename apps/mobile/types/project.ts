export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  emoji: string | null;
  archived: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Computed by API (JOIN)
  taskCount?: number;
  completedCount?: number;
}
