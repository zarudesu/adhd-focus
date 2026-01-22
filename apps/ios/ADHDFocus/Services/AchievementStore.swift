import Foundation
import SwiftUI

@MainActor
class AchievementStore: ObservableObject {
    @Published var achievements: [Achievement] = []
    @Published var stats: AchievementStats?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    // MARK: - Computed Properties

    /// Group achievements by category
    var achievementsByCategory: [String: [Achievement]] {
        Dictionary(grouping: achievements, by: { $0.category })
    }

    /// Sorted category names for display
    var sortedCategories: [String] {
        // Custom sort order for categories
        let order = ["productivity", "consistency", "milestones", "special", "secret"]
        return achievementsByCategory.keys.sorted { cat1, cat2 in
            let idx1 = order.firstIndex(of: cat1.lowercased()) ?? 99
            let idx2 = order.firstIndex(of: cat2.lowercased()) ?? 99
            return idx1 < idx2
        }
    }

    /// Human-readable category names
    func displayName(for category: String) -> String {
        switch category.lowercased() {
        case "productivity": return "Productivity"
        case "consistency": return "Consistency"
        case "milestones": return "Milestones"
        case "special": return "Special"
        case "secret": return "Secret"
        default: return category.capitalized
        }
    }

    /// Total unlocked count
    var unlockedCount: Int {
        achievements.filter { $0.isUnlocked }.count
    }

    /// Progress percentage for overall completion
    var overallProgress: Double {
        guard !achievements.isEmpty else { return 0.0 }
        return Double(unlockedCount) / Double(achievements.count)
    }

    // MARK: - Actions

    func fetchAchievements() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.getAchievements()
            self.achievements = response.achievements
            self.stats = response.stats
        } catch {
            self.error = error.localizedDescription
        }
    }
}
