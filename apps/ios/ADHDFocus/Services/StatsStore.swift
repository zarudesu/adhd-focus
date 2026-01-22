import Foundation
import SwiftUI

@MainActor
class StatsStore: ObservableObject {
    @Published var stats: UserStats?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    // MARK: - Actions

    func fetchStats() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            // Fetch both endpoints in parallel
            async let statsResponse: StatsAPIResponse = api.getStats(days: 7)
            async let gamificationResponse: GamificationStatsResponse = api.getGamificationStats()

            let (stats, gamification) = try await (statsResponse, gamificationResponse)

            self.stats = UserStats.from(
                statsResponse: stats,
                gamificationResponse: gamification
            )
        } catch {
            self.error = error.localizedDescription
        }
    }

    func refresh() async {
        await fetchStats()
    }
}
