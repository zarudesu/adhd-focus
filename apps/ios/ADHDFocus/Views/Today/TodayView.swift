import SwiftUI

struct TodayView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var taskStore = TaskStore()
    @State private var showAddTask = false

    var body: some View {
        NavigationStack {
            Group {
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    ProgressView("Loading...")
                } else if taskStore.todayTasks.isEmpty {
                    emptyState
                } else {
                    taskList
                }
            }
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showAddTask = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }

                ToolbarItem(placement: .cancellationAction) {
                    Menu {
                        Button(role: .destructive) {
                            authManager.logout()
                        } label: {
                            Label("Logout", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    } label: {
                        Image(systemName: "person.circle")
                    }
                }
            }
            .refreshable {
                await taskStore.fetchTasks()
            }
            .task {
                await taskStore.fetchTasks()
            }
            .sheet(isPresented: $showAddTask) {
                AddTaskSheet(taskStore: taskStore, defaultStatus: .today)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "sun.max")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No tasks for today")
                .font(.headline)

            Text("Move tasks from Inbox or add new ones")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                showAddTask = true
            } label: {
                Label("Add Task", systemImage: "plus")
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
            // Active tasks
            Section {
                ForEach(taskStore.todayTasks.filter { $0.status != .done }) { task in
                    TaskRow(task: task, taskStore: taskStore)
                }
            }

            // Completed tasks
            let completedToday = taskStore.todayTasks.filter { $0.status == .done }
            if !completedToday.isEmpty {
                Section("Completed") {
                    ForEach(completedToday) { task in
                        TaskRow(task: task, taskStore: taskStore)
                    }
                }
            }
        }
    }
}

#Preview {
    TodayView()
        .environmentObject(AuthManager())
}
