import SwiftUI

struct TaskRow: View {
    let task: TaskItem
    @ObservedObject var taskStore: TaskStore
    @State private var isCompleting = false

    private var isCompleted: Bool {
        task.status == .done
    }

    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button {
                toggleComplete()
            } label: {
                ZStack {
                    Circle()
                        .strokeBorder(isCompleted ? Color.green : Color.secondary, lineWidth: 2)
                        .frame(width: 24, height: 24)

                    if isCompleted {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 18, height: 18)

                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.white)
                    }

                    if isCompleting {
                        ProgressView()
                            .scaleEffect(0.6)
                    }
                }
            }
            .buttonStyle(.plain)
            .disabled(isCompleting)

            // Task content
            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.body)
                    .strikethrough(isCompleted)
                    .foregroundStyle(isCompleted ? .secondary : .primary)

                if let description = task.description, !description.isEmpty {
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                // Metadata row
                HStack(spacing: 8) {
                    if let priority = task.priority {
                        priorityBadge(priority)
                    }

                    if let energy = task.energyRequired {
                        energyBadge(energy)
                    }

                    if let minutes = task.estimatedMinutes {
                        Label("\(minutes)m", systemImage: "clock")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                deleteTask()
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            if task.status != .inbox {
                Button {
                    moveToInbox()
                } label: {
                    Label("Inbox", systemImage: "tray")
                }
                .tint(.orange)
            }

            if task.status != .today {
                Button {
                    moveToToday()
                } label: {
                    Label("Today", systemImage: "sun.max")
                }
                .tint(.yellow)
            }
        }
    }

    private func toggleComplete() {
        isCompleting = true
        Task {
            if isCompleted {
                _ = await taskStore.uncompleteTask(id: task.id)
            } else {
                _ = await taskStore.completeTask(id: task.id)
            }
            isCompleting = false
        }
    }

    private func deleteTask() {
        Task {
            _ = await taskStore.deleteTask(id: task.id)
        }
    }

    private func moveToInbox() {
        Task {
            _ = await taskStore.moveToInbox(id: task.id)
        }
    }

    private func moveToToday() {
        Task {
            _ = await taskStore.moveToToday(id: task.id)
        }
    }

    private func priorityBadge(_ priority: TaskPriority) -> some View {
        let (color, text): (Color, String) = switch priority {
        case .must: (.red, "Must")
        case .should: (.orange, "Should")
        case .want: (.blue, "Want")
        case .someday: (.gray, "Someday")
        }

        return Text(text)
            .font(.caption2)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .cornerRadius(4)
    }

    private func energyBadge(_ energy: EnergyLevel) -> some View {
        let icon = switch energy {
        case .low: "battery.25"
        case .medium: "battery.50"
        case .high: "battery.100"
        }

        return Image(systemName: icon)
            .font(.caption2)
            .foregroundStyle(.secondary)
    }
}
