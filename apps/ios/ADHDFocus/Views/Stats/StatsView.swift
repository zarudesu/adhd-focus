import SwiftUI
import Charts

struct StatsView: View {
    @StateObject private var statsStore = StatsStore()

    var body: some View {
        NavigationStack {
            Group {
                if statsStore.isLoading && statsStore.stats == nil {
                    loadingView
                } else if let error = statsStore.error, statsStore.stats == nil {
                    errorView(error)
                } else if let stats = statsStore.stats {
                    statsContent(stats)
                } else {
                    emptyView
                }
            }
            .navigationTitle("Statistics")
            .refreshable {
                await statsStore.refresh()
            }
        }
        .task {
            await statsStore.fetchStats()
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading stats...")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Error View

    private func errorView(_ error: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            Text("Failed to load stats")
                .font(.headline)

            Text(error)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Try Again") {
                Task {
                    await statsStore.refresh()
                }
            }
            .buttonStyle(.bordered)
        }
        .padding()
    }

    // MARK: - Empty View

    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "chart.bar")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            Text("No stats yet")
                .font(.headline)

            Text("Complete some tasks to see your stats")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    // MARK: - Stats Content

    private func statsContent(_ stats: UserStats) -> some View {
        ScrollView {
            VStack(spacing: 24) {
                // Hero Section - Level Badge with XP Ring
                LevelBadgeView(
                    level: stats.level,
                    xp: stats.xp,
                    xpToNextLevel: stats.xpToNextLevel
                )

                // Stats Grid (2x2)
                StatsGridView(stats: stats)

                // Weekly Chart
                WeeklyChartView(weeklyData: stats.weeklyData)

                // This Week Summary
                ThisWeekView(tasksCompleted: stats.tasksCompletedThisWeek)
            }
            .padding()
        }
    }
}

// MARK: - Level Badge View

struct LevelBadgeView: View {
    let level: Int
    let xp: Int
    let xpToNextLevel: Int

    @State private var animatedProgress: Double = 0
    @State private var animatedXP: Int = 0

    private var progress: Double {
        guard xpToNextLevel > 0 else { return 0 }
        return Double(xp) / Double(xpToNextLevel)
    }

    var body: some View {
        VStack(spacing: 12) {
            // Level Badge with XP Ring
            ZStack {
                // Background ring
                Circle()
                    .stroke(Color.secondary.opacity(0.2), lineWidth: 10)
                    .frame(width: 120, height: 120)

                // Progress ring
                Circle()
                    .trim(from: 0, to: animatedProgress)
                    .stroke(
                        AngularGradient(
                            colors: [.purple, .blue, .purple],
                            center: .center
                        ),
                        style: StrokeStyle(lineWidth: 10, lineCap: .round)
                    )
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))

                // Level number
                VStack(spacing: 2) {
                    Text("Level")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text("\(level)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)
                }
            }

            // XP Progress Text
            HStack(spacing: 4) {
                Text("\(animatedXP)")
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
                Text("/")
                    .foregroundStyle(.secondary)
                Text("\(xpToNextLevel)")
                    .font(.headline)
                    .foregroundStyle(.secondary)
                Text("XP")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 20)
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                animatedProgress = progress
            }
            withAnimation(.easeOut(duration: 0.8)) {
                animatedXP = xp
            }
        }
        .onChange(of: xp) { _, newValue in
            withAnimation(.easeOut(duration: 0.5)) {
                animatedXP = newValue
                animatedProgress = Double(newValue) / Double(xpToNextLevel)
            }
        }
    }
}

// MARK: - Stats Grid View

struct StatsGridView: View {
    let stats: UserStats

    @State private var animatedStreak: Int = 0
    @State private var animatedTasks: Int = 0
    @State private var animatedMinutes: Int = 0
    @State private var animatedPomodoros: Int = 0

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            StatCard(
                emoji: "fire",
                value: animatedStreak,
                label: "day streak",
                color: .orange
            )

            StatCard(
                emoji: "checkmark.circle.fill",
                value: animatedTasks,
                label: "tasks done",
                color: .green
            )

            StatCard(
                emoji: "timer",
                value: animatedMinutes / 60,
                label: "hours focused",
                color: .blue,
                suffix: formatFocusTime(animatedMinutes)
            )

            StatCard(
                emoji: "leaf.fill",
                value: animatedPomodoros,
                label: "pomodoros",
                color: .red
            )
        }
        .onAppear {
            animateNumbers()
        }
        .onChange(of: stats.currentStreak) { _, _ in
            animateNumbers()
        }
    }

    private func animateNumbers() {
        let duration: Double = 0.8
        let steps = 20

        for i in 0...steps {
            let delay = duration * Double(i) / Double(steps)
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                let fraction = Double(i) / Double(steps)
                animatedStreak = Int(Double(stats.currentStreak) * fraction)
                animatedTasks = Int(Double(stats.totalTasksCompleted) * fraction)
                animatedMinutes = Int(Double(stats.totalFocusMinutes) * fraction)
                animatedPomodoros = Int(Double(stats.totalPomodoros) * fraction)
            }
        }
    }

    private func formatFocusTime(_ minutes: Int) -> String? {
        let hours = minutes / 60
        let mins = minutes % 60
        if hours > 0 && mins > 0 {
            return "\(hours)h \(mins)m"
        } else if hours > 0 {
            return nil // Just show the hours number
        } else {
            return "\(mins)m"
        }
    }
}

struct StatCard: View {
    let emoji: String
    let value: Int
    let label: String
    let color: Color
    var suffix: String? = nil

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: emoji)
                .font(.title)
                .foregroundStyle(color)

            if let suffix = suffix {
                Text(suffix)
                    .font(.title2.bold())
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
            } else {
                Text("\(value)")
                    .font(.title.bold())
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
            }

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Weekly Chart View

struct WeeklyChartView: View {
    let weeklyData: [UserStats.DayData]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("This Week")
                .font(.headline)

            if weeklyData.isEmpty {
                Text("No activity this week")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 40)
            } else {
                Chart(weeklyData) { day in
                    BarMark(
                        x: .value("Day", day.dayAbbreviation),
                        y: .value("Tasks", day.tasksCompleted)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .bottom,
                            endPoint: .top
                        )
                    )
                    .cornerRadius(4)
                    .annotation(position: .top, spacing: 4) {
                        if day.tasksCompleted > 0 {
                            Text("\(day.tasksCompleted)")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading)
                }
                .chartXAxis {
                    AxisMarks { value in
                        AxisValueLabel()
                            .font(.caption)
                    }
                }
                .frame(height: 180)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - This Week View

struct ThisWeekView: View {
    let tasksCompleted: Int

    @State private var animatedCount: Int = 0

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Tasks This Week")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(animatedCount)")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .contentTransition(.numericText())

                    Text("completed")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 40))
                .foregroundStyle(.green)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                animatedCount = tasksCompleted
            }
        }
        .onChange(of: tasksCompleted) { _, newValue in
            withAnimation(.easeOut(duration: 0.5)) {
                animatedCount = newValue
            }
        }
    }
}

// MARK: - Preview

#Preview {
    StatsView()
}
