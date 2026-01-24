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
    @StateObject private var featureStore = FeatureStore()

    var body: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                // Inbox - always available
                InboxView(taskStore: taskStore)
                    .tabItem {
                        Label("Inbox", systemImage: "tray.fill")
                    }
                    .tag(0)

                // Today - unlocks at level 1 (after first task to today)
                if featureStore.isUnlocked(.navToday) {
                    TodayView(taskStore: taskStore)
                        .tabItem {
                            Label("Today", systemImage: "sun.max.fill")
                        }
                        .tag(1)
                }

                // Checklist - unlocks later
                if featureStore.isUnlocked(.navChecklist) {
                    ChecklistView()
                        .tabItem {
                            Label("Checklist", systemImage: "checklist")
                        }
                        .tag(2)
                }

                // Focus - unlocks after some tasks completed
                if featureStore.isUnlocked(.navFocus) {
                    FocusView(taskStore: taskStore)
                        .tabItem {
                            Label("Focus", systemImage: "timer")
                        }
                        .tag(3)
                }

                // More - always available
                MoreView(taskStore: taskStore, projectStore: projectStore, featureStore: featureStore)
                    .tabItem {
                        Label("More", systemImage: "ellipsis")
                    }
                    .tag(4)
            }

            // Feature unlock modal
            if featureStore.showUnlockModal, let feature = featureStore.newlyUnlockedFeature {
                FeatureUnlockModal(feature: feature) {
                    featureStore.dismissUnlockModal()
                }
                .transition(.opacity)
                .zIndex(100)
            }
        }
        .animation(.default, value: featureStore.showUnlockModal)
        .task {
            await featureStore.fetchFeatures()
            await taskStore.fetchTasks()
            await projectStore.fetchProjects()
        }
        .refreshable {
            await featureStore.fetchFeatures()
            await taskStore.fetchTasks()
        }
    }
}

struct MoreView: View {
    @EnvironmentObject var authManager: AuthManager
    @ObservedObject var taskStore: TaskStore
    @ObservedObject var projectStore: ProjectStore
    @ObservedObject var featureStore: FeatureStore
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

                    // Level progress
                    HStack {
                        Image(systemName: "sparkles")
                            .foregroundStyle(.yellow)
                        Text("Level \(featureStore.level)")
                            .font(.subheadline)
                        Spacer()
                        Text("\(featureStore.xp) XP")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                // Task views - show only unlocked
                Section("Tasks") {
                    // Projects
                    if featureStore.isUnlocked(.navProjects) {
                        NavigationLink {
                            ProjectsView(projectStore: projectStore, taskStore: taskStore)
                        } label: {
                            Label("Projects", systemImage: "folder.fill")
                        }
                    }

                    // Scheduled
                    if featureStore.isUnlocked(.navScheduled) {
                        NavigationLink {
                            ScheduledView(taskStore: taskStore)
                        } label: {
                            Label("Scheduled", systemImage: "calendar")
                        }
                    }

                    // Completed
                    if featureStore.isUnlocked(.navCompleted) {
                        NavigationLink {
                            CompletedView(taskStore: taskStore)
                        } label: {
                            Label("Completed", systemImage: "checkmark.circle.fill")
                        }
                    }

                    // Quick Actions
                    if featureStore.isUnlocked(.navQuickActions) {
                        Button {
                            showQuickActions = true
                        } label: {
                            Label("Quick Capture", systemImage: "bolt.fill")
                        }
                    }
                }

                // Stats & Gamification - show only unlocked
                if featureStore.isUnlocked(.navStats) || featureStore.isUnlocked(.navAchievements) || featureStore.isUnlocked(.navCreatures) {
                    Section("Progress") {
                        if featureStore.isUnlocked(.navStats) {
                            NavigationLink {
                                StatsView()
                            } label: {
                                Label("Statistics", systemImage: "chart.bar.fill")
                            }
                        }

                        if featureStore.isUnlocked(.navAchievements) {
                            NavigationLink {
                                AchievementsView()
                            } label: {
                                Label("Achievements", systemImage: "trophy.fill")
                            }
                        }

                        if featureStore.isUnlocked(.navCreatures) {
                            NavigationLink {
                                CreaturesView()
                            } label: {
                                Label("Creatures", systemImage: "pawprint.fill")
                            }
                        }
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
