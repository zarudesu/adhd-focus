import Foundation

struct UserStats: Codable {
    let level: Int
    let xp: Int
    let xpToNextLevel: Int
    let totalTasksCompleted: Int
    let currentStreak: Int
    let longestStreak: Int
    let totalFocusMinutes: Int
    let totalPomodoros: Int
    let tasksCompletedThisWeek: Int
    let weeklyData: [DayData]

    struct DayData: Codable, Identifiable {
        let date: String
        let tasksCompleted: Int
        let focusMinutes: Int

        var id: String { date }

        /// Parsed date for display
        var parsedDate: Date? {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            return formatter.date(from: date)
        }

        /// Day of week abbreviation (M, T, W, etc.)
        var dayAbbreviation: String {
            guard let date = parsedDate else { return "" }
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEEE" // Single letter day
            return formatter.string(from: date)
        }
    }
}

// MARK: - API Response Mapping

/// Maps the /api/stats response to UserStats
struct StatsAPIResponse: Codable {
    let dailyStats: [DailyStat]
    let periodTotals: PeriodTotals
    let allTime: AllTimeStats

    struct DailyStat: Codable {
        let date: String
        let tasksCompleted: Int
        let pomodorosCompleted: Int
        let focusMinutes: Int
        let xpEarned: Int
        let streakMaintained: Bool
    }

    struct PeriodTotals: Codable {
        let tasksCompleted: Int
        let pomodorosCompleted: Int
        let focusMinutes: Int
        let xpEarned: Int
    }

    struct AllTimeStats: Codable {
        let totalPomodoros: Int
        let totalFocusMinutes: Int
        let totalTasksCompleted: Int
        let currentStreak: Int
        let longestStreak: Int
    }
}

/// Maps the /api/gamification/stats response for level/xp info
struct GamificationStatsResponse: Codable {
    let xp: Int
    let level: Int
    let currentStreak: Int
    let longestStreak: Int
    let totalTasksCompleted: Int
}

extension UserStats {
    /// Creates UserStats from API responses
    static func from(
        statsResponse: StatsAPIResponse,
        gamificationResponse: GamificationStatsResponse
    ) -> UserStats {
        // Calculate XP to next level using the formula: 100 * level^1.5
        let level = gamificationResponse.level
        let xpToNextLevel = Int(floor(100.0 * pow(Double(level), 1.5)))

        // Map daily stats to DayData
        let weeklyData = statsResponse.dailyStats.map { stat in
            DayData(
                date: stat.date,
                tasksCompleted: stat.tasksCompleted,
                focusMinutes: stat.focusMinutes
            )
        }

        return UserStats(
            level: level,
            xp: gamificationResponse.xp,
            xpToNextLevel: xpToNextLevel,
            totalTasksCompleted: statsResponse.allTime.totalTasksCompleted,
            currentStreak: statsResponse.allTime.currentStreak,
            longestStreak: statsResponse.allTime.longestStreak,
            totalFocusMinutes: statsResponse.allTime.totalFocusMinutes,
            totalPomodoros: statsResponse.allTime.totalPomodoros,
            tasksCompletedThisWeek: statsResponse.periodTotals.tasksCompleted,
            weeklyData: weeklyData
        )
    }
}
