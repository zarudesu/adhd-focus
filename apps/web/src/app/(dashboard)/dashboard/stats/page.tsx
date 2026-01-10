import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Clock, CheckCircle2 } from "lucide-react";

export default function StatsPage() {
  return (
    <>
      <PageHeader
        title="Statistics"
        description="Track your progress"
      />
      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Streak Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: StreakCard component */}
              <div className="text-center">
                <div className="text-5xl font-bold">0</div>
                <p className="text-muted-foreground">days</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0h</div>
                <p className="text-xs text-muted-foreground">this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0/3</div>
                <Progress value={0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: WeeklyChart component */}
              <div className="h-48 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                <p>Weekly activity chart will appear here</p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: AchievementCard component list */}
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Complete tasks to unlock achievements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
