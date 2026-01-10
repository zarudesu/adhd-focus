import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TodayPage() {
  return (
    <>
      <PageHeader
        title="Today"
        description="Focus on what matters most"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        }
      />
      <main className="flex-1 p-4">
        {/* TODO: TaskList component */}
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>Today&apos;s tasks will appear here</p>
          <p className="text-sm mt-1">WIP Limit: 3 tasks per day</p>
        </div>
      </main>
    </>
  );
}
