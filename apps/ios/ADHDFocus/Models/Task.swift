import Foundation

enum TaskStatus: String, Codable, CaseIterable {
    case inbox
    case today
    case scheduled
    case inProgress = "in_progress"
    case done
    case archived
}

enum TaskPriority: String, Codable, CaseIterable {
    case must
    case should
    case want
    case someday
}

enum EnergyLevel: String, Codable, CaseIterable {
    case low
    case medium
    case high
}

struct TaskItem: Identifiable, Codable {
    let id: String
    var title: String
    var description: String?
    var status: TaskStatus
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var actualMinutes: Int?
    var pomodorosCompleted: Int?
    var dueDate: String?
    var scheduledDate: String?
    var projectId: String?
    var completedAt: String?
    var tags: [String]?
    var sortOrder: Int?
    var createdAt: String
    var updatedAt: String
}

struct CreateTaskInput: Codable {
    var title: String
    var description: String?
    var status: TaskStatus?
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var dueDate: String?
    var scheduledDate: String?
    var projectId: String?
    var tags: [String]?
}

struct UpdateTaskInput: Codable {
    var title: String?
    var description: String?
    var status: TaskStatus?
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var actualMinutes: Int?
    var dueDate: String?
    var scheduledDate: String?
    var projectId: String?
    var tags: [String]?
    var sortOrder: Int?
}
