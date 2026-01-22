import SwiftUI

struct ScheduledView: View {
    @ObservedObject var taskStore: TaskStore
    @State private var showAddTask = false

    // MARK: - Date Grouping

    private enum DateGroup: Comparable {
        case today
        case tomorrow
        case thisWeek(Date)
        case later(Date)

        var sortOrder: Int {
            switch self {
            case .today: return 0
            case .tomorrow: return 1
            case .thisWeek: return 2
            case .later: return 3
            }
        }

        static func < (lhs: DateGroup, rhs: DateGroup) -> Bool {
            if lhs.sortOrder != rhs.sortOrder {
                return lhs.sortOrder < rhs.sortOrder
            }
            // Within same group, sort by date
            switch (lhs, rhs) {
            case (.thisWeek(let d1), .thisWeek(let d2)):
                return d1 < d2
            case (.later(let d1), .later(let d2)):
                return d1 < d2
            default:
                return false
            }
        }
    }

    private var groupedTasks: [(group: DateGroup, title: String, tasks: [TaskItem])] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let weekEnd = calendar.date(byAdding: .day, value: 7, to: today)!

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"

        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .none

        // Filter scheduled tasks with valid dates
        let scheduledTasks = taskStore.scheduledTasks.compactMap { task -> (task: TaskItem, date: Date)? in
            guard let dateString = task.scheduledDate,
                  let date = dateFormatter.date(from: dateString) else {
                return nil
            }
            return (task, calendar.startOfDay(for: date))
        }

        // Group by date category
        var groups: [DateGroup: [TaskItem]] = [:]

        for (task, date) in scheduledTasks {
            let group: DateGroup

            if calendar.isDate(date, inSameDayAs: today) {
                group = .today
            } else if calendar.isDate(date, inSameDayAs: tomorrow) {
                group = .tomorrow
            } else if date > today && date < weekEnd {
                group = .thisWeek(date)
            } else {
                group = .later(date)
            }

            groups[group, default: []].append(task)
        }

        // Sort tasks within each group by date, then by title
        for key in groups.keys {
            groups[key]?.sort { task1, task2 in
                if let d1 = task1.scheduledDate, let d2 = task2.scheduledDate, d1 != d2 {
                    return d1 < d2
                }
                return task1.title < task2.title
            }
        }

        // Convert to array with display titles
        var result: [(group: DateGroup, title: String, tasks: [TaskItem])] = []

        for (group, tasks) in groups {
            let title: String
            switch group {
            case .today:
                title = "Today"
            case .tomorrow:
                title = "Tomorrow"
            case .thisWeek(let date):
                // Show weekday name for this week
                let weekdayFormatter = DateFormatter()
                weekdayFormatter.dateFormat = "EEEE"
                title = weekdayFormatter.string(from: date)
            case .later(let date):
                title = displayFormatter.string(from: date)
            }
            result.append((group, title, tasks))
        }

        // Sort groups
        result.sort { $0.group < $1.group }

        return result
    }

    var body: some View {
        NavigationStack {
            Group {
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    ProgressView("Loading...")
                } else if groupedTasks.isEmpty {
                    emptyState
                } else {
                    taskList
                }
            }
            .navigationTitle("Scheduled")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showAddTask = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
            }
            .refreshable {
                await taskStore.fetchTasks()
            }
            .sheet(isPresented: $showAddTask) {
                AddScheduledTaskSheet(taskStore: taskStore)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No scheduled tasks")
                .font(.headline)

            Text("Schedule tasks for future dates")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                showAddTask = true
            } label: {
                Label("Schedule Task", systemImage: "plus")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }

    private var taskList: some View {
        List {
            ForEach(groupedTasks, id: \.title) { group in
                Section(group.title) {
                    ForEach(group.tasks) { task in
                        TaskRow(task: task, taskStore: taskStore)
                    }
                }
            }
        }
    }
}

// MARK: - Add Scheduled Task Sheet

struct AddScheduledTaskSheet: View {
    @ObservedObject var taskStore: TaskStore

    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var selectedDate = Date()
    @State private var isCreating = false
    @FocusState private var isFocused: Bool

    private var minimumDate: Date {
        Calendar.current.startOfDay(for: Date())
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What needs to be done?", text: $title, axis: .vertical)
                        .font(.title3)
                        .lineLimit(3...6)
                        .focused($isFocused)
                }

                Section("Schedule for") {
                    DatePicker(
                        "Date",
                        selection: $selectedDate,
                        in: minimumDate...,
                        displayedComponents: .date
                    )
                    .datePickerStyle(.graphical)
                }
            }
            .navigationTitle("Schedule Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        createTask()
                    } label: {
                        if isCreating {
                            ProgressView()
                        } else {
                            Text("Add")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
                }
            }
            .onAppear {
                isFocused = true
            }
        }
    }

    private func createTask() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        isCreating = true
        Task {
            let success = await taskStore.createScheduledTask(
                title: trimmedTitle,
                scheduledDate: selectedDate
            )
            if success {
                dismiss()
            }
            isCreating = false
        }
    }
}

#Preview {
    ScheduledView(taskStore: TaskStore())
}
