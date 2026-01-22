import SwiftUI

struct ProjectDetailView: View {
    let project: Project
    @ObservedObject var projectStore: ProjectStore
    @ObservedObject var taskStore: TaskStore

    @State private var showAddTask = false
    @State private var showEditProject = false
    @State private var showDeleteConfirmation = false
    @Environment(\.dismiss) var dismiss

    // Tasks filtered by this project
    private var projectTasks: [TaskItem] {
        taskStore.tasks.filter { $0.projectId == project.id && $0.status != .done }
    }

    private var completedTasks: [TaskItem] {
        taskStore.tasks.filter { $0.projectId == project.id && $0.status == .done }
    }

    var body: some View {
        List {
            // Active tasks section
            if !projectTasks.isEmpty {
                Section {
                    ForEach(projectTasks) { task in
                        TaskRow(task: task, taskStore: taskStore)
                    }
                }
            } else {
                Section {
                    emptyTasksMessage
                }
            }

            // Completed tasks section
            if !completedTasks.isEmpty {
                Section("Completed") {
                    ForEach(completedTasks) { task in
                        TaskRow(task: task, taskStore: taskStore)
                    }
                }
            }
        }
        .navigationTitle(titleWithEmoji)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button {
                        showAddTask = true
                    } label: {
                        Label("Add Task", systemImage: "plus")
                    }

                    Divider()

                    Button {
                        showEditProject = true
                    } label: {
                        Label("Edit Project", systemImage: "pencil")
                    }

                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Delete Project", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.title3)
                }
            }
        }
        .refreshable {
            await taskStore.fetchTasks()
        }
        .sheet(isPresented: $showAddTask) {
            AddTaskToProjectSheet(
                taskStore: taskStore,
                projectId: project.id,
                projectName: project.name
            )
        }
        .sheet(isPresented: $showEditProject) {
            EditProjectSheet(
                projectStore: projectStore,
                project: project
            )
        }
        .confirmationDialog(
            "Delete Project",
            isPresented: $showDeleteConfirmation,
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                deleteProject()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to delete this project? Tasks in this project will be moved to Inbox.")
        }
    }

    private var titleWithEmoji: String {
        if let emoji = project.emoji, !emoji.isEmpty {
            return "\(emoji) \(project.name)"
        }
        return project.name
    }

    private var emptyTasksMessage: some View {
        VStack(spacing: 8) {
            Text("No active tasks")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Button {
                showAddTask = true
            } label: {
                Label("Add Task", systemImage: "plus")
                    .font(.subheadline)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
    }

    private func deleteProject() {
        Task {
            let success = await projectStore.deleteProject(id: project.id)
            if success {
                dismiss()
            }
        }
    }
}

// MARK: - Add Task to Project Sheet

struct AddTaskToProjectSheet: View {
    @ObservedObject var taskStore: TaskStore
    let projectId: String
    let projectName: String

    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var isCreating = false
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Project indicator
                HStack {
                    Image(systemName: "folder.fill")
                        .foregroundStyle(.secondary)
                    Text(projectName)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                TextField("What needs to be done?", text: $title, axis: .vertical)
                    .font(.title3)
                    .lineLimit(3...6)
                    .focused($isFocused)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(12)
                    .padding(.horizontal)

                Spacer()
            }
            .padding(.top)
            .navigationTitle("Add Task")
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
            .onSubmit {
                createTask()
            }
        }
        .presentationDetents([.medium])
    }

    private func createTask() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        isCreating = true
        Task {
            let success = await taskStore.createTaskWithProject(
                title: trimmedTitle,
                projectId: projectId
            )
            if success {
                dismiss()
            }
            isCreating = false
        }
    }
}

// MARK: - Edit Project Sheet

struct EditProjectSheet: View {
    @ObservedObject var projectStore: ProjectStore
    let project: Project

    @Environment(\.dismiss) var dismiss
    @State private var name: String
    @State private var selectedEmoji: String
    @State private var selectedColor: String
    @State private var description: String
    @State private var isSaving = false
    @FocusState private var isNameFocused: Bool

    init(projectStore: ProjectStore, project: Project) {
        self.projectStore = projectStore
        self.project = project
        _name = State(initialValue: project.name)
        _selectedEmoji = State(initialValue: project.emoji ?? "")
        _selectedColor = State(initialValue: project.color ?? "#6366f1")
        _description = State(initialValue: project.description ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Project Name") {
                    TextField("Project name", text: $name)
                        .focused($isNameFocused)
                }

                Section("Emoji") {
                    EmojiPicker(selectedEmoji: $selectedEmoji)
                }

                Section("Color") {
                    ColorPicker(selectedColor: $selectedColor)
                }

                Section("Description (Optional)") {
                    TextField("Add a description...", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Edit Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        saveProject()
                    } label: {
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isSaving)
                }
            }
        }
    }

    private func saveProject() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { return }

        isSaving = true
        Task {
            let success = await projectStore.updateProject(
                id: project.id,
                name: trimmedName,
                emoji: selectedEmoji.isEmpty ? nil : selectedEmoji,
                color: selectedColor,
                description: description.isEmpty ? nil : description,
                archived: nil
            )
            if success {
                dismiss()
            }
            isSaving = false
        }
    }
}

#Preview {
    NavigationStack {
        ProjectDetailView(
            project: Project(
                id: "1",
                name: "Test Project",
                description: "A test project",
                emoji: "rocket",
                color: "#6366f1",
                archived: false,
                taskCount: 5,
                completedCount: 2,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            ),
            projectStore: ProjectStore(),
            taskStore: TaskStore()
        )
    }
}
