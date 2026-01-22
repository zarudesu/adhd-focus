import Foundation

// MARK: - Session Types

enum SessionType: String, Codable, CaseIterable {
    case work
    case shortBreak = "short_break"
    case longBreak = "long_break"

    var displayName: String {
        switch self {
        case .work: return "Work"
        case .shortBreak: return "Short Break"
        case .longBreak: return "Long Break"
        }
    }

    var defaultDuration: Int {
        switch self {
        case .work: return 25
        case .shortBreak: return 5
        case .longBreak: return 15
        }
    }
}

// MARK: - Timer State

enum TimerState {
    case idle
    case running
    case paused
}

// MARK: - Focus Session Model

struct FocusSession: Codable, Identifiable {
    let id: String
    var taskId: String?
    var durationMinutes: Int
    var pomodoros: Int
    var breaksTaken: Int
    var completed: Bool
    var startedAt: String
    var endedAt: String?
    var taskTitle: String?

    // For creating new sessions
    init(id: String = UUID().uuidString,
         taskId: String? = nil,
         durationMinutes: Int = 0,
         pomodoros: Int = 0,
         breaksTaken: Int = 0,
         completed: Bool = false,
         startedAt: String = ISO8601DateFormatter().string(from: Date()),
         endedAt: String? = nil,
         taskTitle: String? = nil) {
        self.id = id
        self.taskId = taskId
        self.durationMinutes = durationMinutes
        self.pomodoros = pomodoros
        self.breaksTaken = breaksTaken
        self.completed = completed
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.taskTitle = taskTitle
    }
}

// MARK: - API Request/Response

struct CreateSessionInput: Codable {
    let taskId: String?
}

struct UpdateSessionInput: Codable {
    let completed: Bool?
    let pomodoros: Int?
    let durationMinutes: Int?
}

struct FocusSessionsResponse: Codable {
    let sessions: [FocusSession]
    let todayStats: TodayFocusStats
    let totalStats: TotalFocusStats
}

struct TodayFocusStats: Codable {
    let pomodoros: Int
    let focusMinutes: Int
    let sessionsCompleted: Int
}

struct TotalFocusStats: Codable {
    let totalPomodoros: Int
    let totalFocusMinutes: Int
}
