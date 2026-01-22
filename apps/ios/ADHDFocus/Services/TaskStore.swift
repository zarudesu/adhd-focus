import Foundation
import SwiftUI

@MainActor
class TaskStore: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    // MARK: - Computed Properties

    var todayTasks: [TaskItem] {
        tasks.filter { $0.status == .today || $0.status == .inProgress }
    }

    var inboxTasks: [TaskItem] {
        tasks.filter { $0.status == .inbox }
    }

    var scheduledTasks: [TaskItem] {
        tasks.filter { $0.status == .scheduled }
    }

    var completedTasks: [TaskItem] {
        tasks.filter { $0.status == .done }
    }

    // MARK: - Actions

    func fetchTasks() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            self.tasks = try await api.getTasks()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func createTask(title: String, status: TaskStatus = .inbox) async -> Bool {
        let input = CreateTaskInput(
            title: title,
            status: status
        )

        do {
            let task = try await api.createTask(input)
            self.tasks.insert(task, at: 0)
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func completeTask(id: String) async -> CompleteTaskResponse? {
        do {
            let response = try await api.completeTask(id: id)
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = response.task
            }
            return response
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }

    func uncompleteTask(id: String) async -> Bool {
        do {
            let task = try await api.uncompleteTask(id: id)
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = task
            }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func deleteTask(id: String) async -> Bool {
        do {
            _ = try await api.deleteTask(id: id)
            tasks.removeAll { $0.id == id }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func moveToToday(id: String) async -> Bool {
        let input = UpdateTaskInput(status: .today)
        do {
            let task = try await api.updateTask(id: id, input)
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = task
            }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func moveToInbox(id: String) async -> Bool {
        let input = UpdateTaskInput(status: .inbox)
        do {
            let task = try await api.updateTask(id: id, input)
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = task
            }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
