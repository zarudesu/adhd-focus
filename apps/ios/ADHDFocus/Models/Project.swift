import Foundation

struct Project: Identifiable, Codable {
    let id: String
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
    var isArchived: Bool
    var taskCount: Int?
    var completedCount: Int?
    var createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, description, emoji, color
        case isArchived = "is_archived"
        case taskCount = "task_count"
        case completedCount = "completed_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct CreateProjectInput: Codable {
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
}
