import Foundation

struct Project: Identifiable, Codable {
    let id: String
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
    var archived: Bool
    var taskCount: Int?
    var completedCount: Int?
    var createdAt: String
    var updatedAt: String
}

struct CreateProjectInput: Codable {
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
}
