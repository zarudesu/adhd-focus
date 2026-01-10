import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Organize tasks by project"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        }
      />
      <main className="flex-1 p-4">
        {/* TODO: ProjectList component */}
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>Your projects will appear here</p>
          <p className="text-sm mt-1">Create projects to organize related tasks</p>
        </div>
      </main>
    </>
  );
}
