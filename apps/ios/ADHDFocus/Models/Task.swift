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

struct Task: Identifiable, Codable {
    let id: String
    var title: String
    var description: String?
    var status: TaskStatus
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var scheduledDate: String?
    var projectId: String?
    var completedAt: String?
    var createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, title, description, status, priority
        case energyRequired = "energy_required"
        case estimatedMinutes = "estimated_minutes"
        case scheduledDate = "scheduled_date"
        case projectId = "project_id"
        case completedAt = "completed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct CreateTaskInput: Codable {
    var title: String
    var description: String?
    var status: TaskStatus?
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var scheduledDate: String?
    var projectId: String?

    enum CodingKeys: String, CodingKey {
        case title, description, status, priority
        case energyRequired = "energy_required"
        case estimatedMinutes = "estimated_minutes"
        case scheduledDate = "scheduled_date"
        case projectId = "project_id"
    }
}

struct UpdateTaskInput: Codable {
    var title: String?
    var description: String?
    var status: TaskStatus?
    var priority: TaskPriority?
    var energyRequired: EnergyLevel?
    var estimatedMinutes: Int?
    var scheduledDate: String?
    var projectId: String?

    enum CodingKeys: String, CodingKey {
        case title, description, status, priority
        case energyRequired = "energy_required"
        case estimatedMinutes = "estimated_minutes"
        case scheduledDate = "scheduled_date"
        case projectId = "project_id"
    }
}
