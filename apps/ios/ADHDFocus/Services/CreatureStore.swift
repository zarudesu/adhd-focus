import Foundation
import SwiftUI

@MainActor
class CreatureStore: ObservableObject {
    @Published var creatures: [Creature] = []
    @Published var stats: CreatureStats?
    @Published var isLoading = false
    @Published var isSpawning = false
    @Published var error: String?

    // Spawn result state
    @Published var spawnedCreature: SpawnedCreature?
    @Published var isNewCreature = false
    @Published var showSpawnResult = false

    private let api = APIClient.shared

    // MARK: - Computed Properties

    var caughtCreatures: [Creature] {
        creatures.filter { $0.isCaught }
    }

    var uncaughtCreatures: [Creature] {
        creatures.filter { !$0.isCaught }
    }

    var caughtCount: Int {
        stats?.caught ?? caughtCreatures.count
    }

    var totalCount: Int {
        stats?.total ?? creatures.count
    }

    // Group creatures by rarity
    var creaturesByRarity: [CreatureRarity: [Creature]] {
        Dictionary(grouping: creatures) { $0.displayRarity }
    }

    // Sort order for display
    var sortedRarities: [CreatureRarity] {
        CreatureRarity.allCases.filter { creaturesByRarity[$0] != nil }
            .sorted { $0.sortOrder < $1.sortOrder }
    }

    // MARK: - Actions

    func fetchCreatures() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response: CreaturesResponse = try await api.getCreatures()
            self.creatures = response.creatures
            self.stats = response.stats
        } catch {
            self.error = error.localizedDescription
        }
    }

    func spawnCreature() async -> Bool {
        isSpawning = true
        error = nil
        defer { isSpawning = false }

        do {
            let response: SpawnCreatureResponse = try await api.spawnCreature()

            if let creature = response.creature {
                self.spawnedCreature = creature
                self.isNewCreature = response.isNew ?? true
                self.showSpawnResult = true

                // Refresh the collection to get updated data
                await fetchCreatures()
                return true
            } else {
                // No creature spawned (spawn roll failed)
                self.error = response.reason ?? "No creature appeared this time. Try again!"
                return false
            }
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func dismissSpawnResult() {
        showSpawnResult = false
        spawnedCreature = nil
        isNewCreature = false
    }
}
