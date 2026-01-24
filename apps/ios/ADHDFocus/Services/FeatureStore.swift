import Foundation
import SwiftUI

@MainActor
class FeatureStore: ObservableObject {
    @Published var features: [Feature] = []
    @Published var unlockedCodes: Set<String> = []
    @Published var level: Int = 1
    @Published var xp: Int = 0
    @Published var isLoading = false
    @Published var error: String?

    // For showing unlock modal
    @Published var newlyUnlockedFeature: Feature?
    @Published var showUnlockModal = false

    private let api = APIClient.shared

    // Track previously unlocked codes to detect new unlocks
    private var previousUnlockedCodes: Set<String> = []

    // MARK: - Check if feature is unlocked

    func isUnlocked(_ code: FeatureCode) -> Bool {
        unlockedCodes.contains(code.rawValue)
    }

    func isUnlocked(_ code: String) -> Bool {
        unlockedCodes.contains(code)
    }

    // MARK: - Fetch Features

    func fetchFeatures() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.getFeatures()

            // Store previous codes before updating
            previousUnlockedCodes = unlockedCodes

            // Update state
            self.features = response.unlockedFeatures
            self.unlockedCodes = Set(response.unlockedCodes)
            self.level = response.level
            self.xp = response.xp

            // Check for newly unlocked features
            checkForNewUnlocks()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Check for new unlocks

    private func checkForNewUnlocks() {
        // Skip on first load (when previousUnlockedCodes is empty)
        guard !previousUnlockedCodes.isEmpty else { return }

        // Find newly unlocked features
        let newCodes = unlockedCodes.subtracting(previousUnlockedCodes)

        if let newCode = newCodes.first,
           let newFeature = features.first(where: { $0.code == newCode }) {
            // Show unlock modal for the first new feature
            newlyUnlockedFeature = newFeature
            showUnlockModal = true
        }
    }

    // MARK: - Dismiss unlock modal

    func dismissUnlockModal() {
        showUnlockModal = false
        newlyUnlockedFeature = nil
    }
}

// MARK: - APIClient Feature Extensions

extension APIClient {
    func getFeatures() async throws -> FeaturesResponse {
        try await request("/features")
    }
}
