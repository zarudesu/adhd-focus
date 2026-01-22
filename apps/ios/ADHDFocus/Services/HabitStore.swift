import Foundation
import SwiftUI

@MainActor
class HabitStore: ObservableObject {
    @Published var habits: [Habit] = []
    @Published var summary: HabitsSummary = HabitsSummary(
        totalHabits: 0,
        habitsForToday: 0,
        completed: 0,
        skipped: 0,
        remaining: 0,
        allDone: false,
        progress: 0
    )
    @Published var currentDate: String = ""
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    // MARK: - Computed Properties

    /// Habits grouped by time of day, ordered by section
    var habitsByTimeOfDay: [(timeOfDay: TimeOfDay, habits: [Habit])] {
        let grouped = Dictionary(grouping: habits) { $0.timeOfDay }
        return TimeOfDay.allCases
            .filter { grouped[$0]?.isEmpty == false }
            .map { ($0, grouped[$0] ?? []) }
    }

    /// Habits for a specific time of day
    func habits(for timeOfDay: TimeOfDay) -> [Habit] {
        habits.filter { $0.timeOfDay == timeOfDay }
    }

    // MARK: - Actions

    /// Fetch all habits with today's status
    func fetchHabits() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.getHabitsToday()
            self.habits = response.habits
            self.summary = response.summary
            self.currentDate = response.date
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Create a new habit
    func createHabit(
        name: String,
        emoji: String = "checkmark",
        timeOfDay: TimeOfDay = .anytime,
        frequency: HabitFrequency = .daily
    ) async -> Bool {
        let input = CreateHabitInput(
            name: name,
            emoji: emoji,
            frequency: frequency,
            timeOfDay: timeOfDay
        )

        do {
            _ = try await api.createHabit(input)
            await fetchHabits() // Refresh to get updated list
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    /// Update a habit
    func updateHabit(id: String, _ input: UpdateHabitInput) async -> Bool {
        do {
            _ = try await api.updateHabit(id: id, input)
            await fetchHabits()
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    /// Delete/archive a habit
    func deleteHabit(id: String) async -> Bool {
        do {
            _ = try await api.deleteHabit(id: id)
            habits.removeAll { $0.id == id }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    /// Toggle check for a habit (complete or uncheck)
    func toggleCheck(for habitId: String) async -> CheckHabitResponse? {
        guard let habitIndex = habits.firstIndex(where: { $0.id == habitId }) else {
            return nil
        }

        let habit = habits[habitIndex]
        let wasChecked = habit.isCheckedToday

        // Optimistic update
        habits[habitIndex].isCompleted = !wasChecked
        habits[habitIndex].isSkipped = false

        do {
            if wasChecked {
                // Uncheck
                try await api.uncheckHabit(id: habitId, date: currentDate)
                habits[habitIndex].todayCheck = nil
                await fetchHabits() // Refresh summary
                return nil
            } else {
                // Check
                let response = try await api.checkHabit(id: habitId, date: currentDate)
                habits[habitIndex].isCompleted = true
                habits[habitIndex].currentStreak += 1
                await fetchHabits() // Refresh summary
                return response
            }
        } catch {
            // Revert on error
            habits[habitIndex].isCompleted = wasChecked
            self.error = error.localizedDescription
            return nil
        }
    }

    /// Reorder habits
    func reorderHabits(_ orderedIds: [String]) async {
        // Optimistic update
        let oldHabits = habits
        let habitMap = Dictionary(uniqueKeysWithValues: habits.map { ($0.id, $0) })
        var reordered: [Habit] = []

        for id in orderedIds {
            if let habit = habitMap[id] {
                reordered.append(habit)
            }
        }

        // Add any remaining habits not in orderedIds
        for habit in habits {
            if !orderedIds.contains(habit.id) {
                reordered.append(habit)
            }
        }

        habits = reordered

        do {
            let updates = orderedIds.enumerated().map { index, id in
                ReorderHabitsInput.ReorderItem(id: id, sortOrder: index)
            }
            try await api.reorderHabits(ReorderHabitsInput(habits: updates))
        } catch {
            // Revert on error
            habits = oldHabits
            self.error = error.localizedDescription
        }
    }

    /// Reorder habits within a time of day section
    func reorderHabitsInSection(timeOfDay: TimeOfDay, from source: IndexSet, to destination: Int) async {
        var sectionHabits = habits(for: timeOfDay)
        sectionHabits.move(fromOffsets: source, toOffset: destination)

        // Get all ordered IDs (section habits first, then others)
        var orderedIds = sectionHabits.map { $0.id }

        // Add habits from other sections in their original order
        for habit in habits where habit.timeOfDay != timeOfDay {
            orderedIds.append(habit.id)
        }

        await reorderHabits(orderedIds)
    }
}

// MARK: - APIClient Habit Extensions

extension APIClient {
    func getHabitsToday() async throws -> HabitsResponse {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = .current
        let date = formatter.string(from: Date())
        return try await request("/habits/today?date=\(date)")
    }

    func createHabit(_ input: CreateHabitInput) async throws -> Habit {
        try await request("/habits", method: "POST", body: input)
    }

    func updateHabit(id: String, _ input: UpdateHabitInput) async throws -> Habit {
        try await request("/habits/\(id)", method: "PATCH", body: input)
    }

    func deleteHabit(id: String) async throws -> EmptyResponse {
        try await request("/habits/\(id)", method: "DELETE")
    }

    func checkHabit(id: String, date: String, skipped: Bool = false, reflection: String? = nil) async throws -> CheckHabitResponse {
        struct CheckInput: Codable {
            let date: String
            let skipped: Bool
            let reflection: String?
        }
        return try await request(
            "/habits/\(id)/check",
            method: "POST",
            body: CheckInput(date: date, skipped: skipped, reflection: reflection)
        )
    }

    func uncheckHabit(id: String, date: String) async throws {
        let _: EmptyResponse = try await request("/habits/\(id)/check?date=\(date)", method: "DELETE")
    }

    func reorderHabits(_ input: ReorderHabitsInput) async throws {
        let _: EmptyResponse = try await request("/habits/reorder", method: "POST", body: input)
    }
}

// MARK: - Success Response for reorder

private struct SuccessResponse: Codable {
    let success: Bool
}
