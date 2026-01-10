import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InboxPage() {
  return (
    <>
      <PageHeader
        title="Inbox"
        description="Quick capture, process later"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
        }
      />
      <main className="flex-1 p-4">
        {/* TODO: QuickCapture + TaskList component */}
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>Inbox tasks will appear here</p>
          <p className="text-sm mt-1">Capture ideas fast, organize later</p>
        </div>
      </main>
    </>
  );
}
