import SwiftUI

struct ChecklistView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var habitStore = HabitStore()
    @State private var showAddHabit = false
    @State private var editMode: EditMode = .inactive

    var body: some View {
        NavigationStack {
            Group {
                if habitStore.isLoading && habitStore.habits.isEmpty {
                    loadingView
                } else if habitStore.habits.isEmpty {
                    emptyState
                } else {
                    habitList
                }
            }
            .navigationTitle("Checklist")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showAddHabit = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }

                ToolbarItem(placement: .topBarLeading) {
                    EditButton()
                }
            }
            .environment(\.editMode, $editMode)
            .refreshable {
                await habitStore.fetchHabits()
            }
            .sheet(isPresented: $showAddHabit) {
                AddHabitSheet(habitStore: habitStore)
            }
            .task {
                await habitStore.fetchHabits()
            }
            .alert("Error", isPresented: .constant(habitStore.error != nil)) {
                Button("OK") {
                    habitStore.error = nil
                }
            } message: {
                if let error = habitStore.error {
                    Text(error)
                }
            }
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading habits...")
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checklist")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No habits yet")
                .font(.headline)

            Text("Build consistency with daily habits")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                showAddHabit = true
            } label: {
                Label("Add Habit", systemImage: "plus")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }

    // MARK: - Habit List

    private var habitList: some View {
        List {
            // Progress header
            if habitStore.summary.habitsForToday > 0 {
                progressHeader
            }

            // Habits grouped by time of day
            ForEach(habitStore.habitsByTimeOfDay, id: \.timeOfDay) { section in
                Section {
                    ForEach(section.habits) { habit in
                        HabitRow(
                            habit: habit,
                            onToggle: {
                                Task {
                                    _ = await habitStore.toggleCheck(for: habit.id)
                                }
                            }
                        )
                    }
                    .onMove { source, destination in
                        Task {
                            await habitStore.reorderHabitsInSection(
                                timeOfDay: section.timeOfDay,
                                from: source,
                                to: destination
                            )
                        }
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            let habit = section.habits[index]
                            Task {
                                _ = await habitStore.deleteHabit(id: habit.id)
                            }
                        }
                    }
                } header: {
                    HStack(spacing: 6) {
                        Image(systemName: section.timeOfDay.icon)
                            .font(.caption)
                        Text(section.timeOfDay.displayName)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    // MARK: - Progress Header

    private var progressHeader: some View {
        Section {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Today's Progress")
                        .font(.headline)
                    Spacer()
                    Text("\(habitStore.summary.completed)/\(habitStore.summary.habitsForToday)")
                        .font(.headline)
                        .foregroundStyle(habitStore.summary.allDone ? .green : .primary)
                }

                ProgressView(value: Double(habitStore.summary.progress) / 100)
                    .tint(habitStore.summary.allDone ? .green : .accentColor)

                if habitStore.summary.allDone {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text("All habits complete!")
                            .font(.subheadline)
                            .foregroundStyle(.green)
                    }
                }
            }
            .padding(.vertical, 4)
        }
    }
}

// MARK: - Habit Row

struct HabitRow: View {
    let habit: Habit
    let onToggle: () -> Void

    @State private var isAnimating = false

    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    isAnimating = true
                }
                onToggle()

                // Reset animation
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    isAnimating = false
                }
            } label: {
                ZStack {
                    Circle()
                        .strokeBorder(
                            habit.isCompleted == true ? Color.green : Color.secondary.opacity(0.3),
                            lineWidth: 2
                        )
                        .frame(width: 28, height: 28)

                    if habit.isCompleted == true {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 28, height: 28)

                        Image(systemName: "checkmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .scaleEffect(isAnimating ? 1.2 : 1.0)
            }
            .buttonStyle(.plain)

            // Title
            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .font(.body)
                    .strikethrough(habit.isCompleted == true, color: .secondary)
                    .foregroundStyle(habit.isCompleted == true ? .secondary : .primary)

                if habit.isSkipped == true {
                    Text("Skipped")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
            }

            Spacer()

            // Streak badge
            if let streakText = habit.streakText {
                HStack(spacing: 2) {
                    Image(systemName: "flame.fill")
                        .font(.caption)
                    Text(streakText)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.orange.opacity(0.15))
                .foregroundStyle(.orange)
                .cornerRadius(8)
            }
        }
        .contentShape(Rectangle())
        .padding(.vertical, 4)
    }
}

// MARK: - Preview

#Preview {
    ChecklistView()
        .environmentObject(AuthManager())
}
