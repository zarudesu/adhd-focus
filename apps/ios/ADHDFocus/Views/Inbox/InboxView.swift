import SwiftUI

struct InboxView: View {
    @ObservedObject var taskStore: TaskStore
    @State private var showAddTask = false
    @State private var newTaskTitle = ""
    @FocusState private var isQuickAddFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Quick add bar at top
                quickAddBar

                // Task list
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    Spacer()
                    ProgressView("Loading...")
                    Spacer()
                } else if taskStore.inboxTasks.isEmpty {
                    Spacer()
                    emptyState
                    Spacer()
                } else {
                    taskList
                }
            }
            .navigationTitle("Inbox")
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
                AddTaskSheet(taskStore: taskStore, defaultStatus: .inbox)
            }
        }
    }

    private var quickAddBar: some View {
        HStack(spacing: 12) {
            TextField("Add a thought...", text: $newTaskTitle)
                .textFieldStyle(.roundedBorder)
                .focused($isQuickAddFocused)
                .submitLabel(.done)
                .onSubmit {
                    quickAdd()
                }

            Button {
                quickAdd()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundStyle(newTaskTitle.isEmpty ? Color.secondary : Color.accentColor)
            }
            .disabled(newTaskTitle.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("Inbox is empty")
                .font(.headline)

            Text("Capture thoughts quickly here")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var taskList: some View {
        List {
            ForEach(taskStore.inboxTasks) { task in
                TaskRow(task: task, taskStore: taskStore)
            }
        }
    }

    private func quickAdd() {
        let trimmedTitle = newTaskTitle.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        Task {
            let success = await taskStore.createTask(title: trimmedTitle, status: .inbox)
            if success {
                newTaskTitle = ""
            }
        }
    }
}

#Preview {
    InboxView(taskStore: TaskStore())
}
