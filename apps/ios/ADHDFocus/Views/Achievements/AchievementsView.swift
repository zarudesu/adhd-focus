import SwiftUI

struct AchievementsView: View {
    @StateObject private var achievementStore = AchievementStore()

    var body: some View {
        NavigationStack {
            Group {
                if achievementStore.isLoading && achievementStore.achievements.isEmpty {
                    ProgressView("Loading achievements...")
                } else if achievementStore.achievements.isEmpty {
                    emptyState
                } else {
                    achievementsList
                }
            }
            .navigationTitle("Achievements")
            .refreshable {
                await achievementStore.fetchAchievements()
            }
            .task {
                if achievementStore.achievements.isEmpty {
                    await achievementStore.fetchAchievements()
                }
            }
            .alert("Error", isPresented: .init(
                get: { achievementStore.error != nil },
                set: { if !$0 { achievementStore.error = nil } }
            )) {
                Button("OK") { achievementStore.error = nil }
            } message: {
                Text(achievementStore.error ?? "Unknown error")
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "trophy")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No achievements yet")
                .font(.headline)

            Text("Complete tasks to unlock achievements")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                Task {
                    await achievementStore.fetchAchievements()
                }
            } label: {
                Label("Refresh", systemImage: "arrow.clockwise")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }

    // MARK: - Achievements List

    private var achievementsList: some View {
        List {
            // Summary Header
            Section {
                summaryHeader
            }

            // Achievements by Category
            ForEach(achievementStore.sortedCategories, id: \.self) { category in
                Section(achievementStore.displayName(for: category)) {
                    ForEach(achievementStore.achievementsByCategory[category] ?? []) { achievement in
                        AchievementRow(achievement: achievement)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    // MARK: - Summary Header

    private var summaryHeader: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(achievementStore.unlockedCount) of \(achievementStore.achievements.count) unlocked")
                        .font(.headline)

                    Text("\(Int(achievementStore.overallProgress * 100))% complete")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "trophy.fill")
                    .font(.title)
                    .foregroundStyle(.yellow)
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.secondary.opacity(0.2))
                        .frame(height: 8)

                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [.yellow, .orange],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * achievementStore.overallProgress, height: 8)
                }
            }
            .frame(height: 8)
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Achievement Row

struct AchievementRow: View {
    let achievement: Achievement

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            achievementIcon

            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(achievement.name)
                        .font(.headline)
                        .foregroundStyle(achievement.isUnlocked ? .primary : .secondary)

                    if !achievement.isUnlocked {
                        Text("(locked)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(achievement.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                // Progress or unlock date
                if achievement.isUnlocked {
                    if let unlockDate = achievement.formattedUnlockDate {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.green)
                            Text("Unlocked \(unlockDate)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                } else if let progress = achievement.progress {
                    progressBar(current: progress.current, target: progress.target)
                }
            }

            Spacer()

            // XP Badge
            xpBadge
        }
        .padding(.vertical, 4)
        .opacity(achievement.isUnlocked ? 1.0 : 0.7)
    }

    // MARK: - Icon

    private var achievementIcon: some View {
        ZStack {
            Circle()
                .fill(achievement.isUnlocked ? Color.yellow.opacity(0.2) : Color.secondary.opacity(0.1))
                .frame(width: 50, height: 50)

            Text(achievement.icon)
                .font(.title)
                .grayscale(achievement.isUnlocked ? 0.0 : 1.0)
        }
    }

    // MARK: - Progress Bar

    private func progressBar(current: Int, target: Int) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.secondary.opacity(0.2))
                        .frame(height: 6)

                    Capsule()
                        .fill(Color.accentColor)
                        .frame(width: geometry.size.width * achievement.progressPercent, height: 6)
                }
            }
            .frame(height: 6)

            Text("\(current)/\(target)")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: 120)
    }

    // MARK: - XP Badge

    private var xpBadge: some View {
        Text("+\(achievement.xpReward) XP")
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(achievement.isUnlocked ? Color.green.opacity(0.2) : Color.secondary.opacity(0.1))
            )
            .foregroundStyle(achievement.isUnlocked ? .green : .secondary)
    }
}

// MARK: - Preview

#Preview {
    AchievementsView()
}

#Preview("Achievement Row - Unlocked") {
    List {
        AchievementRow(achievement: Achievement(
            id: "1",
            code: "first_steps",
            name: "First Steps",
            description: "Complete your first task",
            icon: "\u{1F3C6}",
            category: "productivity",
            visibility: "visible",
            xpReward: 10,
            isUnlocked: true,
            unlockedAt: "2026-01-15T10:30:00Z",
            progress: nil
        ))
    }
}

#Preview("Achievement Row - Locked with Progress") {
    List {
        AchievementRow(achievement: Achievement(
            id: "2",
            code: "on_fire",
            name: "On Fire",
            description: "7-day streak",
            icon: "\u{1F525}",
            category: "consistency",
            visibility: "visible",
            xpReward: 50,
            isUnlocked: false,
            unlockedAt: nil,
            progress: AchievementProgress(current: 4, target: 7)
        ))
    }
}
