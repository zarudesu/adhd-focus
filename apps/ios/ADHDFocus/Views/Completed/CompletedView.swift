import SwiftUI

struct CompletedView: View {
    @ObservedObject var taskStore: TaskStore

    var body: some View {
        NavigationStack {
            Group {
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    ProgressView("Loading...")
                } else if taskStore.completedTasks.isEmpty {
                    emptyState
                } else {
                    taskList
                }
            }
            .navigationTitle("Completed")
            .refreshable {
                await taskStore.fetchTasks()
            }
        }
    }

    // MARK: - Date Grouping

    private var groupedTasks: [(key: DateGroup, tasks: [TaskItem])] {
        let calendar = Calendar.current
        let now = Date()
        let today = calendar.startOfDay(for: now)
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: today)!

        var groups: [DateGroup: [TaskItem]] = [:]

        for task in taskStore.completedTasks {
            let group = dateGroup(for: task, today: today, yesterday: yesterday, weekAgo: weekAgo, calendar: calendar)
            groups[group, default: []].append(task)
        }

        // Sort tasks within each group by completedAt descending
        for key in groups.keys {
            groups[key]?.sort { task1, task2 in
                guard let date1 = parseDate(task1.completedAt),
                      let date2 = parseDate(task2.completedAt) else {
                    return false
                }
                return date1 > date2
            }
        }

        // Sort groups: Today, Yesterday, This Week, Earlier
        return groups
            .sorted { $0.key.sortOrder < $1.key.sortOrder }
            .map { (key: $0.key, tasks: $0.value) }
    }

    private func dateGroup(for task: TaskItem, today: Date, yesterday: Date, weekAgo: Date, calendar: Calendar) -> DateGroup {
        guard let completedAt = parseDate(task.completedAt) else {
            return .earlier
        }

        let completedDay = calendar.startOfDay(for: completedAt)

        if completedDay == today {
            return .today
        } else if completedDay == yesterday {
            return .yesterday
        } else if completedAt >= weekAgo {
            return .thisWeek
        } else {
            return .earlier
        }
    }

    private func parseDate(_ dateString: String?) -> Date? {
        guard let dateString = dateString else { return nil }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            return date
        }

        // Try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }

    // MARK: - Views

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No completed tasks yet")
                .font(.headline)

            Text("Complete tasks from Today or Inbox")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var taskList: some View {
        List {
            ForEach(groupedTasks, id: \.key) { group in
                Section {
                    ForEach(group.tasks) { task in
                        TaskRow(task: task, taskStore: taskStore)
                    }
                } header: {
                    HStack {
                        Text(group.key.title)
                        Spacer()
                        Text("\(group.tasks.count)")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }
}

// MARK: - Date Group Enum

private enum DateGroup: Hashable {
    case today
    case yesterday
    case thisWeek
    case earlier

    var title: String {
        switch self {
        case .today: return "Today"
        case .yesterday: return "Yesterday"
        case .thisWeek: return "This Week"
        case .earlier: return "Earlier"
        }
    }

    var sortOrder: Int {
        switch self {
        case .today: return 0
        case .yesterday: return 1
        case .thisWeek: return 2
        case .earlier: return 3
        }
    }
}

#Preview {
    CompletedView(taskStore: TaskStore())
}
