import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ScheduledPage() {
  return (
    <>
      <PageHeader
        title="Scheduled"
        description="Tasks with due dates"
      />
      <main className="flex-1 p-4">
        <Tabs defaultValue="week" className="w-full">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            {/* TODO: CalendarView week */}
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground mt-4">
              <p>Week calendar view will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="month">
            {/* TODO: CalendarView month */}
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground mt-4">
              <p>Month calendar view will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
