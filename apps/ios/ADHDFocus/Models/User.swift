import Foundation

struct User: Identifiable, Codable {
    let id: String
    var email: String
    var name: String?
    var level: Int
    var xp: Int
    var currentStreak: Int
    var longestStreak: Int
    var totalTasksCompleted: Int
    var pomodoroWorkMinutes: Int?
    var pomodoroShortBreak: Int?
    var pomodoroLongBreak: Int?
    var wipLimit: Int?

    enum CodingKeys: String, CodingKey {
        case id, email, name, level, xp
        case currentStreak = "current_streak"
        case longestStreak = "longest_streak"
        case totalTasksCompleted = "total_tasks_completed"
        case pomodoroWorkMinutes = "pomodoro_work_minutes"
        case pomodoroShortBreak = "pomodoro_short_break"
        case pomodoroLongBreak = "pomodoro_long_break"
        case wipLimit = "wip_limit"
    }
}

struct AuthResponse: Codable {
    let user: User
    let token: String?
}

struct LoginInput: Codable {
    let email: String
    let password: String
}

struct RegisterInput: Codable {
    let email: String
    let password: String
    let name: String?
}
