import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function FocusPage() {
  return (
    <>
      <PageHeader
        title="Focus Mode"
        description="One task at a time"
      />
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* TODO: PomodoroTimer component */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Pomodoro Timer</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-mono font-bold">25:00</div>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="outline">
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
                <Button size="lg" variant="outline" disabled>
                  <Pause className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TODO: FocusTask component - current task */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <p>Select a task to focus on</p>
              </div>
            </CardContent>
          </Card>

          {/* TODO: SessionStats component */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <p>0 pomodoros completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
