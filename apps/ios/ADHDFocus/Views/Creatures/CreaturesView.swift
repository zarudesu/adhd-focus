import SwiftUI

struct CreaturesView: View {
    @StateObject private var creatureStore = CreatureStore()
    @State private var showSpawnConfirm = false
    @State private var selectedCreature: Creature?

    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header stats
                    collectionHeader

                    // Spawn button
                    spawnButton

                    // Creatures grid
                    if creatureStore.isLoading && creatureStore.creatures.isEmpty {
                        ProgressView("Loading creatures...")
                            .padding(.top, 40)
                    } else if creatureStore.creatures.isEmpty {
                        emptyState
                    } else {
                        creaturesGrid
                    }
                }
                .padding()
            }
            .navigationTitle("Creatures")
            .refreshable {
                await creatureStore.fetchCreatures()
            }
            .task {
                await creatureStore.fetchCreatures()
            }
            .alert("Spawn Creature", isPresented: $showSpawnConfirm) {
                Button("Cancel", role: .cancel) { }
                Button("Spawn!") {
                    Task {
                        await creatureStore.spawnCreature()
                    }
                }
            } message: {
                Text("Try to discover a new creature?\n\nNote: There is a 30% chance a creature will appear.")
            }
            .sheet(item: $selectedCreature) { creature in
                CreatureDetailSheet(creature: creature)
            }
            .sheet(isPresented: $creatureStore.showSpawnResult) {
                if let creature = creatureStore.spawnedCreature {
                    SpawnResultSheet(
                        creature: creature,
                        isNew: creatureStore.isNewCreature,
                        onDismiss: {
                            creatureStore.dismissSpawnResult()
                        }
                    )
                }
            }
        }
    }

    // MARK: - Subviews

    private var collectionHeader: some View {
        VStack(spacing: 8) {
            Text("\(creatureStore.caughtCount) of \(creatureStore.totalCount)")
                .font(.system(size: 42, weight: .bold, design: .rounded))

            Text("creatures discovered")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            // Rarity breakdown
            if let stats = creatureStore.stats {
                HStack(spacing: 12) {
                    ForEach(CreatureRarity.allCases.prefix(4), id: \.self) { rarity in
                        if let rarityStats = stats.byRarity[rarity.rawValue] {
                            rarityBadge(rarity: rarity, caught: rarityStats.caught, total: rarityStats.total)
                        }
                    }
                }
                .padding(.top, 8)
            }
        }
        .padding(.vertical, 16)
    }

    private func rarityBadge(rarity: CreatureRarity, caught: Int, total: Int) -> some View {
        VStack(spacing: 2) {
            Text("\(caught)/\(total)")
                .font(.caption.bold())
                .foregroundStyle(rarityColor(rarity))

            Text(rarity.displayName)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }

    private var spawnButton: some View {
        Button {
            showSpawnConfirm = true
        } label: {
            HStack(spacing: 12) {
                if creatureStore.isSpawning {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(.white)
                } else {
                    Image(systemName: "sparkles")
                        .font(.title2)
                }

                Text(creatureStore.isSpawning ? "Summoning..." : "Spawn Creature")
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                LinearGradient(
                    colors: [.purple, .blue],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundStyle(.white)
            .cornerRadius(16)
            .shadow(color: .purple.opacity(0.3), radius: 8, y: 4)
        }
        .disabled(creatureStore.isSpawning)
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("???")
                .font(.system(size: 80))

            Text("No creatures yet")
                .font(.headline)

            Text("Tap the spawn button to discover your first creature!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
    }

    private var creaturesGrid: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(creatureStore.creatures) { creature in
                CreatureCard(creature: creature)
                    .onTapGesture {
                        if creature.isCaught {
                            selectedCreature = creature
                        }
                    }
            }
        }
    }

    private func rarityColor(_ rarity: CreatureRarity) -> Color {
        switch rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        case .mythic: return .orange
        case .secret: return .pink
        }
    }
}

// MARK: - Creature Card

struct CreatureCard: View {
    let creature: Creature

    var body: some View {
        VStack(spacing: 8) {
            // Emoji or locked icon
            Text(creature.isCaught ? creature.emoji : "???")
                .font(.system(size: 48))
                .frame(height: 60)

            // Name
            Text(creature.isCaught ? creature.name : "Locked")
                .font(.subheadline.bold())
                .lineLimit(1)

            // Rarity badge
            if creature.isCaught {
                RarityBadge(rarity: creature.displayRarity)
            } else {
                Text("???")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Count indicator for duplicates
            if creature.isCaught && creature.count > 1 {
                Text("x\(creature.count)")
                    .font(.caption2.bold())
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .padding(.horizontal, 12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(creature.isCaught ? cardBackground(for: creature.displayRarity) : Color(.systemGray6))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(
                    creature.isCaught ? rarityColor(creature.displayRarity).opacity(0.3) : Color.clear,
                    lineWidth: 2
                )
        )
        .opacity(creature.isCaught ? 1 : 0.6)
    }

    private func cardBackground(for rarity: CreatureRarity) -> Color {
        switch rarity {
        case .common: return Color(.systemGray6)
        case .uncommon: return Color.green.opacity(0.1)
        case .rare: return Color.blue.opacity(0.1)
        case .legendary: return Color.purple.opacity(0.1)
        case .mythic: return Color.orange.opacity(0.1)
        case .secret: return Color.pink.opacity(0.1)
        }
    }

    private func rarityColor(_ rarity: CreatureRarity) -> Color {
        switch rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        case .mythic: return .orange
        case .secret: return .pink
        }
    }
}

// MARK: - Rarity Badge

struct RarityBadge: View {
    let rarity: CreatureRarity

    var body: some View {
        Text(rarity.displayName)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(rarityColor.opacity(0.2))
            .foregroundStyle(rarityColor)
            .cornerRadius(6)
    }

    private var rarityColor: Color {
        switch rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        case .mythic: return .orange
        case .secret: return .pink
        }
    }
}

// MARK: - Preview

#Preview {
    CreaturesView()
}
