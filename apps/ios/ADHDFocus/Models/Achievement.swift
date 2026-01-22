import Foundation

struct Achievement: Identifiable, Codable {
    let id: String
    let code: String
    let name: String
    let description: String
    let icon: String // emoji
    let category: String
    let visibility: String?
    let xpReward: Int
    let isUnlocked: Bool
    let unlockedAt: String? // ISO date string
    let progress: AchievementProgress?

    var unlockedDate: Date? {
        guard let unlockedAt = unlockedAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: unlockedAt) ?? ISO8601DateFormatter().date(from: unlockedAt)
    }

    var formattedUnlockDate: String? {
        guard let date = unlockedDate else { return nil }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    var progressPercent: Double {
        guard let progress = progress else { return isUnlocked ? 1.0 : 0.0 }
        guard progress.target > 0 else { return 0.0 }
        return min(Double(progress.current) / Double(progress.target), 1.0)
    }
}

struct AchievementProgress: Codable {
    let current: Int
    let target: Int
}

struct AchievementStats: Codable {
    let total: Int
    let unlocked: Int
    let visible: Int
}

struct AchievementsResponse: Codable {
    let achievements: [Achievement]
    let stats: AchievementStats
}
