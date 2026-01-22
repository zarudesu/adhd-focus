import SwiftUI

struct TaskSelectorSheet: View {
    @ObservedObject var taskStore: TaskStore
    @Binding var selectedTask: TaskItem?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if taskStore.todayTasks.isEmpty {
                    emptyState
                } else {
                    taskList
                }
            }
            .navigationTitle("Select Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                if selectedTask != nil {
                    ToolbarItem(placement: .primaryAction) {
                        Button("Clear") {
                            selectedTask = nil
                            dismiss()
                        }
                        .foregroundStyle(.red)
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("No tasks for today")
                .font(.headline)

            Text("Add tasks to Today to focus on them")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var taskList: some View {
        List {
            Section {
                ForEach(taskStore.todayTasks.filter { $0.status != .done }) { task in
                    TaskSelectorRow(
                        task: task,
                        isSelected: selectedTask?.id == task.id
                    ) {
                        selectedTask = task
                        dismiss()
                    }
                }
            } header: {
                Text("Today's Tasks")
            }
        }
    }
}

// MARK: - Task Selector Row

struct TaskSelectorRow: View {
    let task: TaskItem
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.body)
                        .foregroundStyle(.primary)

                    if let estimate = task.estimatedMinutes {
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text("\(estimate) min")
                                .font(.caption)
                        }
                        .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.orange)
                        .font(.title2)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview {
    TaskSelectorSheet(
        taskStore: TaskStore(),
        selectedTask: .constant(nil)
    )
    .preferredColorScheme(.dark)
}
