import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            if authManager.isLoading {
                // Loading state
                VStack {
                    ProgressView()
                    Text("Loading...")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            } else if authManager.isAuthenticated {
                // Main app
                MainTabView()
            } else {
                // Login screen
                LoginView()
            }
        }
        .animation(.default, value: authManager.isAuthenticated)
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0
    @StateObject private var taskStore = TaskStore()
    @StateObject private var projectStore = ProjectStore()

    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView(taskStore: taskStore)
                .tabItem {
                    Label("Today", systemImage: "sun.max.fill")
                }
                .tag(0)

            InboxView(taskStore: taskStore)
                .tabItem {
                    Label("Inbox", systemImage: "tray.fill")
                }
                .tag(1)

            ChecklistView()
                .tabItem {
                    Label("Checklist", systemImage: "checklist")
                }
                .tag(2)

            FocusView(taskStore: taskStore)
                .tabItem {
                    Label("Focus", systemImage: "timer")
                }
                .tag(3)

            MoreView(taskStore: taskStore, projectStore: projectStore)
                .tabItem {
                    Label("More", systemImage: "ellipsis")
                }
                .tag(4)
        }
        .task {
            await taskStore.fetchTasks()
            await projectStore.fetchProjects()
        }
    }
}

struct MoreView: View {
    @EnvironmentObject var authManager: AuthManager
    @ObservedObject var taskStore: TaskStore
    @ObservedObject var projectStore: ProjectStore
    @State private var showQuickActions = false

    var body: some View {
        NavigationStack {
            List {
                // User profile section
                Section {
                    if let user = authManager.currentUser {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.largeTitle)
                                .foregroundStyle(.secondary)

                            VStack(alignment: .leading) {
                                Text(user.name ?? "User")
                                    .font(.headline)
                                Text(user.email)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                // Task views
                Section("Tasks") {
                    NavigationLink {
                        ProjectsView(projectStore: projectStore, taskStore: taskStore)
                    } label: {
                        Label("Projects", systemImage: "folder.fill")
                    }

                    NavigationLink {
                        ScheduledView(taskStore: taskStore)
                    } label: {
                        Label("Scheduled", systemImage: "calendar")
                    }

                    NavigationLink {
                        CompletedView(taskStore: taskStore)
                    } label: {
                        Label("Completed", systemImage: "checkmark.circle.fill")
                    }

                    Button {
                        showQuickActions = true
                    } label: {
                        Label("Quick Capture", systemImage: "bolt.fill")
                    }
                }

                // Stats & Gamification
                Section("Progress") {
                    NavigationLink {
                        StatsView()
                    } label: {
                        Label("Statistics", systemImage: "chart.bar.fill")
                    }

                    NavigationLink {
                        AchievementsView()
                    } label: {
                        Label("Achievements", systemImage: "trophy.fill")
                    }

                    NavigationLink {
                        CreaturesView()
                    } label: {
                        Label("Creatures", systemImage: "pawprint.fill")
                    }
                }

                // Sign out
                Section {
                    Button(role: .destructive) {
                        authManager.logout()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("More")
            .fullScreenCover(isPresented: $showQuickActions) {
                QuickActionsView(taskStore: taskStore)
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager())
}
