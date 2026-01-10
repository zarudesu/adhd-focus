import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  // TODO: Fetch project data from API
  const projectName = `Project ${id}`;

  return (
    <>
      <PageHeader
        title={projectName}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-4">
        {/* TODO: TaskList filtered by project */}
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>Project tasks will appear here</p>
        </div>
      </main>
    </>
  );
}
