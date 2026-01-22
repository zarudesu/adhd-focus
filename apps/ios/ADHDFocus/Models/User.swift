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
}

struct AuthResponse: Codable {
    let user: User
    let token: String?
}

struct RegisterResponse: Codable {
    let message: String
    let user: RegisteredUser
}

struct RegisteredUser: Codable {
    let id: String
    let email: String
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
