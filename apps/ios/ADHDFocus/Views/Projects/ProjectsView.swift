import SwiftUI

struct ProjectsView: View {
    @ObservedObject var projectStore: ProjectStore
    @ObservedObject var taskStore: TaskStore
    @State private var showAddProject = false

    var body: some View {
        NavigationStack {
            Group {
                if projectStore.isLoading && projectStore.projects.isEmpty {
                    ProgressView("Loading...")
                } else if projectStore.projects.isEmpty {
                    emptyState
                } else {
                    projectList
                }
            }
            .navigationTitle("Projects")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showAddProject = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
            }
            .refreshable {
                await projectStore.fetchProjects()
            }
            .sheet(isPresented: $showAddProject) {
                AddProjectSheet(projectStore: projectStore)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "folder")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No projects yet")
                .font(.headline)

            Text("Organize your tasks into projects")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                showAddProject = true
            } label: {
                Label("Create Project", systemImage: "plus")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }

    private var projectList: some View {
        List {
            ForEach(projectStore.projects) { project in
                NavigationLink(destination: ProjectDetailView(
                    project: project,
                    projectStore: projectStore,
                    taskStore: taskStore
                )) {
                    ProjectCard(project: project)
                }
            }
        }
    }
}

// MARK: - Project Card

struct ProjectCard: View {
    let project: Project

    var body: some View {
        HStack(spacing: 12) {
            // Emoji or folder icon
            ZStack {
                Circle()
                    .fill(project.swiftUIColor.opacity(0.2))
                    .frame(width: 44, height: 44)

                if let emoji = project.emoji, !emoji.isEmpty {
                    Text(emoji)
                        .font(.title2)
                } else {
                    Image(systemName: "folder.fill")
                        .font(.title3)
                        .foregroundStyle(project.swiftUIColor)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(project.name)
                    .font(.headline)

                // Task count and progress
                HStack(spacing: 8) {
                    let total = project.taskCount ?? 0
                    let completed = project.completedCount ?? 0

                    Text("\(completed)/\(total) tasks")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    if total > 0 {
                        ProgressView(value: project.progress)
                            .progressViewStyle(.linear)
                            .tint(project.swiftUIColor)
                            .frame(width: 60)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ProjectsView(projectStore: ProjectStore(), taskStore: TaskStore())
}
