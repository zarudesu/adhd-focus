import Foundation
import SwiftUI

@MainActor
class ProjectStore: ObservableObject {
    @Published var projects: [Project] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    // MARK: - Actions

    func fetchProjects() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            self.projects = try await api.getProjects()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func createProject(name: String, emoji: String?, color: String?, description: String?) async -> Project? {
        let input = CreateProjectInput(
            name: name,
            description: description,
            emoji: emoji,
            color: color
        )

        do {
            let project = try await api.createProject(input)
            self.projects.insert(project, at: 0)
            return project
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }

    func updateProject(id: String, name: String?, emoji: String?, color: String?, description: String?, archived: Bool?) async -> Bool {
        let input = UpdateProjectInput(
            name: name,
            description: description,
            emoji: emoji,
            color: color,
            archived: archived
        )

        do {
            let updated = try await api.updateProject(id: id, input)
            if let index = projects.firstIndex(where: { $0.id == id }) {
                projects[index] = updated
            }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func deleteProject(id: String) async -> Bool {
        do {
            _ = try await api.deleteProject(id: id)
            projects.removeAll { $0.id == id }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func archiveProject(id: String) async -> Bool {
        return await updateProject(id: id, name: nil, emoji: nil, color: nil, description: nil, archived: true)
    }
}
