import Foundation

// MARK: - Time of Day

enum TimeOfDay: String, Codable, CaseIterable {
    case morning
    case afternoon
    case evening
    case night
    case anytime

    var displayName: String {
        switch self {
        case .morning: return "Morning"
        case .afternoon: return "Afternoon"
        case .evening: return "Evening"
        case .night: return "Night"
        case .anytime: return "Anytime"
        }
    }

    var icon: String {
        switch self {
        case .morning: return "sunrise"
        case .afternoon: return "sun.max"
        case .evening: return "sunset"
        case .night: return "moon"
        case .anytime: return "clock"
        }
    }

    // Section order for display
    var order: Int {
        switch self {
        case .morning: return 0
        case .afternoon: return 1
        case .evening: return 2
        case .night: return 3
        case .anytime: return 4
        }
    }
}

// MARK: - Habit Frequency

enum HabitFrequency: String, Codable, CaseIterable {
    case daily
    case weekdays
    case weekends
    case custom

    var displayName: String {
        switch self {
        case .daily: return "Every day"
        case .weekdays: return "Weekdays"
        case .weekends: return "Weekends"
        case .custom: return "Custom"
        }
    }
}

// MARK: - Habit Check

struct HabitCheck: Codable, Identifiable {
    let id: String
    let habitId: String
    let userId: String
    let date: String
    let checkedAt: String
    let skipped: Bool
    let reflection: String?
    let blockers: [String]?
    let xpAwarded: Int?
}

// MARK: - Habit

struct Habit: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var emoji: String
    var description: String?
    var frequency: HabitFrequency
    var customDays: [Int]?
    var timeOfDay: TimeOfDay
    var sortOrder: Int
    var color: String?
    var isArchived: Bool
    var currentStreak: Int
    var longestStreak: Int
    var totalCompletions: Int
    let createdAt: String
    var archivedAt: String?

    // Computed properties from API (enriched response)
    var shouldDoToday: Bool?
    var todayCheck: HabitCheck?
    var isCompleted: Bool?
    var isSkipped: Bool?

    // Convenience computed properties
    var isCheckedToday: Bool {
        isCompleted == true || isSkipped == true
    }

    var streakText: String? {
        guard currentStreak > 0 else { return nil }
        return "\(currentStreak) day\(currentStreak == 1 ? "" : "s")"
    }

    static func == (lhs: Habit, rhs: Habit) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - API Response Types

struct HabitsResponse: Codable {
    let habits: [Habit]
    let summary: HabitsSummary
    let date: String
}

struct HabitsSummary: Codable {
    let totalHabits: Int
    let habitsForToday: Int
    let completed: Int
    let skipped: Int
    let remaining: Int
    let allDone: Bool
    let progress: Int
}

struct CheckHabitResponse: Codable {
    let check: HabitCheck
    let xpAwarded: Int
    let habitXp: Int
    let bonusXp: Int
    let allHabitsDone: Bool
    let levelUp: Bool?
    let newLevel: Int?
}

// MARK: - API Input Types

struct CreateHabitInput: Codable {
    var name: String
    var emoji: String?
    var description: String?
    var frequency: HabitFrequency?
    var customDays: [Int]?
    var timeOfDay: TimeOfDay?
    var color: String?
}

struct UpdateHabitInput: Codable {
    var name: String?
    var emoji: String?
    var description: String?
    var frequency: HabitFrequency?
    var customDays: [Int]?
    var timeOfDay: TimeOfDay?
    var color: String?
    var sortOrder: Int?
}

struct ReorderHabitsInput: Codable {
    let habits: [ReorderItem]

    struct ReorderItem: Codable {
        let id: String
        let sortOrder: Int
    }
}
